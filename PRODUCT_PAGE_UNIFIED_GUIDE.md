# DeepVape 統一產品頁面系統使用指南

## 🎯 概述

DeepVape 統一產品頁面系統是為了解決以下問題而設計的：

### 現有問題
- ❌ 每個產品頁面有不同的HTML結構
- ❌ 導航列、頁腳不統一
- ❌ CSS樣式各自為政，維護困難
- ❌ 變數選擇器實現方式不一致
- ❌ 響應式設計不統一
- ❌ 用戶體驗不一致

### 解決方案
- ✅ 統一的HTML模板框架
- ✅ 統一的導航列和頁腳
- ✅ 統一的CSS架構系統
- ✅ 統一的變數選擇器
- ✅ 統一的響應式設計
- ✅ 一致的用戶體驗

## 📁 文件結構

```
DeepVape/
├── product-template.html          # 統一產品頁面模板
├── generate-unified-product-page.js  # 頁面生成器腳本
├── css/
│   ├── deepvape-unified.css      # 主要CSS文件 (包含所有樣式)
│   ├── variables.css             # CSS變數定義
│   ├── variant-selector.css      # 變數選擇器樣式
│   ├── responsive.css            # 響應式設計
│   └── product-page-unified.css  # 統一產品頁面樣式
└── js/
    ├── variant-selector.js       # 變數選擇器功能
    ├── product-manager.js        # 產品管理器
    └── cart-animation.js         # 購物車動畫
```

## 🛠️ 使用方法

### 1. 生成統一格式的產品頁面

```bash
# 執行生成器腳本
node generate-unified-product-page.js
```

這會：
- 備份現有產品頁面
- 根據配置生成統一格式的新頁面
- 輸出生成結果和下一步驟

### 2. 手動創建新產品頁面

#### 步驟1：複製模板
```bash
cp product-template.html my_new_product.html
```

#### 步驟2：替換變數
在新文件中替換以下變數：

| 變數 | 說明 | 範例 |
|------|------|------|
| `{PRODUCT_THEME}` | 產品主題 | `ilia`, `sp2`, `lana`, `hta` |
| `{PRODUCT_TITLE}` | 產品標題 | `ILIA 一代主機` |
| `{PRODUCT_SUBTITLE}` | 產品副標題 | `7W~8W功率 • 450mAH電池` |
| `{PRODUCT_PRICE}` | 產品價格 | `650` |
| `{PRODUCT_ID}` | 產品ID | `ilia_1_product` |
| `{VARIANT_TITLE}` | 變數選擇標題 | `選擇顏色` |
| `{VARIANT_TYPE}` | 變數類型 | `顏色`, `口味` |

#### 步驟3：自定義內容區塊
替換以下內容區塊：

- `{PRODUCT_FEATURES}` - 產品特色列表
- `{PRODUCT_SPECIFICATIONS}` - 產品規格表
- `{PRODUCT_HIGHLIGHTS}` - 產品亮點展示

## 🎨 CSS架構

### 統一CSS引入
所有產品頁面只需引入一個CSS文件：

```html
<link rel="stylesheet" href="css/deepvape-unified.css">
```

### 主題系統
通過在 `<body>` 標籤添加主題類別來應用不同的色彩主題：

```html
<body class="theme-ilia">   <!-- ILIA系列 -->
<body class="theme-sp2">    <!-- SP2系列 -->
<body class="theme-lana">   <!-- LANA系列 -->
<body class="theme-hta">    <!-- HTA系列 -->
```

### CSS變數系統
所有樣式使用CSS變數，便於維護和主題切換：

```css
:root {
    --dv-primary: #1afe49;
    --dv-secondary: #06b6d4;
    --dv-text-primary: #ffffff;
    /* 更多變數... */
}
```

## 🔧 組件系統

### 1. 統一導航列
- 固定在頂部
- 包含Logo、導航連結、購物車按鈕
- 滾動時自動變更透明度
- 響應式設計

### 2. 產品展示區
- 左右兩欄佈局（桌面版）
- 產品圖片 + 產品資訊
- 響應式調整為單欄（移動版）

### 3. 統一變數選擇器
- 支援顏色、口味等不同類型變數
- 統一的視覺效果和交互
- 庫存狀態顯示
- 響應式網格佈局

