
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen max-w-md mx-auto bg-white shadow-lg flex flex-col">
      <header className="bg-emerald-600 text-white p-4 sticky top-0 z-10 shadow-md">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span>🇻🇳</span>
          <span>中越翻譯助手</span>
          <span>🇹🇼</span>
        </h1>
        <p className="text-xs opacity-80 mt-1">快速翻譯並傳送至 LINE 聊天室</p>
      </header>
      <main className="flex-1 p-4">
        {children}
      </main>
      <footer className="p-4 bg-slate-50 border-t text-center text-xs text-slate-400">
        Powered by LIFF & Gemini AI
      </footer>
    </div>
  );
};
