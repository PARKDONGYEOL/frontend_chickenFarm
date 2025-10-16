import React, { useEffect, useRef } from 'react';
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import styles from './WaveChart.module.css';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, TimeScale
);

const WaveChart = ({ 
  data = [], 
  timestamps = [], 
  sensorType = 'temperature',
  title = '센서 데이터',
  unit = '',
  color = '#4CAF50',
  height = 200,
  showGrid = true,
  showLabels = true
}) => {
  // 센서 타입별 설정 (Y축 범위 포함)
  const sensorConfig = {
    temperature: { color: 'rgba(255,87,34,1)', unit: '°C', title: '온도', min: 15, max: 40 },
    humidity: { color: 'rgba(33,150,243,1)', unit: '%', title: '습도', min: 40, max: 100 },
    lux: { color: 'rgba(255,193,7,1)', unit: 'lux', title: '조도', min: 1, max: 1000 },
    co2: { color: 'rgba(156,39,176,1)', unit: 'ppm', title: 'CO2', min: 0, max: 3000 },
    no2: { color: 'rgba(244,67,54,1)', unit: 'ppb', title: 'NO2', min: 0, max: 50 },
    co: { color: 'rgba(121,85,72,1)', unit: 'ppm', title: 'CO', min: 0, max: 100 },
    nh3: { color: 'rgba(96,125,139,1)', unit: 'ppm', title: 'NH3', min: 0, max: 100 }
  };

  const config = sensorConfig[sensorType] || { color, unit, title };

  // Chart.js 데이터 형식으로 변환
  const chartData = {
    datasets: [
      {
        label: `${config.title} (${config.unit})`,
        data: data.map((value, index) => ({
          x: timestamps[index] ? new Date(timestamps[index]) : new Date(),
          y: value
        })),
        borderColor: config.color,
        backgroundColor: config.color.replace('1)', '0.2)'),
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: config.color,
        pointBorderColor: config.color,
        pointBorderWidth: 2,
        pointHoverBackgroundColor: config.color,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { 
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: config.color,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function(context) {
            const date = new Date(context[0].parsed.x);
            return date.toLocaleString('ko-KR', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
          },
          label: function(context) {
            return `${config.title}: ${context.parsed.y.toFixed(2)}${config.unit}`;
          }
        }
      }
    },
    scales: {
      x: { 
        type: "time", 
        time: { 
          unit: "second",
          displayFormats: {
            second: 'HH:mm:ss'
          }
        },
        grid: {
          color: showGrid ? 'rgba(224,224,224,0.5)' : 'transparent',
          lineWidth: 1
        },
        ticks: {
          color: '#666',
          font: {
            size: 10
          },
          maxTicksLimit: 8
        },
        title: {
          display: true,
          text: '시간',
          color: '#333',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      y: {
        beginAtZero: false,
        min: config.min !== undefined ? config.min : undefined,
        max: config.max !== undefined ? config.max : undefined,
        grid: {
          color: showGrid ? 'rgba(224,224,224,0.5)' : 'transparent',
          lineWidth: 1
        },
        ticks: {
          color: '#666',
          font: {
            size: 10
          },
          callback: function(value) {
            return value.toFixed(1) + config.unit;
          }
        },
        title: {
          display: true,
          text: `${config.title} (${config.unit})`,
          color: '#333',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    elements: {
      line: {
        borderWidth: 3,
        borderCapStyle: 'round',
        borderJoinStyle: 'round'
      },
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2
      }
    },
    animation: {
      duration: 0 // 실시간 업데이트를 위해 애니메이션 비활성화
    }
  };

  return (
    <div className={styles.waveChartContainer}>
      <div className={styles.chartWrapper} style={{ height: `${height}px` }}>
        {data.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className={styles.noData}>
            <p>📊 최근 실시간 데이터가 없습니다</p>
            <p>센서가 아직 데이터를 수집하지 않았거나</p>
            <p>예열 중일 수 있습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaveChart;
