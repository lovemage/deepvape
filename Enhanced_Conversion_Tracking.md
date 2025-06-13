# DeepVape 增強轉換追蹤實施方案

## 📊 當前轉換追蹤分析

### 現有設置
您目前有一個Line聯繫的轉換追蹤代碼：
```javascript
// 現有的Line聯繫轉換追蹤
function gtag_report_conversion(url) {
  var callback = function () {
    if (typeof(url) != 'undefined') {
      window.location = url;
    }
  };
  gtag('event', 'conversion', {
      'send_to': 'AW-879825412/fZR-COz-itkaEISkxKMD',
      'value': 5.0,
      'currency': 'TWD',
      'event_callback': callback
  });
  return false;
}
```

## 🎯 完整轉換追蹤架構

### 1. Google Ads 轉換事件設置

#### 主要轉換事件
```javascript
// Google Ads 全域網站代碼 (放在所有頁面的 <head> 中)
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-879825412"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-879825412');
</script>

// 購買轉換追蹤 (訂單完成頁面)
function trackPurchaseConversion(orderData) {
  gtag('event', 'conversion', {
    'send_to': 'AW-879825412/PURCHASE_CONVERSION_LABEL', // 需要替換為實際的轉換標籤
    'value': orderData.total,
    'currency': 'TWD',
    'transaction_id': orderData.orderId,
    'custom_parameters': {
      'items': orderData.items.map(item => ({
        'item_id': item.id || item.name,
        'item_name': item.name,
        'category': item.category || 'VAPE',
        'quantity': item.quantity,
        'price': item.price
      }))
    }
  });
}

// 加入購物車轉換追蹤
function trackAddToCartConversion(productData) {
  gtag('event', 'conversion', {
    'send_to': 'AW-879825412/ADD_TO_CART_CONVERSION_LABEL', // 需要替換為實際的轉換標籤
    'value': productData.price * productData.quantity,
    'currency': 'TWD',
    'custom_parameters': {
      'item_name': productData.name,
      'item_category': productData.category || 'VAPE',
      'quantity': productData.quantity
    }
  });
}

// 開始結帳轉換追蹤
function trackBeginCheckoutConversion(cartData) {
  const totalValue = cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  gtag('event', 'conversion', {
    'send_to': 'AW-879825412/BEGIN_CHECKOUT_CONVERSION_LABEL', // 需要替換為實際的轉換標籤
    'value': totalValue,
    'currency': 'TWD',
    'custom_parameters': {
      'num_items': cartData.length,
      'cart_value': totalValue
    }
  });
}

// Line聯繫轉換追蹤 (現有代碼優化版)
function trackLineContactConversion(url) {
  var callback = function () {
    if (typeof(url) != 'undefined') {
      window.location = url;
    }
  };
  gtag('event', 'conversion', {
    'send_to': 'AW-879825412/fZR-COz-itkaEISkxKMD',
    'value': 5.0,
    'currency': 'TWD',
    'event_callback': callback,
    'custom_parameters': {
      'contact_method': 'line',
      'page_location': window.location.href
    }
  });
  return false;
}
```

### 2. Google Analytics 4 (GA4) 電子商務追蹤

