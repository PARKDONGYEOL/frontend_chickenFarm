// 맨 위 import 라인 유지
import React, { useState, useEffect, useRef } from "react";
import styles from "./Streaming.module.css";
import Button from "../../common/Button";
import axios from "axios";
import Modal from "../../common/Modal";
import recordingTimer from "../../utils/recordingTimer";

 const API_BASE = "http://192.168.30.71:5000";
// const API_BASE = "http://192.168.31.229:5000";
const NO_SIGNAL_ON_BLACK = "/no_signal_on_black.gif";
const NO_SIGNAL_NOISE = "/no_signal_noise.gif";
const DEFAULT_DURATION = 300000; // 기본 5분 (10분 600,000ms)

export default function Streaming() {
  const [alarms, setAlarms] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(1);
  const [isAlarmOn, setIsAlarmOn] = useState(false);
  const [isRecordOn, setIsRecordOn] = useState(false);
  const [isCaptureOn, setIsCaptureOn] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [capturedImageUrl, setCapturedImageUrl] = useState(null);
  const [imageResolution, setImageResolution] = useState(null);
  const [recordingFile, setRecordingFile] = useState(null);
  const [noSignalImage, setNoSignalImage] = useState(NO_SIGNAL_ON_BLACK);

  const [recordDuration, setRecordDuration] = useState(DEFAULT_DURATION);

  const statusTimerRef = useRef(null);
  const alarmsTimerRef = useRef(null);
  const validateTimerRef = useRef(null); // 백엔드 상태 검증 타이머

  // 👇 추가: SSE 핸들용 ref & 연결상태
  const sseRef = useRef(null);
  const sseAliveRef = useRef(false);

  // 멀티탭 동기화용 BroadcastChannel
  const recordChannelRef = useRef(null);

  // ---- 유틸: 알람 포맷 정규화(메모리 or SSE 모두 time(초)로 통일) ----
  const normalizeAlarm = (raw) => {
    // 백엔드 /alarms: {label, score, time(초)}
    if (raw?.time && raw?.label) {
      return { label: raw.label, score: raw.score, time: raw.time };
    }
    // SSE: {type:"alarm", label, score, ts: ISO}
    if (raw?.ts && raw?.label) {
      const t = Date.parse(raw.ts);
      const sec = isNaN(t) ? Math.floor(Date.now() / 1000) : Math.floor(t / 1000);
      return { label: raw.label, score: raw.score ?? 0, time: sec };
    }
    // 혹시 모를 DB 포맷 대응(DET…)
    if (raw?.DETECTED_AT && raw?.OBJECT_LABEL) {
      const t = Date.parse(raw.DETECTED_AT);
      const sec = isNaN(t) ? Math.floor(Date.now() / 1000) : Math.floor(t / 1000);
      return { label: raw.OBJECT_LABEL, score: raw.SCORE ?? 0, time: sec };
    }
    return null;
  };

  // ---- 알람 메시지 ----
  const getAlarmMessage = (alarm) => {
    if (!alarm) return "";
    const timeStr = new Date(alarm.time * 1000).toLocaleTimeString();
    const formattedTime = `[${timeStr}]`;
    const score = alarm.score != null ? `(신뢰도: ${(Number(alarm.score) * 100).toFixed(0)}%)` : "";
    if (alarm.label === "dog") return `${formattedTime} 유해동물 개가 침입!!`;
    if (alarm.label === "cat") return `${formattedTime} 유해동물 고양이가 침입!!`;
    return `${formattedTime} ${alarm.label} ${score}`;
  };

  // ---- 카메라 변경 시 노시그널 이미지 처리 ----
  useEffect(() => {
    if (selectedCamera !== 1) {
      setNoSignalImage(NO_SIGNAL_ON_BLACK);
      const timer = setTimeout(() => setNoSignalImage(NO_SIGNAL_NOISE), 1000);
      return () => clearTimeout(timer);
    }
  }, [selectedCamera]);

  const getCameraSrc = () => (selectedCamera === 1 ? `${API_BASE}/video_feed` : noSignalImage);

  // ---- 상태 폴링들 (알람 on/off, 녹화상태) ----
  const pollAlarmStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE}/alarm/status`, { params: { _t: Date.now() } });
      setIsAlarmOn(Boolean(res.data.is_alarm_on));
    } catch (err) {
      console.error("알람 상태 동기화 실패:", err);
    }
  };

  const pollRecordStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE}/record/status`, { params: { _t: Date.now() } });
      setIsRecordOn(Boolean(res.data.is_recording));
      setRecordingFile(res.data.current_file || null);
    } catch (err) {
      console.error("녹화 상태 조회 실패:", err);
    }
  };

  // ---- (백업) 메모리 알람 폴링: SSE가 끊긴 경우에만 사용 ----
  const pollAlarms = async () => {
    if (selectedCamera !== 1) return;
    if (sseAliveRef.current) return; // SSE 연결 중이면 폴링 생략
    try {
      const res = await axios.get(`${API_BASE}/alarms`, { params: { _t: Date.now() } });
      const normed = (res.data || [])
        .map(normalizeAlarm)
        .filter(Boolean)
        .slice(-50); // 메모리 과대 표시 방지
      setAlarms(normed);
    } catch (err) {
      console.error("실시간 알람 폴링 실패:", err);
    }
  };

  // ---- 마운트/카메라 변경시: 상태 폴링 + SSE 구독 + 타이머 복원 ----
  useEffect(() => {
    // ✅ 전역 타이머 콜백 설정
    recordingTimer.onStatusChange = (isRecording) => {
      setIsRecordOn(isRecording);
    };

    recordingTimer.onMessage = (message) => {
      setModalMessage(message);
      setModalOpen(true);
    };

    // ✅ BroadcastChannel 초기화 (멀티탭 동기화)
    if (selectedCamera === 1) {
      try {
        recordChannelRef.current = new BroadcastChannel('recording_channel');

        recordChannelRef.current.onmessage = (e) => {
          if (e.data.type === 'STOP_RECORDING') {
            console.log('[BroadcastChannel] 다른 탭에서 녹화 중지 감지');
            stopPeriodicRecording();
            setIsRecordOn(false);
          } else if (e.data.type === 'START_RECORDING' && e.data.time) {
            console.log('[BroadcastChannel] 다른 탭에서 녹화 시작 감지');
            // 전역 타이머가 알아서 처리
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel not supported:', err);
      }
    }

    // 공통 상태 폴링 시작
    pollAlarmStatus();
    pollRecordStatus();
    statusTimerRef.current = setInterval(pollRecordStatus, 1500);

    // ✅ 백엔드 상태 검증 타이머 추가
    validateTimerRef.current = setInterval(async () => {
      const timerStatus = recordingTimer.getStatus();
      if (timerStatus.isRunning) {
        try {
          const res = await axios.get(`${API_BASE}/record/status`, { params: { _t: Date.now() } });
          // 백엔드에서 녹화 중이 아닌데 타이머가 있으면 취소
          if (!res.data.is_recording) {
            console.warn("백엔드 녹화 중단 감지, 타이머 제거");
            stopPeriodicRecording();
            setIsRecordOn(false);
          }
        } catch (err) {
          console.error("상태 검증 실패:", err);
        }
      }
    }, 3000); // 3초마다 검증

    // 알람(백업) 폴링
    if (selectedCamera === 1) {
      pollAlarms();
      alarmsTimerRef.current = setInterval(pollAlarms, 1000);
    }

    // SSE 연결 (카메라1에서만)
    if (selectedCamera === 1) {
      try {
        const es = new EventSource(`${API_BASE}/alarms/stream`);
        sseRef.current = es;

        es.onopen = () => {
          sseAliveRef.current = true;
          // SSE 연결되면 알람 폴링은 백업으로만 두고, 중복 반영 방지
          // (위 pollAlarms에서 sseAliveRef.current 체크함)
        };

        es.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data?.type === "alarm") {
              const norm = normalizeAlarm(data);
              if (norm) {
                setAlarms((prev) => [norm, ...prev].slice(0, 50));
              }
            }
          } catch (err) {
            console.error("SSE parse error:", err);
          }
        };

        es.onerror = (err) => {
          console.warn("SSE error:", err);
          sseAliveRef.current = false; // 폴백 폴링이 동작하도록 플래그 내림
          // 브라우저가 자동 재연결(retry) 시도함
        };
      } catch (e) {
        console.warn("SSE init failed, fallback to polling only:", e);
        sseAliveRef.current = false;
      }

      // 🔁 녹화 타이머 복원 로직 (페이지 복귀 시) - 전역 타이머 사용
      const checkAndRestoreTimer = async () => {
        const restored = await recordingTimer.restore();
        if (restored) {
          setIsRecordOn(true);
        }
      };

      checkAndRestoreTimer();
    }

    return () => {
      if (alarmsTimerRef.current) clearInterval(alarmsTimerRef.current);
      if (statusTimerRef.current) clearInterval(statusTimerRef.current);
      if (validateTimerRef.current) clearInterval(validateTimerRef.current);
      // ⚠️ 전역 타이머는 여기서 정리하지 않음 (페이지 이동 후에도 계속 작동)
      if (sseRef.current) {
        try {
          sseRef.current.close();
        } catch {}
        sseRef.current = null;
      }
      sseAliveRef.current = false;

      // BroadcastChannel 정리
      if (recordChannelRef.current) {
        try {
          recordChannelRef.current.close();
        } catch {}
        recordChannelRef.current = null;
      }

      // 콜백 정리
      recordingTimer.onStatusChange = null;
      recordingTimer.onMessage = null;
    };
  }, [selectedCamera]);

  // ---- 이하 기존 핸들러/렌더 그대로 ----
  const handleAlarmToggle = async () => {
    if (selectedCamera !== 1) return;
    try {
      const res = await axios.post(`${API_BASE}/alarm/toggle`);
      if (res.data.status === "success") {
        setIsAlarmOn(Boolean(res.data.is_alarm_on));
        setModalMessage(res.data.message);
      } else {
        setModalMessage("알람 상태 토글 실패");
      }
    } catch (err) {
      console.error("알람 토글 실패:", err);
      setModalMessage("알람 상태 토글 실패");
    } finally {
      setModalOpen(true);
    }
  };

