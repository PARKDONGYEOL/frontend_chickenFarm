import React from "react";
import styles from "./GaugeCard.module.css";
import { ArcElement, Chart as ChartJS, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip);

const GaugeCard = ({ icon, label, value, max, min, optimalMax, unit, onClick }) => {
  // 상태 판단
  let status = "Normal";
  if (value > optimalMax) status = "Caution";
  if (value > max * 0.9) status = "Danger";

  // 게이지 데이터
  const data = {
    datasets: [
      {
        data: [value, Math.max(max - value, 0)],
        backgroundColor: ["#22c55e", "#e5e7eb"],
        borderWidth: 0,
        cutout: "80%",
        circumference: 180,
        rotation: 270,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { tooltip: { enabled: false } },
  };

  return (
    <div className={styles.card} onClick={onClick}>
      {/* 상단: 아이콘 + 라벨/단위 */}
      <div className={styles.header}>
        <div className={styles.icon}>{icon}</div>
        <div className={styles.labelBlock}>
          <div className={styles.label}>{label}</div>
          <div className={styles.unit}>{unit}</div> {/* ✅ 라벨 밑 단위 */}
        </div>
      </div>

      {/* 수치 값 + 상태 */}
      <div className={styles.valueRow}>
        <div className={styles.value}>{value.toFixed(1)}</div>
        <div
          className={`${styles.status} ${
            status === "Normal"
              ? styles.normal
              : status === "Caution"
              ? styles.caution
              : styles.danger
          }`}
        >
          {status}
        </div>
      </div>

      {/* 게이지 */}
      <div className={styles.gaugeWrapper}>
        <Doughnut data={data} options={options} />
      </div>

      {/* 최소/최대 값 */}
      <div className={styles.minMax}>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

export default GaugeCard;