import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // 讓程式碼中可以讀取到 process.env.API_KEY
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  // 如果您的 GitHub Pages 網址是 https://stevetai0314-dot.github.io/line-translator/
  // 那麼 base 就必須是 '/line-translator/'
  base: '/line-translator/'
});