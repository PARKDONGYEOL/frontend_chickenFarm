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
  const [period, setPeriod] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Refresh 버튼 핸들러
  const handleRefresh = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

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
    let step;
    if (period === "daily") {
      step = (24 * 60 * 60 * 1000) / points;
    } else if (period === "weekly") {
      step = (7 * 24 * 60 * 60 * 1000) / points;
    } else {
      step = (30 * 24 * 60 * 60 * 1000) / points;
    }
    return Array.from({ length: points }, (_, i) => ({
      t: new Date(now - (points - i - 1) * step),
      v: min + Math.random() * (max - min),
    }));
  };

  const getDummyData = (metric) => {
    const { min, max } = metrics[metric];
    const points = period === "daily" ? 24 : period === "weekly" ? 7 : 30;
    return generateTimeSeries(points, min, max);
  };

  const getXAxisOptions = () => {
    if (period === "daily") {
      return {
        type: "time",
        time: { unit: "hour", stepSize: 2, displayFormats: { hour: "HH" } },
        ticks: { color: "#666" },
        grid: { color: "#eee" },
      };
    } else if (period === "weekly") {
      return {
        type: "time",
        time: { unit: "day", displayFormats: { day: "M.dd" } },
        ticks: { color: "#666" },
        grid: { color: "#eee" },
      };
    } else {
      return {
        type: "time",
        time: { unit: "day", stepSize: 3, displayFormats: { day: "M.dd" } },
        ticks: {
          color: "#666",
          maxRotation: 0,
          minRotation: 0
        },
        grid: { color: "#eee" },
      };
    }
  };

  // 📌 데이터 카드용 샘플 값
  const getDiffText = (changePercent) => {
    if (period === "daily") {
      return `${changePercent}% from yesterday`;
    } else if (period === "weekly") {
      return `${changePercent}% from last week`;
    } else {
      return `${changePercent}% from last month`;
    }
  };

  const overview = [
    { key: "temp", value: 24.5, change: "+2.1" },
    { key: "hum", value: 62, change: "-1.3" },
    { key: "lux", value: 850, change: "+12.5" },
    { key: "air", value: "Good", change: "0" },
  ];

  return (
    <div className={styles.container}>
      {/* 데이터 모니터링 컨트롤 */}
      <div className={styles.controlPanel}>
        <div className={styles.controlLeft}>
          <h3 className={styles.controlTitle}>Data Monitoring</h3>
          <div className={styles.periodTabs}>
            <button
              className={`${styles.periodTab} ${period === "daily" ? styles.active : ""}`}
              onClick={() => setPeriod("daily")}
            >
              Daily
            </button>
            <button
              className={`${styles.periodTab} ${period === "weekly" ? styles.active : ""}`}
              onClick={() => setPeriod("weekly")}
            >
              Weekly
            </button>
            <button
              className={`${styles.periodTab} ${period === "monthly" ? styles.active : ""}`}
              onClick={() => setPeriod("monthly")}
            >
              Monthly
            </button>
          </div>
        </div>
        <div className={styles.controlRight}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={styles.datePicker}
          />
          <button className={styles.refreshButton} onClick={handleRefresh}>
            Refresh
          </button>
        </div>
      </div>

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
            <div className={styles.overviewDiff}>
              {item.key === "air" ? "Normal levels" : getDiffText(item.change)}
            </div>
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
                x: getXAxisOptions(),
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
                x: getXAxisOptions(),
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
                x: getXAxisOptions(),
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
                x: getXAxisOptions(),
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