// GaugeCard.jsx
import React from "react";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import styles from "./GaugeCard.module.css";

/**
 * 반원 게이지 카드 (요약)
 * props:
 *  - label: 카드 제목 (예: "온도 (°C)")
 *  - value: 현재 값 (number)
 *  - unit: 단위 표시 (예: "°C")
 *  - max: 게이지 최대값 (number)
 *  - warning: 경고 임계치 (number)
 *  - below: true면 값이 warning보다 "작을 때" 위험, false면 "클 때" 위험
 *  - width, height: 게이지 캔버스 크기 (기본 160 x 120)
 *  - onClick: 클릭 핸들러 (예: 모달 열기)
 *  - className: 추가 클래스
 */
const GaugeCard = ({
  label,
  value = 0,
  unit = "",
  max = 100,
  warning = 80,
  below = false,
  width = 160,
  height = 120,
  onClick,
  className = "",
}) => {
  const danger = below ? value < warning : value > warning;
  const statusText = danger ? "⚠️ 위험" : "✅ 정상";
  const valueText = Number.isFinite(value) ? value.toFixed(1) : "-";

  return (
    <div
      className={`${styles.card} ${onClick ? styles.clickable : ""} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`${label} ${statusText} (${valueText} ${unit})`}
    >
      <div className={styles.header}>
        <h4 className={styles.title}>{label}</h4>
      </div>

      <div className={styles.gaugeWrap}>
        <Gauge
          width={width}
          height={height}
          startAngle={-90}
          endAngle={90}
          value={value}
          valueMax={max}
          sx={{
            [`& .${gaugeClasses.valueArc}`]: {
              fill: danger ? "#ef4444" : "#22c55e", // 빨강/초록
              transition: "fill 200ms ease",
            },
            [`& .${gaugeClasses.referenceArc}`]: {
              fill: "#e5e7eb", // 회색 트랙
            },
            [`& .${gaugeClasses.valueText}`]: {
              fontSize: 20,
            },
          }}
        />
      </div>

      <div className={styles.footer}>
        <span className={danger ? styles.badgeDanger : styles.badgeOk}>
          {statusText} ({valueText} {unit})
        </span>
      </div>
    </div>
  );
};

export default GaugeCard;