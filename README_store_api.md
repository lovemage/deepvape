# 🏪 門市選擇系統 - Google Maps API整合

完整的門市選擇解決方案，讓客戶可以透過「選擇縣市 → 選擇區域 → 選擇門市」的流程來選擇取貨地點，並串接購物車後台。

## 🎯 系統功能

### 前端功能
- ✅ **三級選擇**：縣市 → 區域 → 門市
- ✅ **即時地圖**：Google Maps顯示門市位置
- ✅ **響應式設計**：支援手機、平板、桌面
- ✅ **門市資訊**：顯示地址、電話、營業時間
- ✅ **視覺化選擇**：地圖標記和資訊卡片

### 後端功能
- ✅ **Google Maps API整合**：即時搜尋門市
- ✅ **購物車管理**：儲存選擇的門市
- ✅ **門市驗證**：確保門市資訊正確性
- ✅ **配送費計算**：根據取貨方式計算費用
- ✅ **訂單處理**：完整的結帳流程

## 🚀 快速開始

### 1. 安裝依賴
```bash
# 安裝後端依賴
npm install express cors @googlemaps/google-maps-services-js

# 或使用提供的package.json
cp package_backend.json package.json
npm install
```

### 2. 啟動後端服務
```bash
node cart_api.js
```

### 3. 開啟門市選擇頁面
瀏覽器開啟：`http://localhost:3000/store_selector.html`

## 📡 API端點說明

### 購物車相關
```javascript
// 獲取購物車資訊
GET /api/cart/:cartId

// 設定取貨門市
POST /api/cart/store
{
  "cartId": "cart_123",
  "selectedStore": {
    "storeId": "ChIJ...",
    "storeName": "7-ELEVEN 信義門市",
    "storeAddress": "台北市信義區信義路五段7號",
    "storePhone": "02-2723-4567"
  }
}

// 計算配送費用
POST /api/cart/shipping
{
  "cartId": "cart_123",
  "deliveryMethod": "store_pickup" // store_pickup, home_delivery, express_delivery
}
```

### 門市搜尋相關
```javascript
// 搜尋門市
GET /api/stores/search?city=台北市&district=信義區&keyword=7-ELEVEN

// 獲取門市詳情
GET /api/stores/:storeId
```

### 結帳相關
```javascript
// 結帳
POST /api/checkout
{
  "cartId": "cart_123",
  "customerInfo": {
    "name": "王小明",
    "phone": "0912345678",
    "email": "test@example.com"
  },
  "paymentMethod": "credit_card"
}
```

## 🗺️ Google Maps API設定

### 需要啟用的API服務
1. **Places API** - 搜尋門市
2. **Places API (New)** - 新版門市搜尋
3. **Geocoding API** - 地址轉座標
4. **Maps JavaScript API** - 前端地圖顯示

### API金鑰設定
```javascript
// 在cart_api.js中設定
const GOOGLE_MAPS_API_KEY = 'YOUR_API_KEY_HERE';

// 在store_selector.html中設定
this.apiKey = 'YOUR_API_KEY_HERE';
```

## 💡 使用流程

### 客戶端流程
1. **選擇縣市**：從下拉選單選擇縣市
2. **選擇區域**：根據縣市載入對應區域
3. **選擇門市**：顯示該區域的7-ELEVEN門市列表
4. **查看地圖**：在地圖上顯示門市位置
5. **確認選擇**：點擊確認按鈕儲存到購物車

### 後端處理流程
1. **接收請求**：客戶選擇門市後發送API請求
2. **驗證門市**：使用Google Places API驗證門市資訊
3. **更新購物車**：將門市資訊儲存到購物車
4. **計算費用**：根據取貨方式計算配送費
5. **返回結果**：回傳更新後的購物車資訊

## 🔧 自訂設定

### 修改支援的縣市區域
```javascript
// 在store_selector.html中修改taiwanData
taiwanData = {
  '台北市': ['中正區', '大同區', '中山區', ...],
  '新北市': ['板橋區', '三重區', '中和區', ...],
  // 添加更多縣市...
}
```