#### GA4 設置代碼
```javascript
// GA4 全域代碼 (放在所有頁面的 <head> 中)
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  
  gtag('config', 'G-XXXXXXXXXX', {
    'enhanced_ecommerce': true,
    'send_page_view': true
  });
  
  // 連結 Google Ads 帳戶
  gtag('config', 'AW-879825412');
</script>

// GA4 電子商務事件追蹤
function trackGA4Purchase(orderData) {
  gtag('event', 'purchase', {
    'transaction_id': orderData.orderId,
    'value': orderData.total,
    'currency': 'TWD',
    'shipping': orderData.shipping || 60,
    'tax': 0,
    'items': orderData.items.map(item => ({
      'item_id': item.id || item.name.replace(/\s+/g, '_').toLowerCase(),
      'item_name': item.name,
      'category': item.category || 'VAPE',
      'quantity': item.quantity,
      'price': item.price,
      'item_brand': item.brand || 'DeepVape',
      'item_variant': item.flavor || item.color || ''
    }))
  });
}

function trackGA4AddToCart(productData) {
  gtag('event', 'add_to_cart', {
    'currency': 'TWD',
    'value': productData.price * productData.quantity,
    'items': [{
      'item_id': productData.id || productData.name.replace(/\s+/g, '_').toLowerCase(),
      'item_name': productData.name,
      'category': productData.category || 'VAPE',
      'quantity': productData.quantity,
      'price': productData.price,
      'item_brand': productData.brand || 'DeepVape',
      'item_variant': productData.flavor || productData.color || ''
    }]
  });
}

function trackGA4BeginCheckout(cartData) {
  const totalValue = cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  gtag('event', 'begin_checkout', {
    'currency': 'TWD',
    'value': totalValue,
    'items': cartData.map(item => ({
      'item_id': item.id || item.name.replace(/\s+/g, '_').toLowerCase(),
      'item_name': item.name,
      'category': item.category || 'VAPE',
      'quantity': item.quantity,
      'price': item.price,
      'item_brand': item.brand || 'DeepVape',
      'item_variant': item.flavor || item.color || ''
    }))
  });
}
```

### 3. Facebook Pixel 追蹤

#### Facebook Pixel 設置
```javascript
// Facebook Pixel 基礎代碼 (放在所有頁面的 <head> 中)
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');

fbq('init', 'YOUR_PIXEL_ID'); // 需要替換為實際的 Pixel ID
fbq('track', 'PageView');
</script>

// Facebook 轉換事件追蹤
function trackFacebookPurchase(orderData) {
  fbq('track', 'Purchase', {
    value: orderData.total,
    currency: 'TWD',
    content_ids: orderData.items.map(item => item.id || item.name),
    content_type: 'product',
    num_items: orderData.items.reduce((sum, item) => sum + item.quantity, 0)
  });
}

function trackFacebookAddToCart(productData) {
  fbq('track', 'AddToCart', {
    value: productData.price * productData.quantity,
    currency: 'TWD',
    content_ids: [productData.id || productData.name],
    content_type: 'product'
  });
}

function trackFacebookInitiateCheckout(cartData) {
  const totalValue = cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  fbq('track', 'InitiateCheckout', {
    value: totalValue,
    currency: 'TWD',
    content_ids: cartData.map(item => item.id || item.name),
    content_type: 'product',
    num_items: cartData.reduce((sum, item) => sum + item.quantity, 0)
  });
}
```

## 🛠️ 實際實施代碼

### 1. 購物車頁面 (cart.html) 修改

#### 在 `<head>` 區域添加追蹤代碼
```html
<!-- Google Ads 全域網站代碼 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-879825412"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-879825412');
</script>

<!-- GA4 追蹤代碼 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  gtag('config', 'G-XXXXXXXXXX', {
    'enhanced_ecommerce': true
  });
</script>
```

