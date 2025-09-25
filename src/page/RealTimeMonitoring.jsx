import React, { useState, useEffect } from "react";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import styles from "./RealTimeMonitoring.module.css";

const RealTimeMonitoring = () => {
  const [data, setData] = useState({
    temp: 0,
    hum: 0,
    nh3: 0,
    lux: 0,
    co2: 0,
    no2: 0,
    co: 0,
  });

  // ✅ 5분마다 데이터 갱신 (현재는 랜덤값)
  useEffect(() => {
    const updateData = () => {
      setData({
        temp: Math.random() * 40,
        hum: Math.random() * 100,
        nh3: Math.random() * 40,
        lux: Math.random() * 1000,
        co2: Math.random() * 1000,
        no2: Math.random() * 200,
        co: Math.random() * 150,
      });
    };

    updateData(); // 초기 실행
    const interval = setInterval(updateData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        {/* ✅ 왼쪽 : 2줄 게이지 */}
        <div className={styles.gaugeSection}>
          <div className={styles.gaugeRow}>
            <div>
              <h3></h3>
            </div>
            <GaugeCard label="온도 (°C)" value={data.temp} max={40} warning={35} unit="°C" />
            <GaugeCard label="습도 (%)" value={data.hum} max={100} warning={40} below unit="%" />
            <GaugeCard label="조도 (lux)" value={data.lux} max={1000} warning={800} unit="lux" />
          </div>
          <div className={styles.gaugeRow}>
            <GaugeCard label="암모니아 (ppm)" value={data.nh3} max={40} warning={20} unit="ppm" />
            <GaugeCard label="이산화탄소 (CO₂)" value={data.co2} max={1000} warning={800} unit="ppm" />
            <GaugeCard label="이산화질소 (NO₂)" value={data.no2} max={200} warning={150} unit="ppb" />
            <GaugeCard label="일산화탄소 (CO)" value={data.co} max={150} warning={100} unit="ppm" />
          </div>
        </div>

        {/* ✅ 오른쪽 : 테이블 */}
        <div className={styles.tableWrapper}>
          <div className={styles.tableTitle}>
            <h3>실시간 환경 데이터</h3>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>항목</th>
                <th>현재 값</th>
                <th>단위</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>온도</td><td>{data.temp.toFixed(1)}</td><td>°C</td></tr>
              <tr><td>습도</td><td>{data.hum.toFixed(1)}</td><td>%</td></tr>
              <tr><td>조도</td><td>{data.lux.toFixed(1)}</td><td>lux</td></tr>
              <tr><td>암모니아</td><td>{data.nh3.toFixed(1)}</td><td>ppm</td></tr>
              <tr><td>이산화탄소 (CO₂)</td><td>{data.co2.toFixed(1)}</td><td>ppm</td></tr>
              <tr><td>이산화질소 (NO₂)</td><td>{data.no2.toFixed(1)}</td><td>ppb</td></tr>
              <tr><td>일산화탄소 (CO)</td><td>{data.co.toFixed(1)}</td><td>ppm</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ✅ 게이지 카드 컴포넌트
const GaugeCard = ({ label, value, max, warning, below = false, unit }) => {
  const danger = below ? value < warning : value > warning;

  return (
    <div className={styles.gaugeCard}>
      <h3>{label}</h3>
      <Gauge
        width={150}
        height={120}
        startAngle={-90}
        endAngle={90}
        value={value}
        valueMax={max}
        sx={{
          [`& .${gaugeClasses.valueArc}`]: {
            fill: danger ? "#ef4444" : "#4caf50",
          },
          [`& .${gaugeClasses.valueText}`]: {
            fontSize: 22,
          },
        }}
      />
      <p className={danger ? styles.alert : styles.normal}>
        {danger ? "⚠️ 위험" : "✅ 정상"} ({value.toFixed(1)} {unit})
      </p>
    </div>
  );
};

export default RealTimeMonitoring;