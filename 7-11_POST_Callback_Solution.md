# 7-11 超商取貨 POST 回調解決方案

## 問題描述

7-11 電子地圖 API 在用戶選擇門市後，會以 **POST 方法**將門市資料回傳到指定的 callback URL。這在純前端環境中會遇到以下問題：

1. 瀏覽器無法直接處理 POST 請求到 HTML 頁面
2. 跨域限制（CORS）問題
3. 本地開發環境（localhost）無法接收外部 POST 請求

## 解決方案

我們使用 **Netlify Functions** 來處理 POST 回調，這是一個 serverless 解決方案，可以正確接收和處理 7-11 API 的 POST 請求。

### 實作架構

```
用戶選擇門市 
    ↓
7-11 API (POST) 
    ↓
Netlify Function (/.netlify/functions/cvs-callback)
    ↓
返回 HTML 頁面
    ↓
postMessage 傳送資料給購物車頁面
    ↓
自動填入門市資訊
```

## 修改內容

### 1. 創建 Netlify Function
**檔案**: `netlify/functions/cvs-callback.js`

此函數可以：
- 接收 POST 請求（form-urlencoded 或 JSON 格式）
- 解析 7-11 API 的參數（CVSStoreID, CVSStoreName, CVSAddress, CVSTelephone）
- 返回包含 JavaScript 的 HTML 頁面，自動將資料傳回購物車

### 2. 更新購物車頁面
**檔案**: `cart.html`

修改 `openIbonStoreMap()` 函數：
- 使用 Netlify Function URL 作為 callback
- 開發環境自動切換到生產環境 URL
- 保留 postMessage 監聽器接收回傳資料

### 3. Netlify 配置
**檔案**: `netlify.toml`

已配置：
- Functions 目錄設定
- CORS headers
- API 路由重定向

## API 整合流程

### 7-11 API URL 格式
```
https://emap.presco.com.tw/c2cemap.ashx?eshopid=870&servicetype=1&url={callback_url}
```

### Callback URL 設定
- **生產環境**: `https://deepvape.org/.netlify/functions/cvs-callback`
- **開發環境**: 自動使用生產環境 URL（因為 localhost 無法接收外部 POST）

### POST 參數處理
```javascript
// 7-11 API 會 POST 以下參數
CVSStoreID    // 門市店號
CVSStoreName  // 門市名稱  
CVSAddress    // 門市地址
CVSTelephone  // 門市電話
```

## 使用說明

### 1. 部署設定
確保 Netlify 已正確部署 Functions：
```bash
# 本地測試
netlify dev

# 部署
netlify deploy --prod
```

### 2. 測試流程
1. 開啟購物車頁面
2. 點擊「7-ELEVEN ibon門市查詢」
3. 在地圖選擇門市
4. 確認後自動回傳並填入資訊

### 3. 除錯技巧
- 查看瀏覽器 Console 的訊息
- 檢查 Network 面板的 POST 請求
- Netlify Functions 日誌查看

## 優勢

1. **正確處理 POST 請求**: Serverless function 可以接收任何 HTTP 方法
2. **無 CORS 問題**: Function 返回正確的 CORS headers
3. **安全性**: 不暴露敏感資訊在前端
4. **可擴展**: 容易加入其他超商的 API 整合

## 注意事項

1. **廠商代碼**: 確保 `eshopid=870` 是正確的廠商代碼
2. **HTTPS**: 生產環境必須使用 HTTPS
3. **彈出視窗**: 用戶瀏覽器需允許彈出視窗
4. **備援方案**: 保留手動輸入功能

## 後續優化

1. 加入請求驗證（檢查 referrer）
2. 增加錯誤處理和重試機制
3. 支援全家、萊爾富等其他超商
4. 加入門市資料快取機制 
