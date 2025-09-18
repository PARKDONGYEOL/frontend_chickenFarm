import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend,
} from "chart.js";
import styles from "./WeeklyInformation.module.css";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend
);

const WeeklyInformation = () => {
  const today = new Date();
  const start = new Date();
  start.setDate(today.getDate() - 6); // 최근 7일

  const [rows, setRows] = useState([]);

  useEffect(() => {
    const startDate = start.toISOString().slice(0, 10);
    const endDate = today.toISOString().slice(0, 10);

    axios
      .get("/api/thsensor", { params: { startDate, endDate } })
      .then(res => setRows(res.data ?? []))
      .catch(err => console.error(err));
  }, []);

  // 날짜별 그룹핑
  const grouped = {};
  rows.forEach(r => {
    const d = new Date(r.recTime).toISOString().slice(0, 10); // YYYY-MM-DD
    if (!grouped[d]) grouped[d] = { temps: [], hums: [], lux: [] };
    grouped[d].temps.push(r.tempData);
    grouped[d].hums.push(r.humData);
    grouped[d].lux.push(r.luxData);
  });

  // 평균값 계산
  const labels = Object.keys(grouped).sort();
  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

  const chartData = {
    labels,
    datasets: [
      {
        label: "온도(°C)",
        data: labels.map(d => avg(grouped[d].temps)),
        borderColor: "red",
        yAxisID: "y",
      },
      {
        label: "습도(%)",
        data: labels.map(d => avg(grouped[d].hums)),
        borderColor: "blue",
        yAxisID: "y",
      },
      {
        label: "조도(lux)",
        data: labels.map(d => avg(grouped[d].lux)),
        borderColor: "orange",
        yAxisID: "y1",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "white" },
      },
    },
    scales: {
      x: {
        ticks: { color: "white" },
        grid: { color: "rgba(255,255,255,0.2)" },
      },
      y: {
        type: "linear",
        position: "left",
        ticks: { color: "white" },
        grid: { color: "rgba(255,255,255,0.2)" },
      },
      y1: {
        type: "linear",
        position: "right",
        ticks: { color: "white" },
        grid: { drawOnChartArea: false },
      },
    },
  };

  return (
    <div className={styles.container}>
      <h2>📅 최근 7일 센서 데이터</h2>
      <div className={styles.chartBox}>
        <Line data={chartData} options={chartOptions} />
      </div>

      <h3>📊 데이터 테이블 (일 평균)</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>날짜</th>
            <th>평균 온도(°C)</th>
            <th>평균 습도(%)</th>
            <th>평균 조도(lux)</th>
          </tr>
        </thead>
        <tbody>
          {labels.length === 0 ? (
            <tr><td colSpan="4">데이터가 없습니다.</td></tr>
          ) : (
            labels.map((d, i) => (
              <tr key={i}>
                <td>{d}</td>
                <td>{avg(grouped[d].temps).toFixed(1)}</td>
                <td>{avg(grouped[d].hums).toFixed(1)}</td>
                <td>{avg(grouped[d].lux).toFixed(1)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default WeeklyInformation