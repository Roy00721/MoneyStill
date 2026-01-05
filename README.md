# 錢還在 - 記帳APP

一個簡單又好用的Progressive Web App記帳應用，採用簡約設計風格。

## 功能特色

- ✅ PWA（Progressive Web App）支援
- ✅ Google帳戶登入
- ✅ Firebase資料庫整合
- ✅ **資料持久化儲存**
- ✅ **跨裝置資料同步**
- ✅ **用戶資料隔離**
- ✅ 簡約風格設計
- ✅ 低濃度色彩的漫畫感
- ✅ 新增/刪除記帳項目
- ✅ 即時餘額計算

## 技術架構

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **PWA**: Service Worker, Web App Manifest
- **認證**: Firebase Authentication + Google Sign-in
- **資料庫**: Firebase Firestore (預計整合)
- **設計**: 自定義CSS，簡約漫畫風格

## 圖標設置

目前使用SVG圖標。如需添加PNG圖標：

1. **生成PNG圖標**：
   - 使用線上工具如 [favicon.io](https://favicon.io/) 或 [RealFaviconGenerator](https://realfavicongenerator.net/)
   - 將 `icon.svg` 轉換為 192x192 和 512x512 PNG

2. **替換圖標文件**：
   - 將生成的 `icon-192.png` 和 `icon-512.png` 放到專案根目錄
   - 更新 `manifest.json` 中的圖標路徑

3. **favicon.ico**：
   - 生成一個 32x32 的 ICO 文件
   - 或者使用線上工具生成完整的favicon包

## Firebase 疑難排解

### 🔴 常見錯誤及解決方案

#### 1. `auth/unauthorized-domain` 錯誤
**原因**：當前域名沒有在 Firebase 中授權

**解決步驟**：
1. 進入 [Firebase Console](https://console.firebase.google.com/)
2. 選擇你的專案 (moneystill-fa898)
3. 點擊左側 **"Authentication"**
4. 點擊 **"Settings"** 標籤頁
5. 在 **"Authorized domains"** 區塊中點擊 **"Add domain"**
6. 添加域名：
   - 本地開發：`localhost`
   - 生產環境：你的域名 (如 `moneystill.com`)
7. 點擊 **"Add"** 保存

#### 2. `Cross-Origin-Opener-Policy policy would block the window.closed call` 錯誤
**原因**：瀏覽器的 COOP (Cross-Origin-Opener-Policy) 安全策略

**解決步驟**：
1. 確保你在 **localhost:8000** 上運行應用
2. 在 Firebase Console 的授權域名中添加：
   - `localhost:8000`
   - `127.0.0.1:8000`
3. 或者使用 Incognito/隱私模式測試
4. 如果問題持續，嘗試清除瀏覽器快取並重新載入

#### 3. 每次重新載入都回到登入頁面
**原因**：Firebase Auth 持久化設置問題

**解決方案**：
應用已自動設置 Auth 持久化。如果還是問題，請：
1. 清除瀏覽器快取 (Ctrl+Shift+R)
2. 使用 Incognito/隱私模式測試
3. 檢查瀏覽器是否阻止了 cookies

#### 4. Firestore 權限錯誤
**原因**：安全規則沒有正確設置

**解決步驟**：
1. 進入 [Firebase Console](https://console.firebase.google.com/)
2. 選擇你的專案 → **"Firestore Database"**
3. 點擊 **"Rules"** 標籤頁
4. 將規則設置為：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用戶只能存取自己的資料
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

5. 點擊 **"Publish"** 發布規則

#### 2. 登入沒有反應
**檢查項目**：
- ✅ Firebase 配置是否正確？
- ✅ Google 登入是否在 Firebase Console 中啟用？
- ✅ 域名是否已授權？

#### 3. 其他常見錯誤
- **`auth/popup-blocked`**：瀏覽器阻止彈窗，請允許彈窗
- **`auth/popup-closed-by-user`**：用戶取消登入
- **`auth/invalid-api-key`**：API 金鑰錯誤，請檢查配置

### 🧪 測試步驟
1. 添加域名到授權列表
2. 重新載入頁面 `http://localhost:8000`
3. 點擊登入按鈕
4. 應該能看到 Google 登入彈窗

## 快速開始

### 1. 安裝依賴
```bash
npm install
```

### 2. 設置Firebase
1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 創建新專案
3. 啟用 Authentication 和 Firestore
4. 在 `index.html` 中更新 Firebase 配置

### 3. 運行應用
```bash
npm start
```

應用將在 `http://localhost:8000` 運行。

## 專案結構

```
money-still/
├── index.html          # 主頁面
├── styles.css          # 樣式文件
├── app.js             # 應用邏輯
├── firebase-config.js # Firebase配置
├── firestore.rules    # Firestore安全規則
├── manifest.json      # PWA 配置
├── sw.js              # Service Worker
├── icon.svg           # 應用圖標
├── favicon.ico        # 網站圖標
├── package.json       # 專案配置
└── README.md          # 說明文件
```

## 資料架構

### Firestore 集合結構
```
users/{userId}/
  └── entries/{entryId}
      ├── type: "income" | "expense"
      ├── amount: number
      ├── description: string
      ├── date: timestamp
      └── createdAt: timestamp
```

### 資料安全
- 每個用戶只能存取自己的記帳資料
- 使用 Firebase Authentication UID 進行資料隔離
- 通過 Firestore 安全規則強制執行

## 開發說明

### 目前實作的功能
- [x] 基本PWA架構
- [x] Google登入整合
- [x] 記帳UI介面
- [x] 新增記帳項目（儲存到Firestore）
- [x] 刪除記帳項目（從Firestore刪除）
- [x] Firebase資料庫儲存
- [x] 資料同步
- [x] 用戶資料隔離
- [x] Firestore安全規則
- [ ] 即時同步（可選）
- [ ] 離線支援（可選）

### Firebase設置
在 `index.html` 的 Firebase 配置中，請替換為你的實際配置：

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```

## 設計理念

採用低濃度色彩的漫畫感設計，創造輕鬆愉快的記帳體驗：
- 柔和的漸層背景
- 圓潤的邊角設計
- 適當的陰影效果
- 直觀的色彩語意（綠色收入、紅色支出）

## 瀏覽器支援

支援所有現代瀏覽器，包含：
- Chrome 70+
- Firefox 68+
- Safari 12+
- Edge 79+

## 授權

MIT License
