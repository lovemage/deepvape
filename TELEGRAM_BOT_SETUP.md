# Telegram Bot 設置指南

## 📱 **建立 Telegram Bot**

### 1. 創建 Bot
1. 在 Telegram 中搜尋 `@BotFather`
2. 發送 `/newbot` 命令
3. 輸入 Bot 名稱（例如：Deepvape 訂單通知）
4. 輸入 Bot 用戶名（例如：deepvape_orders_bot）
5. 獲得 Bot Token（格式：`123456789:ABCdefGHIjklMNOpqrsTUVwxyz`）

### 2. 創建群組或頻道
1. 創建新群組或頻道
2. 將剛創建的 Bot 加入群組
3. 給予 Bot 管理員權限（發送訊息）

### 3. 獲取群組 Chat ID ⚠️ **重要：必須使用群組 ID**

商家訂單通知應該發送到**群組**而不是個人聊天，這樣團隊成員都能看到訂單。

#### 方法一：使用 Bot API（推薦）
1. **在群組中發送任意訊息**（例如：`/start` 或 `Hello`）
2. **查詢 Bot 更新**：
   ```bash
   curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates"
   ```
3. **找到群組 Chat ID**：
   - 在 JSON 回應中尋找 `"type": "group"` 或 `"type": "supergroup"`
   - 對應的 `chat.id` 就是群組 Chat ID
   - **群組 Chat ID 特徵**：負數格式（如：`-1001234567890`）

#### 方法二：使用 @userinfobot
1. 將 `@userinfobot` 加入群組
2. 發送 `/start` 命令
3. Bot 會回覆群組的 Chat ID

#### Chat ID 類型說明
- **個人聊天 ID**：正數（如：`123456789`）❌ 不適用於商家通知
- **群組 Chat ID**：負數（如：`-987654321`）✅ 適用於商家通知  
- **超級群組 ID**：以 `-100` 開頭（如：`-1001234567890`）✅ 適用於商家通知

## 🔧 **配置購物車系統**

### 修改 cart.html 中的配置
```javascript
// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = 'YOUR_ACTUAL_BOT_TOKEN'; // 替換為實際的 Bot Token
const TELEGRAM_CHAT_ID = 'YOUR_ACTUAL_CHAT_ID';     // 替換為實際的群組 Chat ID
```

### 範例配置
```javascript
// 實際配置範例
const TELEGRAM_BOT_TOKEN = '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456789';
const TELEGRAM_CHAT_ID = '-1001234567890'; // 群組 ID 通常是負數
```

## 📋 **訊息格式**

Bot 會發送包含以下資訊的訂單通知：
- 📋 訂單編號
- 📅 訂單時間
- 👤 客戶資訊（姓名、電話）
- 🏪 取貨門市資訊
- 🛍️ 訂購商品清單
- 💰 金額明細

## 🔒 **安全注意事項**

1. **保護 Bot Token**：不要在公開代碼中暴露真實的 Bot Token
2. **限制 Bot 權限**：只給予必要的發送訊息權限
3. **群組管理**：定期檢查群組成員，移除不必要的用戶
4. **備份配置**：記錄 Bot Token 和 Chat ID 以備不時之需

## 🧪 **測試 Bot**

### 測試訊息發送
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage" \
     -H "Content-Type: application/json" \
     -d '{
       "chat_id": "<YOUR_CHAT_ID>",
       "text": "🧪 測試訊息：Deepvape 訂單通知系統已啟用！"
     }'
```

### 驗證配置
1. 在購物車中完成一筆測試訂單
2. 檢查 Telegram 群組是否收到通知
3. 確認訊息格式正確且包含所有必要資訊

## 🚨 **故障排除**

### 常見問題
1. **Bot Token 錯誤**：檢查 Token 格式是否正確
2. **Chat ID 錯誤**：確認 Chat ID 是否為群組的正確 ID
3. **權限不足**：確認 Bot 在群組中有發送訊息權限
4. **網路問題**：檢查伺服器是否能訪問 Telegram API

### 錯誤代碼
- `400 Bad Request`：請求格式錯誤
- `401 Unauthorized`：Bot Token 無效
- `403 Forbidden`：Bot 沒有權限發送訊息
- `404 Not Found`：Chat ID 不存在

## 📞 **技術支援**

如需協助設置 Telegram Bot，請聯絡技術團隊並提供：
1. Bot 用戶名
2. 群組/頻道名稱
3. 錯誤訊息截圖
4. 測試步驟說明 