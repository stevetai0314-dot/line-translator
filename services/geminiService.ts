import { GoogleGenAI, Type } from "@google/genai";
import { TranslationResult } from "../types";

// Always use a named parameter for apiKey and obtain from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const translateText = async (text: string): Promise<TranslationResult> => {
  // Use ai.models.generateContent to query GenAI with both the model name and contents
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

  // Extracting Text Output: Access .text property (not a method)
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
