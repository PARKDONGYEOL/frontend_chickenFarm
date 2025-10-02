import React, { useState, useEffect } from "react";
import styles from "./RealTimeMonitoring.module.css";
import GaugeCard from "../common/GaugeCard";
import LineTrendChart from "../common/LineTrendChart";
import ModalFloat from "../common/ModalFloat";

// 아이콘 컴포넌트
const ThermoIcon = () => (
  <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <img width="40" height="40" src="/free-icon-temperature-2652881.png" alt="temperature"/>
  </div>
);

const HumidityIcon = () => (
  <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <img width="40" height="40" src="https://img.icons8.com/office/40/hygrometer.png" alt="hygrometer"/>
  </div>
);

const LightIcon = () => (
  <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <img width="40" height="40" src="/free-icon-lightbulb-2684825.png" alt="light"/>
  </div>
);

const AmmoniaIcon = () => (
  <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <img width="40" height="40" src="/ammonia.png" alt="ammonia"/>
  </div>
);

const CO2Icon = () => (
  <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <img width="40" height="40" src="https://img.icons8.com/ios-filled/50/co2.png" alt="co2"/>
  </div>
);

const NO2Icon = () => (
  <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'}}>
    ⚠️
  </div>
);

const COIcon = () => (
  <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <img width="40" height="40" src="/free-icon-carbon-monoxide-958528.png" alt="carbon monoxide"/>
  </div>
);

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

  const [weather, setWeather] = useState({
    temp: 0,
    feels_like: 0,
    temp_min: 0,
    temp_max: 0,
    description: "",
    humidity: 0,
    icon: "",
  });

  const [trendOpen, setTrendOpen] = useState(false);
  const [trend, setTrend] = useState({
    title: "",
    unit: "",
    points: [],
  });

  // ✅ 날씨 데이터 가져오기
  useEffect(() => {
    const fetchWeather = async () => {
      const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
      const city = "Ulsan"; // 원하는 도시명으로 변경 가능

      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=kr`
        );
        const data = await response.json();

        setWeather({
          temp: data.main.temp,
          feels_like: data.main.feels_like,
          temp_min: data.main.temp_min,
          temp_max: data.main.temp_max,
          description: data.weather[0].description.replace('온', ''),
          humidity: data.main.humidity,
          icon: data.weather[0].icon,
        });
      } catch (error) {
        console.error("날씨 데이터를 가져오는데 실패했습니다:", error);
      }
    };

    fetchWeather();
    // 10분마다 날씨 업데이트
    const weatherInterval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(weatherInterval);
  }, []);

  // ✅ 값 갱신 (5분마다 랜덤 데이터)
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

  // ✅ 24시간 시계열 데이터 생성
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

  // ✅ 더미 데이터 함수
  const genTemp = (i) => 22 + Math.sin(i / 6) * 3 + Math.random();
  const genHum = () => 60 + Math.random() * 25;
  const genLux = (i) => 300 + Math.sin(i / 4) * 150 + Math.random() * 30;
  const genNH3 = () => 10 + Math.random() * 25;
  const genCO2 = () => 400 + Math.random() * 700;
  const genNO2 = () => 80 + Math.random() * 100;
  const genCO = () => 20 + Math.random() * 120;

  const activeSensors = 7;
  const totalSensors = 7;
  const alerts = data.temp > 30 || data.hum > 80 || data.nh3 > 25 ? 1 : 0;

  return (
    <>
      <div className={styles.container}>
        <div className={styles.mainGrid}>
          {/* 왼쪽: 센서 카드들 + 시스템 상태 */}
          <div className={styles.leftSection}>
            <GaugeCard
              icon={<ThermoIcon />}
              label="온도"
              value={data.temp}
              max={40}
              min={15}
              optimalMax={30}
              unit="°C"
              onClick={() => openTrend("온도 (최근 24시간)", "°C", genTemp)}
            />
            <GaugeCard
              icon={<HumidityIcon />}
              label="습도"
              value={data.hum}
              max={100}
              min={40}
              optimalMax={80}
              unit="%"
              onClick={() => openTrend("습도 (최근 24시간)", "%", genHum)}
            />
            <GaugeCard
              icon={<LightIcon />}
              label="조도"
              value={data.lux}
              max={1000}
              min={1}
              optimalMax={50}
              unit="lux"
              onClick={() => openTrend("조도 (최근 24시간)", "lux", genLux)}
            />
            <GaugeCard
              icon={<AmmoniaIcon />}
              label="암모니아"
              value={data.nh3}
              max={60}
              min={0}
              optimalMax={25}
              unit="ppm"
              onClick={() => openTrend("암모니아 (최근 24시간)", "ppm", genNH3)}
            />
            <GaugeCard
              icon={<CO2Icon />}
              label="이산화탄소"
              value={data.co2}
              max={6000}
              min={1000}
              optimalMax={5000}
              unit="ppm"
              onClick={() => openTrend("이산화탄소 (최근 24시간)", "ppm", genCO2)}
            />
            <GaugeCard
              icon={<NO2Icon />}
              label="이산화질소"
              value={data.no2}
              max={200}
              min={0}
              optimalMax={50}
              unit="ppb"
              onClick={() => openTrend("이산화질소 (최근 24시간)", "ppb", genNO2)}
            />
            <GaugeCard
              icon={<COIcon />}
              label="일산화탄소"
              value={data.co}
              max={150}
              min={0}
              optimalMax={50}
              unit="ppm"
              onClick={() => openTrend("일산화탄소 (최근 24시간)", "ppm", genCO)}
            />

            {/* 시스템 상태 패널 */}
            <div className={styles.statusPanel}>
              <h3 className={styles.statusTitle}>시스템 상태</h3>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>활성 센서</span>
                <span className={styles.statusValue}>{activeSensors}/{totalSensors}</span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>알림</span>
                <span className={`${styles.statusValue} ${alerts > 0 ? styles.alertActive : ''}`}>{alerts}</span>
              </div>
            </div>
          </div>

          {/* 오른쪽: 날씨 정보 패널 */}
          <div className={styles.rightSection}>
            <div className={styles.weatherPanel}>
              <h3 className={styles.statusTitle}>
              {weather.icon && (
                <img
                  src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
                  alt={weather.description}
                  className={styles.titleWeatherIcon}
                />
              )}
              날씨 정보 (울산)
              </h3>
              <div className={styles.weatherContent}>
                <div className={styles.weatherTop}>
                  {weather.icon && (
                    <img
                      src={`https://openweathermap.org/img/wn/${weather.icon}@4x.png`}
                      alt={weather.description}
                      className={styles.weatherIcon}
                    />
                  )}
                  <div className={styles.weatherMainInfo}>
                    <div className={styles.weatherTemp}>{weather.temp.toFixed(1)}°C</div>
                    <div className={styles.weatherDesc}>{weather.description}</div>
                  </div>
                </div>
                <div className={styles.weatherInfo}>
                  <div>
                    <img
                      src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
                      alt="체감온도"
                      className={styles.infoIcon}
                    />
                    체감: {weather.feels_like.toFixed(1)}°C
                  </div>
                  <div>
                    <img
                      src={`https://openweathermap.org/img/wn/01d.png`}
                      alt="최저최고"
                      className={styles.infoIcon}
                    />
                    최저/최고: {weather.temp_min.toFixed(1)}°C / {weather.temp_max.toFixed(1)}°C
                  </div>
                  <div>
                    <img
                      src={`https://openweathermap.org/img/wn/09d.png`}
                      alt="습도"
                      className={styles.infoIcon}
                    />
                    습도: {weather.humidity}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ 클릭 시 모달 */}
      <ModalFloat
        isOpen={trendOpen}
        onClose={() => setTrendOpen(false)}
        title={trend.title}
        width={1200}
        height={600}
      >
        <div className={styles.modalContent}>
          <div className={styles.modalChart}>
            <LineTrendChart title="" data={trend.points} yUnit={trend.unit} />
          </div>
          <div className={styles.modalTable}>
            <h4 className={styles.trendTableTitle}>최근 5개 데이터</h4>
            <table className={styles.trendTable}>
              <thead>
                <tr>
                  <th>시간</th>
                  <th>값 ({trend.unit})</th>
                </tr>
              </thead>
              <tbody>
                {trend.points.slice(-5).map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.t.toLocaleString()}</td>
                    <td>{p.value.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ModalFloat>
    </>
  );
};

export default RealTimeMonitoring;