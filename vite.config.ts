import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // 確保 build 過程中 API_KEY 被正確注入
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  },
  // 使用相對路徑，增加 GitHub Pages 部署的相容性
  base: './'
});