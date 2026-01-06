# MoneyStill - 上線前注意事項

## 🔧 專案架構
```
src/
├── app/           # 啟動、全域設置
├── modules/       # 各種功能模組
├── utils/         # 小工具
firebase/          # Firebase 功能封裝
repository/        # 資料存取層
css/              # 外觀設定
res/              # 圖片、音效等資源
```

## 🚀 上線前檢查清單

### Firebase 設定
- [ ] Firebase 專案已建立
- [ ] Authentication > Google 登入已啟用
- [ ] Firestore 資料庫已建立
- [ ] 安全規則已設定（複製 firestore.rules）
- [ ] 授權域名包含部署域名
- [ ] firebase-config.js 配置正確

### PWA 功能
- [ ] manifest.json 圖示路徑正確（應為 "res/icon.svg"）
- [ ] Service Worker 版本號已更新
- [ ] 測試 PWA 安裝功能
- [ ] 測試離線功能正常
- [ ] sw.js 中的 urlsToCache 路徑正確

### 程式碼清理
- [ ] 清除所有開發用 console.log
- [ ] 移除測試檔案和註釋
- [ ] 檢查所有 import 路徑正確
- [ ] 壓縮靜態資源（選用）

### 部署準備
- [ ] 測試所有瀏覽器相容性
- [ ] 檢查 HTTPS 環境
- [ ] 更新 package.json 版本號
- [ ] 備份重要檔案

## 🔄 Service Worker 更新注意事項

當修改程式碼後：
1. 更新 `sw.js` 中的 `CACHE_NAME` 版本號
2. 測試更新機制是否正常運作
3. 檢查新版本是否自動安裝並重新載入

## 🐛 常見問題

### 快取問題
- 舊版本程式碼快取：清除瀏覽器快取或使用無痕模式
- manifest.json 更新問題：檢查路徑是否正確

### Firebase 問題
- 登入失敗：檢查授權域名設定
- 資料不同步：檢查 Firestore 安全規則

### PWA 問題
- 不顯示安裝提示：確保 HTTPS 和 manifest.json 正確
- 離線功能異常：檢查 Service Worker 註冊和快取

## 📊 效能檢查

- 確認網路優先快取策略正常
- 測試離線時的回退機制
- 檢查 bundle 大小是否合理

## 🔐 安全提醒

- 定期檢查 Firebase 用量和費用
- 監控 Firestore 安全規則是否被繞過
- 定期更新依賴套件