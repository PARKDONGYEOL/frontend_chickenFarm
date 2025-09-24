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

  // ✅ 모드: today(오늘, 자동 갱신) / past(과거, 수동 조회)
  const [mode, setMode] = useState('today');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  // ✅ 차트 옵션 생성 함수
  const createOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: title,
        color: '#2e7d32',
        font: { size: 16, weight: 'bold' },
        padding: { top: 10, bottom: 10 },
      },
    },
    elements: {
      line: { borderWidth: 2 },
      point: { radius: 3, backgroundColor: '#fff' },
    },
    scales: {
      x: {
        ticks: { color: '#555', font: { size: 12 } },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      y: {
        ticks: { color: '#555', font: { size: 12 } },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
    },
  });

  // ✅ 레이블 (시간)
  const labels = sensorData.map(entry => {
    const d = new Date(entry.recTime);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  // ✅ 차트 데이터
  const temperatureData = {
    labels,
    datasets: [
      {
        label: '온도 (°C)',
        data: sensorData.map(d => d.tempData),
        borderColor: 'rgba(255, 138, 157, 1)',
        backgroundColor: 'rgba(255, 138, 157, 0.3)',
        tension: 0.4,
      },
    ],
  };
  const humidityData = {
    labels,
    datasets: [
      {
        label: '습도 (%)',
        data: sensorData.map(d => d.humData),
        borderColor: 'rgba(100, 181, 246, 1)',
        backgroundColor: 'rgba(100, 181, 246, 0.3)',
        tension: 0.4,
      },
    ],
  };
  const lightData = {
    labels,
    datasets: [
      {
        label: '조도 (Lux)',
        data: sensorData.map(d => d.luxData),
        borderColor: 'rgba(255, 241, 118, 1)',
        backgroundColor: 'rgba(255, 241, 118, 0.4)',
        tension: 0.4,
      },
    ],
  };

  // ✅ 통계 계산
  const calcStats = (arr, key) => {
    if (!arr.length) return { min: 0, max: 0, avg: 0 };
    const values = arr.map(item => item[key]).filter(val => val != null);
    if (!values.length) return { min: 0, max: 0, avg: 0 };
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1),
    };
  };
  const tempStats = calcStats(sensorData, 'tempData');
  const humidStats = calcStats(sensorData, 'humData');
  const lightStats = calcStats(sensorData, 'luxData');

  // ✅ API 호출
  const filterTo5MinInterval = (data) => {
    return data.filter(entry => {
      const d = new Date(entry.recTime);
      return d.getMinutes() % 5 === 0;
    });
  };

  const fetchSensorData = async (targetDate) => {
    try {
      setLoading(true);
      setError(null);

      const startTime = '00:00:00';
      const endTime = '23:59:59';

      const [tempRes, humRes, luxRes] = await Promise.all([
        axios.get('/api/thsensor/temp', { params: { date: targetDate, startTime, endTime } }),
        axios.get('/api/thsensor/hum', { params: { date: targetDate, startTime, endTime } }),
        axios.get('/api/thsensor/lux', { params: { date: targetDate, startTime, endTime } }),
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

      setSensorData(filterTo5MinInterval(mergedData));
    } catch (err) {
      console.error(err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ 오늘 모드: 5분마다 자동 갱신
  useEffect(() => {
    if (mode === 'today') {
      const todayDate = new Date().toISOString().split('T')[0];
      fetchSensorData(todayDate);

      const interval = setInterval(() => {
        fetchSensorData(todayDate);
      }, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [mode]);

  // ✅ 과거 모드: 한 번만 조회
  useEffect(() => {
    if (mode === 'past' && date) {
      fetchSensorData(date);
    }
  }, [mode, date]);

  if (loading) {
    return (
      <div className={styles.container}>
        <h2>실시간 정보</h2>
        <div style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>
          데이터를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>실시간 정보</h2>

      {/* ✅ 날짜 선택 + 버튼 */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setMode('past');
          }}
        />
        {mode === 'past' && (
          <button
            onClick={() => setMode('today')}
            style={{
              marginLeft: '10px',
              padding: '6px 12px',
              border: 'none',
              background: '#4caf50',
              color: '#fff',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            오늘 데이터 보기
          </button>
        )}
      </div>

      {error && (
        <div style={{ color: '#f44336', marginBottom: '20px', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* ✅ 차트 3개 */}
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

      {/* ✅ 통계 카드 */}
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