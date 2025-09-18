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
import 'chartjs-adapter-date-fns';
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

  useEffect(() => {
    if (!date) return;
    axios
      .get("/api/thsensor", { params: { startDate: date, endDate: date } })
      .then((res) => setRows(res.data ?? []))
      .catch((err) => console.error(err));
  }, [date]);

  const chartData = {
    datasets: [
      {
        label: "온도(°C)",
        data: rows.map(r => ({ x: new Date(r.recTime), y: r.tempData })), 
        borderColor: "red",
        yAxisID: "y",
      },
      {
        label: "습도(%)",
        data: rows.map(r => ({ x: new Date(r.recTime), y: r.humData })), 
        borderColor: "blue",
        yAxisID: "y",
      },
      {
        label: "조도(lux)",
        data: rows.map(r => ({ x: new Date(r.recTime), y: r.luxData })), 
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
      type: "time",   // 시간 축 활성화
      time: {
        unit: "hour", // 1시간 단위로 눈금
        displayFormats: {
          hour: "HH:mm" // 라벨 포맷
        }
      },
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
      <h2>📅 하루 센서 데이터</h2>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <h3 className={styles.chartTitle}>{date} 라인 차트</h3>
      <div className={styles.chartBox}>
        <Line data={chartData} options={chartOptions} />
      </div>

      <h3>{date} 데이터 테이블</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>센서 ID</th>
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
                <td>{r.thSensorId}</td>
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
  );
};

export default DailyInformation