import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const BACKEND_IP = '192.168.30.152'
const PYTHON_IP = '192.168.30.240'

// 환경 변수에서 포트 가져오기 (없으면 기본값 사용)
const PORT = process.env.PORT || process.env.VITE_PORT || 5173

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: PORT, // 환경 변수에서 포트 가져오기
    strictPort: false, // 포트가 사용 중이면 다른 포트 자동 선택
    proxy: {
      // 🔥 Python 센서 API - 가장 먼저 매칭
      '/api/realtime': {
        target: `http://${PYTHON_IP}:5000`,
        changeOrigin: true,
      },
      '/api/sensor-history': {
        target: `http://${PYTHON_IP}:5000`,
        changeOrigin: true,
      },
      '/api/status': {
        target: `http://${PYTHON_IP}:5000`,
        changeOrigin: true,
      },
      '/api/settings': {
        target: `http://${PYTHON_IP}:5000`,
        changeOrigin: true,
      },
      
      // 라즈베리파이 설정 API
      '/raspberry': {
        target: `http://${PYTHON_IP}:5000`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/raspberry/, '/api'),
      },
      
      // 백엔드 API - 마지막에 매칭
      '/api': {
        target: `http://${BACKEND_IP}:8080`,
        changeOrigin: true,
      }
    }
  }
})