#### 修改 `confirmCheckout()` 函數
```javascript
async function confirmCheckout() {
    const orderData = {
        items: cart,
        customer: {
            name: document.getElementById('customerName').value,
            phone: document.getElementById('customerPhone').value
        },
        store: selectedStoreInfo,
        subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        shipping: 60,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 60,
        orderDate: new Date().toISOString(),
        orderId: 'ORD' + Date.now()
    };
    
    // 追蹤開始結帳事件
    trackBeginCheckoutConversion(cart);
    trackGA4BeginCheckout(cart);
    
    // Show loading
    const confirmBtn = document.querySelector('#checkoutModal .modal-btn.confirm');
    const originalText = confirmBtn.textContent;
    confirmBtn.innerHTML = '<span class="loading-spinner"></span> 處理中...';
    confirmBtn.disabled = true;

    try {
        // Send Telegram notification
        await sendTelegramNotification(orderData);
        
        // Save order to localStorage
        localStorage.setItem('currentOrder', JSON.stringify(orderData));
        
        // Clear cart
        localStorage.removeItem('cart');
        
        // Redirect to confirmation page
        window.location.href = 'order_confirmation.html';
    } catch (error) {
        console.error('Order processing error:', error);
        alert('訂單處理失敗，請稍後再試！');
        
        // Reset button
        confirmBtn.textContent = originalText;
        confirmBtn.disabled = false;
    }
}

// 添加轉換追蹤函數
function trackBeginCheckoutConversion(cartData) {
    const totalValue = cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    gtag('event', 'conversion', {
        'send_to': 'AW-879825412/BEGIN_CHECKOUT_LABEL', // 需要設置實際的轉換標籤
        'value': totalValue,
        'currency': 'TWD'
    });
}

function trackGA4BeginCheckout(cartData) {
    const totalValue = cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    gtag('event', 'begin_checkout', {
        'currency': 'TWD',
        'value': totalValue,
        'items': cartData.map(item => ({
            'item_id': item.name.replace(/\s+/g, '_').toLowerCase(),
            'item_name': item.name,
            'category': 'VAPE',
            'quantity': item.quantity,
            'price': item.price,
            'item_brand': 'DeepVape'
        }))
    });
}
```

### 2. 訂單確認頁面 (order_confirmation.html) 修改

#### 在頁面載入時追蹤購買轉換
```javascript
<script>
document.addEventListener('DOMContentLoaded', function() {
    // 從 localStorage 獲取訂單資料
    const orderData = JSON.parse(localStorage.getItem('currentOrder'));
    
    if (orderData) {
        // 追蹤購買轉換 - Google Ads
        gtag('event', 'conversion', {
            'send_to': 'AW-879825412/PURCHASE_LABEL', // 需要設置實際的轉換標籤
            'value': orderData.total,
            'currency': 'TWD',
            'transaction_id': orderData.orderId
        });
        
        // 追蹤購買轉換 - GA4
        gtag('event', 'purchase', {
            'transaction_id': orderData.orderId,
            'value': orderData.total,
            'currency': 'TWD',
            'shipping': orderData.shipping,
            'items': orderData.items.map(item => ({
                'item_id': item.name.replace(/\s+/g, '_').toLowerCase(),
                'item_name': item.name,
                'category': 'VAPE',
                'quantity': item.quantity,
                'price': item.price,
                'item_brand': 'DeepVape'
            }))
        });
        
        // 追蹤 Facebook Pixel (如果有設置)
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Purchase', {
                value: orderData.total,
                currency: 'TWD',
                content_ids: orderData.items.map(item => item.name),
                content_type: 'product'
            });
        }
        
        // 顯示訂單資訊
        displayOrderInfo(orderData);
        
        // 清除 localStorage 中的訂單資料 (避免重複追蹤)
        localStorage.removeItem('currentOrder');
    }
});
</script>
```

### 3. 產品頁面加入購物車追蹤

#### 修改加入購物車函數 (適用於所有產品頁面)
```javascript
function addToCart(productData) {
    // 原有的加入購物車邏輯
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // 檢查是否已存在相同產品
    const existingItem = cart.find(item => 
        item.name === productData.name && 
        item.flavor === productData.flavor && 
        item.color === productData.color
    );
    
    if (existingItem) {
        existingItem.quantity += productData.quantity;
    } else {
        cart.push(productData);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // 追蹤加入購物車事件 - Google Ads
    gtag('event', 'conversion', {
        'send_to': 'AW-879825412/ADD_TO_CART_LABEL', // 需要設置實際的轉換標籤
        'value': productData.price * productData.quantity,
        'currency': 'TWD'
    });
    
    // 追蹤加入購物車事件 - GA4
    gtag('event', 'add_to_cart', {
        'currency': 'TWD',
        'value': productData.price * productData.quantity,
        'items': [{
            'item_id': productData.name.replace(/\s+/g, '_').toLowerCase(),
            'item_name': productData.name,
            'category': 'VAPE',
            'quantity': productData.quantity,
            'price': productData.price,
            'item_brand': 'DeepVape'
        }]
    });
    
    // 顯示成功訊息
    showAddToCartSuccess();
}
```

