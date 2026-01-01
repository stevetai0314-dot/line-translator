
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { translateText } from './services/geminiService';
import { AppStatus, TranslationResult } from './types';

// 已更新為您提供的最新 LIFF ID
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
        console.log("開始初始化 LIFF, ID:", LIFF_ID);
        
        if (!LIFF_ID || LIFF_ID.includes('YOUR_LIFF_ID')) {
          throw new Error("LIFF ID 尚未設定或格式錯誤");
        }

        await window.liff.init({ liffId: LIFF_ID });
        setIsLiffInitialized(true);
        console.log("LIFF 初始化成功");
        
        if (!window.liff.isInClient()) {
          setStatus(AppStatus.OUTSIDE_LINE);
        } else {
          setStatus(AppStatus.READY);
        }
      } catch (err: any) {
        console.error('LIFF init error', err);
        setError(`初始化失敗: ${err.message || '請檢查 LIFF ID 是否與 LINE Developer 後台一致'}`);
        setStatus(AppStatus.ERROR);
      }
    };

    // 確保 SDK script 載入後再執行
    const timer = setInterval(() => {
      if (window.liff) {
        clearInterval(timer);
        initLiff();
      }
    }, 200);

    return () => clearInterval(timer);
  }, []);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // 確保 API KEY 有抓到
      if (!process.env.API_KEY || process.env.API_KEY === "undefined") {
        throw new Error("API Key 缺失。請在 GitHub Repo -> Settings -> Secrets -> Actions 加入 API_KEY");
      }
      const res = await translateText(inputText);
      setResult(res);
    } catch (err: any) {
      console.error("Translation error:", err);
      setError(err.message || "翻譯過程發生錯誤，請稍後再試");
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
      if (window.liff.isInClient()) {
        await window.liff.sendMessages([{ type: 'text', text: formatMessage() }]);
        window.liff.closeWindow();
      } else {
        setError('目前不在 LINE App 內，請點擊「複製結果」手動貼上。');
      }
    } catch (err: any) {
      console.error('Send error', err);
      setError('傳送失敗！請確認已在 LIFF 設定中開啟「chat_message.write」權限。');
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(formatMessage()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (status === AppStatus.INITIALIZING) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-100 border-t-emerald-600 mb-4"></div>
          <p className="text-slate-500 font-medium">系統載入中...</p>
          <p className="text-[10px] text-slate-300 mt-2 italic">ID: {LIFF_ID}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 rounded-r-xl text-xs shadow-sm">
            <p className="font-bold">⚠️ 注意</p>
            <p>{error}</p>
          </div>
        )}

        <section>
          <div className="relative">
            <textarea
              className="w-full p-5 border-2 border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none h-40 text-slate-800 shadow-inner text-lg"
              placeholder="輸入要翻譯的文字..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            {inputText && (
              <button 
                onClick={() => setInputText('')}
                className="absolute top-4 right-4 text-slate-300 hover:text-slate-500"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={handleTranslate}
            disabled={loading || !inputText.trim()}
            className={`w-full mt-4 py-4 rounded-2xl font-black text-white transition-all shadow-xl ${
              loading || !inputText.trim() 
                ? 'bg-slate-200' 
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]'
            }`}
          >
            {loading ? '🦾 正在翻譯...' : '🌟 立即翻譯'}
          </button>
        </section>

        {result && (
          <section className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-black text-slate-300 uppercase ml-1 tracking-widest">
                  {result.sourceLang === 'vi' ? '🇻🇳 原文' : '🇹🇼 原文'}
                </span>
                <div className="bg-slate-50 p-4 rounded-2xl text-slate-500 border border-slate-100 mt-1 leading-relaxed">
                  {result.original}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-black text-emerald-400 uppercase ml-1 tracking-widest">
                  {result.targetLang === 'vi' ? '🇻🇳 翻譯結果' : '🇹🇼 翻譯結果'}
                </span>
                <div className="bg-emerald-50 p-5 rounded-2xl text-emerald-900 font-bold border border-emerald-100 text-xl mt-1 leading-relaxed">
                  {result.translated}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-8">
              <button 
                onClick={handleCopy} 
                className="py-4 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all active:bg-slate-300"
              >
                {copied ? '✅ 已複製' : '📋 複製結果'}
              </button>
              <button
                onClick={handleSendToLine}
                className={`py-4 rounded-2xl font-black text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  status === AppStatus.OUTSIDE_LINE ? 'bg-slate-300' : 'bg-sky-500 hover:bg-sky-600'
                }`}
              >
                直接傳送
              </button>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default App;
