
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
        console.log("Checking window.liff...");
        if (!window.liff) {
          throw new Error("LINE SDK (liff.js) 尚未載入");
        }

        console.log("Initializing LIFF with ID:", LIFF_ID);
        await window.liff.init({ liffId: LIFF_ID });
        setIsLiffInitialized(true);
        console.log("LIFF Initialization successful");
        
        if (!window.liff.isInClient()) {
          setStatus(AppStatus.OUTSIDE_LINE);
        } else {
          setStatus(AppStatus.READY);
        }
      } catch (err: any) {
        console.error('LIFF Error:', err);
        setError(`初始化失敗: ${err.message || '未知錯誤'}`);
        setStatus(AppStatus.ERROR);
      }
    };

    // 輪詢直到 liff sdk 載入
    const checkLiff = setInterval(() => {
      if (window.liff) {
        clearInterval(checkLiff);
        initLiff();
      }
    }, 100);

    return () => clearInterval(checkLiff);
  }, []);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      if (!process.env.API_KEY) {
        throw new Error("Gemini API Key 尚未設定");
      }
      const res = await translateText(inputText);
      setResult(res);
    } catch (err: any) {
      console.error("Translation Error:", err);
      setError(err.message || "翻譯失敗");
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
        setError('請在 LINE 內部開啟以使用傳送功能');
      }
    } catch (err: any) {
      setError('傳送失敗，請確認是否開啟訊息傳送權限');
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
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-100 border-t-emerald-600"></div>
          <p className="mt-4 text-slate-500 font-medium">系統載入中，請稍候...</p>
        </div>
      </Layout>
    );
  }

  if (status === AppStatus.ERROR) {
    return (
      <Layout>
        <div className="p-6 bg-red-50 rounded-2xl border border-red-100 text-red-700">
          <h2 className="font-bold mb-2">啟動失敗</h2>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            重試
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {status === AppStatus.OUTSIDE_LINE && (
          <div className="bg-amber-50 border border-amber-100 text-amber-700 p-3 rounded-xl text-[10px] text-center italic">
            偵測到非 LINE 環境。翻譯功能可用，但「直接傳送」功能僅支援 LINE 內部。
          </div>
        )}

        <section>
          <textarea
            className="w-full p-5 border-2 border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none h-40 text-slate-800 text-lg shadow-inner"
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
                <span className="text-[10px] font-black text-slate-300 uppercase ml-1">原文 ({result.sourceLang})</span>
                <div className="bg-slate-50 p-4 rounded-2xl text-slate-500 border border-slate-100 mt-1">{result.original}</div>
              </div>
              <div>
                <span className="text-[10px] font-black text-emerald-400 uppercase ml-1">翻譯 ({result.targetLang})</span>
                <div className="bg-emerald-50 p-5 rounded-2xl text-emerald-900 font-bold border border-emerald-100 text-xl mt-1">{result.translated}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-8">
              <button onClick={handleCopy} className="py-4 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">
                {copied ? '✅ 已複製' : '📋 複製'}
              </button>
              <button
                onClick={handleSendToLine}
                disabled={status === AppStatus.OUTSIDE_LINE}
                className={`py-4 rounded-2xl font-black text-white shadow-lg flex items-center justify-center gap-2 ${
                  status === AppStatus.OUTSIDE_LINE ? 'bg-slate-300' : 'bg-sky-500 hover:bg-sky-600'
                }`}
              >
                傳送至 LINE
              </button>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default App;
