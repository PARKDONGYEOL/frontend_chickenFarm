import React, { useState, useEffect } from "react";
import styles from "./RealTimeMonitoring.module.css";
import GaugeCard from "../common/GaugeCard";
import LineTrendChart from "../common/LineTrendChart";
import ModalFloat from "../common/ModalFloat";
import WaveChart from "../common/WaveChart";
import { sensorAPI } from "../services/api";

const ThermoIcon = () => (
  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <img width="40" height="40" src="/free-icon-temperature-2652881.png" alt="temperature" />
  </div>
);

const HumidityIcon = () => (
  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <img width="40" height="40" src="https://img.icons8.com/office/40/hygrometer.png" alt="hygrometer" />
  </div>
);

const LightIcon = () => (
  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <img width="40" height="40" src="/free-icon-lightbulb-2684825.png" alt="light" />
  </div>
);

const AmmoniaIcon = () => (
  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <img width="40" height="40" src="/ammonia.png" alt="ammonia" />
  </div>
);

const CO2Icon = () => (
  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <img width="40" height="40" src="https://img.icons8.com/ios-filled/50/co2.png" alt="co2" />
  </div>
);

const NO2Icon = () => (
  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
    ⚠️
  </div>
);

const COIcon = () => (
  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <img width="40" height="40" src="/free-icon-carbon-monoxide-958528.png" alt="carbon monoxide" />
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

  // 센서 히스토리 관련 상태
  const [sensorHistory, setSensorHistory] = useState({
    temperature: [],
    humidity: [],
    lux: [],
    co2: [],
    no2: [],
    co: [],
    nh3: [],
    timestamps: []
  });
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  

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

  const [envStatus, setEnvStatus] = useState({
    status: "양호",
    score: 100,
    issues: []
  });

  // 센서 박스 클릭 핸들러
  const handleSensorClick = async (sensorType) => {
    try {
      console.log(`🔍 ${sensorType} 센서 히스토리 조회 시작...`);
      console.log(`📡 API 호출: /api/sensor-history/${sensorType}`);
      
      const response = await sensorAPI.getSensorHistory(sensorType);
      
      console.log(`📊 API 응답:`, response);
      
      if (response.success) {
        console.log(`✅ ${sensorType} 히스토리 데이터 수신:`, response.data);
        console.log(`📊 데이터 포인트 수: ${response.data.values?.length || 0}`);
        console.log(`⏰ 타임스탬프 수: ${response.data.timestamps?.length || 0}`);
        
        if (response.data.values && response.data.values.length > 0) {
          setSensorHistory(response.data);
          setSelectedSensor(sensorType);
          setIsHistoryModalOpen(true);
          console.log(`🎯 모달 열기: ${sensorType}`);
        } else {
          console.warn(`⚠️ ${sensorType} 히스토리 데이터가 비어있습니다.`);
          alert(`${sensorType} 센서의 최근 데이터가 없습니다. 잠시 후 다시 시도해주세요.`);
        }
      } else {
        console.error(`❌ ${sensorType} 히스토리 조회 실패:`, response.message);
        alert(`센서 히스토리 조회 실패: ${response.message}`);
      }
    } catch (error) {
      console.error(`💥 ${sensorType} 히스토리 조회 오류:`, error);
      alert(`센서 히스토리 조회 오류: ${error.message}`);
    }
  };

  // 히스토리 모달 닫기
  const closeHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setSelectedSensor(null);
  };

  // 환경 상태 계산 함수
  const calculateEnvStatus = (sensorData) => {
    const issues = [];
    let score = 100;

    // 온도 체크 (18-28°C가 적정)
    if (sensorData.temp < 18 || sensorData.temp > 28) {
      issues.push("온도");
      score -= 20;
    }

    // 습도 체크 (40-70%가 적정)
    if (sensorData.hum < 40 || sensorData.hum > 70) {
      issues.push("습도");
      score -= 15;
    }

    // CO2 체크 (1000ppm 이하가 적정)
    if (sensorData.co2 > 1000) {
      issues.push("CO2");
      score -= 25;
    }

    // 암모니아 체크 (25ppm 이하가 적정)
    if (sensorData.nh3 > 25) {
      issues.push("암모니아");
      score -= 20;
    }

    // 일산화탄소 체크 (50ppm 이하가 적정)
    if (sensorData.co > 50) {
      issues.push("일산화탄소");
      score -= 30;
    }

    // 조도 체크 (200-500lux가 적정)
    if (sensorData.lux < 200 || sensorData.lux > 500) {
      issues.push("조도");
      score -= 10;
    }

    // 상태 결정
    let status;
    if (score >= 80) {
      status = "양호";
    } else if (score >= 60) {
      status = "좋음";
    } else {
      status = "나쁨";
    }

    return { status, score: Math.max(0, score), issues };
  };

  // 날씨 데이터 가져오기
  useEffect(() => {
    const fetchWeather = async () => {
      const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
      const city = "Ulsan";

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
    const weatherInterval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(weatherInterval);
  }, []);


  // 센서 데이터 가져오기
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const result = await sensorAPI.getRealtimeData();

        if (result.success && result.data) {
          const newData = {
            temp: result.data.temperature || 0,
            hum: result.data.humidity || 0,
            nh3: result.data.nh3 || 0,
            lux: result.data.lux || 0,
            co2: result.data.co2 || 0,
            no2: result.data.no2 || 0,
            co: result.data.co || 0,
          };
          setData(newData);
          
          // 환경 상태 계산
          const envStatusResult = calculateEnvStatus(newData);
          setEnvStatus(envStatusResult);
        }
      } catch (error) {
        console.error("센서 데이터 가져오기 실패:", error);
      }
    };

    // 히스토리 데이터 업데이트 함수
    const updateHistoryData = async () => {
      if (isHistoryModalOpen && selectedSensor) {
        try {
          console.log(`🔄 히스토리 데이터 자동 업데이트: ${selectedSensor}`);
          const response = await sensorAPI.getSensorHistory(selectedSensor);
          
          if (response.success && response.data.values && response.data.values.length > 0) {
            setSensorHistory(response.data);
            console.log(`✅ 히스토리 데이터 업데이트 완료: ${response.data.count}개 포인트`);
          }
        } catch (error) {
          console.error(`❌ 히스토리 데이터 업데이트 실패: ${error.message}`);
        }
      }
    };

    fetchSensorData();
    updateHistoryData(); // 초기 히스토리 업데이트
    
    const interval = setInterval(() => {
      fetchSensorData();
      updateHistoryData(); // 매초마다 히스토리 업데이트
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isHistoryModalOpen, selectedSensor]); // 의존성 배열에 모달 상태 추가

  // 24시간 시계열 데이터 생성
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

  // 더미 데이터 함수
  const genTemp = (i) => 22 + Math.sin(i / 6) * 3 + Math.random();
  const genHum = () => 60 + Math.random() * 25;
  const genLux = (i) => 300 + Math.sin(i / 4) * 150 + Math.random() * 30;
  const genNH3 = () => 10 + Math.random() * 25;
  const genCO2 = () => 400 + Math.random() * 700;
  const genNO2 = () => 80 + Math.random() * 100;
  const genCO = () => 20 + Math.random() * 120;

  const activeSensors = 7;
  const totalSensors = 7;
  const alertCount = data.temp > 30 || data.hum > 80 || data.nh3 > 25 ? 1 : 0;

  return (
    <>
      <div className={styles.container}>
        {/* 페이지 제목 */}
        <h2>실시간 모니터링</h2>

        <div className={styles.mainGrid}>
          <div className={styles.leftSection}>
            <GaugeCard
              icon={<ThermoIcon />}
              label="온도"
              value={data.temp}
              max={40}
              min={15}
              optimalMax={30}
              unit="°C"
              onClick={() => handleSensorClick('temperature')}
            />
            <GaugeCard
              icon={<HumidityIcon />}
              label="습도"
              value={data.hum}
              max={100}
              min={40}
              optimalMax={80}
              unit="%"
              onClick={() => handleSensorClick('humidity')}
            />
            <GaugeCard
              icon={<LightIcon />}
              label="조도"
              value={data.lux}
              max={1000}
              min={1}
              optimalMax={50}
              unit="lux"
              onClick={() => handleSensorClick('lux')}
            />
            <GaugeCard
              icon={<AmmoniaIcon />}
              label="암모니아"
              value={data.nh3}
              max={100}
              min={0}
              optimalMax={50}
              unit="ppm"
              onClick={() => handleSensorClick('nh3')}
            />
            <GaugeCard
              icon={<CO2Icon />}
              label="이산화탄소"
              value={data.co2}
              max={400}
              min={0}
              optimalMax={250}
              unit="ppm"
              onClick={() => handleSensorClick('co2')}
            />
            <GaugeCard
              icon={<NO2Icon />}
              label="이산화질소"
              value={data.no2}
              max={20}
              min={0}
              optimalMax={10}
              unit="ppb"
              onClick={() => handleSensorClick('no2')}
            />
            <GaugeCard
              icon={<COIcon />}
              label="일산화탄소"
              value={data.co}
              max={100}
              min={0}
              optimalMax={50}
              unit="ppm"
              onClick={() => handleSensorClick('co')}
            />

            <div className={styles.statusPanel}>
              <h3 className={styles.statusTitle}>환경 상태</h3>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>전체 상태</span>
                <span className={`${styles.statusValue} ${envStatus.status === '양호' ? styles.statusGood : envStatus.status === '좋음' ? styles.statusFair : styles.statusBad}`}>
                  {envStatus.status}
                </span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>환경 점수</span>
                <span className={styles.statusValue}>{envStatus.score}/100점</span>
              </div>
              {envStatus.issues.length > 0 && (
                <div className={styles.statusItem}>
                  <span className={styles.statusLabel}>주의 항목</span>
                  <span className={styles.statusValue}>{envStatus.issues.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

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

      {/* 센서 히스토리 모달 */}
      <ModalFloat
        isOpen={isHistoryModalOpen}
        onClose={closeHistoryModal}
        title={`${selectedSensor ? selectedSensor.toUpperCase() : ''} 센서 히스토리 (최근 30초)`}
        width={900}
        height={500}
      >
        <div className={styles.historyContainer}>
          {selectedSensor && (
            <WaveChart
              data={sensorHistory.values || []}
              timestamps={sensorHistory.timestamps || []}
              sensorType={selectedSensor}
              height={300}
              showGrid={true}
              showLabels={true}
            />
          )}
          
          {/* 데이터 정보 */}
          <div className={styles.historyInfo}>
            <p>데이터 포인트: {sensorHistory.count || 0}개</p>
            <p>시간 범위: 최근 30초</p>
            {sensorHistory.values && sensorHistory.values.length > 0 && (
              <p>
                현재 값: {sensorHistory.values[sensorHistory.values.length - 1]?.toFixed(2)}
                {selectedSensor === 'temperature' ? '°C' : 
                 selectedSensor === 'humidity' ? '%' :
                 selectedSensor === 'lux' ? 'lux' :
                 selectedSensor === 'co2' ? 'ppm' :
                 selectedSensor === 'no2' ? 'ppb' :
                 selectedSensor === 'co' ? 'ppm' :
                 selectedSensor === 'nh3' ? 'ppm' : ''}
              </p>
            )}
          </div>
        </div>
      </ModalFloat>
    </>
  );
};

export default RealTimeMonitoring;