# 產品頁面管理系統使用說明

## 概述

新的產品頁面管理系統讓您可以在 Netlify CMS 後台直接管理所有產品頁面的：
1. **產品名稱**
2. **價格**
3. **變數（口味或顏色）**
4. **變數庫存**
5. **新增變數**

## 如何使用

### 1. 進入後台管理
1. 訪問 `https://your-site.netlify.app/admin/`
2. 登入您的 Netlify CMS 後台
3. 在左側選單中找到 **「產品頁面管理」**

### 2. 管理產品頁面
在「產品頁面管理」中，您會看到所有產品頁面：

- **HTA 黑桃煙彈頁面**
- **HTA 黑桃主機頁面**
- **ILIA 一代主機頁面**
- **ILIA 拋棄式四代頁面**
- **ILIA 布紋主機頁面**
- **ILIA 發光煙彈頁面**
- **ILIA 皮革款主機頁面**
- **SP2 一代主機頁面**
- **SP2 煙彈頁面**
- **RELX Infinity 主機頁面**
- **RELX 煙彈頁面**

### 3. 編輯產品信息

點擊任一產品頁面進入編輯模式：

#### 基本信息
- **產品名稱**: 直接修改產品標題
- **產品價格**: 設定當前售價
- **原價**: 可選，用於顯示折扣前價格
- **折扣標籤**: 可選，如「限時優惠」

#### 管理變數（口味/顏色）
在「產品變數」區域：

1. **查看現有變數**: 所有變數會列出，包含：
   - 變數ID
   - 變數名稱（口味/顏色）
   - 變數類型（flavor/color）
   - 變數值（如：清涼可樂、黑色）
   - 庫存數量
   - 價格調整
   - 圖片
   - SKU編號

2. **修改庫存**: 直接在「庫存數量」欄位輸入新數量

3. **新增變數**: 點擊「Add 產品變數」按鈕
   - 輸入變數ID（唯一識別碼）
   - 選擇變數類型（口味 flavor 或顏色 color）
   - 輸入變數值（如：新口味名稱）
   - 設定庫存數量
   - 可選：設定價格調整、圖片、SKU

4. **刪除變數**: 點擊變數右上角的刪除按鈕

### 4. 保存變更
1. 編輯完成後，點擊右上角「Save」按鈕
2. 系統會自動更新對應的產品頁面
3. 前台頁面會即時反映變更

## 功能特色

### 🎯 即時庫存管理
- 庫存為 0 時，變數選項會顯示「缺貨」
- 庫存 ≤ 5 時，會顯示「庫存剩餘」警告
- 購物車會自動檢查庫存限制

### 💰 價格管理
- 支援原價和折扣價顯示
- 變數可設定價格調整（+/- 金額）
- 自動計算最終價格

### 🏷️ 變數管理
- 支援口味（flavor）和顏色（color）兩種類型
- 每個變數獨立管理庫存
- 支援變數圖片和 SKU 編號

### 📊 庫存狀態
- ✅ 現貨供應（庫存 > 5）
- ⚠️ 庫存剩餘：X（庫存 1-5）
- ⚠️ 缺貨（庫存 = 0）

## 數據文件位置

所有產品頁面數據存儲在：
```
data/page_products/
├── hta_pods.json          # HTA 黑桃煙彈
├── hta_vape.json          # HTA 黑桃主機
├── ilia_1.json            # ILIA 一代主機
├── ilia_disposable.json   # ILIA 拋棄式四代
├── ilia_fabric.json       # ILIA 布紋主機
├── ilia_pods.json         # ILIA 發光煙彈
├── ilia_leather.json      # ILIA 皮革款主機
├── sp2_device.json        # SP2 一代主機
├── sp2_pods.json          # SP2 煙彈
├── relx_infinity.json     # RELX Infinity 主機
└── relx_pods.json         # RELX 煙彈
```

## 注意事項

### ⚠️ 重要提醒
1. **測試數據**: 目前所有庫存數據都是測試數據，請根據實際情況修改
2. **備份**: 修改前建議先備份現有數據
3. **同步**: 修改後需要重新部署網站才會生效

### 🔧 技術說明
- 使用 `js/page-product-manager.js` 管理前台頁面
- 自動從後台數據載入產品信息
- 支援庫存檢查和購物車整合
- 與現有的庫存管理系統完全整合

## 常見問題

### Q: 修改後前台沒有更新？
A: 請確認：
1. 已點擊「Save」保存
2. 網站已重新部署
3. 清除瀏覽器快取

### Q: 如何新增全新的產品頁面？
A: 需要：
1. 在 `admin/config.yml` 中新增對應配置
2. 創建對應的數據文件
3. 創建對應的 HTML 頁面

### Q: 庫存數據會自動扣除嗎？
A: 目前是靜態管理，需要手動更新庫存。未來可整合動態庫存系統。

## 支援

如有問題，請聯繫技術支援或查看系統日誌。 