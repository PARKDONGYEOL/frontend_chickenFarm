import React, { useMemo } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import styles from "./LineTrendChart.module.css";

const LineTrendChart = ({ title = "", data = [], yUnit = "" }) => {
  const { xData, yData } = useMemo(() => {
    const xs = data.map((d) => d.t);
    const ys = data.map((d) => d.value);
    return { xData: xs, yData: ys };
  }, [data]);

  return (
    <div className={styles.card}>
      {title && <h4 className={styles.title}>{title}</h4>}
      <div className={styles.body}>
        <LineChart
          width={undefined}   // ✅ 고정값 제거
          height={undefined}  // ✅ 고정값 제거
          style={{ width: "100%", height: "100%" }}  // ✅ 부모 채우기
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
            },
          ]}
          series={[
            {
              data: yData,
              label: `값 (${yUnit})`,
              color: "rgba(255, 99, 132, 0.7)",
            },
          ]}
          yAxis={[
            {
              label: yUnit,
            },
          ]}
          grid={{ horizontal: true }}
        />
      </div>
    </div>
  );
};

export default LineTrendChart