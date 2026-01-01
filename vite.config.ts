
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // 確保環境變數能被正確注入
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  // 重要：這裡的路徑必須與您的 GitHub 倉庫名稱完全一致
  // 例如倉庫網址是 https://github.com/user/my-app，這裡就要寫 '/my-app/'
  base: '/line-translator/' 
});
