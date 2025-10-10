import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/note';

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
    const response = await axios.get(`${API_BASE_URL}/date`, {
      params: { memId, date }
    });
    return response.data;
  } catch (error) {
    console.error('특정 날짜 일지 조회 실패:', error);
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
