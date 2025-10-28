// 녹화 자동 갱신 타이머 전역 관리
// 페이지 이동과 무관하게 계속 작동

import axios from "axios";

const API_BASE = "http://192.168.30.71:5000";
const TIMER_STORAGE_KEY = 'next_record_renewal_time';
const DEFAULT_DURATION = 300000; // 5분

class RecordingTimer {
  constructor() {
    this.timerId = null;
    this.isRunning = false;
    this.duration = DEFAULT_DURATION;
    this.onStatusChange = null; // 콜백 함수
    this.onMessage = null; // 메시지 콜백
  }

  // 타이머 시작
  start(duration = this.duration) {
    this.stop(); // 기존 타이머 제거

    const nextRenewalTime = Date.now() + duration;
    localStorage.setItem(TIMER_STORAGE_KEY, nextRenewalTime.toString());
    this.isRunning = true;

    this.timerId = setTimeout(async () => {
      console.log(`[Global Timer] ${duration / 60000}분 경과. 녹화 갱신 시작.`);
      await this.performRenewal();
    }, duration);

    console.log(`[Global Timer] Started. Next renewal in ${duration / 1000}s`);
  }

  // 타이머 중지
  stop() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.isRunning = false;
    localStorage.removeItem(TIMER_STORAGE_KEY);
    console.log('[Global Timer] Stopped');
  }

  // 갱신 수행
  async performRenewal() {
    try {
      // 1️⃣ 현재 상태 확인
      const statusRes = await axios.get(`${API_BASE}/record/status`, { params: { _t: Date.now() } });
      if (!statusRes.data.is_recording) {
        console.warn("[Global Timer] 녹화 중이 아닙니다. 갱신 취소.");
        this.stop();
        if (this.onStatusChange) this.onStatusChange(false);
        return;
      }

      // 2️⃣ 녹화 중지
      const stopRes = await axios.get(`${API_BASE}/record/stop`);
      if (stopRes.data.status !== 'success') {
        throw new Error('녹화 중지 실패');
      }

      // 3️⃣ 중지 완료 확인 (최대 5초 대기)
      let stopped = false;
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const checkRes = await axios.get(`${API_BASE}/record/status`, { params: { _t: Date.now() } });
        if (!checkRes.data.is_recording) {
          stopped = true;
          break;
        }
      }

      if (!stopped) {
        throw new Error('녹화 중지 확인 실패');
      }

      // 4️⃣ 녹화 재시작
      const startRes = await axios.get(`${API_BASE}/record/start`);
      if (startRes.data.status === 'success') {
        console.log('[Global Timer] 녹화 갱신 완료');
        if (this.onMessage) {
          this.onMessage(`녹화 갱신 완료: ${this.duration / 60000}분 주기로 재시작.`);
        }
        this.start(this.duration); // 재귀 호출
      } else {
        throw new Error('녹화 재시작 실패');
      }

    } catch (err) {
      console.error("[Global Timer] 녹화 갱신 실패:", err);
      this.stop();
      if (this.onMessage) {
        this.onMessage(`녹화 갱신 실패: ${err.message}`);
      }
      if (this.onStatusChange) this.onStatusChange(false);
    }
  }

  // 페이지 복귀 시 타이머 복원
  async restore() {
    try {
      const res = await axios.get(`${API_BASE}/record/status`, { params: { _t: Date.now() } });
      const isRecording = res.data.is_recording;

      if (!isRecording) {
        this.stop();
        return false;
      }

      const savedTime = localStorage.getItem(TIMER_STORAGE_KEY);
      if (savedTime) {
        const nextRenewalTime = parseInt(savedTime, 10);
        const now = Date.now();
        const remainingTime = nextRenewalTime - now;

        if (remainingTime <= 0) {
          console.log('[Global Timer] 갱신 시간 경과, 즉시 갱신 실행');
          this.start(100); // 100ms 후 실행
        } else {
          console.log(`[Global Timer] ${Math.floor(remainingTime / 1000)}초 후 갱신 예정`);
          this.start(remainingTime);
        }
      } else {
        console.log('[Global Timer] 저장된 시간 없음, 새로운 주기 시작');
        this.start(this.duration);
      }

      return true;
    } catch (err) {
      console.error('[Global Timer] 복원 실패:', err);
      this.stop();
      return false;
    }
  }

  // 상태 확인
  getStatus() {
    return {
      isRunning: this.isRunning,
      timerId: this.timerId,
      nextRenewalTime: localStorage.getItem(TIMER_STORAGE_KEY)
    };
  }
}

// 싱글톤 인스턴스
const recordingTimer = new RecordingTimer();

export default recordingTimer;
