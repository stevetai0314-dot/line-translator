
export interface TranslationResult {
  original: string;
  translated: string;
  sourceLang: 'vi' | 'zh';
  targetLang: 'vi' | 'zh';
}

export enum AppStatus {
  INITIALIZING = 'initializing',
  READY = 'ready',
  ERROR = 'error',
  OUTSIDE_LINE = 'outside_line'
}

declare global {
  interface Window {
    liff: any;
  }
}
