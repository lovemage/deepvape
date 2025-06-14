# 首頁商品卡片同步系統使用說明

## 系統概述

首頁商品卡片同步系統會自動將 Netlify CMS 後台的產品數據同步到首頁的商品卡片，確保價格、名稱、庫存狀態等信息的一致性。

## 功能特色

### 1. 自動同步功能
- **產品名稱同步**：後台修改產品名稱後，首頁卡片會自動更新
- **價格同步**：後台調整價格後，首頁顯示的價格會即時更新
- **庫存狀態顯示**：根據變數庫存自動顯示「現貨」、「低庫存」或「缺貨」狀態
- **折扣標籤**：如果設定了折扣標籤，會自動在卡片上顯示

### 2. 庫存管理
- **現貨**：總庫存 > 10 件，顯示綠色「現貨」標籤
- **低庫存**：總庫存 ≤ 10 件，顯示橙色「低庫存」標籤  
- **缺貨**：總庫存 = 0 件，顯示紅色「缺貨」標籤，並禁用購買按鈕

### 3. 支援的產品

#### 主機系列
- SP2 一代主機 (`sp2_device`)
- ILIA 一代主機 (`ilia_gen1`) 
- ILIA 皮革款主機 (`ilia_leather`)
- ILIA 布紋主機 (`ilia_fabric`)
- HTA 黑桃主機 (`hta_spade`)

#### 煙彈系列
- ILIA 發光煙彈 (`ilia_pods`)
- SP2 煙彈 (`sp2_pods`)
- HTA 黑桃煙彈 (`hta_pods`)
- LANA 煙彈 (`lana_pods`)

#### 拋棄式系列
- ILIA 拋棄式四代 (`ilia_disposable`)
- LANA A8000 拋棄式 (`lana_a8000`)

## 使用方式

### 1. 後台管理
1. 登入 Netlify CMS 後台 (`/admin`)
2. 進入「產品頁面管理」
3. 選擇要修改的產品頁面
4. 修改產品名稱、價格或變數庫存
5. 儲存變更

### 2. 自動同步
- 系統會在頁面載入時自動同步所有產品數據
- 無需手動操作，變更會即時反映在首頁

### 3. 手動刷新（開發者功能）
```javascript
// 刷新特定產品
homepageSync.refreshProduct('sp2_device');

// 獲取產品庫存信息
const stock = await homepageSync.getProductStock('ilia_pods');
console.log(stock);
```

## 數據文件位置

所有產品數據存放在 `data/page_products/` 目錄下：

```
data/page_products/
├── sp2_device.json      # SP2 一代主機
├── ilia_1.json          # ILIA 一代主機
├── ilia_leather.json    # ILIA 皮革款主機
├── ilia_fabric.json     # ILIA 布紋主機
├── hta_vape.json        # HTA 黑桃主機
├── ilia_pods.json       # ILIA 發光煙彈
├── sp2_pods.json        # SP2 煙彈
├── hta_pods.json        # HTA 黑桃煙彈
├── lana_pods.json       # LANA 煙彈
├── ilia_disposable.json # ILIA 拋棄式四代
└── lana_a8000.json      # LANA A8000 拋棄式
```

## 技術說明

### 1. 同步機制
- 使用 `fetch()` API 載入 JSON 數據文件
- 通過 `data-product-id` 屬性匹配商品卡片
- 備用方案：根據產品名稱進行模糊匹配

### 2. 錯誤處理
- 如果數據載入失敗，會保持原有的靜態數據
- 控制台會顯示詳細的錯誤信息
- 不會影響頁面的正常運作

### 3. 效能優化
- 使用 `Promise.all()` 並行載入所有產品數據
- 只更新有變化的 DOM 元素
- 自動注入必要的 CSS 樣式

## 注意事項

1. **數據格式**：確保 JSON 文件格式正確，包含必要的欄位
2. **圖片路徑**：變數圖片路徑需要相對於網站根目錄
3. **庫存計算**：總庫存 = 所有變數庫存的總和
4. **瀏覽器支援**：需要支援 ES6+ 的現代瀏覽器

## 常見問題

### Q: 為什麼價格沒有更新？
A: 檢查 JSON 文件中的 `price` 欄位是否正確，並確認瀏覽器已清除快取。

### Q: 庫存狀態不正確怎麼辦？
A: 確認 `variants` 陣列中每個變數的 `stock` 值是否正確設定。

### Q: 新增產品後沒有同步？
A: 需要在 `js/homepage-sync.js` 中的 `productMapping` 添加新產品的映射關係。

### Q: 如何停用某個產品的同步？
A: 在產品數據中設定 `status: "inactive"` 或從 `productMapping` 中移除該產品。

## 更新記錄

- **v1.0** (2024-01-15): 初始版本，支援基本的名稱和價格同步
- **v1.1** (2024-01-15): 新增庫存狀態顯示和折扣標籤功能
- **v1.2** (2024-01-15): 新增 LANA 產品支援，優化錯誤處理

---

**注意**：本文檔中的產品數據為測試數據，請勿當作真實商品信息。 