### 4. 購買控制區
- 數量選擇器
- 加入購物車按鈕
- 狀態管理

### 5. 統一頁腳
- 品牌資訊
- 產品連結
- 客服資訊
- 法律聲明

## 📱 響應式設計

### 斷點設計
- 手機版：≤ 768px
- 平板版：769px - 1024px  
- 桌面版：≥ 1025px

### 變數選擇器響應式
- 手機版：3列固定佈局
- 平板版：自適應佈局（最小140px）
- 桌面版：自適應佈局（最小120px）

## 🛡️ 變數選擇器統一

### 新系統類別
```html
<div class="dv-variant-selector">
    <div class="dv-variant-options" id="variantContainer">
        <!-- 由JavaScript動態生成 -->
    </div>
</div>
```

### 舊系統兼容
系統同時支援舊的類別名稱：
- `.variant-option` ← 舊系統
- `.dv-variant-option` ← 新系統
- `.color-option` ← 舊系統
- `.flavor-option` ← 舊系統

## 🚀 JavaScript整合

### 統一初始化
```javascript
// 產品數據配置
const productData = {
    id: 'product_id',
    name: '產品名稱',
    price: 價格,
    image: '圖片路徑'
};

// 自動初始化變數選擇器
document.addEventListener('DOMContentLoaded', function() {
    initVariantSelector();
    updateCartCount();
});
```

### 變數選擇器整合
```javascript
// 初始化變數選擇器
variantSelector = new VariantSelector(productData.id, 'variantContainer');

// 設置回調函數
variantSelector.setOnVariantChange((variant) => {
    selectedVariant = variant;
    updateAddToCartButton(variant);
});
```

## 📋 檢查清單

### 新增產品頁面時
- [ ] 使用統一模板
- [ ] 設置正確的產品主題
- [ ] 配置產品數據
- [ ] 測試變數選擇器
- [ ] 驗證響應式設計
- [ ] 測試購物車功能
- [ ] 檢查SEO標籤

### 修改現有頁面時
- [ ] 備份原始文件
- [ ] 使用生成器或手動轉換
- [ ] 測試所有功能
- [ ] 確認資料正確性
- [ ] 驗證連結有效性

## 🔧 維護指南

### 修改全域樣式
編輯對應的CSS文件：
- `variables.css` - 修改色彩、尺寸等變數
- `variant-selector.css` - 修改變數選擇器樣式  
- `responsive.css` - 修改響應式行為
- `product-page-unified.css` - 修改頁面佈局

### 新增產品系列
1. 在 `variables.css` 中新增主題變數
2. 在 `generate-unified-product-page.js` 中新增產品配置
3. 創建對應的產品數據JSON文件

### 調試工具
使用內建的調試類別：
```html
<div class="dv-debug-border">顯示紅色邊框</div>
<div class="dv-debug-bg">顯示紅色背景</div>
<div class="dv-debug-grid">顯示網格線</div>
```

## 🎯 最佳實踐

1. **一致性優先**：始終使用統一的類別名稱和結構
2. **移動優先**：先設計移動版，再適配桌面版
3. **語義化HTML**：使用有意義的HTML標籤
4. **無障礙設計**：確保屏幕閱讀器可讀性
5. **性能優化**：懶加載圖片、最小化CSS
6. **測試覆蓋**：在不同設備和瀏覽器測試

## ❓ 常見問題

**Q: 現有頁面如何轉換？**
A: 使用 `generate-unified-product-page.js` 腳本自動轉換，或參考模板手動轉換。

**Q: 如何自定義主題色彩？**
A: 修改 `variables.css` 中的對應主題變數。

**Q: 變數選擇器不顯示怎麼辦？**
A: 檢查產品ID是否正確，確認 `ProductManager` 已初始化。

**Q: 響應式佈局有問題？**
A: 檢查是否引入了 `responsive.css`，確認容器類別正確。

## 📞 技術支援

如有問題，請檢查：
1. 瀏覽器開發者工具的錯誤信息
2. CSS文件是否正確載入
3. JavaScript初始化是否成功
4. 產品數據配置是否正確

---

*最後更新：2024年6月* 