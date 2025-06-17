/**
 * 價格同步管理器
 * 確保全域價格和個別產品頁面價格保持同步
 */

class PriceSyncManager {
    constructor() {
        this.globalPrices = {};
        this.pageProductPrices = {};
        this.syncInProgress = false;
        this.init();
    }

    async init() {
        console.log('🔄 價格同步管理器初始化中...');
        await this.loadAllPrices();
        this.setupAutoSync();
        console.log('✅ 價格同步管理器已初始化');
    }

    // 載入所有價格數據
    async loadAllPrices() {
        try {
            await Promise.all([
                this.loadGlobalPrices(),
                this.loadPageProductPrices()
            ]);
        } catch (error) {
            console.error('載入價格數據失敗:', error);
        }
    }

    // 載入全域價格
    async loadGlobalPrices() {
        try {
            const response = await fetch('/data/prices.json?t=' + Date.now());
            const data = await response.json();
            this.globalPrices = {};
            data.products.forEach(product => {
                this.globalPrices[product.id] = product;
            });
            console.log('✅ 全域價格已載入');
        } catch (error) {
            console.error('載入全域價格失敗:', error);
        }
    }

    // 載入個別產品頁面價格
    async loadPageProductPrices() {
        try {
            const productFiles = [
                'hta_pods', 'hta_vape', 'ilia_1', 'ilia_disposable', 'ilia_fabric',
                'ilia_pods', 'ilia_leather', 'ilia_5_device', 'ilia_ultra5_pods',
                'sp2_device', 'sp2_pods', 'lana_a8000', 'lana_pods'
            ];

            this.pageProductPrices = {};
            const promises = productFiles.map(async (file) => {
                try {
                    const response = await fetch(`/data/page_products/${file}.json?t=` + Date.now());
                    if (response.ok) {
                        const data = await response.json();
                        this.pageProductPrices[data.pageId] = {
                            file: file,
                            data: data
                        };
                    }
                } catch (error) {
                    console.warn(`載入產品頁面價格失敗: ${file}`, error);
                }
            });

            await Promise.all(promises);
            console.log('✅ 產品頁面價格已載入');
        } catch (error) {
            console.error('載入產品頁面價格失敗:', error);
        }
    }

    // 檢查價格是否需要同步
    checkPriceSync() {
        const syncNeeded = [];
        
        Object.keys(this.globalPrices).forEach(productId => {
            const globalPrice = this.globalPrices[productId];
            const pageProduct = this.pageProductPrices[productId];
            
            if (pageProduct) {
                const pageData = pageProduct.data;
                
                if (pageData.price !== globalPrice.price ||
                    pageData.originalPrice !== globalPrice.originalPrice ||
                    pageData.discount !== globalPrice.discount) {
                    
                    syncNeeded.push({
                        productId,
                        file: pageProduct.file,
                        currentPrice: {
                            price: pageData.price,
                            originalPrice: pageData.originalPrice,
                            discount: pageData.discount
                        },
                        newPrice: {
                            price: globalPrice.price,
                            originalPrice: globalPrice.originalPrice,
                            discount: globalPrice.discount
                        }
                    });
                }
            }
        });

        return syncNeeded;
    }

    // 執行價格同步
    async syncPrices() {
        if (this.syncInProgress) {
            console.log('⏳ 價格同步正在進行中，跳過此次同步');
            return;
        }

        this.syncInProgress = true;
        console.log('🔄 開始執行價格同步...');

        try {
            const syncNeeded = this.checkPriceSync();
            
            if (syncNeeded.length === 0) {
                console.log('✅ 所有價格已同步，無需更新');
                return;
            }

            console.log(`📝 發現 ${syncNeeded.length} 個產品需要價格同步:`, syncNeeded);

            // 在實際環境中，這裡需要調用後端API來更新文件
            // 由於這是靜態網站，我們只能在前端顯示同步狀態
            this.displaySyncStatus(syncNeeded);

            // 更新本地緩存
            syncNeeded.forEach(item => {
                if (this.pageProductPrices[item.productId]) {
                    this.pageProductPrices[item.productId].data.price = item.newPrice.price;
                    this.pageProductPrices[item.productId].data.originalPrice = item.newPrice.originalPrice;
                    this.pageProductPrices[item.productId].data.discount = item.newPrice.discount;
                }
            });

            // 通知其他組件價格已更新
            this.notifyPriceUpdate();

        } catch (error) {
            console.error('價格同步失敗:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    // 顯示同步狀態
    displaySyncStatus(syncNeeded) {
        console.group('📊 價格同步詳情');
        syncNeeded.forEach(item => {
            console.log(`🔄 ${item.productId}:`);
            console.log(`   舊價格: NT$ ${item.currentPrice.price}`);
            console.log(`   新價格: NT$ ${item.newPrice.price}`);
            if (item.newPrice.originalPrice) {
                console.log(`   原價: NT$ ${item.newPrice.originalPrice}`);
            }
            if (item.newPrice.discount) {
                console.log(`   折扣: ${item.newPrice.discount}`);
            }
        });
        console.groupEnd();
    }

    // 通知其他組件價格已更新
    notifyPriceUpdate() {
        // 觸發自定義事件
        const event = new CustomEvent('pricesUpdated', {
            detail: {
                globalPrices: this.globalPrices,
                pageProductPrices: this.pageProductPrices
            }
        });
        window.dispatchEvent(event);

        // 如果存在 contentManager，通知它重新載入價格
        if (window.contentManager && typeof window.contentManager.reloadPrices === 'function') {
            window.contentManager.reloadPrices();
        }
    }

    // 設置自動同步
    setupAutoSync() {
        // 每30秒檢查一次價格同步
        setInterval(() => {
            this.loadAllPrices().then(() => {
                this.syncPrices();
            });
        }, 30000);

        // 監聽頁面可見性變化，當頁面重新可見時檢查價格
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                setTimeout(() => {
                    this.loadAllPrices().then(() => {
                        this.syncPrices();
                    });
                }, 1000);
            }
        });
    }

    // 手動觸發同步
    async manualSync() {
        console.log('🔄 手動觸發價格同步...');
        await this.loadAllPrices();
        await this.syncPrices();
    }

    // 獲取同步狀態
    getSyncStatus() {
        const syncNeeded = this.checkPriceSync();
        return {
            inSync: syncNeeded.length === 0,
            syncNeeded: syncNeeded,
            lastCheck: new Date().toISOString()
        };
    }
}

// 創建全域實例
window.priceSyncManager = new PriceSyncManager();

// 提供全域函數
window.manualPriceSync = () => {
    if (window.priceSyncManager) {
        return window.priceSyncManager.manualSync();
    }
};

window.getPriceSyncStatus = () => {
    if (window.priceSyncManager) {
        return window.priceSyncManager.getSyncStatus();
    }
    return null;
};

// 監聽價格更新事件
window.addEventListener('pricesUpdated', (event) => {
    console.log('📢 收到價格更新通知:', event.detail);
});

console.log('✅ 價格同步腳本已載入'); 