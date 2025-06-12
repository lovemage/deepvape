# 7-11 門市選擇功能使用指南

## 功能說明

本專案已整合 7-11 官方電子地圖 API，讓用戶可以輕鬆選擇取貨門市。

## 實作架構

### 1. 檔案結構
```
/
├── js/
│   └── store-selector.js    # 門市選擇功能核心模組
├── cart.html               # 購物車頁面（整合門市選擇）
└── cvs_callback.html       # 7-11 API 回調處理頁面
```

### 2. 核心功能模組 - StoreSelector

`store-selector.js` 提供了完整的門市選擇功能：

```javascript
// 初始化門市選擇器
const storeSelector = new StoreSelector();

// 開啟門市地圖
storeSelector.openStoreMap();

// 取得選擇的門市
const selectedStore = storeSelector.getSelectedStore();
```

### 3. 整合方式

在購物車頁面已完成整合：

```javascript
// 初始化
storeSelector = new StoreSelector();

// 自訂選擇完成的回調
storeSelector.onStoreSelected = function(storeInfo) {
    // 自動填入表單
    document.getElementById('storeIdInput').value = storeInfo.storeId;
    document.getElementById('storeNameInput').value = storeInfo.storeName;
    document.getElementById('storeAddressInput').value = storeInfo.storeAddress;
};
```

## 使用流程

### 1. 用戶操作流程
1. 進入購物車頁面
2. 點擊「選擇7-11門市」按鈕
3. 在彈出的地圖中選擇門市
4. 點擊確認後，門市資訊自動填入表單
5. 確認門市選擇，完成訂單

### 2. 技術流程
1. 用戶點擊選擇門市 → 呼叫 `storeSelector.openStoreMap()`
2. 開啟 7-11 電子地圖視窗
3. 用戶選擇門市後，7-11 API 將資料 POST 到 `cvs_callback.html`
4. 回調頁面處理資料並透過 postMessage 傳回主視窗
5. StoreSelector 接收訊息並觸發 `onStoreSelected` 回調
6. 自動填入門市資訊到表單

## API 參數說明

### 7-11 電子地圖 API
- **URL**: `https://emap.presco.com.tw/c2cemap.ashx`
- **參數**:
  - `eshopid`: 廠商代碼（870）
  - `servicetype`: 服務類型（1=取貨付款）
  - `url`: 回調 URL

### 回調資料格式
```javascript
{
    CVSStoreID: "123456",      // 門市代號
    CVSStoreName: "台北信義門市", // 門市名稱
    CVSAddress: "台北市信義區...", // 門市地址
    CVSTelephone: "02-87891234", // 門市電話
    CVSOutSide: "N"             // 是否為離島
}
```

## 注意事項

### 1. 開發環境
- 本地開發時，7-11 API 無法正確回調到 localhost
- 系統會自動使用線上環境的回調 URL
- 建議部署到線上環境進行完整測試

### 2. 安全性考量
- 回調頁面會驗證訊息來源
- 只接受來自允許網域的訊息
- 建議實作 CSRF 保護

### 3. 瀏覽器相容性
- 需要支援 postMessage API
- 需要允許彈出視窗
- 建議使用現代瀏覽器

## 部署設定

### Netlify 部署
確保 `cvs_callback.html` 可以被正確訪問：
```
https://yourdomain.com/cvs_callback.html
```

### 環境變數
不需要特別的環境變數設定，所有配置都在程式碼中。

## 常見問題

### Q: 為什麼本地開發無法使用？
A: 7-11 API 需要有效的公開 URL 作為回調地址，localhost 無法被外部訪問。

### Q: 如何測試門市選擇功能？
A: 使用「快速填入測試門市」按鈕可以在開發時快速測試。

### Q: 可以自訂選擇後的行為嗎？
A: 可以，透過覆寫 `storeSelector.onStoreSelected` 方法來自訂行為。

## 聯絡支援

如有任何問題，請聯絡技術支援團隊。 
