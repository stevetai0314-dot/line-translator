import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // 讓程式碼可以安全存取 process.env.API_KEY
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  },
  // 這是您在 GitHub Pages 上的子路徑
  base: '/line-translator/'
});
