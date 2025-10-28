import axios from 'axios'

// 환경 설정
const isDev = import.meta.env.DEV
const PYTHON_SERVER = isDev ? '' : 'http://192.168.30.240:5000'
const BACKEND_SERVER = 'http://192.168.30.152:8080'

// Axios 인스턴스
const pythonClient = axios.create({
  baseURL: PYTHON_SERVER,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

const backendClient = axios.create({
  baseURL: BACKEND_SERVER,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Python 인터셉터
pythonClient.interceptors.request.use(
  (config) => {
    if (isDev) console.log(`[Python] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => Promise.reject(error)
)

pythonClient.interceptors.response.use(
  (response) => {
    if (isDev) console.log(`[Python] ${response.status}`)
    return response
  },
  (error) => {
    if (isDev) console.error('[Python] Error:', error.message)
    return Promise.reject(error)
  }
)

// Backend 인터셉터
backendClient.interceptors.request.use(
  (config) => {
    if (isDev) console.log(`[Backend] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => Promise.reject(error)
)

backendClient.interceptors.response.use(
  (response) => {
    if (isDev) console.log(`[Backend] ${response.status}`, response.data)
    return response
  },
  (error) => {
    if (isDev) console.error('[Backend] Error:', error.response?.status, error.message)
    return Promise.reject(error)
  }
)

// API: 위험 알림
export const dangerNoticeAPI = {
  saveDangerNotice: async (noticeData) => {
    const response = await backendClient.post('/api/danger/insert', noticeData)
    return response.data
  },

  getDangerNotices: async (farmNum) => {
    const response = await backendClient.get(`/api/danger/list/${farmNum}`)
    return response.data
  }
}

// API: 예방접종
export const inoculationAPI = {
  getChickensByBatch: async (batchId) => {
    const response = await backendClient.get(`/api/inoculation/batch/${batchId}`)
    return response.data
  },

  performInoculation: async (inoculationData) => {
    const response = await backendClient.post('/api/inoculation/perform', inoculationData)
    return response.data
  },

  performBatchInoculation: async (batchInoculationData) => {
    const response = await backendClient.post('/api/inoculation/perform', batchInoculationData)
    return response.data
  },

  deleteInoculation: async (deleteData) => {
    const response = await backendClient.delete('/api/inoculation/perform', { data: deleteData })
    return response.data
  },

  getInoculationSchedule: async (batchId) => {
    const response = await backendClient.get(`/api/inoculation/schedule/${batchId}`)
    return response.data
  },

  getBatchesByFarm: async (farmNum) => {
    const response = await backendClient.get(`/api/inoculation/batches/${farmNum}`)
    return response.data
  }
}

// API: 멤버
export const memberAPI = {
  login: async (loginData) => {
    const response = await backendClient.post('/api/member', loginData)
    return response.data
  },

  updatePassword: async (passwordData) => {
    const response = await backendClient.put('/api/member/password', passwordData)
    return response.data
  },

  updateName: async (nameData) => {
    const response = await backendClient.put('/api/member/name', nameData)
    return response.data
  }
}

// API: 배치
export const batchAPI = {
  getBatchInfo: async () => {
    const response = await backendClient.get('/api/batch/info')
    return response.data
  },

  updateShipment: async (batchIdList) => {
    const response = await backendClient.put('/api/batch/shipment', { batchIdList })
    return response.data
  },

  createBatch: async (batchData) => {
    const response = await backendClient.post('/api/batch', batchData)
    return response.data
  }
}

// API: 농장
export const farmAPI = {
  createFarm: async (farmData) => {
    const response = await backendClient.post('/api/farm', farmData)
    return response.data
  }
}

// API: 닭
export const chickenAPI = {
  getChickensByBatch: async (batchId) => {
    const response = await backendClient.get(`/api/chicken/${batchId}`)
    return response.data
  }
}

// API: 센서 데이터
export const sensorAPI = {
  getRealtimeData: async () => {
    const url = isDev ? '/api/realtime' : `${PYTHON_SERVER}/api/realtime`
    const response = await pythonClient.get(url, { timeout: 10000 })
    return response.data
  },

  getSensorHistory: async (sensorType) => {
    const url = isDev ? `/api/sensor-history/${sensorType}` : `${PYTHON_SERVER}/api/sensor-history/${sensorType}`
    const response = await pythonClient.get(url, { timeout: 10000 })
    return response.data
  },

  getStatus: async () => {
    const url = isDev ? '/api/status' : `${PYTHON_SERVER}/api/status`
    const response = await pythonClient.get(url, { timeout: 10000 })
    return response.data
  }
}

// API: 환경 설정
export const envSettingsAPI = {
  // 설정 조회 (getSettings와 getCurrentSettings 모두 지원)
  getSettings: async () => {
    const url = isDev ? '/api/settings/current' : `${PYTHON_SERVER}/api/settings/current`
    const response = await pythonClient.get(url, { timeout: 10000 })
    return response.data
  },

  getCurrentSettings: async () => {
    const url = isDev ? '/api/settings/current' : `${PYTHON_SERVER}/api/settings/current`
    const response = await pythonClient.get(url, { timeout: 10000 })
    return response.data
  },

  // 설정 업데이트
  updateSettings: async (settings) => {
    const url = isDev ? '/api/settings/update' : `${PYTHON_SERVER}/api/settings/update`
    const response = await pythonClient.post(url, settings, { timeout: 10000 })
    return response.data
  },

  // 설정 적용
  applySettings: async () => {
    const url = isDev ? '/api/settings/apply' : `${PYTHON_SERVER}/api/settings/apply`
    const response = await pythonClient.post(url, {}, { timeout: 10000 })
    return response.data
  },

  // 백엔드 설정 조회
  getSettingsFromBackend: async () => {
    const response = await backendClient.get('/api/env-settings', { timeout: 10000 })
    return response.data
  },

  // 백엔드 설정 저장
  saveSettingsToBackend: async (settings) => {
    const response = await backendClient.post('/api/env-settings', settings, { timeout: 10000 })
    return response.data
  }
}

// 기본 export
export default backendClient
export const apiClient = backendClient