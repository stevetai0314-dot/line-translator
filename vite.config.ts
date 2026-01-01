
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  // 如果你的 Repo 名字不是 username.github.io，請把 base 改成 '/你的Repo名稱/'
  base: './' 
});
