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

  // 자릿수 계산
  const getDigitClass = (num) => {
    const digits = String(num).length;
    if (digits === 1) return styles.digit1;
    if (digits === 2) return styles.digit2;
    if (digits === 3) return styles.digit3;
    return styles.digit4;
  };

  // 게이지 데이터
  const data = {
    datasets: [
      {
        data: [value, Math.max(max - value, 0)],
        backgroundColor: ["#22c55e", "#e5e7eb"],
        borderWidth: 0,
        cutout: "50%",
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
      {/* 상단: 아이콘 + 라벨/단위 + 수치/상태 */}
      <div className={styles.header}>
        <div className={styles.leftSection}>
          <div className={styles.icon}>{icon}</div>
          <div className={styles.labelBlock}>
            <div className={styles.label}>{label}</div>
            <div className={styles.unit}>{unit}</div>
          </div>
        </div>
        <div className={styles.rightSection}>
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
      </div>

      {/* 게이지 */}
      <div className={styles.gaugeWrapper}>
        <Doughnut data={data} options={options} />
      </div>

      {/* 최소/최대 값 */}
      <div className={styles.minMax}>
        <span className={`${styles.minValue} ${getDigitClass(min)}`}>{min}</span>
        <span className={`${styles.maxValue} ${getDigitClass(max)}`}>{max}</span>
      </div>
    </div>
  );
};

export default GaugeCard;