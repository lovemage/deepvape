/**
 * 7-11 門市選擇功能模組
 * 處理門市地圖選擇、資料回傳和顯示
 */

class StoreSelector {
    constructor() {
        this.selectedStore = null;
        this.eshopId = '870'; // 您的廠商代碼
        this.serviceType = '1'; // 服務類型：1=取貨付款
        this.init();
    }

    init() {
        // 監聽來自回調頁面的訊息
        window.addEventListener('message', this.handleMessage.bind(this));
    }

    /**
     * 開啟 7-11 電子地圖選擇門市
     */
    openStoreMap() {
        // 判斷是否為本地開發環境
        const isLocalhost = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';
        
        // 建構回調 URL
        let callbackUrl;
        if (isLocalhost) {
            // 開發環境提示
            alert('⚠️ 注意：您目前在本地開發環境。\n\n' +
                  '7-11門市選擇API需要有效的線上callback URL才能正常運作。\n\n' +
                  '建議將網站部署到線上環境進行測試。');
            
            // 使用線上環境的回調 URL
            callbackUrl = 'https://deepvape.org/cvs_callback.html';
        } else {
            // 生產環境使用當前網域
            callbackUrl = `${window.location.protocol}//${window.location.host}/cvs_callback.html`;
        }

        // 構建電子地圖 URL
        const mapUrl = 'https://emap.presco.com.tw/c2cemap.ashx' + 
                      '?eshopid=' + this.eshopId +
                      '&servicetype=' + this.serviceType +
                      '&url=' + encodeURIComponent(callbackUrl);

        console.log('開啟7-11電子地圖:', mapUrl);
        console.log('回調URL:', callbackUrl);

        // 開啟新視窗
        const mapWindow = window.open(
            mapUrl, 
            'SevenElevenStoreMap', 
            'width=1000,height=700,scrollbars=yes,resizable=yes'
        );

        if (!mapWindow) {
            alert('無法開啟門市查詢視窗，請檢查瀏覽器的彈出視窗設定。');
            return;
        }

        // 顯示使用指引
        this.showInstructions();
    }

    /**
     * 顯示使用說明
     */
    showInstructions() {
        const instructions = `📍 7-ELEVEN 門市查詢說明：

1. 在地圖上選擇您要取貨的門市
2. 點擊「確認」按鈕
3. 系統將自動回傳門市資訊

⚠️ 注意事項：
- 請確保允許彈出視窗
- 選擇門市後系統會自動填入資訊`;

        alert(instructions);
    }

    /**
     * 處理來自回調頁面的訊息
     */
    handleMessage(event) {
        console.log('收到訊息:', event);

        // 驗證訊息來源
        if (!this.isValidOrigin(event.origin)) {
            console.warn('忽略來自不明來源的訊息:', event.origin);
            return;
        }

        // 檢查訊息類型
        if (event.data && event.data.type === 'storeSelected' && event.data.storeInfo) {
            console.log('收到門市選擇資訊:', event.data.storeInfo);
            
            this.selectedStore = event.data.storeInfo;
            this.updateStoreDisplay(event.data.storeInfo);
            this.onStoreSelected(event.data.storeInfo);
        }
    }

    /**
     * 驗證訊息來源是否合法
     */
    isValidOrigin(origin) {
        const allowedOrigins = [
            window.location.origin,
            'https://deepvape.org',
            'https://deepvape.netlify.app',
            'http://localhost:3000',
            'http://127.0.0.1:3000'
        ];
        
        return allowedOrigins.includes(origin);
    }

    /**
     * 更新門市顯示資訊
     */
    updateStoreDisplay(storeInfo) {
        // 取得顯示元素
        const displayElements = {
            selectedStore: document.getElementById('selectedStore'),
            storeName: document.getElementById('storeName'),
            storeAddress: document.getElementById('storeAddress'),
            storeId: document.getElementById('storeId'),
            storePhone: document.getElementById('storePhone')
        };

        // 更新顯示內容
        if (displayElements.storeName) {
            displayElements.storeName.textContent = `7-ELEVEN ${storeInfo.storeName}`;
        }
        
        if (displayElements.storeAddress) {
            displayElements.storeAddress.textContent = storeInfo.storeAddress || '地址未提供';
        }
        
        if (displayElements.storeId) {
            displayElements.storeId.textContent = `門市代號：${storeInfo.storeId}`;
        }
        
        if (displayElements.storePhone) {
            displayElements.storePhone.textContent = `電話：${storeInfo.storePhone || '未提供'}`;
        }

        // 顯示選擇的門市區塊
        if (displayElements.selectedStore) {
            displayElements.selectedStore.style.display = 'block';
            displayElements.selectedStore.classList.add('show');
        }
    }

    /**
     * 門市選擇完成的回調函數
     * 可以被覆寫以執行自訂邏輯
     */
    onStoreSelected(storeInfo) {
        console.log('門市選擇完成:', storeInfo);
        
        // 顯示成功訊息
        const message = `✅ 已選擇門市：
        
門市代號：${storeInfo.storeId}
門市名稱：${storeInfo.storeName}
門市地址：${storeInfo.storeAddress || '未提供'}
門市電話：${storeInfo.storePhone || '未提供'}`;

        alert(message);
    }

    /**
     * 取得選擇的門市資訊
     */
    getSelectedStore() {
        return this.selectedStore;
    }

    /**
     * 清除選擇的門市
     */
    clearSelectedStore() {
        this.selectedStore = null;
        
        // 隱藏顯示區塊
        const selectedStoreElement = document.getElementById('selectedStore');
        if (selectedStoreElement) {
            selectedStoreElement.style.display = 'none';
            selectedStoreElement.classList.remove('show');
        }
    }

    /**
     * 手動設定門市資訊
     */
    setStore(storeInfo) {
        this.selectedStore = storeInfo;
        this.updateStoreDisplay(storeInfo);
    }
}

// 匯出模組
window.StoreSelector = StoreSelector; 
