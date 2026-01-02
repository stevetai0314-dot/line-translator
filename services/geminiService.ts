import { GoogleGenAI, Type } from "@google/genai";
import { TranslationResult } from "../types";

export const translateText = async (text: string): Promise<TranslationResult> => {
  // 每次呼叫時建立實例，確保讀取到編譯時注入的 API_KEY
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY 未定義，請檢查 GitHub Secrets 設定。");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Translate the following text between Vietnamese and Traditional Chinese. 
    If the input is Vietnamese, translate to Traditional Chinese. 
    If the input is Chinese, translate to Vietnamese.
    Input text: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING },
          translated: { type: Type.STRING },
          sourceLang: { type: Type.STRING, description: "'vi' or 'zh'" },
          targetLang: { type: Type.STRING, description: "'vi' or 'zh'" }
        },
        required: ["original", "translated", "sourceLang", "targetLang"]
      }
    }
  });

  const jsonStr = response.text?.trim();
  
  if (!jsonStr) {
    throw new Error("模型未返回任何翻譯結果");
  }

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("翻譯格式錯誤");
  }
};