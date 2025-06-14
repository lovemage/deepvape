# DeepVape 官方網站

DeepVape 是一個現代化的電子煙產品展示和銷售網站。

## 技術架構

- **前端**: HTML5, CSS3, JavaScript (原生)
- **部署**: Netlify
- **內容管理**: Netlify CMS
- **訂單通知**: Telegram Bot API
- **門市查詢**: ibon 7-11 門市查詢系統

## 主要功能

- 產品展示和購物車
- 7-11 門市取貨
- 外島配送支援
- 訂單 Telegram 通知
- 響應式設計
- 公告系統

## 部署說明

網站自動部署到 Netlify，推送到 main 分支即可觸發部署。

## 內容管理

使用 Netlify CMS 進行內容管理：
- 訪問 `/admin` 進行後台管理
- 管理公告和價格信息

## 環境配置

主要配置文件：
- `netlify.toml` - Netlify 部署配置
- `admin/config.yml` - CMS 配置
- `data/announcements.json` - 公告數據
- `data/prices.json` - 價格數據 