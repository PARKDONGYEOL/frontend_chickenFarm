import axios from 'axios';

const API_BASE_URL = 'http://192.168.30.152:8080/api/note';

// 전체 일지 조회
export const getAllNotes = async (memId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/all/${memId}`);
    return response.data;
  } catch (error) {
    console.error('전체 일지 조회 실패:', error);
    throw error;
  }
};

// 특정 날짜의 일지 조회
export const getNotesByDate = async (memId, date) => {
  try {
    console.log('=== getNotesByDate 호출 시작 ===');
    console.log('memId:', memId);
    console.log('date:', date);
    console.log('API URL:', `${API_BASE_URL}/date`);
    
    const response = await axios.get(`${API_BASE_URL}/date`, {
      params: { memId, date }
    });
    
    console.log('=== API 응답 성공 ===');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('=== getNotesByDate 에러 발생 ===');
    console.error('Error message:', error.message);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Request URL:', error.config?.url);
    console.error('Request params:', error.config?.params);
    throw error;
  }
};

// 특정 일지 조회
export const getNoteById = async (noteNum) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${noteNum}`);
    return response.data;
  } catch (error) {
    console.error('특정 일지 조회 실패:', error);
    throw error;
  }
};

// 일지 추가
export const insertNote = async (noteData) => {
  try {
    const response = await axios.post(API_BASE_URL, noteData);
    return response.data;
  } catch (error) {
    console.error('일지 추가 실패:', error);
    throw error;
  }
};

// 일지 수정
export const updateNote = async (noteData) => {
  try {
    const response = await axios.put(API_BASE_URL, noteData);
    return response.data;
  } catch (error) {
    console.error('일지 수정 실패:', error);
    throw error;
  }
};

// 일지 삭제
export const deleteNote = async (noteNum) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${noteNum}`);
    return response.data;
  } catch (error) {
    console.error('일지 삭제 실패:', error);
    throw error;
  }
};
