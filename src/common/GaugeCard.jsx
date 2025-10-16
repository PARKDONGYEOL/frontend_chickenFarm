import React from "react";
import styles from "./GaugeCard.module.css";
import { ArcElement, Chart as ChartJS, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip);

const GaugeCard = ({ icon, label, value, max, min, optimalMax, unit, onClick, isSleepTime = false, sensorType }) => {
  // 상태 판단 (범위 기반)
  let status = "Normal";
  let gaugeColor = "#22c55e"; // 초록색 (정상)

  // 조도 센서의 경우 수면시간 고려
  if (sensorType === "lux") {
    if (isSleepTime) {
      // 수면시간: 조도가 높으면 경고
      if (value > optimalMax) {
        status = "Caution";
        gaugeColor = "#f59e0b"; // 주황색 (주의)
      }
      if (value > optimalMax * 1.5) {
        status = "Danger";
        gaugeColor = "#ef4444"; // 빨간색 (위험)
      }
    } else {
      // 활동시간: 조도가 낮으면 경고
      if (value < optimalMax) {
        status = "Caution";
        gaugeColor = "#f59e0b"; // 주황색 (주의)
      }
      if (value < optimalMax * 0.5) {
        status = "Danger";
        gaugeColor = "#ef4444"; // 빨간색 (위험)
      }
    }
  } else {
    // 다른 센서들은 기존 로직 사용
    // 최소값 미만이거나 최적 최대값 초과 시 주의
    if (value < min || value > optimalMax) {
      status = "Caution";
      gaugeColor = "#f59e0b"; // 주황색 (주의)
    }

    // 최대값의 90% 초과 시 위험
    if (value > max * 0.9) {
      status = "Danger";
      gaugeColor = "#ef4444"; // 빨간색 (위험)
    }
  }

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
        backgroundColor: [gaugeColor, "#e5e7eb"],
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