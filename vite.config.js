import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/member': {
        target: 'http://192.168.30.152:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/api/batch': {
        target: 'http://192.168.30.152:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/api/farm': {
        target: 'http://192.168.30.152:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/api/chicken': {
        target: 'http://192.168.30.152:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/api/inoculation': {
        target: 'http://192.168.30.152:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/api/danger': {
        target: 'http://192.168.30.152:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/api/env-settings': {
        target: 'http://192.168.30.152:8080',
        changeOrigin: true,
      },
      '/raspberry': {
        target: 'http://192.168.30.152:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/raspberry/, '/api')
      },
      // 파이썬 서버의 센서 API 프록시
      '/api/realtime': {
        target: 'http://192.168.30.240:5000',
        changeOrigin: true,
      },
      '/api/sensor-history': {
        target: 'http://192.168.30.240:5000',
        changeOrigin: true,
      },
      '/api/settings': {
        target: 'http://192.168.30.240:5000',
        changeOrigin: true,
      },
      '/api/status': {
        target: 'http://192.168.30.240:5000',
        changeOrigin: true,
      }
    }
  }
})