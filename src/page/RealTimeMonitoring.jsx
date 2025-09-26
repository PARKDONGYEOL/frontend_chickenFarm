import React, { useState, useEffect } from "react";
import styles from "./RealTimeMonitoring.module.css";
import GaugeCard from "../common/GaugeCard";
import LineTrendChart from "../common/LineTrendChart";
import ModalFloat from "../common/ModalFloat";
import DataTable from "../common/DataTable";

const RealTimeMonitoring = () => {
  const [data, setData] = useState({
    temp: 0,
    hum: 0,
    nh3: 0,
    lux: 0,
    co2: 0,
    no2: 0,
    co: 0,
  });

  const [trendOpen, setTrendOpen] = useState(false);
  const [trend, setTrend] = useState({
    title: "",
    unit: "",
    points: [],
  });

  useEffect(() => {
    const updateData = () => {
      setData({
        temp: Math.random() * 40,
        hum: Math.random() * 100,
        nh3: Math.random() * 40,
        lux: Math.random() * 1000,
        co2: Math.random() * 1000,
        no2: Math.random() * 200,
        co: Math.random() * 150,
      });
    };
    updateData();
    const interval = setInterval(updateData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const generateTimeSeries = (points = 96, fn) => {
    const now = Date.now();
    const step = (24 * 60 * 60 * 1000) / points;
    return Array.from({ length: points }, (_, i) => {
      const time = new Date(now - (points - 1 - i) * step);
      return { t: time, value: fn(i) };
    });
  };

  const openTrend = (title, unit, generator) => {
    const points = generateTimeSeries(96, generator);
    setTrend({ title, unit, points });
    setTrendOpen(true);
  };

  const genTemp = (i) => 22 + Math.sin(i / 6) * 3 + Math.random();
  const genHum = () => 60 + Math.random() * 25;
  const genLux = (i) => 300 + Math.sin(i / 4) * 150 + Math.random() * 30;
  const genNH3 = () => 10 + Math.random() * 25;
  const genCO2 = () => 400 + Math.random() * 700;
  const genNO2 = () => 80 + Math.random() * 100;
  const genCO = () => 20 + Math.random() * 120;

  return (
    <>
      <div className={styles.container}>
        <div className={styles.gaugeSection}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>쾌적 지수</h3>
            <div className={`${styles.cards} ${styles.cards3}`}>
              <GaugeCard label="온도 (°C)" value={data.temp} max={40} warning={35} unit="°C" onClick={() => openTrend("온도 (최근 24시간)", "°C", genTemp)} />
              <GaugeCard label="습도 (%)" value={data.hum} max={100} warning={40} below unit="%" onClick={() => openTrend("습도 (최근 24시간)", "%", genHum)} />
              <GaugeCard label="조도 (lux)" value={data.lux} max={1000} warning={800} unit="lux" onClick={() => openTrend("조도 (최근 24시간)", "lux", genLux)} />
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>공기질</h3>
            <div className={`${styles.cards} ${styles.cards4}`}>
              <GaugeCard label="암모니아 (ppm)" value={data.nh3} max={40} warning={20} unit="ppm" onClick={() => openTrend("암모니아 (최근 24시간)", "ppm", genNH3)} />
              <GaugeCard label="이산화탄소 (CO₂)" value={data.co2} max={1000} warning={800} unit="ppm" onClick={() => openTrend("이산화탄소 (최근 24시간)", "ppm", genCO2)} />
              <GaugeCard label="이산화질소 (NO₂)" value={data.no2} max={200} warning={150} unit="ppb" onClick={() => openTrend("이산화질소 (최근 24시간)", "ppb", genNO2)} />
              <GaugeCard label="일산화탄소 (CO)" value={data.co} max={150} warning={100} unit="ppm" onClick={() => openTrend("일산화탄소 (최근 24시간)", "ppm", genCO)} />
            </div>
          </section>
        </div>
      </div>

      {/* ✅ 모달 (라인차트 + 최근 5개 테이블) */}
      <ModalFloat isOpen={trendOpen} onClose={() => setTrendOpen(false)} title={trend.title} width={920} height={640}>
        <LineTrendChart title="" data={trend.points} yUnit={trend.unit} />

        <DataTable
          title="📊 최근 5개 데이터"
          columns={[
            { key: "time", label: "시간" },
            { key: "value", label: `값 (${trend.unit})` },
          ]}
          data={trend.points.map((p) => ({
            time: p.t.toLocaleString(),
            value: p.value.toFixed(2),
          }))}
          limit={5}
        />
      </ModalFloat>
    </>
  );
};

export default RealTimeMonitoring