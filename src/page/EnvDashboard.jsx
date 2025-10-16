import React, { useState, useEffect } from "react";
import styles from "./EnvDashboard.module.css";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { getDailyData, getWeeklyData, getMonthlyData } from "../api/farmStatusApi";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, TimeScale
);

const EnvDashboard = () => {
  const [period, setPeriod] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [farmData, setFarmData] = useState([]);
  const [loading, setLoading] = useState(false);
  const farmId = 1; // 농장 ID (세션에서 가져오거나 고정값)

  // 데이터 로드 함수
  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('=== fetchData 시작 ===');
      console.log('period:', period);
      console.log('farmId:', farmId);
      console.log('selectedDate:', selectedDate);
      
      let response;

      if (period === "daily") {
        console.log('일일 데이터 조회 시도...');
        response = await getDailyData(farmId, selectedDate);
        console.log('일일 데이터 응답:', response);
      } else if (period === "weekly") {
        console.log('주간 데이터 조회 시도...');
        // 선택된 날짜 기준 7일 전부터 7일간
        const endDate = new Date(selectedDate);
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 6);

        response = await getWeeklyData(
          farmId,
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );
        console.log('주간 데이터 응답:', response);
      } else {
        console.log('월간 데이터 조회 시도...');
        // 월간: selectedDate에서 연도 추출 (YYYY)
        const year = selectedDate.substring(0, 4);
        response = await getMonthlyData(farmId, year + '-01');
        console.log('월간 데이터 응답:', response);
      }

      console.log('=== 응답 처리 시작 ===');
      console.log('response:', response);
      console.log('response.success:', response?.success);

      console.log('response 전체 구조:', JSON.stringify(response, null, 2));

      if (response?.success) {
        console.log('✅ success = true');
        console.log('response.data 타입:', Array.isArray(response.data) ? 'Array' : typeof response.data);
        console.log('response.data 내용:', response.data);

        // 백엔드 응답 구조: { success: true, data: [...], count: N }
        // farmStatusApi.js에서 response.data를 반환하므로
        // 여기서 받는 response는 이미 { success, data, count } 형태
        const dataArray = response.data || [];

        console.log('✅ 최종 데이터 배열 길이:', dataArray.length);
        console.log('✅ 첫 번째 항목:', dataArray[0]);

        setFarmData(dataArray);
      } else {
        console.error('❌ 데이터 조회 실패:', response?.message);
        setFarmData([]);
      }
    } catch (error) {
      console.error('=== fetchData 에러 발생 ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      setFarmData([]);
    } finally {
      setLoading(false);
    }
  };

  // period나 selectedDate 변경 시 데이터 로드
  useEffect(() => {
    fetchData();
  }, [period, selectedDate]);

  // Refresh 버튼 핸들러
  const handleRefresh = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
    fetchData();
  };

  // 📌 센서 항목 정의 (RealTimeMonitoring 기준에 맞춤)
  const metrics = {
    temp: { label: "Temperature", unit: "°C", min: 15, max: 40, color: "#e53935" },
    hum: { label: "Humidity", unit: "%", min: 40, max: 100, color: "#1e88e5" },
    lux: { label: "Illumination", unit: "lx", min: 1, max: 1000, color: "#fbc02d" },
    nh3: { label: "NH₃", unit: "ppm", min: 0, max: 100, color: "#43a047" },
    co2: { label: "CO₂", unit: "ppm", min: 0, max: 3000, color: "#8e24aa" },
    no2: { label: "NO₂", unit: "ppb", min: 0, max: 50, color: "#ff5722" },
    co: { label: "CO", unit: "ppm", min: 0, max: 100, color: "#6d4c41" },
  };

  // 📌 실제 데이터 매핑 함수
  const getRealData = (metric) => {
    if (!farmData || farmData.length === 0) {
      console.log('farmData is empty:', farmData);
      return [];
    }

    console.log('farmData:', farmData);

    const fieldMap = {
      temp: 'tempData',
      hum: 'humData',
      lux: 'luxData',
      nh3: 'nh3Data',
      co2: 'co2Data',
      no2: 'no2Data',
    };

    const field = fieldMap[metric];
    if (!field) return [];

    const mappedData = farmData.map(item => {
      const xValue = new Date(item.recTime);
      const yValue = item[field] || 0;
      console.log(`${metric} - recTime: ${item.recTime}, x: ${xValue}, y: ${yValue}`);
      return {
        x: xValue,
        y: yValue
      };
    });

    console.log(`${metric} data:`, mappedData);
    return mappedData;
  };

  const getXAxisOptions = () => {
    if (period === "daily") {
      // 선택된 날짜의 00:00:00 ~ 23:59:59
      const dateStart = new Date(selectedDate);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(selectedDate);
      dateEnd.setHours(23, 59, 59, 999);

      return {
        type: "time",
        min: dateStart.getTime(),
        max: dateEnd.getTime(),
        time: { unit: "hour", stepSize: 2, displayFormats: { hour: "HH:mm" } },
        ticks: {
          color: "#666",
          callback: function(value) {
            const date = new Date(value);
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
          }
        },
        grid: { color: "#eee" },
      };
    } else if (period === "weekly") {
      return {
        type: "time",
        time: { unit: "day", displayFormats: { day: "M.dd" } },
        ticks: { color: "#666" },
        grid: { color: "#eee" },
      };
    } else {
      // 월간: 월별 평균 데이터 (1월~12월 전체 표시)
      const year = new Date(selectedDate).getFullYear();
      const yearStart = new Date(year, 0, 1); // 1월 1일
      const yearEnd = new Date(year, 11, 31, 23, 59, 59); // 12월 31일

      return {
        type: "time",
        min: yearStart.getTime(),
        max: yearEnd.getTime(),
        time: { unit: "month", displayFormats: { month: "M월" } },
        ticks: {
          color: "#666",
          callback: function(value) {
            const date = new Date(value);
            return `${date.getMonth() + 1}월`;
          }
        },
        grid: { color: "#eee" },
      };
    }
  };

  // 📌 데이터 카드용 요약 값 계산
  const getDiffText = (changePercent) => {
    if (period === "daily") {
      return `${changePercent}% from yesterday`;
    } else if (period === "weekly") {
      return `${changePercent}% from last week`;
    } else {
      return `${changePercent}% from last month`;
    }
  };

  const getLatestValue = (metric) => {
    if (!farmData || farmData.length === 0) return 0;
    const fieldMap = {
      temp: 'tempData',
      hum: 'humData',
      lux: 'luxData',
    };
    const field = fieldMap[metric];
    return farmData[farmData.length - 1]?.[field]?.toFixed(1) || 0;
  };

  const overview = [
    { key: "temp", value: getLatestValue("temp"), change: "+2.1" },
    { key: "hum", value: getLatestValue("hum"), change: "-1.3" },
    { key: "lux", value: getLatestValue("lux"), change: "+12.5" },
    { key: "air", value: "Good", change: "0" },
  ];

  return (
    <div className={styles.container}>
      {/* 페이지 제목 */}
      <h2>통계</h2>

      {/* 데이터 모니터링 컨트롤 */}
      <div className={styles.controlPanel}>
        <div className={styles.controlLeft}>
          <h3 className={styles.controlTitle}>Data Monitoring</h3>
          <div className={styles.periodTabs}>
            <button
              className={`${styles.periodTab} ${period === "daily" ? styles.active : ""}`}
              onClick={() => setPeriod("daily")}
            >
              Daily
            </button>
            <button
              className={`${styles.periodTab} ${period === "weekly" ? styles.active : ""}`}
              onClick={() => setPeriod("weekly")}
            >
              Weekly
            </button>
            <button
              className={`${styles.periodTab} ${period === "monthly" ? styles.active : ""}`}
              onClick={() => setPeriod("monthly")}
            >
              Monthly
            </button>
          </div>
        </div>
        <div className={styles.controlRight}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={styles.datePicker}
          />
          <button className={styles.refreshButton} onClick={handleRefresh}>
            Refresh
          </button>
        </div>
      </div>

      {/* 상단 데이터 요약 */}
      <div className={styles.overview}>
        {overview.map((item) => (
          <div key={item.key} className={styles.overviewCard}>
            <div className={styles.overviewValue}>
              {item.value}
              {metrics[item.key]?.unit && (
                <span className={styles.unit}> {metrics[item.key].unit}</span>
              )}
            </div>
            <div className={styles.overviewLabel}>
              {metrics[item.key]?.label || "Air Quality"}
            </div>
            <div className={styles.overviewDiff}>
              {item.key === "air" ? "Normal levels" : getDiffText(item.change)}
            </div>
          </div>
        ))}
      </div>

      {/* 차트 그리드 */}
      <div className={styles.chartGrid}>
        {/* 온도 */}
        <div className={styles.chartCard}>
          <h4 className={styles.chartTitle}>Temperature</h4>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              로딩 중...
            </div>
          ) : (
            <Line
              data={{
                datasets: [{
                  data: getRealData("temp"),
                  borderColor: metrics.temp.color,
                  backgroundColor: `${metrics.temp.color}33`,
                  tension: 0.3,
                  pointRadius: period === "monthly" ? 5 : 0,
                  pointHoverRadius: period === "monthly" ? 7 : 0,
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: getXAxisOptions(),
                  y: { min: metrics.temp.min, max: metrics.temp.max, ticks: { color: "#666" } },
                },
              }}
            />
          )}
        </div>

        {/* 습도 */}
        <div className={styles.chartCard}>
          <h4 className={styles.chartTitle}>Humidity</h4>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              로딩 중...
            </div>
          ) : (
            <Line
              data={{
                datasets: [{
                  data: getRealData("hum"),
                  borderColor: metrics.hum.color,
                  backgroundColor: `${metrics.hum.color}33`,
                  tension: 0.3,
                  pointRadius: period === "monthly" ? 5 : 0,
                  pointHoverRadius: period === "monthly" ? 7 : 0,
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: getXAxisOptions(),
                  y: { min: metrics.hum.min, max: metrics.hum.max, ticks: { color: "#666" } },
                },
              }}
            />
          )}
        </div>

        {/* 조도 */}
        <div className={styles.chartCard}>
          <h4 className={styles.chartTitle}>Illumination</h4>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              로딩 중...
            </div>
          ) : (
            <Line
              data={{
                datasets: [{
                  data: getRealData("lux"),
                  borderColor: metrics.lux.color,
                  backgroundColor: `${metrics.lux.color}33`,
                  tension: 0.3,
                  pointRadius: period === "monthly" ? 5 : 0,
                  pointHoverRadius: period === "monthly" ? 7 : 0,
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: getXAxisOptions(),
                  y: { min: metrics.lux.min, max: metrics.lux.max, ticks: { color: "#666" } },
                },
              }}
            />
          )}
        </div>

        {/* 공기질 (복합 차트) */}
        <div className={styles.chartCard}>
          <h4 className={styles.chartTitle}>Gas Levels</h4>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              로딩 중...
            </div>
          ) : (
            <Line
              data={{
                datasets: ["nh3", "co2", "no2"].map((key) => ({
                  label: metrics[key].label,
                  data: getRealData(key),
                  borderColor: metrics[key].color,
                  backgroundColor: `${metrics[key].color}33`,
                  tension: 0.3,
                  pointRadius: period === "monthly" ? 5 : 0,
                  pointHoverRadius: period === "monthly" ? 7 : 0,
                })),
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "bottom" } },
                scales: {
                  x: getXAxisOptions(),
                  y: { beginAtZero: true, ticks: { color: "#666" } },
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EnvDashboard;