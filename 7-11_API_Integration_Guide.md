# 7-11 官方門市選擇 API 整合指南

## 概述
本系統已整合7-11官方的電子地圖查詢系統 (https://emap.pcsc.com.tw/ecmap/default.aspx)，讓用戶可以直接使用官方的門市選擇功能。

## 整合方式

### 1. 開啟門市選擇
在 `cart.html` 中，點擊「7-ELEVEN 官方門市選擇」按鈕會執行 `open711OfficialMap()` 函數：

```javascript
function open711OfficialMap() {
    const baseUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
    const callbackUrl = baseUrl + '/cvs_callback.html';
    const mapUrl = 'https://emap.pcsc.com.tw/ecmap/default.aspx';
    const fullUrl = `${mapUrl}?BackURL=${encodeURIComponent(callbackUrl)}`;
    
    window.open(fullUrl, '711StoreMap', 'width=1000,height=700,scrollbars=yes,resizable=yes');
}
```

### 2. 回調處理
7-11官方系統會將選擇的門市資訊傳回到 `cvs_callback.html`，預期的參數包括：
- `CVSStoreID`: 門市店號
- `CVSStoreName`: 門市名稱  
- `CVSAddress`: 門市地址
- `CVSTelephone`: 門市電話

### 3. 資料接收流程
1. 用戶在7-11官方地圖選擇門市
2. 7-11系統將資料傳送到 `cvs_callback.html`
3. `cvs_callback.html` 解析並顯示門市資訊
4. 用戶確認後，資料透過 `postMessage` 傳回主視窗
5. `cart.html` 接收資料並自動填入表單

## 注意事項

### 跨域問題
- 確保網站使用 HTTPS，因為7-11官方網站使用 HTTPS
- Callback URL 必須是完整的網址

### 測試環境
在本地測試時，可能會遇到以下問題：
1. 跨域限制
2. POST 資料接收問題

建議部署到實際伺服器環境進行測試。

### 備用方案
如果自動接收失敗，用戶仍可手動輸入門市資訊：
- 門市店號
- 門市名稱
- 門市地址

## 部署檢查清單
- [ ] 網站使用 HTTPS
- [ ] `cvs_callback.html` 可正常訪問
- [ ] 允許彈出視窗（用戶瀏覽器設定）
- [ ] Callback URL 設定正確

## 疑難排解

### 問題：無法開啟7-11官方地圖
**解決方案**：檢查瀏覽器是否封鎖彈出視窗

### 問題：選擇門市後沒有回傳資料
**解決方案**：
1. 檢查 Console 是否有錯誤訊息
2. 確認 Callback URL 是否正確
3. 檢查是否有跨域問題

### 問題：收到的資料格式不正確
**解決方案**：查看 `cvs_callback.html` 的 Console 輸出，確認實際接收到的參數名稱 
