import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import styles from "./TrendAnalysis.module.css";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, TimeScale
);

const TrendAnalysis = () => {
  const [period, setPeriod] = useState("daily");
  const [rows, setRows] = useState([]);

  // ✅ 더미 데이터 생성
  useEffect(() => {
    const now = Date.now();
    let points = 0, step = 0;

    if (period === "daily") { points = 24; step = 60 * 60 * 1000; }      // 1시간 단위, 24개
    if (period === "weekly") { points = 7; step = 24 * 60 * 60 * 1000; } // 하루 단위, 7개
    if (period === "monthly") { points = 30; step = 24 * 60 * 60 * 1000; } // 하루 단위, 30개

    const dummy = Array.from({ length: points }, (_, i) => ({
      t: new Date(now - (points - i - 1) * step),
      v: 20 + Math.sin(i / 3) * 5 + Math.random() * 2 // 온도 더미
    }));
    setRows(dummy);
  }, [period]);

  const chartData = {
    datasets: [
      {
        label: `온도 (${period === "daily" ? "일일" : period === "weekly" ? "주간" : "월간"})`,
        data: rows.map(r => ({ x: r.t, y: r.v })),
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        tension: 0.3,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } },
    scales: {
      x: { type: "time", time: { unit: period === "daily" ? "hour" : "day" } },
      y: { beginAtZero: false }
    }
  };

  return (
    <div className={styles.container}>
      <h2>📊 센서 데이터 추세 분석</h2>

      <div className={styles.controls}>
        <label>기간 선택: </label>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="daily">일일</option>
          <option value="weekly">주간</option>
          <option value="monthly">월간</option>
        </select>
      </div>

      <div className={styles.chartWrapper}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default TrendAnalysis;