### 修改門市搜尋關鍵字
```javascript
// 在cart_api.js中修改searchStores方法
async searchStores(city, district, keyword = '7-ELEVEN') {
  // 可以改為其他便利商店：'全家', 'OK超商', '萊爾富'
}
```

### 自訂配送費用規則
```javascript
// 在cart_api.js中修改calculateShipping方法
calculateShipping(cart, deliveryMethod) {
  switch (deliveryMethod) {
    case 'store_pickup':
      return 0; // 門市取貨免運費
    case 'home_delivery':
      return cart.subtotal >= 1000 ? 0 : 60; // 滿1000免運
    case 'express_delivery':
      return 120; // 快速配送
    default:
      return 60;
  }
}
```

## 📱 前端整合範例

### 在現有購物車頁面中整合
```html
<!-- 在結帳頁面添加門市選擇按鈕 -->
<button onclick="openStoreSelector()">選擇取貨門市</button>

<script>
function openStoreSelector() {
  // 開啟門市選擇頁面
  window.open('/store_selector.html', '_blank', 'width=1200,height=800');
}

// 監聽門市選擇結果
window.addEventListener('message', function(event) {
  if (event.data.type === 'storeSelected') {
    const selectedStore = event.data.store;
    updateCartWithStore(selectedStore);
  }
});

async function updateCartWithStore(store) {
  const response = await fetch('/api/cart/store', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cartId: getCurrentCartId(),
      selectedStore: store
    })
  });
  
  const result = await response.json();
  if (result.success) {
    alert('取貨門市設定成功！');
    location.reload(); // 重新載入頁面顯示更新
  }
}
</script>
```

## 🔒 安全性考量

### API金鑰保護
- 設定API金鑰的使用限制（IP白名單、網域限制）
- 定期輪換API金鑰
- 監控API使用量避免超額

### 資料驗證
- 驗證客戶端傳送的門市資訊
- 防止SQL注入和XSS攻擊
- 限制API請求頻率

## 📊 效能優化

### 快取策略
- 門市搜尋結果快取1小時
- 使用Redis或Memcached提升效能
- 實作CDN加速靜態資源

### API使用量控制
```javascript
// 設定每日API使用上限
const DAILY_API_LIMIT = 10000;
let dailyApiUsage = 0;

// 在API呼叫前檢查
if (dailyApiUsage >= DAILY_API_LIMIT) {
  return res.status(429).json({ error: 'API使用量已達上限' });
}
```

## 🐛 故障排除

### 常見問題
1. **地圖無法載入**：檢查API金鑰是否正確
2. **門市搜尋無結果**：確認Google Places API已啟用
3. **CORS錯誤**：確保後端已設定正確的CORS政策
4. **API額度不足**：檢查Google Cloud Console的使用量

### 除錯模式
```javascript
// 在cart_api.js中啟用詳細日誌
const DEBUG = true;

if (DEBUG) {
  console.log('API請求:', req.body);
  console.log('Google Maps回應:', response.data);
}
```

## 📈 擴展功能

### 可以添加的功能
- 門市庫存查詢
- 預估取貨時間
- 門市評分和評論
- 多語言支援
- 門市照片展示
- 路線規劃功能

### 資料庫整合
```javascript
// 使用MongoDB儲存門市資料
const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  storeId: String,
  storeName: String,
  storeAddress: String,
  location: {
    lat: Number,
    lng: Number
  },
  lastUpdated: Date
});

const Store = mongoose.model('Store', storeSchema);
```

## 📞 技術支援

如有任何問題或需要協助，請聯繫開發團隊：
- Email: dev@deepvape.com
- GitHub Issues: [專案連結]
- 技術文件: [文件連結]

---

**版本**: 1.0.0  
**最後更新**: 2024-12-24  
**授權**: MIT License 