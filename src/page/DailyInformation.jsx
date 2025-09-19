import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from "chart.js";
import 'chartjs-adapter-date-fns';
import styles from "./DailyInformation.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const DailyInformation = () => {

  // 오늘 날짜를 YYYY-MM-DD 형태로 기본 설정(예: 2025-09-19)
  // .toISOString() → Date를 ISO 8601 형식 문자열로 변환 (예: "2025-09-19T06:30:00.000Z")
  // .slice(0, 10) → 문자열의 앞 10글자만 가져옴
  // React는 최초 한 번만 이 함수를 실행해서 초기값을 만듦.
  // 이후 리렌더링 때는 이 함수를 다시 실행하지 않고 기존 state 값을 그대로 씀.
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  // API에서 불러온 하루치 센서 데이터 목록
  const [rows, setRows] = useState([]);

  // 날짜(date)가 바뀔 때마다 실행
  useEffect(() => {
    if (!date) return;
    axios
      .get("/api/thsensor", { params: { startDate: date, endDate: date } })
      // 뱡합 연산자 ?? 사용
      // 서버에서 받아온 응답 데이터(res.data)가 있으면 그걸 rows에 넣고, 없으면 빈 배열([])을 넣어라.
      .then((res) => setRows(res.data ?? []))
      .catch((err) => console.error(err));
  }, [date]);

  // API에서 받은 rows 배열을 x: 시간(recTime), y: 값 형태로 변환
  // 온도, 습도는 왼쪽 Y축(y), 조도는 오른쪽 Y축(y1)
  const chartData = {
    // datasets : 차트에 올릴 “선(시리즈)”들의 배열. 여기선 3개(온도/습도/조도).

    // x: new Date(r.recTime) → 문자열/타임스탬프를 Date 객체로 바꿔 시간축에 표시
    // y: r.tempData / r.humData / r.luxData → 해당 시점의 수치값
    datasets: [
      {
        label: "온도(°C)",
        data: rows.map(r => ({ x: new Date(r.recTime), y: r.tempData })), 
        borderColor: "red",
        yAxisID: "y",
      },
      {
        label: "습도(%)",
        data: rows.map(r => ({ x: new Date(r.recTime), y: r.humData })), 
        borderColor: "blue",
        yAxisID: "y",
      },
      {
        label: "조도(lux)",
        data: rows.map(r => ({ x: new Date(r.recTime), y: r.luxData })), 
        borderColor: "orange",
        yAxisID: "y1",
      },
    ],
  };

  const chartOptions = {
    
    // responsive: true 
    // -> 차트 크기를 부모 요소 크기에 맞춰 자동으로 반응형 조절합니다.
    // maintainAspectRatio: false 
    // -> 기본적으로 Chart.js는 가로/세로 비율을 유지, 이걸 끄면부모 컨테이너의 넓이와 높이에 맞게 꽉 참
    responsive: true,
    maintainAspectRatio: false,
    // plugins (부가 기능)
    plugins: {
      // legend (범례)
      legend: {
        position: "bottom", // 차트 아래쪽에 범례를 배치
        labels: { color: "white" }, // 범례 텍스트 색상을 흰색으로
      },
    },
    // scales (축 설정)
    scales: {
      x: {
        type: "time", // 시간 축 활성화
        time: {
          unit: "hour", // 눈금 단위를 "시간"으로
          displayFormats: {
            hour: "HH:mm" // 표시할 때 24시간제 "시:분" 포맷
          }
        },
        ticks: { color: "white" }, // 눈금 라벨 색상
        grid: { color: "rgba(255,255,255,0.2)" }, // 격자선 색상 (옅은 흰색)
      },
      y: {
        type: "linear", // 숫자 값에 따라 선형 비율로 표시
        position: "left", // 왼쪽에 배치
        ticks: { color: "white" }, // 라벨을 흰색으로 표시
        grid: { color: "rgba(255,255,255,0.2)" }, // 격자선 색상도 x축과 동일하게 옅은 흰색
      },
      y1: {
        type: "linear",
        position: "right", // 오른쪽에 배치
        ticks: { color: "white" },
        // y1 축(오른쪽 축)에 대해서는 차트 영역 안쪽으로 격자선을 그리지 않음. 대신 왼쪽(y) 축만 격자선을 담당하도록 남겨둠.
        grid: { drawOnChartArea: false }
      },
    },
  };

  return (
    <div className={styles.container}>
      <h2>📅 하루 센서 데이터</h2>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <h3 className={styles.chartTitle}>{date} 라인 차트</h3>
      <div className={styles.chartBox}>
        <Line data={chartData} options={chartOptions} />
      </div>

      <h3>{date} 데이터 테이블</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>센서 ID</th>
            <th>온도(°C)</th>
            <th>습도(%)</th>
            <th>조도(lux)</th>
            <th>기록 시간</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan="5">데이터가 없습니다.</td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr key={i}>
                <td>{r.thSensorId}</td>
                <td>{r.tempData}</td>
                <td>{r.humData}</td>
                <td>{r.luxData}</td>
                <td>{new Date(r.recTime).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DailyInformation