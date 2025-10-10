import axios from 'axios'

// 개발 환경에서는 프록시를 사용하고, 프로덕션에서는 실제 백엔드 주소 사용
const API_BASE_URL = import.meta.env.DEV ? '/api' : 'http://localhost:8080/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10초 타임아웃
})

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API 요청: ${config.method?.toUpperCase()} ${config.url}`)
    console.log(`기본 URL: ${config.baseURL}`)
    return config
  },
  (error) => {
    console.error('API 요청 오류:', error)
    return Promise.reject(error)
  }
)

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API 응답: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('API 응답 오류:', error)
    if (error.code === 'ECONNREFUSED') {
      console.error('백엔드 서버가 실행되지 않았습니다. 포트 8080을 확인하세요.')
    }
    return Promise.reject(error)
  }
)

// 예방접종 관련 API
export const inoculationAPI = {
  // 배치별 닭 목록 조회
  getChickensByBatch: async (batchId) => {
    const response = await apiClient.get(`/inoculation/batch/${batchId}`)
    return response.data
  },

  // 예방접종 실행
  performInoculation: async (inoculationData) => {
    const response = await apiClient.post('/inoculation/perform', inoculationData)
    return response.data
  },

  // 일괄 예방접종 실행
  performBatchInoculation: async (batchInoculationData) => {
    const response = await apiClient.post('/inoculation/perform', batchInoculationData)
    return response.data
  },

  // 예방접종 미완료 처리 (삭제)
  deleteInoculation: async (deleteData) => {
    const response = await apiClient.delete('/inoculation/perform', { data: deleteData })
    return response.data
  },

  // 예방접종 스케줄 조회
  getInoculationSchedule: async (batchId) => {
    const response = await apiClient.get(`/inoculation/schedule/${batchId}`)
    return response.data
  },

  // 농장별 배치 목록 조회
  getBatchesByFarm: async (farmNum) => {
    const response = await apiClient.get(`/inoculation/batches/${farmNum}`)
    return response.data
  }
}

export default apiClient