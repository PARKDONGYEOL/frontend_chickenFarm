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
  const avg = (arr) =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const chartData = {
    labels,
    datasets: [
      {
        label: "온도(°C)",
        data: labels.map(d => avg(grouped[d].temps)),
        borderColor: "rgba(255, 138, 157, 1)",
        backgroundColor: "rgba(255, 138, 157, 0.3)",
        yAxisID: "y",
        tension: 0.4,
      },
      {
        label: "습도(%)",
        data: labels.map(d => avg(grouped[d].hums)),
        borderColor: "rgba(100, 181, 246, 1)",
        backgroundColor: "rgba(100, 181, 246, 0.3)",
        yAxisID: "y",
        tension: 0.4,
      },
      {
        label: "조도(lux)",
        data: labels.map(d => avg(grouped[d].lux)),
        borderColor: "rgba(255, 241, 118, 1)",
        backgroundColor: "rgba(255, 241, 118, 0.4)",
        yAxisID: "y1",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#333",
          padding: 15,
          usePointStyle: true,
          boxWidth: 10,
        },
      },
    },
    elements: {
      line: { borderWidth: 2 },
      point: { radius: 3, hoverRadius: 6, backgroundColor: "#fff" },
    },
    scales: {
      x: {
        ticks: { color: "#555", font: { size: 12 } },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      y: {
        type: "linear",
        position: "left",
        ticks: { color: "#555", font: { size: 12 } },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      y1: {
        type: "linear",
        position: "right",
        ticks: { color: "#555", font: { size: 12 } },
        grid: { drawOnChartArea: false },
      },
    },
  };

  return (
    <div className={styles.container}>
      <h2>최근 7일 센서 데이터</h2>

      {/* ✅ 차트 + 테이블 나란히 */}
      <div className={styles.chartAndTable}>
        {/* 차트 */}
        <div className={styles.chartWrapper}>
          <h3 className={styles.chartTitle}>주간 평균 라인 차트</h3>
          <div className={styles.chartBox}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* 테이블 */}
        <div className={styles.tableWrapper}>
          <h3 className={styles.tableTitle}>주간 평균 데이터</h3>
          <div className={styles.tableBox}>
            <div className={styles.tableScroll}>
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
                    <tr>
                      <td colSpan="4">데이터가 없습니다.</td>
                    </tr>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyInformation