import axios from 'axios'

// 개발 환경에서는 프록시를 사용하고, 프로덕션에서는 실제 백엔드 주소 사용
const API_BASE_URL = import.meta.env.DEV ? '' : 'http://localhost:8080'

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

// 위험 알림 관련 API
export const dangerNoticeAPI = {
  // 위험 알림 저장
  saveDangerNotice: async (noticeData) => {
    const response = await apiClient.post('/api/danger/insert', noticeData)
    return response.data
  },

  // 위험 알림 목록 조회
  getDangerNotices: async (farmNum) => {
    console.log('API 호출 시작:', `/api/danger/list/${farmNum}`)
    console.log('API_BASE_URL:', API_BASE_URL)
    const response = await apiClient.get(`/api/danger/list/${farmNum}`)
    console.log('API 응답:', response.data)
    return response.data
  }
}

// 예방접종 관련 API
export const inoculationAPI = {
  // 배치별 닭 목록 조회
  getChickensByBatch: async (batchId) => {
    const response = await apiClient.get(`/api/inoculation/batch/${batchId}`)
    return response.data
  },

  // 예방접종 실행
  performInoculation: async (inoculationData) => {
    const response = await apiClient.post('/api/inoculation/perform', inoculationData)
    return response.data
  },

  // 일괄 예방접종 실행
  performBatchInoculation: async (batchInoculationData) => {
    const response = await apiClient.post('/api/inoculation/perform', batchInoculationData)
    return response.data
  },

  // 예방접종 미완료 처리 (삭제)
  deleteInoculation: async (deleteData) => {
    const response = await apiClient.delete('/api/inoculation/perform', { data: deleteData })
    return response.data
  },

  // 예방접종 스케줄 조회
  getInoculationSchedule: async (batchId) => {
    const response = await apiClient.get(`/api/inoculation/schedule/${batchId}`)
    return response.data
  },

  // 농장별 배치 목록 조회
  getBatchesByFarm: async (farmNum) => {
    const response = await apiClient.get(`/api/inoculation/batches/${farmNum}`)
    return response.data
  }
}

// 멤버 관련 API
export const memberAPI = {
  // 로그인
  login: async (loginData) => {
    const response = await apiClient.get('/api/member', { params: loginData })
    return response.data
  },

  // 비밀번호 변경
  updatePassword: async (passwordData) => {
    const response = await apiClient.put('/api/member/password', passwordData)
    return response.data
  },

  // 이름 변경
  updateName: async (nameData) => {
    const response = await apiClient.put('/api/member/name', nameData)
    return response.data
  }
}

// 배치 관련 API
export const batchAPI = {
  // 배치 정보 조회
  getBatchInfo: async () => {
    const response = await apiClient.get('/api/batch/info')
    return response.data
  },

  // 배치 출하 처리
  updateShipment: async (batchIdList) => {
    const response = await apiClient.put('/api/batch/shipment', { batchIdList })
    return response.data
  },

  // 새 배치 생성
  createBatch: async (batchData) => {
    const response = await apiClient.post('/api/batch', batchData)
    return response.data
  }
}

// 농장 관련 API
export const farmAPI = {
  // 새 농장 생성
  createFarm: async (farmData) => {
    const response = await apiClient.post('/api/farm', farmData)
    return response.data
  }
}

// 닭 관련 API
export const chickenAPI = {
  // 배치별 닭 목록 조회
  getChickensByBatch: async (batchId) => {
    const response = await apiClient.get(`/api/chicken/${batchId}`)
    return response.data
  }
}

// 센서 데이터 관련 API
export const sensorAPI = {
  // 실시간 센서 데이터 조회
  getRealtimeData: async () => {
    const response = await apiClient.get('/api/realtime')
    return response.data
  },

  // 특정 센서의 최근 5분간 히스토리 데이터 조회
  getSensorHistory: async (sensorType) => {
    try {
      const response = await apiClient.get(`/api/sensor-history/${sensorType}`, {
        timeout: 10000 // 10초 타임아웃
      })
      return response.data
    } catch (error) {
      console.error(`센서 히스토리 조회 오류 (${sensorType}):`, error.message)
      throw error
    }
  }
}

// 환경 설정 관련 API
export const envSettingsAPI = {
  // 환경 설정 조회
  getSettings: async () => {
    try {
      const response = await apiClient.get('/api/env-settings', {
        timeout: 30000 // 30초 타임아웃
      })
      return response.data
    } catch (error) {
      console.error('환경 설정 API 오류:', error.message)
      throw error // 오류를 다시 던져서 상위에서 처리하도록 함
    }
  },
  
  // 환경 설정 업데이트
  updateSettings: async (settings) => {
    try {
      // 먼저 백엔드에 저장 시도
      try {
        const response = await apiClient.post('/api/env-settings', settings, {
          timeout: 30000 // 30초 타임아웃
        })
        return response.data
      } catch (backendError) {
        console.log('백엔드 저장 실패, 파이썬 서버로 직접 전송:', backendError.message)
        
        // 백엔드 실패 시 파이썬 서버로 직접 전송
        const pythonResponse = await apiClient.post('/raspberry/settings/update', settings, {
          timeout: 30000
        })
        return pythonResponse.data
      }
    } catch (error) {
      console.error('환경 설정 업데이트 오류:', error.message)
      throw error // 오류를 다시 던져서 상위에서 처리하도록 함
    }
  },
  
  // 설정을 라즈베리파이에 적용
  applySettings: async () => {
    try {
      // 먼저 백엔드에 적용 시도
      try {
        const response = await apiClient.post('/api/env-settings/apply', {}, {
          timeout: 30000 // 30초 타임아웃
        })
        return response.data
      } catch (backendError) {
        console.log('백엔드 적용 실패, 파이썬 서버로 직접 적용:', backendError.message)
        
        // 백엔드 실패 시 파이썬 서버로 직접 적용
        const pythonResponse = await apiClient.post('/raspberry/settings/apply', {}, {
          timeout: 30000
        })
        return pythonResponse.data
      }
    } catch (error) {
      console.error('설정 적용 오류:', error.message)
      throw error // 오류를 다시 던져서 상위에서 처리하도록 함
    }
  },

  // 현재 파이썬 서버의 설정 조회
  getCurrentSettings: async () => {
    try {
      const response = await apiClient.get('/raspberry/settings/current', {
        timeout: 30000
      })
      return response.data
    } catch (error) {
      console.error('현재 설정 조회 오류:', error.message)
      throw error
    }
  }
}

export default apiClient
export { apiClient }