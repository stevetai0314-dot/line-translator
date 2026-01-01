import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // 確保程式碼中出現的 process.env.API_KEY 被替換為環境變數字串
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  },
  // 這是您的 GitHub 倉庫路徑，請確認與倉庫名稱一致
  base: '/line-translator/'
});
