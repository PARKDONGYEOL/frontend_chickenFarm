import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import axios from "axios";

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const lastSavedAlertsRef = useRef([]); // useRef를 사용하여 불필요한 리렌더링 없이 이전 상태를 기억

  // DB에 위험 알림 저장
  const saveDangerNotice = async (alertList) => {
    // 이전 알림과 완전히 동일한 경우에만 중복 저장 방지
    const isSameAlerts =
      JSON.stringify(alertList.map((a) => a.message)) ===
      JSON.stringify(lastSavedAlertsRef.current.map((a) => a.message));

    if (isSameAlerts) {
      return;
    }

    try {
      const loginInfo = JSON.parse(sessionStorage.getItem("loginInfo") || "{}");
      const farmNum = loginInfo.farm_id || 1;

      // alerts가 비어있지 않은 경우에만 DB 저장
      if (alertList.length > 0) {
        for (const alert of alertList) {
          await axios.post("api/danger/insert", {
            noticeContent: alert.message,
            noticeCategory: alert.category,
            farmNum: farmNum,
          });
        }
        lastSavedAlertsRef.current = alertList; // useRef로 이전 알림 목록 업데이트
        console.log("위험 알림 DB 저장 완료");
      }
    } catch (error) {
      console.error("위험 알림 저장 중 오류:", error);
    }
  };

  // ✅ 전역에서 센서 데이터 계속 받기
  useEffect(() => {
    let intervalId; // setInterval ID를 저장할 변수

    const fetchAndCheckSensors = async () => {
      try {
        const response = await axios.get("/raspberry/realtime");
        const result = response.data;

        console.log("AlertContext - 센서 데이터:", result);

        if (result.success && result.data) {
          const data = result.data;
          const newAlerts = [];

          // 비정상 감지
          if (data.lux > 30)
            newAlerts.push({ message: `🌡️ 조도가 ${data.lux.toFixed(1)}lux로 너무 높습니다.`, category: "조명" });
          if (data.temperature > 30)
            newAlerts.push({ message: `🌡️ 온도가 ${data.temperature.toFixed(1)}°C로 너무 높습니다.`, category: "온도" });
          if (data.temperature < 10)
            newAlerts.push({ message: `❄️ 온도가 ${data.temperature.toFixed(1)}°C로 너무 낮습니다.`, category: "온도" });
          if (data.humidity > 80)
            newAlerts.push({ message: `💧 습도가 ${data.humidity.toFixed(1)}%로 너무 높습니다.`, category: "습도" });
          if (data.co2 > 1000)
            newAlerts.push({ message: `⚠️ CO2 농도가 ${data.co2.toFixed(1)}ppm으로 너무 높습니다.`, category: "CO2" });

          setAlerts(newAlerts); // 알림 목록 업데이트
          saveDangerNotice(newAlerts); // 업데이트된 새 알림 목록으로 DB 저장 함수 호출
        }
      } catch (error) {
        console.error("센서 데이터 가져오는 중 오류:", error);
      }
    };

    fetchAndCheckSensors(); // 컴포넌트 마운트 시 최초 1회 실행
    intervalId = setInterval(fetchAndCheckSensors, 5000); // 5초마다 반복 실행

    return () => {
      clearInterval(intervalId); // 컴포넌트 언마운트 시 인터벌 정리
    };
  }, []); // 의존성 배열을 비워 최초 1회만 등록되도록 함

  return (
    <AlertContext.Provider value={{ alerts, setAlerts }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);

