
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // 確保環境變數能被正確注入
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  // 必須與您的 GitHub 倉庫名稱一致
  base: '/line-translator/' 
});
