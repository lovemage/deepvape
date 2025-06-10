# Favicon 設置說明

## 當前狀態
已為以下 HTML 頁面添加了 favicon 設置：
- ✅ index.html (主頁)
- ✅ cart.html (購物車)
- ✅ order_confirmation.html (訂單確認)
- ✅ shopping_guide.html (購物指南)
- ✅ ilia_disposable_product.html (ILIA 拋棄式產品)
- ✅ sp2_pods_product.html (SP2 煙彈產品)
- ✅ ilia_pods_product.html (ILIA 煙彈產品)
- ✅ cvs_callback.html (CVS 回調頁面)

## Favicon 設置方案
每個頁面都添加了以下 favicon 配置：
```html
<link rel="icon" type="image/x-icon" href="favicon.ico">
<link rel="shortcut icon" type="image/x-icon" href="favicon.ico">
<link rel="icon" type="image/png" href="nav_logo.png">
<link rel="apple-touch-icon" href="nav_logo.png">
```

## 需要創建的文件
1. **favicon.ico** - 傳統 ICO 格式圖標 (16x16, 32x32, 48x48 像素)
2. 已使用現有的 **nav_logo.png** 作為 PNG 格式圖標

## 如何生成 favicon.ico
1. 使用現有的 `nav_logo.png` 作為源文件
2. 使用在線工具轉換：
   - https://www.favicon.cc/
   - https://favicon.io/
   - https://realfavicongenerator.net/

3. 或使用 ImageMagick 命令：
   ```bash
   convert nav_logo.png -resize 16x16 favicon-16.png
   convert nav_logo.png -resize 32x32 favicon-32.png
   convert nav_logo.png -resize 48x48 favicon-48.png
   convert favicon-16.png favicon-32.png favicon-48.png favicon.ico
   ```

## 文件放置位置
將生成的 `favicon.ico` 文件放在項目根目錄下，與 `index.html` 同級。

## 瀏覽器支持
- **favicon.ico**: 支持所有瀏覽器，包括舊版瀏覽器
- **PNG favicon**: 支持現代瀏覽器，質量更好
- **Apple Touch Icon**: 支持 iOS 設備的主屏幕圖標

## 驗證設置
設置完成後，可以通過以下方式驗證：
1. 在瀏覽器中打開網站，檢查標籤頁圖標
2. 訪問 `your-domain.com/favicon.ico` 確認文件可訪問
3. 使用 favicon 檢測工具驗證設置

## 建議圖標尺寸
- **favicon.ico**: 16x16, 32x32, 48x48 (多尺寸組合)
- **PNG favicon**: 32x32 或 16x16
- **Apple Touch Icon**: 180x180 (推薦) 