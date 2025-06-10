# DeepVape 網站部署服務記錄

## 🌐 網域服務 (Domain Service)

### Namecheap
- **服務提供商**: Namecheap
- **帳戶名稱**: lovemage
- **管理平台**: [Namecheap Dashboard](https://ap.www.namecheap.com/dashboard)
- **域名管理**: 透過 Namecheap 控制台管理 DNS 設定

## 🖥️ 服務器託管 (Web Hosting)

### Netlify
- **服務提供商**: Netlify
- **帳戶持有人**: Chi Logon
- **登入郵箱**: aistorm0910@gmail.com
- **管理平台**: [Netlify Dashboard](https://app.netlify.com/)
- **部署方式**: 自動部署 (Auto Deploy)
- **服務特色**:
  - ✅ 免費 SSL 憑證
  - ✅ 全球 CDN 加速
  - ✅ 自動 HTTPS 重定向
  - ✅ 表單處理功能
  - ✅ 即時預覽部署

## 💻 代碼託管 (Code Repository)

### GitHub
- **服務提供商**: GitHub
- **儲存庫位置**: github.com/lovemage/deepvape
- **部署來源**: GitHub Repository
- **自動部署**: 推送到 main/master 分支時自動觸發部署
- **版本控制**: Git 版本控制系統

## 🔄 自動化部署流程

### CI/CD 流程
```
開發者推送代碼 → GitHub Repository → Netlify 自動檢測 → 自動構建 → 部署到生產環境
```

### 部署步驟
1. **代碼推送**: 開發者推送代碼到 GitHub
2. **自動觸發**: Netlify 檢測到 Repository 變更
3. **構建過程**: Netlify 自動構建網站
4. **部署上線**: 自動部署到生產環境
5. **DNS 解析**: Namecheap 域名指向 Netlify 服務器

## 📁 專案結構

### 前端文件
```
deepvape/
├── index.html                    # 主頁面
├── cart.html                     # 購物車頁面
├── order_confirmation.html       # 訂單確認頁面
├── shopping_guide.html           # 購物指南
├── cvs_callback.html             # 便利商店回調頁面
├── ilia_*_product.html           # ILIA 系列產品頁面
├── sp2_*_product.html            # SP2 系列產品頁面
├── hta_*_product.html            # HTA 系列產品頁面
├── test_*.html                   # 測試頁面
├── assets/                       # 靜態資源
│   ├── images/                   # 圖片資源
│   ├── css/                      # 樣式文件
│   └── js/                       # JavaScript 文件
└── backend/                      # 後端服務 (Flask)
```

### 數據文件
```
data/
├── cart_stores_711.json         # 7-ELEVEN 門市資料
├── cart_stores_family.json      # 全家便利商店門市資料
├── seven_eleven_stores.db       # 7-ELEVEN 資料庫
├── family_mart_stores.db        # 全家資料庫
└── product_data/                # 產品資料
```

## 🛠️ 技術規格

### 前端技術
- **HTML5**: 語義化標記
- **CSS3**: 響應式設計、動畫效果
- **JavaScript ES6**: 現代 JavaScript 功能
- **FontAwesome**: 圖標庫
- **Google Fonts**: 字體服務

### 後端技術
- **Flask**: Python Web 框架
- **SQLite**: 輕量級資料庫
- **SQLAlchemy**: ORM 映射
- **Gunicorn**: WSGI 服務器

### 整合服務
- **Telegram Bot API**: 訂單通知系統
- **便利商店 API**: 門市查詢系統
- **支付系統**: 線上支付整合 (規劃中)

## 🔐 安全與備份

### 安全措施
- **HTTPS**: 全站 SSL 加密
- **環境變數**: 敏感資訊環境變數管理
- **CORS**: 跨域請求控制
- **驗證碼**: 防機器人驗證系統

### 備份策略
- **代碼備份**: GitHub 自動版本控制
- **資料備份**: 定期資料庫備份
- **配置備份**: 服務配置文件備份

## 📊 監控與分析

### 網站監控
- **Netlify Analytics**: 基本流量統計
- **Uptime Monitoring**: 服務可用性監控
- **Performance Monitoring**: 性能監控

### 用戶分析
- **Google Analytics**: 用戶行為分析 (可選)
- **Hotjar**: 用戶體驗分析 (可選)
- **Custom Tracking**: 自定義追蹤事件

## 🚀 部署歷史

### 重要里程碑
- **2024-06**: 初始專案建立
- **2024-06**: 產品頁面系統開發
- **2024-06**: 購物車系統開發
- **2024-06**: 便利商店整合系統
- **2024-06**: Telegram 通知系統
- **2024-06**: 7-ELEVEN 爬蟲系統
- **2024-06**: 全家便利商店爬蟲系統

### Git 提交記錄
```bash
# 最近的重要提交
- 完成全家便利商店爬蟲整合
- 修復 Telegram 通知問題
- 後端系統部署優化與完整功能更新
```

## 📞 聯絡資訊

### 技術支援
- **GitHub Issues**: 在 Repository 中提交問題
- **Netlify Support**: 透過 Netlify Dashboard 聯絡
- **Namecheap Support**: 透過 Namecheap 客服系統

### 開發團隊
- **主要開發者**: Chi Logon
- **聯絡郵箱**: aistorm0910@gmail.com
- **專案管理**: GitHub Project Management

## 🔧 常用操作

### 更新網站
```bash
# 1. 克隆專案
git clone https://github.com/lovemage/deepvape.git

# 2. 進入專案目錄
cd deepvape

# 3. 進行修改
# ... 編輯文件 ...

# 4. 提交更改
git add .
git commit -m "更新描述"
git push origin main

# 5. Netlify 會自動部署更新
```

### 緊急維護
```bash
# 如需緊急停止服務
# 1. 在 Netlify Dashboard 停用部署
# 2. 設置維護頁面
# 3. 通知用戶服務暫停
```

### 回滾版本
```bash
# 在 Netlify Dashboard 中可以快速回滾到之前的部署版本
# 或使用 Git 回滾特定提交
git revert <commit-hash>
git push origin main
```

## 📋 檢查清單

### 部署前檢查
- [ ] 代碼審查完成
- [ ] 測試環境驗證
- [ ] 資料庫備份
- [ ] 環境變數配置
- [ ] SSL 憑證狀態

### 部署後檢查
- [ ] 網站可正常訪問
- [ ] 所有功能正常運作
- [ ] 購物車系統測試
- [ ] Telegram 通知測試
- [ ] 移動端兼容性測試

## 🎯 未來規劃

### 技術升級
- **CDN 優化**: 進一步提升全球訪問速度
- **API Gateway**: 統一 API 管理
- **微服務架構**: 服務拆分與優化
- **容器化部署**: Docker 容器化

### 功能擴展
- **多語言支援**: 國際化功能
- **支付系統**: 完整支付流程
- **會員系統**: 用戶註冊與管理
- **庫存管理**: 實時庫存系統

---

**📝 最後更新**: 2024年6月  
**📍 文件版本**: v1.0  
**�� 下次檢查**: 每月定期檢查服務狀態 