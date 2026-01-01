
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { translateText } from './services/geminiService';
import { AppStatus, TranslationResult } from './types';

// ⚠️ 重要：請在 LINE Developers 申請 LIFF ID 並填寫於此
const LIFF_ID: string = '2006764506-6JreQ2eB'; 

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
        if (LIFF_ID === '2006764506-6JreQ2eB') {
          throw new Error("目前使用的是預設範例 ID，請更換為您的 LIFF ID。");
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
        setError(err.message || 'LIFF 初始化失敗');
        setStatus(AppStatus.ERROR);
      }
    };

    if (window.liff) {
      initLiff();
    } else {
      setStatus(AppStatus.ERROR);
      setError("無法載入 LINE SDK，請確認網路連線。");
    }
  }, []);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await translateText(inputText);
      setResult(res);
    } catch (err: any) {
      setError("翻譯失敗：" + (err.message || "未知錯誤"));
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
      setError('發送失敗！請確認：1. 是否在 LINE 內開啟 2. 權限勾選 chat_message.write');
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
          <p className="mt-4 text-slate-500 font-medium">翻譯系統啟動中...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <section>
          <div className="relative">
            <textarea
              className="w-full p-5 border-2 border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none h-40 text-slate-800 text-lg shadow-sm"
              placeholder="輸入中或越文..."
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
            className={`w-full mt-4 py-4 rounded-2xl font-black text-white transition-all shadow-lg ${
              loading || !inputText.trim() 
                ? 'bg-slate-200 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
            }`}
          >
            {loading ? '🦾 思考中...' : '🌟 開始翻譯'}
          </button>
        </section>

        {result && (
          <section className="bg-white border-2 border-emerald-50 rounded-[2.5rem] p-6 shadow-xl animate-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-600 text-sm">
                {result.original}
              </div>
              <div className="bg-emerald-50 p-5 rounded-2xl text-emerald-900 font-bold border border-emerald-100 text-xl">
                {result.translated}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={handleCopy}
                className="py-4 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
              >
                {copied ? '✅ 已複製' : '📋 複製'}
              </button>
              
              <button
                onClick={handleSendToLine}
                className={`py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 transition-all shadow-md ${
                  status === AppStatus.OUTSIDE_LINE
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-sky-500 hover:bg-sky-600 active:scale-95'
                }`}
              >
                傳送訊息
              </button>
            </div>
            
            {status === AppStatus.OUTSIDE_LINE && (
              <p className="text-center text-[10px] text-rose-400 mt-4">
                偵測到瀏覽器環境，請複製後手動貼上。
              </p>
            )}
          </section>
        )}

        {error && (
          <div className="bg-rose-50 text-rose-600 text-xs p-5 rounded-3xl border-2 border-rose-100 shadow-sm leading-relaxed">
            <p className="font-bold mb-1 underline">⚠️ 系統提示</p>
            {error}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
