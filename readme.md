# Deepvape 電子菸銷售網站

![Deepvape Logo](logo.png)

## 📋 專案簡介

Deepvape 是一個現代化的電子菸線上銷售平台，提供優質的電子菸產品與完善的購物體驗。網站採用響應式設計，支援多種裝置瀏覽，並整合了 Telegram Bot 訂單通知系統與 LINE 客服功能。

## 🚀 功能特色

### 前端功能
- **年齡驗證系統**：符合法規要求的年齡確認機制
- **卡片式商品展示**：清晰展示商品資訊與價格
- **脈衝動畫按鈕**：酷炫的視覺效果增強使用體驗
- **響應式設計**：支援手機、平板、桌面等多種裝置
- **動態公告輪播**：即時顯示最新優惠資訊
- **購物車功能**：完整的商品選購流程

### 商品分類
- **主機系列**：SP2 一代、ilia 一代、皮革款、布紋款
- **HTX 黑桃系列**：頂級限定版產品
- **煙彈系列**：ilia、SP2、LANA 等多種選擇
- **拋棄式系列**：ilia 四代、LANA 拋棄式

### 後端整合（開發中）
- **Telegram Bot**：自動通知新訂單
- **LINE 客服**：即時客戶服務
- **管理系統**：批量管理商品價格與庫存
- **MySQL 資料庫**：訂單與商品資料儲存

## 🛠️ 技術架構

### 前端技術
- **HTML5** - 網頁結構
- **CSS3** - 樣式設計（含動畫效果）
- **JavaScript** - 互動功能
- **Font Awesome** - 圖標系統
- **Google Fonts** - 中英文字體

### 後端技術（規劃中）
- **Python** - 後端開發語言
- **Telegram Bot API** - 訂單通知系統
- **MySQL** - 資料庫
- **Railway** - 主機託管平台

### 部署環境
- **網域註冊**：xxxsilo
- **DNS/CDN**：Cloudflare（免費版）
- **SSL 憑證**：Cloudflare SSL
- **圖片來源**：Unsplash API

## 📁 檔案結構

```
deepvape/
├── index.html          # 主網頁檔案
├── logo.png           # 網站 Logo（需自行提供）
├── README.md          # 專案說明文件
└── backend/           # 後端程式（開發中）
    ├── telegram_bot.py
    ├── database.py
    └── config.py
```

## 🚦 快速開始

### 前端部署

1. **下載專案檔案**
   ```bash
   git clone [專案網址]
   cd deepvape
   ```

2. **準備 Logo 圖片**
   - 將您的品牌 Logo 命名為 `logo.png`
   - 放置於專案根目錄

3. **本地測試**
   - 直接開啟 `index.html` 即可預覽
   - 或使用本地伺服器：
   ```bash
   python -m http.server 8000
   ```

4. **正式部署**
   - 上傳檔案至您的網頁主機
   - 設定網域指向
   - 確認 SSL 憑證生效

### 後端設定（待開發）

1. **環境需求**
   - Python 3.8+
   - MySQL 5.7+
   - Telegram Bot Token

2. **安裝相依套件**
   ```bash
   pip install -r requirements.txt
   ```

3. **設定環境變數**
   ```bash
   TELEGRAM_BOT_TOKEN=your_bot_token
   DATABASE_URL=mysql://user:password@host/database
   LINE_CHANNEL_ID=your_line_channel_id
   ```

## 💰 費用說明

### 初期費用
- **訂金**：NT$ 10,000
  - 含網域費用：NT$ 1,500/年
  - 含網站建置費用

### 網站總額
- **尾款**：NT$ 14,000
- **包含服務**：SEO 代操作三個月及網站維護一年

### 月費
- **雲端主機 Pro**：NT$ 650/月
- **SSL/CDN**：免費（Cloudflare）

## 📱 使用說明

### 顧客端操作流程

1. **進入網站**
   - 通過年齡驗證（18歲以上）

2. **瀏覽商品**
   - 查看各類別商品
   - 點擊「立即選購」

3. **選擇規格**
   - 選擇顏色
   - 設定數量
   - 選擇配送方式（7-11/全家）
   - *註：需串聯選擇便利店之 API（開發中）*

4. **送出訂單**
   - 確認訂單內容
   - 系統自動通知客服
   - 轉接 LINE 完成後續服務

### 管理端功能（開發中）

- 批量更新商品價格
- 批量調整庫存數量
- 修改網站公告內容
- 查看訂單記錄

## 🔧 自訂修改

### 修改商品資訊
在 `index.html` 中找到對應的商品區塊：
```html
<div class="product-info">
    <h3 class="product-name">商品名稱</h3>
    <p class="product-description">商品描述</p>
    <div class="product-price">NT$ 價格</div>
</div>
```

### 修改公告內容
找到 JavaScript 中的公告陣列：
```javascript
const announcements = [
    '🎉 新品上市！全館滿 $1500 免運費 🚚',
    // 新增您的公告...
];
```

### 修改配色主題
在 CSS 中的 `:root` 變數：
```css
:root {
    --primary-color: #1a1a2e;
    --secondary-color: #16213e;
    --accent-color: #0f3460;
    --highlight-color: #e94560;
    /* 修改顏色值... */
}
```

## 🔒 安全注意事項

1. **年齡驗證**：確保符合當地法規要求
2. **資料保護**：客戶資料需加密儲存
3. **定期更新**：保持系統與套件最新版本
4. **備份機制**：定期備份資料庫與檔案

## 📄 授權說明

本專案為客製化開發，版權歸 Deepvape 所有。

## 🔄 更新紀錄

### v1.0.0 (2025-01-XX)
- 初版網站上線
- 實現基本購物功能
- 整合年齡驗證系統
- 響應式設計完成

### 待開發功能
- [ ] Telegram Bot 整合
- [ ] 後台管理系統
- [ ] 會員系統
- [ ] 優惠券功能
- [ ] 商品評價系統
- [ ] 多語言支援

---

**注意**：本網站僅供 18 歲以上成年人使用。請遵守當地相關法規。