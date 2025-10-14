import React, { useState, useEffect } from "react";
import styles from "./AlertHistory.module.css";
import DataTable from "../common/DataTable";
import { dangerNoticeAPI } from "../services/api";

const AlertHistory = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 날짜 검색 상태
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  
  // 시간 검색 상태
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    fetchAlertHistory();
  }, []);

  // 필터링된 데이터 업데이트
  useEffect(() => {
    filterAlerts();
  }, [alerts, startDate, endDate, searchCategory, startTime, endTime]);

  // 알림 기록 필터링 함수
  const filterAlerts = () => {
    let filtered = [...alerts];

    // 날짜 범위 필터링
    if (startDate) {
      filtered = filtered.filter(alert => {
        const alertDate = new Date(alert.recTime);
        const start = new Date(startDate);
        return alertDate >= start;
      });
    }

    if (endDate) {
      filtered = filtered.filter(alert => {
        const alertDate = new Date(alert.recTime);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // 하루 끝까지 포함
        return alertDate <= end;
      });
    }

    // 카테고리 필터링
    if (searchCategory) {
      filtered = filtered.filter(alert => 
        alert.noticeCategory.toLowerCase().includes(searchCategory.toLowerCase())
      );
    }

    // 시간대 필터링
    if (startTime) {
      filtered = filtered.filter(alert => {
        const alertTime = new Date(alert.recTime);
        const alertHour = alertTime.getHours();
        const alertMinute = alertTime.getMinutes();
        const alertTimeMinutes = alertHour * 60 + alertMinute;
        
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const startTimeMinutes = startHour * 60 + startMinute;
        
        return alertTimeMinutes >= startTimeMinutes;
      });
    }

    if (endTime) {
      filtered = filtered.filter(alert => {
        const alertTime = new Date(alert.recTime);
        const alertHour = alertTime.getHours();
        const alertMinute = alertTime.getMinutes();
        const alertTimeMinutes = alertHour * 60 + alertMinute;
        
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const endTimeMinutes = endHour * 60 + endMinute;
        
        return alertTimeMinutes <= endTimeMinutes;
      });
    }

    // 백엔드에서 이미 ORDER BY DESC로 정렬되어 있으므로 추가 정렬 불필요
    setFilteredAlerts(filtered);
  };

  // 검색 초기화
  const resetSearch = () => {
    setStartDate('');
    setEndDate('');
    setSearchCategory('');
    setStartTime('');
    setEndTime('');
  };

  const fetchAlertHistory = async () => {
    try {
      setLoading(true);
      const loginInfo = JSON.parse(sessionStorage.getItem("loginInfo") || "{}");
      const farmNum = loginInfo.farm_id || 1;
      
      console.log("알림기록 조회 시작 - farmNum:", farmNum);
      
      const result = await dangerNoticeAPI.getDangerNotices(farmNum);
      console.log("API 응답:", result);
      console.log("API 응답 타입:", typeof result);
      console.log("API 응답 success:", result?.success);
      console.log("API 응답 data:", result?.data);
      console.log("API 응답 data 길이:", result?.data?.length);
      
      if (result && result.success && Array.isArray(result.data)) {
        console.log("전체 데이터:", result.data);
        console.log("데이터 개수:", result.data.length);
        setAlerts(result.data);
        console.log("알림기록 로드 성공:", result.data.length, "건");
      } else if (Array.isArray(result)) {
        // 직접 배열로 반환된 경우
        console.log("직접 배열 데이터:", result);
        console.log("직접 배열 길이:", result.length);
        setAlerts(result);
        console.log("알림기록 로드 성공 (직접 배열):", result.length, "건");
      } else {
        console.log("알림 기록이 없거나 API 응답 실패:", result);
        setAlerts([]); // 빈 배열로 설정
      }
    } catch (err) {
      console.error("알림 기록 조회 오류:", err);
      setError("알림 기록을 불러오는데 실패했습니다. 백엔드 서버를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  // 시간 포맷팅 함수
  const formatDateTime = (dateTimeString) => {
    console.log('formatDateTime 호출됨:', dateTimeString);
    const date = new Date(dateTimeString);
    console.log('Date 객체:', date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    const formatted = `${year}-${month}-${day} ${hours}:${minutes}`;
    console.log('포맷팅된 결과:', formatted);
    return formatted;
  };

  const getCategoryColor = (category) => {
    const colors = {
      "온도": "#ef4444",
      "습도": "#3b82f6", 
      "CO2": "#10b981",
      "조명": "#f59e0b",
      "암모니아": "#8b5cf6",
      "일산화탄소": "#6b7280"
    };
    return colors[category] || "#6b7280";
  };

  const columns = [
    {
      key: "noticeNum",
      label: "번호",
      width: "80px"
    },
    {
      key: "noticeCategory",
      label: "카테고리",
      width: "120px",
      render: (value) => (
        <span 
          className={styles.categoryBadge}
          style={{ backgroundColor: getCategoryColor(value) }}
        >
          {value}
        </span>
      )
    },
    {
      key: "noticeContent",
      label: "알림 내용",
      width: "auto"
    },
    {
      key: "recTime",
      label: "발생 시간",
      width: "180px",
      render: (value) => formatDateTime(value)
    }
  ];

  if (loading) {
    return (
      <div className={styles.container}>
        <h2>알림기록</h2>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h2>알림기록</h2>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  console.log("AlertHistory 렌더링 - alerts:", alerts);
  console.log("AlertHistory 렌더링 - alerts.length:", alerts.length);

  return (
    <div className={styles.container}>
      <h2>알림기록</h2>
      
      {/* 검색 폼 */}
      <div className={styles.searchForm}>
        <div className={styles.searchRow}>
          <div className={styles.searchItem}>
            <label htmlFor="startDate">시작 날짜</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>
          <div className={styles.searchItem}>
            <label htmlFor="endDate">종료 날짜</label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>
          <div className={styles.searchItem}>
            <label htmlFor="startTime">시작 시간</label>
            <input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={styles.timeInput}
            />
          </div>
          <div className={styles.searchItem}>
            <label htmlFor="endTime">종료 시간</label>
            <input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={styles.timeInput}
            />
          </div>
          <div className={styles.searchItem}>
            <label htmlFor="category">카테고리</label>
            <select
              id="category"
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className={styles.selectInput}
            >
              <option value="">전체</option>
              <option value="온도">온도</option>
              <option value="습도">습도</option>
              <option value="CO2">CO2</option>
              <option value="조명">조명</option>
              <option value="암모니아">암모니아</option>
              <option value="일산화탄소">일산화탄소</option>
            </select>
          </div>
          <div className={styles.searchItem}>
            <button 
              onClick={resetSearch}
              className={styles.resetButton}
            >
              초기화
            </button>
          </div>
        </div>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>전체 알림 수</span>
          <span className={styles.summaryValue}>{alerts.length}건</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>검색 결과</span>
          <span className={styles.summaryValue}>{filteredAlerts.length}건</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>최근 알림</span>
          <span className={styles.summaryValue}>
            {alerts.length > 0 
              ? formatDateTime(alerts[0].recTime)
              : "없음"
            }
          </span>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <DataTable
          data={filteredAlerts}
          columns={columns}
          limit={filteredAlerts.length} // 모든 데이터 표시
          emptyMessage="검색 조건에 맞는 알림 기록이 없습니다."
        />
      </div>
    </div>
  );
};

export default AlertHistory;
