import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale, // ddd
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
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
  TimeScale,
  Filler
);

const DailyInformation = () => {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState([]);

  // 데이터 불러오기
  useEffect(() => {
    if (!date) return;
    axios
      .get("/api/thsensor", { params: { startDate: date, endDate: date } })
      .then((res) => setRows(res.data ?? []))
      .catch((err) => console.error(err));
  }, [date]);

  // 개별 차트 생성 함수
  const createChartData = (label, dataKey, color) => ({
    datasets: [
      {
        label,
        data: rows.map((r) => ({ x: new Date(r.recTime), y: r[dataKey] })),
        borderColor: color,
        backgroundColor: color.replace('1)', '0.1)'),
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  });

  // 차트 옵션
  const createChartOptions = (label, unit, color) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        type: "time",
        time: { unit: "hour", displayFormats: { hour: "HH:mm" } },
        ticks: { color: "#9ca3af", font: { size: 10 } },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        ticks: { color: "#9ca3af", font: { size: 10 }, precision: 0 },
        grid: { color: "rgba(0,0,0,0.05)", drawBorder: false },
        border: { display: false },
      },
    },
  });

  // 최신 값 계산
  const getLatestValue = (dataKey) => {
    if (rows.length === 0) return "0";
    return rows[rows.length - 1]?.[dataKey]?.toFixed(1) || "0";
  };

  // 차트 카드 컴포넌트
  const ChartCard = ({ icon, title, value, unit, dataKey, color, status }) => (
    <div className={styles.chartCard}>
      <div className={styles.cardHeader}>
        <div className={styles.iconWrapper} style={{ background: color }}>
          {icon}
        </div>
        <div className={styles.cardInfo}>
          <div className={styles.cardTitle}>{title}</div>
          <div className={styles.cardValue}>
            {value} <span className={styles.unit}>{unit}</span>
          </div>
        </div>
        <div className={`${styles.status} ${styles[status]}`}>{status === 'normal' ? 'Normal' : 'Caution'}</div>
      </div>
      <div className={styles.chartWrap}>
        <Line
          data={createChartData(title, dataKey, color)}
          options={createChartOptions(title, unit, color)}
        />
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>Data Monitoring</h2>
          <p className={styles.subtitle}>Smart device data environmental indicators</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.dateDisplay}>
            <span className={styles.dateLabel}>Today</span>
            <span className={styles.dateValue}>{date}</span>
          </div>
          <button className={styles.refreshBtn}>↻ Refresh</button>
        </div>
      </div>

      {/* 날짜 입력 */}
      <div className={styles.dateInput}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* 차트 그리드 */}
      <div className={styles.chartsGrid}>
        <ChartCard
          icon={<img src="/free-icon-temperature-2652881.png" alt="temperature" style={{width: '32px', height: '32px'}} />}
          title="Temperature"
          value={getLatestValue('tempData')}
          unit="°C"
          dataKey="tempData"
          color="rgba(239, 68, 68, 1)"
          status="normal"
        />
        <ChartCard
          icon="💧"
          title="Humidity"
          value={getLatestValue('humData')}
          unit="%"
          dataKey="humData"
          color="rgba(59, 130, 246, 1)"
          status="normal"
        />
        <ChartCard
          icon={<img src="/free-icon-lightbulb-2684825.png" alt="light" style={{width: '32px', height: '32px'}} />}
          title="Illumination"
          value={getLatestValue('luxData')}
          unit="lux"
          dataKey="luxData"
          color="rgba(245, 158, 11, 1)"
          status="normal"
        />
        <ChartCard
          icon={<img src="/ammonia.png" alt="ammonia" style={{width: '32px', height: '32px'}} />}
          title="Ammonia (NH₃)"
          value={(Math.random() * 15 + 5).toFixed(1)}
          unit="ppm"
          dataKey="nh3Data"
          color="rgba(168, 85, 247, 1)"
          status="normal"
        />
        <ChartCard
          icon="🌿"
          title="Carbon Dioxide (CO₂)"
          value={(Math.random() * 400 + 400).toFixed(0)}
          unit="ppm"
          dataKey="co2Data"
          color="rgba(34, 197, 94, 1)"
          status="normal"
        />
        <ChartCard
          icon="⚠️"
          title="Nitrogen Dioxide (NO₂)"
          value={(Math.random() * 1 + 0.5).toFixed(1)}
          unit="ppb"
          dataKey="no2Data"
          color="rgba(249, 115, 22, 1)"
          status="caution"
        />
        <ChartCard
          icon={<img src="/free-icon-carbon-monoxide-958528.png" alt="carbon monoxide" style={{width: '32px', height: '32px'}} />}
          title="Carbon Monoxide (CO)"
          value={(Math.random() * 3 + 1).toFixed(1)}
          unit="ppm"
          dataKey="coData"
          color="rgba(100, 100, 100, 1)"
          status="normal"
        />
      </div>
    </div>
  );
};

export default DailyInformation;