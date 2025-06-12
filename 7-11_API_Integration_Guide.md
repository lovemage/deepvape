# 7-11 與全家官方門市選擇 API 整合指南

## 概述
本系統已整合兩大便利商店的官方門市查詢系統：
- 7-11官方電子地圖：https://emap.pcsc.com.tw/ecmap/default.aspx
- 全家官方門市查詢：https://family.map.com.tw/ShopSpaceQuery/ShopSpaceQuery.asp

讓用戶可以直接使用官方的門市選擇功能。

## 整合方式

### 1. 7-11門市選擇
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

### 2. 全家門市選擇
點擊「全家官方門市選擇」按鈕會執行 `openFamilyOfficialMap()` 函數：

```javascript
function openFamilyOfficialMap() {
    const baseUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
    const callbackUrl = baseUrl + '/cvs_callback.html';
    const mapUrl = 'https://family.map.com.tw/ShopSpaceQuery/ShopSpaceQuery.asp';
    const fullUrl = `${mapUrl}?ReturnURL=${encodeURIComponent(callbackUrl)}`;
    
    window.open(fullUrl, 'FamilyStoreMap', 'width=1000,height=700,scrollbars=yes,resizable=yes');
}
```

### 3. 回調處理
兩家便利商店會將選擇的門市資訊傳回到 `cvs_callback.html`：

#### 7-11預期參數：
- `CVSStoreID`: 門市店號
- `CVSStoreName`: 門市名稱  
- `CVSAddress`: 門市地址
- `CVSTelephone`: 門市電話

#### 全家預期參數：
- `shopid`: 門市店號
- `shopname`: 門市名稱
- `shopaddr`: 門市地址
- `shoptel`: 門市電話

### 4. 資料接收流程
1. 用戶在官方地圖選擇門市
2. 系統將資料傳送到 `cvs_callback.html`
3. `cvs_callback.html` 解析並顯示門市資訊
4. 用戶確認後，資料透過 `postMessage` 傳回主視窗
5. `cart.html` 接收資料並自動填入表單

## 注意事項

### 跨域問題
- 確保網站使用 HTTPS，因為兩家官方網站都使用 HTTPS
- Callback URL 必須是完整的網址

### 本地測試環境
在本地測試時（file://協議），系統會：
1. 偵測本地環境並提示用戶
2. 開啟官方網站供查詢
3. 要求用戶手動輸入門市資訊

### 備用方案
如果自動接收失敗，用戶可手動輸入門市資訊：
- 門市店號
- 門市名稱
- 門市地址

## 部署檢查清單
- [ ] 網站使用 HTTPS
- [ ] `cvs_callback.html` 可正常訪問
- [ ] 允許彈出視窗（用戶瀏覽器設定）
- [ ] Callback URL 設定正確

## 疑難排解

### 問題：無法開啟官方地圖
**解決方案**：檢查瀏覽器是否封鎖彈出視窗

### 問題：選擇門市後沒有回傳資料
**解決方案**：
1. 檢查 Console 是否有錯誤訊息
2. 確認 Callback URL 是否正確
3. 檢查是否有跨域問題

### 問題：收到的資料格式不正確
**解決方案**：查看 `cvs_callback.html` 的 Console 輸出，確認實際接收到的參數名稱

## 測試建議
使用本地檔案系統時，建議採用手動輸入方式：
1. 開啟官方門市查詢網站
2. 選擇門市並記下資訊
3. 返回購物車頁面手動填入
4. 點擊「確認門市選擇」 

🛒 **新訂單通知**

📋 **訂單編號**: TEST1234567890
📅 **訂單時間**: 2024/12/11 下午2:30:45

👤 **客戶資訊**:
• 姓名: 測試客戶
• 電話: 0912-345-678

🏪 **取貨門市**:
• 統一超商測試門市
• 台北市信義區信義路五段7號
• 店號: TEST001

🛍️ **訂購商品**:
• SP2 一代主機 x1 - NT$ 650
  口味: 薄荷
  顏色: 黑色

💰 **金額明細**:
• 商品小計: NT$ 650
• 運費: NT$ 60
• **總計: NT$ 710**

請盡快處理此訂單！ 