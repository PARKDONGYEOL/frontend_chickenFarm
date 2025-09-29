import React, { useState } from "react";
import styles from "./EnvDashboard.module.css";
import ModalFloat from "../common/ModalFloat";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, TimeScale
);

const EnvDashboard = () => {
  const [modal, setModal] = useState({ open: false, metric: null });
  const [period, setPeriod] = useState("daily");

  // 📌 실제 계사 환경 기준값
  const metrics = {
    temp: { label: "온도", unit: "°C", min: 18, max: 30 },
    hum: { label: "습도", unit: "%", min: 50, max: 70 },
    lux: { label: "조도", unit: "lux", min: 100, max: 800 },
    nh3: { label: "암모니아", unit: "ppm", min: 0, max: 20 },
    co2: { label: "이산화탄소", unit: "ppm", min: 400, max: 1500 },
    no2: { label: "이산화질소", unit: "ppb", min: 0, max: 100 },
    co: { label: "일산화탄소", unit: "ppm", min: 0, max: 50 },
  };

  // 📌 더미 데이터 생성
  const generateTimeSeries = (points, fn) => {
    const now = Date.now();
    const step = (24 * 60 * 60 * 1000) / points;
    return Array.from({ length: points }, (_, i) => ({
      t: new Date(now - (points - i - 1) * step),
      v: fn(i),
    }));
  };

  const getDummyData = (metric, type = "daily") => {
    let points = 24;
    if (type === "weekly") points = 7;
    if (type === "monthly") points = 30;

    const { min, max } = metrics[metric];
    return generateTimeSeries(points, () =>
      min + Math.random() * (max - min)
    );
  };

  const openModal = (metric) => {
    setModal({ open: true, metric });
    setPeriod("daily");
  };

  // 📌 공통 X축 옵션
  const xAxisOptions = {
    type: "time",
    time: {
      unit: "hour",
      stepSize: 2,
      displayFormats: { hour: "HH" },
    },
    ticks: {
      color: "#333",
      callback: (value) => {
        const hour = new Date(value).getHours();
        return hour % 2 === 0 ? `${hour}` : "";
      },
    },
    grid: { color: "#ddd" },
  };

  return (
    <div className={styles.container}>
      <div className={styles.splitLayout}>
        {/* 쾌적 지수 */}
        <div className={styles.leftSection}>
          <h3 className={styles.sectionTitle}>쾌적 지수</h3>
          <div className={styles.comfortGrid}>
            {["temp", "hum", "lux"].map((key) => (
              <div
                key={key}
                className={styles.chartCard}
                onClick={() => openModal(key)}
              >
                <div className={styles.chartWrapperMini}>
                  <Line
                    data={{
                      datasets: [
                        {
                          data: getDummyData(key, "daily").map((p) => ({
                            x: p.t,
                            y: p.v,
                          })),
                          borderColor: "#2e7d32",
                          backgroundColor: "rgba(46,125,50,0.1)",
                          tension: 0.3,
                          pointRadius: 0,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false }, tooltip: { enabled: false } },
                      scales: {
                        x: xAxisOptions,
                        y: {
                          min: metrics[key].min,
                          max: metrics[key].max,
                          ticks: { color: "#666" },
                          grid: { display: false },
                        },
                      },
                    }}
                  />
                </div>
                <div className={styles.chartLabel}>
                  {metrics[key].label} ({metrics[key].unit})
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 공기질 */}
        <div className={styles.rightSection}>
          <h3 className={styles.sectionTitle}>공기질</h3>
          <div className={styles.airGrid}>
            {["nh3", "co2", "no2", "co"].map((key) => (
              <div
                key={key}
                className={styles.chartCard}
                onClick={() => openModal(key)}
              >
                <div className={styles.chartWrapperMini}>
                  <Line
                    data={{
                      datasets: [
                        {
                          data: getDummyData(key, "daily").map((p) => ({
                            x: p.t,
                            y: p.v,
                          })),
                          borderColor: "#2e7d32",
                          backgroundColor: "rgba(46,125,50,0.1)",
                          tension: 0.3,
                          pointRadius: 0,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false }, tooltip: { enabled: false } },
                      scales: {
                        x: xAxisOptions,
                        y: {
                          min: metrics[key].min,
                          max: metrics[key].max,
                          ticks: { color: "#666" },
                          grid: { display: false },
                        },
                      },
                    }}
                  />
                </div>
                <div className={styles.chartLabel}>
                  {metrics[key].label} ({metrics[key].unit})
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 모달 */}
      {modal.open && (
        <ModalFloat
          isOpen={modal.open}
          onClose={() => setModal({ open: false, metric: null })}
          title={`${metrics[modal.metric].label} 추세`}
          width={1000}
          height={600}
        >
          <div className={styles.modalContent}>
            <div className={styles.controls}>
              <label>기간: </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="daily">일일</option>
                <option value="weekly">주간</option>
                <option value="monthly">월간</option>
              </select>
            </div>

            <div className={styles.chartWrapper}>
              <Line
                data={{
                  datasets: [
                    {
                      label: `${metrics[modal.metric].label} (${metrics[modal.metric].unit})`,
                      data: getDummyData(modal.metric, period).map((p) => ({
                        x: p.t,
                        y: p.v,
                      })),
                      borderColor: "#2e7d32",
                      backgroundColor: "rgba(46,125,50,0.2)",
                      tension: 0.3,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "bottom", labels: { color: "#333" } },
                  },
                  scales: {
                    x: {
                      ...xAxisOptions,
                      time: {
                        unit: period === "daily" ? "hour" : "day",
                        stepSize: period === "daily" ? 2 : 1,
                        displayFormats: { hour: "HH", day: "MM/dd" },
                      },
                    },
                    y: {
                      min: metrics[modal.metric].min,
                      max: metrics[modal.metric].max,
                      ticks: { color: "#333" },
                      grid: { color: "#ddd" },
                    },
                  },
                }}
              />
            </div>
          </div>
        </ModalFloat>
      )}
    </div>
  );
};

export default EnvDashboard;