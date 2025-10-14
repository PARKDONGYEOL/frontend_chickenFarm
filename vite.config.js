import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/member': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/api/batch': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/api/farm': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
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
      '/raspberry': {
        target: 'http://localhost:5000',
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