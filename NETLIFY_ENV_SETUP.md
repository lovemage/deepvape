# Netlify 環境變數設定指南

## 🔑 設定Google Maps API金鑰

### 步驟1：在Google Cloud Console創建新的API金鑰

1. **前往Google Cloud Console**
   - 訪問 [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - 選擇你的專案

2. **創建新的API金鑰**
   - 前往「API和服務」→「憑證」
   - 點擊「建立憑證」→「API金鑰」
   - **立即刪除舊金鑰**: `AIzaSyCadRR9e4sgVKSUf3vqChPqoQshoI8DgOg`

3. **設定API金鑰限制**（重要！）
   - 點擊剛創建的API金鑰進行編輯
   - **應用程式限制**：選擇「HTTP referrers (網站)」
     - 新增: `https://deepvape.netlify.app/*`
     - 新增: `https://*.netlify.app/*` (測試分支用)
     - 新增: `http://localhost:*` (本地開發用)
   - **API限制**：選擇「限制金鑰」
     - 啟用：Maps JavaScript API
     - 啟用：Places API
   - 點擊「儲存」

### 步驟2：在Netlify Dashboard設定環境變數

1. **登入Netlify**
   - 前往 [https://app.netlify.com/](https://app.netlify.com/)
   - 選擇 `deepvape` 網站

2. **設定環境變數**
   - 點擊「Site settings」
   - 在左側選單選擇「Environment variables」
   - 點擊「Add a variable」

3. **新增環境變數**
   ```
   Key: GOOGLE_MAPS_API_KEY
   Value: [你的新API金鑰]
   Scopes: All contexts
   ```

4. **重新部署**
   - 前往「Deploys」頁面
   - 點擊「Trigger deploy」→「Deploy site」

### 步驟3：驗證設定

1. **檢查門市選擇功能**
   - 訪問你的網站：https://deepvape.netlify.app/store_selector.html
   - 選擇門市類型、縣市、區域
   - 確認能正常載入門市列表和地圖

2. **檢查API呼叫**
   - 打開瀏覽器開發者工具（F12）
   - 查看Network標籤
   - 確認對`/.netlify/functions/search-stores`的請求成功

## 🔒 安全注意事項

1. **絕對不要將API金鑰寫在程式碼中**
2. **定期檢查API使用量和費用**
3. **設定適當的API金鑰限制**
4. **監控異常API呼叫**

## 🛠️ 本地開發設定

如果需要在本地開發：

1. **安裝Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **在本地創建.env檔案**
   ```bash
   echo "GOOGLE_MAPS_API_KEY=你的新API金鑰" > .env
   ```

3. **使用Netlify Dev運行**
   ```bash
   netlify dev
   ```

## 📞 支援

如果遇到問題：
1. 檢查Netlify函數日誌
2. 檢查瀏覽器控制台錯誤
3. 確認API金鑰權限設定正確 