// 🔁 녹화 주기 타이머를 시작/재시작합니다. (전역 타이머 사용)
const startPeriodicRecording = (duration = recordDuration) => {
    recordingTimer.start(duration);

    // 멀티탭 동기화
    if (recordChannelRef.current) {
        recordChannelRef.current.postMessage({ type: 'START_RECORDING', time: Date.now() + duration });
    }
};

// ⛔ 타이머 제거 함수
const stopPeriodicRecording = () => {
    recordingTimer.stop();
};

  const startRecording = async () => {
    try {
      const res = await axios.get(`${API_BASE}/record/start`);
      if (res.data.status === "success") {
        setModalMessage("녹화를 시작합니다.");
        setIsRecordOn(true);
      } else {
        setModalMessage(res.data.message || "녹화 시작 실패");
      }
    } catch (err) {
      console.error("녹화 시작 실패:", err);
      setModalMessage("녹화 시작 실패");
    } finally {
      setModalOpen(true);
      pollRecordStatus();
    }
  };

  const stopRecording = async () => {
    try {
      const res = await axios.get(`${API_BASE}/record/stop`);
      if (res.data.status === "success") {
        setModalMessage("녹화를 정지합니다.");
        setIsRecordOn(false);
      } else {
        setModalMessage(res.data.message || "녹화 정지 실패");
      }
    } catch (err) {
      console.error("녹화 정지 실패:", err);
      setModalMessage("녹화 정지 실패");
    } finally {
      setModalOpen(true);
      pollRecordStatus();
    }
  };

