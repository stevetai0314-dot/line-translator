
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { translateText } from './services/geminiService';
import { AppStatus, TranslationResult } from './types';

// 請確認這裡填的是你的 LIFF ID
const LIFF_ID: string = '2008793706-VpD5hC7x'; 

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.INITIALIZING);
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLiffInitialized, setIsLiffInitialized] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const initLiff = async () => {
      try {
        if (!LIFF_ID || LIFF_ID === '2006764506-6JreQ2eB' && window.location.hostname !== 'localhost') {
          setStatus(AppStatus.ERROR);
          setError("請在 App.tsx 中設定正確的 LIFF ID");
          return;
        }

        await window.liff.init({ liffId: LIFF_ID });
        setIsLiffInitialized(true);
        
        if (!window.liff.isInClient()) {
          setStatus(AppStatus.OUTSIDE_LINE);
        } else {
          setStatus(AppStatus.READY);
        }
      } catch (err: any) {
        console.error('LIFF init error', err);
        setError(`LIFF 初始化失敗: ${err.message}`);
        setStatus(AppStatus.ERROR);
      }
    };

    if (window.liff) {
      initLiff();
    } else {
      setStatus(AppStatus.ERROR);
      setError("找不到 LINE SDK，請檢查網路連線");
    }
  }, []);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // 檢查 API KEY 是否存在 (定義在 vite.config.ts)
      if (!process.env.API_KEY) {
        throw new Error("找不到 API_KEY，請確認 GitHub Secrets 設定");
      }
      const res = await translateText(inputText);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "翻譯發生錯誤");
    } finally {
      setLoading(false);
    }
  };

  const formatMessage = () => {
    if (!result) return '';
    return result.sourceLang === 'vi' 
      ? `🇻🇳 越語：${result.original}\n🇹🇼 中文：${result.translated}`
      : `🇹🇼 中文：${result.original}\n🇻🇳 越語：${result.translated}`;
  };

  const handleSendToLine = async () => {
    if (!result || !isLiffInitialized) return;
    try {
      await window.liff.sendMessages([{ type: 'text', text: formatMessage() }]);
      window.liff.closeWindow();
    } catch (err: any) {
      console.error('Send error', err);
      setError('傳送失敗！請確認是在 LINE 聊天室內開啟，且已授權傳訊權限。');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formatMessage()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (status === AppStatus.INITIALIZING) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-100 border-t-emerald-600"></div>
          <p className="mt-4 text-slate-500 font-medium italic">系統啟動中...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl text-xs">
            <strong>發生錯誤：</strong> {error}
          </div>
        )}

        <section>
          <textarea
            className="w-full p-5 border-2 border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none h-40 text-slate-800 shadow-inner text-lg"
            placeholder="請輸入越文或中文..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            onClick={handleTranslate}
            disabled={loading || !inputText.trim()}
            className={`w-full mt-4 py-4 rounded-2xl font-black text-white transition-all shadow-xl ${
              loading || !inputText.trim() 
                ? 'bg-slate-200' 
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]'
            }`}
          >
            {loading ? '🦾 翻譯中...' : '🌟 立即翻譯'}
          </button>
        </section>

        {result && (
          <section className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-black text-slate-300 uppercase ml-1">原文</span>
                <div className="bg-slate-50 p-4 rounded-2xl text-slate-500 border border-slate-100 mt-1">{result.original}</div>
              </div>
              <div>
                <span className="text-[10px] font-black text-emerald-400 uppercase ml-1">翻譯</span>
                <div className="bg-emerald-50 p-5 rounded-2xl text-emerald-900 font-bold border border-emerald-100 text-xl mt-1">{result.translated}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-8">
              <button onClick={handleCopy} className="py-4 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">
                {copied ? '✅ 已複製' : '📋 複製'}
              </button>
              <button
                onClick={handleSendToLine}
                className="py-4 rounded-2xl font-black text-white bg-sky-500 hover:bg-sky-600 shadow-lg flex items-center justify-center gap-2"
              >
                傳送
              </button>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default App;
