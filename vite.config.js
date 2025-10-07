import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/raspberry': {
        target: 'http://192.168.30.240:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/raspberry/, '/api')
      }
    }
  }
})



