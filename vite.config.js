import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
 
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 모든 네트워크 인터페이스에서 접근 허용
    port: 5173, // 기본 포트 (필요시 변경)
    // 구매한 도메인이 있다면 아래 설정도 가능
    // host: 'your-domain.com', // 실제 도메인으로 변경
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 프로덕션에서 console.log 제거
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', 'chart.js', 'react-chartjs-2']
        }
      }
    }
  }
}) 