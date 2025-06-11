# 🚀 Netlify 部署說明

這個門市選擇系統已經完全適配Netlify託管，並整合Google Maps API。

## 📋 部署步驟

### 1. Netlify 網站設定
1. 登入 [Netlify](https://app.netlify.com/)
2. 點擊「New site from Git」
3. 連接你的GitHub/GitLab倉庫
4. 選擇這個專案

### 2. 建置設定
- **Base directory**: 留空（或填入 `.`）
- **Build command**: `echo 'No build step required'`
- **Publish directory**: `.`

### 3. 環境變數設定
在Netlify控制台的「Site settings」→「Environment variables」中添加：

```
GOOGLE_MAPS_API_KEY = 你的Google Maps API金鑰
```

### 4. 啟用Functions功能
Netlify會自動偵測 `netlify/functions` 目錄並啟用Functions功能。

## 🔧 本地開發

### 安裝依賴
```bash
npm install
```

### 本地測試
```bash
# 安裝Netlify CLI
npm install -g netlify-cli

# 啟動本地開發伺服器
netlify dev
```

本地開發時，Functions會在 `http://localhost:8888/.netlify/functions/` 下運行。

## 🗺️ Google Maps API 設定

### 需要啟用的API服務
1. **Maps JavaScript API** - 前端地圖顯示
2. **Places API** - 搜尋門市
3. **Places API (New)** - 新版API（推薦）

### API金鑰限制設定
為了安全性，建議在Google Cloud Console設定以下限制：
- **應用程式限制**: HTTP參照網址
- **網站限制**: 你的Netlify網域（如：`yoursite.netlify.app`）
- **API限制**: 只允許上述3個API

## 📡 API端點

部署後，以下端點會自動可用：

### 搜尋門市
```
GET /.netlify/functions/search-stores?city=台北市&district=大安區
```

### 門市詳情
```
GET /.netlify/functions/store-details?place_id=ChIJ...
```

## 🔍 功能特色

### ✅ 完全託管在Netlify
- 無需後端伺服器
- 自動SSL憑證
- CDN加速
- 自動部署

### ✅ Google Maps API整合
- 真實門市資料
- 即時搜尋
- 地圖顯示
- 門市詳情

### ✅ 備援機制
- 本地門市資料庫
- API失敗時自動切換
- 確保服務穩定性

### ✅ 行動裝置友善
- 響應式設計
- 觸控優化
- 載入速度快

## 🛠️ 自訂設定

### 修改搜尋關鍵字
在 `netlify/functions/search-stores.js` 中修改：
```javascript
const { city, district, keyword = '全家' } = event.queryStringParameters || {};
```

### 新增門市類型
可以搜尋其他便利商店：
- 7-ELEVEN / 7-11 / 統一超商
- 全家 / FamilyMart
- OK便利店 / OK超商
- 萊爾富 / Hi-Life

### 調整搜尋範圍
在API呼叫中加入半徑參數：
```javascript
const url = `...&radius=5000&...`; // 5公里範圍
```

## 🔒 安全性

### API金鑰保護
- 金鑰儲存在伺服器端環境變數
- 前端無法直接存取
- 支援網域限制

### CORS處理
- 自動處理跨域請求
- 安全的API代理
- 防止API濫用

## 📊 使用限制

### Google Maps API配額
- 每日免費額度：詳見Google定價
- 建議設定使用上限避免超額
- 監控API使用量

### Netlify Functions限制
- 免費版：125,000次函數呼叫/月
- 函數執行時間：最長10秒
- 函數大小：最大50MB

## 🐛 故障排除

### 常見問題

#### 1. 地圖無法載入
- 檢查Google Maps API金鑰是否正確
- 確認Maps JavaScript API已啟用
- 檢查網域限制設定

#### 2. 門市搜尋失敗
- 檢查Places API是否已啟用
- 確認環境變數設定正確
- 查看Netlify Functions日誌

#### 3. 本地開發問題
- 確保安裝了Netlify CLI
- 檢查 `.env` 檔案設定
- 使用 `netlify dev` 而非其他工具

### 除錯方法
```javascript
// 在Functions中添加日誌
console.log('API Key:', API_KEY ? '已設定' : '未設定');
console.log('搜尋參數:', { city, district });
```

## 📈 效能優化

### 快取策略
- 門市搜尋結果快取
- 地圖載入優化
- 圖片延遲載入

### API使用優化
- 批次請求
- 結果去重
- 錯誤重試機制

## 📞 技術支援

- **Netlify文件**: https://docs.netlify.com/
- **Google Maps API文件**: https://developers.google.com/maps
- **問題回報**: GitHub Issues

---

**版本**: 2.0.0 (Netlify版)  
**更新日期**: 2024-12-24  
**支援**: Netlify Functions + Google Maps API 