import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/farm-status';

// 일일 데이터 조회
export const getDailyData = async (farmId, date) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/daily`, {
      params: { farmId, date }
    });
    return response.data;
  } catch (error) {
    console.error('일일 데이터 조회 실패:', error);
    throw error;
  }
};

// 주간 데이터 조회
export const getWeeklyData = async (farmId, startDate, endDate) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/weekly`, {
      params: { farmId, startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('주간 데이터 조회 실패:', error);
    throw error;
  }
};

// 월간 데이터 조회
export const getMonthlyData = async (farmId, yearMonth) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/monthly`, {
      params: { farmId, yearMonth }
    });
    return response.data;
  } catch (error) {
    console.error('월간 데이터 조회 실패:', error);
    throw error;
  }
};

// 최신 데이터 조회
export const getLatestData = async (farmId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/latest`, {
      params: { farmId }
    });
    return response.data;
  } catch (error) {
    console.error('최신 데이터 조회 실패:', error);
    throw error;
  }
};
