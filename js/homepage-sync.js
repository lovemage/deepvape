/**
 * 首頁商品卡片同步系統
 * 負責將後台產品數據同步到首頁商品卡片
 */

class HomepageSync {
    constructor() {
        this.productMapping = {
            // 主機系列
            'sp2_device': 'data/page_products/sp2_device.json',
            'ilia_gen1': 'data/page_products/ilia_1.json',
            'ilia_leather': 'data/page_products/ilia_leather.json',
            'ilia_fabric': 'data/page_products/ilia_fabric.json',
            'hta_spade': 'data/page_products/hta_vape.json',
            
            // 煙彈系列
            'ilia_pods': 'data/page_products/ilia_pods.json',
            'sp2_pods': 'data/page_products/sp2_pods.json',
            'hta_pods': 'data/page_products/hta_pods.json',
            'lana_pods': 'data/page_products/lana_pods.json',
            
            // 拋棄式系列
            'ilia_disposable': 'data/page_products/ilia_disposable.json',
            'lana_a8000': 'data/page_products/lana_a8000.json'
        };
        
        this.init();
    }

    async init() {
        try {
            await this.syncAllProducts();
            console.log('首頁商品卡片同步完成');
        } catch (error) {
            console.error('首頁商品卡片同步失敗:', error);
            this.loadFallbackData();
        }
    }

    async syncAllProducts() {
        const promises = Object.entries(this.productMapping).map(([productId, dataPath]) => 
            this.syncProductCard(productId, dataPath)
        );
        
        await Promise.all(promises);
    }

    async syncProductCard(productId, dataPath) {
        try {
            const productData = await this.loadProductData(dataPath);
            if (!productData) return;

            const card = document.querySelector(`[data-product-id="${productId}"]`);
            if (!card) {
                // 如果沒有 data-product-id，嘗試其他方式找到卡片
                this.syncCardByContent(productData);
                return;
            }

            this.updateProductCard(card, productData);
        } catch (error) {
            console.error(`同步產品 ${productId} 失敗:`, error);
        }
    }

    async loadProductData(dataPath) {
        try {
            const response = await fetch(dataPath);
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error(`載入產品數據失敗: ${dataPath}`, error);
            return null;
        }
    }

    updateProductCard(card, productData) {
        // 更新產品名稱
        const nameElement = card.querySelector('.product-name');
        if (nameElement && productData.productName) {
            nameElement.textContent = productData.productName;
        }

        // 更新價格
        const priceElement = card.querySelector('.product-price');
        if (priceElement && productData.price) {
            const formattedPrice = `NT$ ${productData.price}`;
            priceElement.textContent = formattedPrice;
        }

        // 更新庫存狀態
        this.updateStockStatus(card, productData);

        // 更新折扣標籤
        this.updateDiscountBadge(card, productData);
    }

    updateStockStatus(card, productData) {
        const totalStock = this.calculateTotalStock(productData.variants || []);
        const stockIndicator = card.querySelector('.stock-indicator') || this.createStockIndicator(card);
        
        if (totalStock === 0) {
            stockIndicator.className = 'stock-indicator out-of-stock';
            stockIndicator.textContent = '缺貨';
            this.disableCard(card);
        } else if (totalStock <= 10) {
            stockIndicator.className = 'stock-indicator low-stock';
            stockIndicator.textContent = '低庫存';
        } else {
            stockIndicator.className = 'stock-indicator in-stock';
            stockIndicator.textContent = '現貨';
        }
    }

    calculateTotalStock(variants) {
        return variants.reduce((total, variant) => total + (variant.stock || 0), 0);
    }

    createStockIndicator(card) {
        const indicator = document.createElement('div');
        indicator.className = 'stock-indicator';
        
        const productInfo = card.querySelector('.product-info');
        if (productInfo) {
            productInfo.appendChild(indicator);
        }
        
        return indicator;
    }

    updateDiscountBadge(card, productData) {
        if (productData.discount) {
            let badge = card.querySelector('.product-badge.discount');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'product-badge discount';
                card.appendChild(badge);
            }
            badge.innerHTML = `<i class="fas fa-tag"></i> ${productData.discount}`;
        }
    }

    disableCard(card) {
        card.classList.add('out-of-stock');
        const button = card.querySelector('.pulse-button');
        if (button) {
            button.disabled = true;
            button.textContent = '暫時缺貨';
        }
    }

    // 根據產品名稱匹配卡片（備用方案）
    syncCardByContent(productData) {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
            const nameElement = card.querySelector('.product-name');
            if (nameElement && this.isProductMatch(nameElement.textContent, productData.productName)) {
                this.updateProductCard(card, productData);
            }
        });
    }

    isProductMatch(cardName, dataName) {
        // 簡單的名稱匹配邏輯
        const normalize = (str) => str.replace(/\s+/g, '').toLowerCase();
        return normalize(cardName).includes(normalize(dataName)) || 
               normalize(dataName).includes(normalize(cardName));
    }

    // 載入備用數據（從 DOM 獲取）
    loadFallbackData() {
        console.log('使用備用數據載入方式');
        // 保持原有的靜態數據
    }

    // 手動刷新特定產品
    async refreshProduct(productId) {
        const dataPath = this.productMapping[productId];
        if (dataPath) {
            await this.syncProductCard(productId, dataPath);
        }
    }

    // 獲取產品庫存信息
    async getProductStock(productId) {
        const dataPath = this.productMapping[productId];
        if (!dataPath) return null;

        const productData = await this.loadProductData(dataPath);
        if (!productData) return null;

        return {
            productName: productData.productName,
            totalStock: this.calculateTotalStock(productData.variants || []),
            variants: productData.variants || []
        };
    }
}

// CSS 樣式
const styles = `
.stock-indicator {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
    margin-top: 0.5rem;
}

.stock-indicator.in-stock {
    background: rgba(0, 210, 91, 0.2);
    color: #00d25b;
    border: 1px solid rgba(0, 210, 91, 0.3);
}

.stock-indicator.low-stock {
    background: rgba(255, 171, 0, 0.2);
    color: #ffab00;
    border: 1px solid rgba(255, 171, 0, 0.3);
}

.stock-indicator.out-of-stock {
    background: rgba(233, 69, 96, 0.2);
    color: #e94560;
    border: 1px solid rgba(233, 69, 96, 0.3);
}

.product-card.out-of-stock {
    opacity: 0.6;
    pointer-events: none;
}

.product-card.out-of-stock .pulse-button {
    background: #666;
    cursor: not-allowed;
}

.product-badge.discount {
    position: absolute;
    top: 10px;
    right: 10px;
    background: linear-gradient(45deg, #e94560, #ff6b9d);
    color: white;
    padding: 0.3rem 0.6rem;
    border-radius: 15px;
    font-size: 0.7rem;
    font-weight: 600;
    z-index: 2;
}
`;

// 注入樣式
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// 初始化同步系統
let homepageSync;

document.addEventListener('DOMContentLoaded', () => {
    homepageSync = new HomepageSync();
});

// 導出給其他腳本使用
window.HomepageSync = HomepageSync;
window.homepageSync = homepageSync; 