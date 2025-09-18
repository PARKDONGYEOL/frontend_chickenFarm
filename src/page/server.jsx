// src/App.js - 실시간 + 그래프
import React, { useState, useEffect } from 'react';

function App() {
  const [realtimeData, setRealtimeData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  
  const API_BASE = 'http://192.168.1.100:5000/api';

  // 실시간 데이터 (2초마다)
  useEffect(() => {
    const fetchRealtime = async () => {
      try {
        const response = await fetch(`${API_BASE}/realtime`);
        const data = await response.json();
        setRealtimeData(data);
      } catch (error) {
        console.error('실시간 데이터 오류:', error);
      }
    };

    fetchRealtime();
    const interval = setInterval(fetchRealtime, 2000);
    return () => clearInterval(interval);
  }, []);

  // 히스토리 데이터 (30초마다)
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_BASE}/history`);
        const data = await response.json();
        setHistoryData(data);
      } catch (error) {
        console.error('히스토리 데이터 오류:', error);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>🏠 하이브리드 센서 대시보드</h1>
      
      {/* 실시간 데이터 */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px', 
        borderRadius: '15px', 
        marginBottom: '20px' 
      }}>
        <h2>⚡ 실시간 상태 (메모리)</h2>
        {realtimeData ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '2em' }}>🌡️ {realtimeData.temperature}°C</div>
              <small>온도</small>
            </div>
            <div>
              <div style={{ fontSize: '2em' }}>💧 {realtimeData.humidity}%</div>
              <small>습도</small>
            </div>
            <div>
              <div style={{ fontSize: '2em' }}>☀️ {realtimeData.lux}</div>
              <small>조도</small>
            </div>
            <div>
              <div style={{ fontSize: '1.5em' }}>💡 {realtimeData.led_status}</div>
              <small>LED</small>
            </div>
            <div>
              <div style={{ fontSize: '1.5em' }}>🔄 {realtimeData.motor_status}</div>
              <small>모터</small>
            </div>
            <div>
              <div style={{ fontSize: '1.5em' }}>📐 {realtimeData.servo_position}°</div>
              <small>서보</small>
            </div>
          </div>
        ) : (
          <p>실시간 데이터 로딩중...</p>
        )}
      </div>

      {/* 히스토리 그래프 영역 */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '15px', 
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)' 
      }}>
        <h2>📈 24시간 히스토리 (DB)</h2>
        <p>데이터 포인트: {historyData.length}개</p>
        {historyData.length > 0 ? (
          <div>
            <p>최신: {historyData[historyData.length - 1]?.timestamp}</p>
            <p>가장 오래된: {historyData[0]?.timestamp}</p>
            {/* 여기에 실제 차트 라이브러리 연결 */}
            <div style={{ height: '200px', background: '#f8f9fa', borderRadius: '8px', padding: '20px' }}>
              <p>🚧 차트 영역 (Chart.js 또는 Recharts 연결 예정)</p>
            </div>
          </div>
        ) : (
          <p>히스토리 데이터 로딩중...</p>
        )}
      </div>
    </div>
  );
}

export default App;