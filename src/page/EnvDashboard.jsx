import React, { useState } from "react";
import styles from "./EnvDashboard.module.css";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, TimeScale
);

const EnvDashboard = () => {
  const [period] = useState("daily");

  // 📌 센서 항목 정의
  const metrics = {
    temp: { label: "Temperature", unit: "°C", min: 18, max: 30, color: "#e53935" },
    hum: { label: "Humidity", unit: "%", min: 50, max: 70, color: "#1e88e5" },
    lux: { label: "Illumination", unit: "lx", min: 100, max: 800, color: "#fbc02d" },
    nh3: { label: "NH₃", unit: "ppm", min: 0, max: 20, color: "#43a047" },
    co2: { label: "CO₂", unit: "ppm", min: 400, max: 1500, color: "#8e24aa" },
    no2: { label: "NO₂", unit: "ppb", min: 0, max: 100, color: "#ff5722" },
    co: { label: "CO", unit: "ppm", min: 0, max: 50, color: "#6d4c41" },
  };

  // 📌 더미 데이터 생성
  const generateTimeSeries = (points, min, max) => {
    const now = Date.now();
    const step = (24 * 60 * 60 * 1000) / points;
    return Array.from({ length: points }, (_, i) => ({
      t: new Date(now - (points - i - 1) * step),
      v: min + Math.random() * (max - min),
    }));
  };

  const getDummyData = (metric) => {
    const { min, max } = metrics[metric];
    return generateTimeSeries(24, min, max);
  };

  const xAxisOptions = {
    type: "time",
    time: { unit: "hour", stepSize: 2, displayFormats: { hour: "HH" } },
    ticks: { color: "#666" },
    grid: { color: "#eee" },
  };

  // 📌 데이터 카드용 샘플 값
  const overview = [
    { key: "temp", value: 24.5, diff: "+2.1% from yesterday" },
    { key: "hum", value: 62, diff: "-1.3% from yesterday" },
    { key: "lux", value: 850, diff: "+12.5% from yesterday" },
    { key: "air", value: "Good", diff: "Normal levels" },
  ];

  return (
    <div className={styles.container}>
      {/* 상단 데이터 요약 */}
      <div className={styles.overview}>
        {overview.map((item) => (
          <div key={item.key} className={styles.overviewCard}>
            <div className={styles.overviewValue}>
              {item.value}
              {metrics[item.key]?.unit && (
                <span className={styles.unit}> {metrics[item.key].unit}</span>
              )}
            </div>
            <div className={styles.overviewLabel}>
              {metrics[item.key]?.label || "Air Quality"}
            </div>
            <div className={styles.overviewDiff}>{item.diff}</div>
          </div>
        ))}
      </div>

      {/* 차트 그리드 */}
      <div className={styles.chartGrid}>
        {/* 온도 */}
        <div className={styles.chartCard}>
          <h4 className={styles.chartTitle}>Temperature</h4>
          <Line
            data={{
              datasets: [{
                data: getDummyData("temp").map((p) => ({ x: p.t, y: p.v })),
                borderColor: metrics.temp.color,
                backgroundColor: `${metrics.temp.color}33`,
                tension: 0.3,
                pointRadius: 0,
              }],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: xAxisOptions,
                y: { min: metrics.temp.min, max: metrics.temp.max, ticks: { color: "#666" } },
              },
            }}
          />
        </div>

        {/* 습도 */}
        <div className={styles.chartCard}>
          <h4 className={styles.chartTitle}>Humidity</h4>
          <Line
            data={{
              datasets: [{
                data: getDummyData("hum").map((p) => ({ x: p.t, y: p.v })),
                borderColor: metrics.hum.color,
                backgroundColor: `${metrics.hum.color}33`,
                tension: 0.3,
                pointRadius: 0,
              }],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: xAxisOptions,
                y: { min: metrics.hum.min, max: metrics.hum.max, ticks: { color: "#666" } },
              },
            }}
          />
        </div>

        {/* 조도 */}
        <div className={styles.chartCard}>
          <h4 className={styles.chartTitle}>Illumination</h4>
          <Line
            data={{
              datasets: [{
                data: getDummyData("lux").map((p) => ({ x: p.t, y: p.v })),
                borderColor: metrics.lux.color,
                backgroundColor: `${metrics.lux.color}33`,
                tension: 0.3,
                pointRadius: 0,
              }],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: xAxisOptions,
                y: { min: metrics.lux.min, max: metrics.lux.max, ticks: { color: "#666" } },
              },
            }}
          />
        </div>

        {/* 공기질 (복합 차트) */}
        <div className={styles.chartCard}>
          <h4 className={styles.chartTitle}>Gas Levels</h4>
          <Line
            data={{
              datasets: ["nh3", "co2", "no2", "co"].map((key) => ({
                label: metrics[key].label,
                data: getDummyData(key).map((p) => ({ x: p.t, y: p.v })),
                borderColor: metrics[key].color,
                backgroundColor: `${metrics[key].color}33`,
                tension: 0.3,
                pointRadius: 0,
              })),
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: "bottom" } },
              scales: {
                x: xAxisOptions,
                y: { beginAtZero: true, ticks: { color: "#666" } },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EnvDashboard;