### 4. Line 聯繫按鈕追蹤

#### 修改現有的 Line 聯繫函數
```javascript
function showContact() {
    // 追蹤 Line 聯繫轉換 (使用您現有的轉換標籤)
    gtag('event', 'conversion', {
        'send_to': 'AW-879825412/fZR-COz-itkaEISkxKMD',
        'value': 5.0,
        'currency': 'TWD',
        'event_callback': function() {
            window.open('https://line.me/ti/p/euNh8K-s3e', '_blank');
        }
    });
    
    // 追蹤 GA4 自訂事件
    gtag('event', 'contact_line', {
        'event_category': 'engagement',
        'event_label': 'line_contact',
        'value': 1
    });
}
```

## 📊 轉換追蹤設置檢查清單

### Google Ads 設置
- [ ] **建立轉換動作**
  - [ ] 購買轉換 (Purchase)
  - [ ] 加入購物車轉換 (Add to Cart)
  - [ ] 開始結帳轉換 (Begin Checkout)
  - [ ] Line聯繫轉換 (已存在)

- [ ] **獲取轉換標籤**
  - [ ] 複製每個轉換動作的標籤
  - [ ] 替換代碼中的 `PURCHASE_LABEL`、`ADD_TO_CART_LABEL` 等

- [ ] **設置轉換價值**
  - [ ] 購買轉換：使用實際訂單金額
  - [ ] 加入購物車：使用產品金額
  - [ ] Line聯繫：固定價值 (已設為 5.0)

### Google Analytics 4 設置
- [ ] **建立 GA4 屬性**
  - [ ] 獲取測量 ID (G-XXXXXXXXXX)
  - [ ] 啟用增強型電子商務

- [ ] **設置電子商務事件**
  - [ ] purchase 事件
  - [ ] add_to_cart 事件
  - [ ] begin_checkout 事件

- [ ] **連結 Google Ads**
  - [ ] 在 GA4 中連結 Google Ads 帳戶
  - [ ] 啟用自動標記

### 測試與驗證
- [ ] **使用 Google Tag Assistant**
  - [ ] 驗證 Google Ads 代碼正確載入
  - [ ] 檢查轉換事件是否正確觸發

- [ ] **使用 GA4 DebugView**
  - [ ] 驗證電子商務事件
  - [ ] 檢查事件參數是否正確

- [ ] **實際測試流程**
  - [ ] 測試加入購物車追蹤
  - [ ] 測試結帳流程追蹤
  - [ ] 測試訂單完成追蹤
  - [ ] 測試 Line 聯繫追蹤

## 🎯 預期成效

### 轉換追蹤改善
- **更精確的 ROAS 計算**: 追蹤完整的購買漏斗
- **更好的出價優化**: Google Ads 可以更好地優化出價
- **詳細的客戶行為分析**: 了解客戶從瀏覽到購買的完整路徑

### 數據洞察提升
- **漏斗分析**: 了解每個步驟的轉換率
- **產品效能**: 分析哪些產品最受歡迎
- **客戶價值**: 計算平均訂單價值和客戶終身價值

### 廣告優化機會
- **智能出價**: 使用目標 ROAS 和目標 CPA
- **受眾優化**: 建立基於轉換行為的受眾
- **再行銷**: 針對不同階段的客戶進行再行銷

---

**重要提醒**: 
1. 請確保所有轉換標籤都正確設置
2. 定期檢查轉換追蹤是否正常運作
3. 遵守相關隱私法規，適當告知用戶數據收集
4. 建議先在測試環境驗證所有追蹤代碼 