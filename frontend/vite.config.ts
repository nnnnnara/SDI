import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/camera-view-1': {
        target: 'http://100.99.75.18:8001',
        changeOrigin: true,
      },
      '/camera-view-2': {
        target: 'http://100.99.75.18:8001',
        changeOrigin: true,
      },
    },
  },
})