const handleRecordToggle = async () => {
    if (selectedCamera !== 1) return;

    if (isRecordOn) { // ➡️ 녹화 중지
        try {
            await stopRecording();
            stopPeriodicRecording(); // ✅ 성공 시에만 타이머 제거
            // 멀티탭 동기화
            if (recordChannelRef.current) {
                recordChannelRef.current.postMessage({ type: 'STOP_RECORDING' });
            }
        } catch (err) {
            console.error("녹화 중지 실패, 타이머 유지:", err);
            // 타이머는 계속 유지되어 다음 갱신 시 재시도
        }
    } else { // ➡️ 녹화 시작
        try {
            await startRecording();
            startPeriodicRecording(recordDuration); // ✅ 성공 시에만 타이머 시작
            // 멀티탭 동기화
            if (recordChannelRef.current) {
                recordChannelRef.current.postMessage({ type: 'START_RECORDING', time: Date.now() + recordDuration });
            }
        } catch (err) {
            console.error("녹화 시작 실패:", err);
        }
    }
};

  const handleCaptureToggle = async () => {
    if (selectedCamera !== 1) return;
    if (isCaptureOn) {
      setIsCaptureOn(false);
      try {
        const response = await fetch(`${API_BASE}/capture`);
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImageUrl(imageUrl);

        const img = new Image();
        img.onload = () => {
          setImageResolution(`${img.naturalWidth} x ${img.naturalHeight}`);
        };
        img.src = imageUrl;

        setModalMessage("캡처 이미지가 준비되었습니다.");
        setModalOpen(true);
      } catch (err) {
        console.error("캡처 실패:", err);
        setModalMessage("캡처에 실패했습니다.");
        setModalOpen(true);
        setIsCaptureOn(true);
      }
    } else {
      setIsCaptureOn(true);
      setModalOpen(false);
      setCapturedImageUrl(null);
      setImageResolution(null);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setModalMessage("");
    setCapturedImageUrl(null);
    setImageResolution(null);
    if (!isCaptureOn) setIsCaptureOn(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.body_div}>
        <div className={styles.left_div}>
          <div className={styles.camera_header}>
            <p>{selectedCamera}번 카메라</p>
          </div>
          <div className={styles.video_div}>
            <img src={getCameraSrc()} alt="Live Stream" className={styles.video_feed} />
          </div>
        </div>

        <div className={styles.right_div}>
          <div className={styles.alarm_header}>
            <p>실시간 알람</p>
          </div>

          <div className={styles.alrm_div}>
            {alarms.length === 0 ? (
              <p className={styles.no_alarm}>알람 없음</p>
            ) : (
              <ul>
                {alarms.slice(0, 10).map((alarm, idx) => (
                  <li key={idx} className={styles.alarm_item}>
                    {getAlarmMessage(alarm)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.recordingStatus}>
            {recordingFile ? (
              <p className={styles.recordingOn}>{recordingFile}</p>
            ) : (
              <p className={styles.recordingOff}>녹화 중 아님</p>
            )}
          </div>

          <div className={styles.play_div}>
            <Button
              size="95px"
              title={isAlarmOn && selectedCamera === 1 ? "알람ON" : "알람OFF"}
              color={isAlarmOn && selectedCamera === 1 ? "green" : "gray"}
              onClick={handleAlarmToggle}
            />
            <Button
              size="95px"
              title={isRecordOn && selectedCamera === 1 ? "녹화ON" : "녹화OFF"}
              color={isRecordOn && selectedCamera === 1 ? "green" : "gray"}
              onClick={handleRecordToggle}
            />
            <Button
              size="95px"
              title={isCaptureOn && selectedCamera === 1 ? "캡쳐ON" : "캡쳐OFF"}
              color={isCaptureOn && selectedCamera === 1 ? "green" : "gray"}
              onClick={handleCaptureToggle}
            />
          </div>
        </div>
      </div>

      <div className={styles.button_div}>
        <Button title="1번 카메라" size="22%" color={selectedCamera === 1 ? "blue" : "gray"} onClick={() => setSelectedCamera(1)} />
        <Button title="2번 카메라" size="22%" color={selectedCamera === 2 ? "blue" : "gray"} onClick={() => setSelectedCamera(2)} />
        <Button title="3번 카메라" size="22%" color={selectedCamera === 3 ? "blue" : "gray"} onClick={() => setSelectedCamera(3)} />
        <Button title="4번 카메라" size="22%" color={selectedCamera === 4 ? "blue" : "gray"} onClick={() => setSelectedCamera(4)} />
      </div>

      <Modal size="640px" title={capturedImageUrl ? "캡처 이미지" : "알림"} isOpen={modalOpen} onClose={handleModalClose}>
        {capturedImageUrl ? (
          <div>
            <p style={{ textAlign: "center", fontSize: "14px", color: "#555" }}>
              해상도: {imageResolution || "불러오는 중..."}
            </p>
            <img
              src={capturedImageUrl}
              alt="캡처 이미지"
              style={{ maxWidth: "100%", height: "auto", border: "2px solid #ccc", borderRadius: "8px" }}
            />
            <br />
            <br />
            <a
              className={`${styles.btn} ${styles.blue}`}
              href={capturedImageUrl}
              download={`capture_${new Date().toISOString().replace(/[:.]/g, "-")}.jpg`}
              style={{ textDecoration: "none" }}
            >
              다운로드
            </a>
            <p style={{ marginTop: "10px", textAlign: "center", fontSize: "12px", color: "#888" }}>
              다운로드가 시작됩니다.
            </p>
          </div>
        ) : (
          <p>{modalMessage}</p>
        )}
      </Modal>
    </div>
  );
}
