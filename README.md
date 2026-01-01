# 🇹🇼 中越翻譯助手部署指南 🇻🇳

如果你在執行 `git add` 或 `git commit` 時遇到失敗，請按照以下步驟操作：

## 1. 基礎設定 (第一次使用才需要)
打開終端機 (Terminal)，輸入以下兩行指令，把括號內換成你的資料：
```bash
git config --global user.email "你的電子郵件"
git config --global user.name "你的名字"
```

## 2. 標準上傳流程
如果你改了程式碼，想把新版傳到 GitHub，請依序執行這三行：

1. **暫存所有變更**：
   ```bash
   git add .
   ```
2. **存檔並寫下註解**：
   ```bash
   git commit -m "更新翻譯助手功能"
   ```
3. **推送到 GitHub** (如果你是第一次推送到新專案)：
   ```bash
   git branch -M main
   git remote add origin https://github.com/你的帳號/你的專案名.git
   git push -u origin main
   ```

## 3. GitHub Actions 部署注意
- 確保你在 GitHub Repo 的 **Settings > Secrets and variables > Actions** 中新增了 `API_KEY`。
- 部署成功後，網址會是 `https://你的帳號.github.io/你的專案名/`。
- 這個網址必須填回 LINE Developers 的 **LIFF Endpoint URL**。

---
### 常見問題 (FAQ)
- **Q: 為什麼網頁點開是空白的？**
  - A: 請檢查 `vite.config.ts` 裡的 `base: './'` 是否有正確設定。
- **Q: 為什麼翻譯沒反應？**
  - A: 請確認 GitHub Secrets 裡的 `API_KEY` 是否有效。
