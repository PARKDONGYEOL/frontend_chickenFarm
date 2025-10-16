import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Python 서버 IP 설정 (환경 변수 또는 기본값)
const PYTHON_SERVER_IP = process.env.VITE_PYTHON_SERVER_IP || '192.168.30.240' /* ip주소를 라즈베리파이 실행중인 컴퓨터 ip로 해야함 */

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 🔥 핵심 설정: 외부 접속 허용
    proxy: {
      '/api/member': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api/batch': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api/farm': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api/chicken': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/api/inoculation': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/api/danger': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/api/env-settings': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // 라즈베리파이 Python 서버 API
      '/raspberry': {
        target: 'http://192.168.30.152:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/raspberry/, '/api')
      },
      // 파이썬 서버의 센서 API 프록시
      '/api/realtime': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/api/sensor-history': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/api/settings': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/api/status': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})