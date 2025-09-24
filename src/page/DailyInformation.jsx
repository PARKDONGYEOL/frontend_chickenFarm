import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from "chart.js";
import "chartjs-adapter-date-fns";
import styles from "./DailyInformation.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const DailyInformation = () => {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState([]);

  // ✅ 데이터 불러오기
  useEffect(() => {
    if (!date) return;
    axios
      .get("/api/thsensor", { params: { startDate: date, endDate: date } })
      .then((res) => setRows(res.data ?? []))
      .catch((err) => console.error(err));
  }, [date]);

  // ✅ 차트 데이터
  const chartData = {
    datasets: [
      {
        label: "온도(°C)",
        data: rows.map((r) => ({ x: new Date(r.recTime), y: r.tempData })),
        borderColor: "rgba(255, 138, 157, 1)",
        backgroundColor: "rgba(255, 138, 157, 0.3)",
        yAxisID: "y",
        tension: 0.4,
      },
      {
        label: "습도(%)",
        data: rows.map((r) => ({ x: new Date(r.recTime), y: r.humData })),
        borderColor: "rgba(100, 181, 246, 1)",
        backgroundColor: "rgba(100, 181, 246, 0.3)",
        yAxisID: "y",
        tension: 0.4,
      },
      {
        label: "조도(lux)",
        data: rows.map((r) => ({ x: new Date(r.recTime), y: r.luxData })),
        borderColor: "rgba(255, 241, 118, 1)",
        backgroundColor: "rgba(255, 241, 118, 0.4)",
        yAxisID: "y1",
        tension: 0.4,
      },
    ],
  };

  // ✅ 차트 옵션
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
        type: "time",
        time: { unit: "hour", displayFormats: { hour: "HH:mm" } },
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
      <h2>하루 센서 데이터</h2>

      {/* 날짜 입력 */}
      <div className={styles.dateInput}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* ✅ 차트와 테이블 가로 배치 */}
      <div className={styles.chartAndTable}>
        {/* 차트 영역 */}
        <div className={styles.chartWrapper}>
          <h3 className={styles.chartTitle}>{date} 라인 차트</h3>
          <div className={styles.chartBox}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* 테이블 영역 */}
        <div className={styles.tableWrapper}>
          <h3 className={styles.tableTitle}>{date} 데이터 테이블</h3>
          <div className={styles.tableBox}>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>온도(°C)</th>
                    <th>습도(%)</th>
                    <th>조도(lux)</th>
                    <th>기록 시간</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan="5">데이터가 없습니다.</td>
                    </tr>
                  ) : (
                    rows.map((r, i) => (
                      <tr key={i}>
                        <td>{r.tempData}</td>
                        <td>{r.humData}</td>
                        <td>{r.luxData}</td>
                        <td>{new Date(r.recTime).toLocaleString()}</td>
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

export default DailyInformation