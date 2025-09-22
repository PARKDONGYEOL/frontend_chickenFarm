import React, { useEffect, useState } from 'react';
import styles from './PoultryFarmManagement.module.css';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PoultryFarmManagement = () => {
  
  const [sensorData, setSensorData] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const createOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: title,
        color: '#2e7d32', // ✅ 진한 초록
        font: { size: 16, weight: 'bold' },
        padding: { top: 10, bottom: 10 },
      },
    },
    elements: {
      line: { borderWidth: 2 },
      point: { radius: 3, backgroundColor: '#fff' }, // ✅ 포인트를 흰색 안쪽
    },
    scales: {
      x: {
        ticks: { color: '#555', font: { size: 12 } },
        grid: { color: 'rgba(0,0,0,0.05)' }, // ✅ 은은한 그리드
      },
      y: {
        ticks: { color: '#555', font: { size: 12 } },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
    },
  });

  const labels = sensorData.map(entry => {
    const date = new Date(entry.recTime);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  });

   // 온도 데이터
  const temperatureData = {
    labels,
    datasets: [
      {
        label: '온도 (°C)',
        data: sensorData.map(d => d.tempData),
        borderColor: 'rgba(255, 138, 157, 1)',     // ✅ 파스텔 핑크
        backgroundColor: 'rgba(255, 138, 157, 0.3)',
        tension: 0.4,
      },
    ],
  };

// 습도 데이터 (파스텔 블루)
const humidityData = {
  labels,
  datasets: [
    {
      label: '습도 (%)',
      data: sensorData.map(d => d.humData),
      borderColor: 'rgba(100, 181, 246, 1)',     // ✅ 파스텔 블루
      backgroundColor: 'rgba(100, 181, 246, 0.3)',
      tension: 0.4,
    },
  ],
};

// 조도 데이터 (파스텔 옐로우/그린)
const lightData = {
  labels,
  datasets: [
    {
      label: '조도 (Lux)',
      data: sensorData.map(d => d.luxData),
      borderColor: 'rgba(255, 241, 118, 1)',     // ✅ 파스텔 옐로우
      backgroundColor: 'rgba(255, 241, 118, 0.4)',
      tension: 0.4,
    },
  ],
};

  // 통계 계산 함수
  const calcStats = (arr, key) => {
    if (!arr.length) return { min: 0, max: 0, avg: 0 };
    const values = arr.map(item => item[key]).filter(val => val != null);
    if (values.length === 0) return { min: 0, max: 0, avg: 0 };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
    return { min, max, avg };
  };

  const tempStats = calcStats(sensorData, 'tempData');
  const humidStats = calcStats(sensorData, 'humData');
  const lightStats = calcStats(sensorData, 'luxData');

  // API 데이터 가져오기
  const filterTo5MinInterval = (data) => {
  return data.filter(entry => {
    const date = new Date(entry.recTime);
    return date.getMinutes() % 5 === 0; // 5분 단위만 남김
  });
};

const fetchSensorData = async () => {
  try {
    setLoading(true);
    setError(null);

    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const startTime = '00:00:00';
    const endTime = '23:59:59';

    const [tempRes, humRes, luxRes] = await Promise.all([
      axios.get('/api/thsensor/temp', { params: { date, startTime, endTime } }),
      axios.get('/api/thsensor/hum', { params: { date, startTime, endTime } }),
      axios.get('/api/thsensor/lux', { params: { date, startTime, endTime } }),
    ]);

    const tempData = tempRes.data || [];
    const humData = humRes.data || [];
    const luxData = luxRes.data || [];

    const maxLength = Math.max(tempData.length, humData.length, luxData.length);
    const mergedData = [];

    for (let i = 0; i < maxLength; i++) {
      const temp = tempData[i] || {};
      const hum = humData[i] || {};
      const lux = luxData[i] || {};
      const recTime = temp.recTime || hum.recTime || lux.recTime;

      if (recTime) {
        mergedData.push({
          recTime,
          tempData: temp.tempData ?? 0,
          humData: hum.humData ?? 0,
          luxData: lux.luxData ?? 0,
        });
      }
    }

    // ✅ 여기서 5분 단위로 필터링
    setSensorData(filterTo5MinInterval(mergedData));

  } catch (err) {
    console.error(err);
    setError('데이터를 불러오는데 실패했습니다.');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 5 * 60 * 1000); // 5분마다 갱신
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <h2>실시간 정보</h2>
        <div style={{ textAlign: 'center', color: '#eaeaea', marginTop: '50px' }}>
          데이터를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
     <div className={styles.container}>
      <h2>실시간 정보</h2>
      
      {error && (
        <div style={{ color: '#f44336', marginBottom: '20px', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* 차트 영역 */}
      <div className={styles.chart_div}>
        <div className={styles.chart}>
          <Line options={createOptions('온도')} data={temperatureData} />
        </div>
        <div className={styles.chart}>
          <Line options={createOptions('습도')} data={humidityData} />
        </div>
        <div className={styles.chart}>
          <Line options={createOptions('조도')} data={lightData} />
        </div>
      </div>

      {/* 통계 카드 영역 */}
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <h3>온도</h3>
          <p>최저: {tempStats.min}°C</p>
          <p>평균: {tempStats.avg}°C</p>
          <p>최고: {tempStats.max}°C</p>
        </div>

        <div className={styles.statCard}>
          <h3>습도</h3>
          <p>최저: {humidStats.min}%</p>
          <p>평균: {humidStats.avg}%</p>
          <p>최고: {humidStats.max}%</p>
        </div>

        <div className={styles.statCard}>
          <h3>조도</h3>
          <p>최저: {lightStats.min} Lux</p>
          <p>평균: {lightStats.avg} Lux</p>
          <p>최고: {lightStats.max} Lux</p>
        </div>
      </div>
    </div>
  );
};

export default PoultryFarmManagement