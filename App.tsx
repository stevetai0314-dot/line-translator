import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { translateText } from './services/geminiService';
import { AppStatus, TranslationResult } from './types';

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
        console.log("正在嘗試初始化 LIFF...");
        if (typeof window.liff === 'undefined') {
          // 如果 SDK 還沒載入，再等一下
          setTimeout(initLiff, 500);
          return;
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
        console.error('LIFF 啟動錯誤:', err);
        setError(`LIFF 初始化失敗: ${err.message || '請確認 LIFF ID 是否正確'}`);
        setStatus(AppStatus.ERROR);
      }
    };

    initLiff();
  }, []);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      if (!process.env.API_KEY || process.env.API_KEY === "undefined") {
        throw new Error("Gemini API Key 尚未設定，請檢查 GitHub Secrets");
      }
      const res = await translateText(inputText);
      setResult(res);
    } catch (err: any) {
      console.error("翻譯錯誤:", err);
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
      if (window.liff.isInClient()) {
        await window.liff.sendMessages([{ type: 'text', text: formatMessage() }]);
        window.liff.closeWindow();
      } else {
        setError('請在 LINE App 內開啟此網頁方可直接傳送訊息。');
      }
    } catch (err: any) {
      console.error('傳送訊息失敗:', err);
      setError('傳送失敗，請確認已授予 chat_message.write 權限。');
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
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl text-rose-700 text-sm animate-pulse">
            <p className="font-bold">⚠️ 系統訊息</p>
            <p>{error}</p>
          </div>
        )}

        <section>
          <textarea
            className="w-full p-5 border-2 border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none h-40 text-slate-800 text-lg shadow-inner"
            placeholder="請輸入文字 (中文或越文均可)..."
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
            {loading ? '🦾 正在努力翻譯中...' : '🌟 翻譯並轉換格式'}
          </button>
        </section>

        {result && (
          <section className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-black text-slate-300 uppercase ml-1">
                  {result.sourceLang === 'vi' ? '🇻🇳 越南原文' : '🇹🇼 中文原文'}
                </span>
                <div className="bg-slate-50 p-4 rounded-2xl text-slate-500 border border-slate-100 mt-1">{result.original}</div>
              </div>
              <div>
                <span className="text-[10px] font-black text-emerald-400 uppercase ml-1">
                  {result.targetLang === 'vi' ? '🇻🇳 越語翻譯' : '🇹🇼 中文翻譯'}
                </span>
                <div className="bg-emerald-50 p-5 rounded-2xl text-emerald-900 font-bold border border-emerald-100 text-xl mt-1">{result.translated}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-8">
              <button onClick={handleCopy} className="py-4 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all active:scale-95">
                {copied ? '✅ 已複製' : '📋 複製結果'}
              </button>
              <button
                onClick={handleSendToLine}
                className={`py-4 rounded-2xl font-black text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  status === AppStatus.OUTSIDE_LINE ? 'bg-slate-300' : 'bg-sky-500 hover:bg-sky-600'
                }`}
              >
                直接傳回聊天室
              </button>
            </div>
            {status === AppStatus.OUTSIDE_LINE && (
              <p className="text-[10px] text-slate-400 mt-3 text-center italic">※ 請從 LINE 群組點開此連結方可直接傳送訊息</p>
            )}
          </section>
        )}
      </div>
    </Layout>
  );
};

export default App;
