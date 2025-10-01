import React, { useMemo } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import styles from "./LineTrendChart.module.css";

const LineTrendChart = ({ title = "", data = [], yUnit = "", min = 0, optimalMax = 100 }) => {
  const { xData, yData, minY, maxY } = useMemo(() => {
    const xs = data.map((d) => d.t);
    const ys = data.map((d) => d.value);
    const dataMin = Math.min(...ys);
    const dataMax = Math.max(...ys);
    return { xData: xs, yData: ys, minY: dataMin, maxY: dataMax };
  }, [data]);

  // 각 포인트의 상태에 따라 색상 결정
  const getColorForValue = (value) => {
    if (value < min) return "#f59e0b"; // 노란색 (낮음)
    if (value > optimalMax) return "#dc2626"; // 빨간색 (높음)
    return "#10b981"; // 녹색 (정상)
  };

  // 데이터를 3개의 시리즈로 분할 (low, normal, high)
  const series = useMemo(() => {
    const lowData = yData.map((v) => (v < min ? v : null));
    const normalData = yData.map((v) => (v >= min && v <= optimalMax ? v : null));
    const highData = yData.map((v) => (v > optimalMax ? v : null));

    return [
      {
        data: lowData,
        label: `낮음 (< ${min})`,
        curve: "natural",
        showMark: false,
        area: true,
        color: "#f59e0b",
        connectNulls: true,
      },
      {
        data: normalData,
        label: `정상 (${min}-${optimalMax})`,
        curve: "natural",
        showMark: false,
        area: true,
        color: "#10b981",
        connectNulls: true,
      },
      {
        data: highData,
        label: `높음 (> ${optimalMax})`,
        curve: "natural",
        showMark: false,
        area: true,
        color: "#dc2626",
        connectNulls: true,
      },
    ];
  }, [yData, min, optimalMax]);

  return (
    <div className={styles.card}>
      {title && <h4 className={styles.title}>{title}</h4>}
      <div className={styles.body}>
        <LineChart
          width={undefined}
          height={undefined}
          style={{ width: "100%", height: "100%" }}
          xAxis={[
            {
              data: xData,
              scaleType: "time",
              label: "시간",
              valueFormatter: (v) =>
                new Date(v).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              tickLabelStyle: {
                fontSize: 11,
                fill: "#6b7280",
              },
            },
          ]}
          series={series}
          yAxis={[
            {
              label: yUnit,
              tickLabelStyle: {
                fontSize: 11,
                fill: "#6b7280",
              },
            },
          ]}
          grid={{ horizontal: true, vertical: true }}
          sx={{
            "& .MuiLineElement-root": {
              strokeWidth: 3,
            },
            "& .MuiAreaElement-root": {
              fillOpacity: 0.3,
            },
            "& .MuiChartsGrid-line": {
              stroke: "#e5e7eb",
              strokeDasharray: "4 4",
            },
            "& .MuiChartsAxis-line": {
              stroke: "#9ca3af",
              strokeWidth: 2,
            },
            "& .MuiChartsAxis-tick": {
              stroke: "#9ca3af",
            },
            "& .MuiChartsLegend-root": {
              fontSize: 12,
              fontWeight: 600,
            },
          }}
          slotProps={{
            legend: {
              position: { vertical: "top", horizontal: "right" },
              padding: 0,
            },
          }}
        >
          <defs>
            {/* 기준선 표시용 */}
            <line
              id="minLine"
              x1="0"
              y1={min}
              x2="100%"
              y2={min}
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            <line
              id="maxLine"
              x1="0"
              y1={optimalMax}
              x2="100%"
              y2={optimalMax}
              stroke="#dc2626"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          </defs>
        </LineChart>
      </div>
    </div>
  );
};

export default LineTrendChart;