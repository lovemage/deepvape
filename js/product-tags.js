/**
 * 產品標籤管理系統
 * 處理產品卡片標籤的顯示和管理
 */

class ProductTagManager {
    constructor() {
        this.availableTags = [
            { id: 'hot', name: '火爆商品', color: '#ff4757', icon: '🔥' },
            { id: 'safe', name: '安心選擇', color: '#2ed573', icon: '✅' },
            { id: 'new', name: '新品上架', color: '#3742fa', icon: '🆕' },
            { id: 'recommend', name: '小編推薦', color: '#ffa502', icon: '👍' },
            { id: 'limited', name: '限時優惠', color: '#ff6348', icon: '⏰' },
            { id: 'combo', name: '超值組合', color: '#7bed9f', icon: '📦' },
            { id: 'trending', name: '熱門排行', color: '#ff5722', icon: '📈' },
            { id: 'soldout', name: '售完為止', color: '#ff9ff3', icon: '⚡' },
            { id: 'exclusive', name: '獨家販售', color: '#70a1ff', icon: '💎' },
            { id: 'value', name: '高CP值', color: '#5f27cd', icon: '💰' }
        ];
        this.productTags = {};
        this.init();
    }

    async init() {
        try {
            await this.loadProductTags();
            console.log('產品標籤管理系統初始化完成');
        } catch (error) {
            console.error('產品標籤管理系統初始化失敗:', error);
        }
    }

    // 載入產品標籤數據
    async loadProductTags() {
        try {
            const response = await fetch('/data/product-tags.json');
            if (response.ok) {
                const data = await response.json();
                this.productTags = data.productTags || {};
            } else {
                console.warn('無法載入產品標籤數據，使用空數據');
                this.productTags = {};
            }
        } catch (error) {
            console.error('載入產品標籤數據失敗:', error);
            this.productTags = {};
        }
    }

    // 獲取所有可用標籤
    getAvailableTags() {
        return this.availableTags;
    }

    // 獲取標籤信息
    getTagInfo(tagId) {
        return this.availableTags.find(tag => tag.id === tagId);
    }

    // 獲取產品標籤
    getProductTags(productId) {
        return this.productTags[productId] || [];
    }

    // 設置產品標籤
    setProductTags(productId, tagIds) {
        this.productTags[productId] = tagIds;
        this.saveProductTags();
    }

    // 添加產品標籤
    addProductTag(productId, tagId) {
        if (!this.productTags[productId]) {
            this.productTags[productId] = [];
        }
        
        if (!this.productTags[productId].includes(tagId)) {
            this.productTags[productId].push(tagId);
            this.saveProductTags();
        }
    }

    // 移除產品標籤
    removeProductTag(productId, tagId) {
        if (this.productTags[productId]) {
            this.productTags[productId] = this.productTags[productId].filter(id => id !== tagId);
            this.saveProductTags();
        }
    }

    // 保存產品標籤數據
    async saveProductTags() {
        try {
            // 這裡應該調用後端API保存數據
            // 暫時保存到localStorage
            localStorage.setItem('productTags', JSON.stringify(this.productTags));
            console.log('產品標籤數據已保存');
        } catch (error) {
            console.error('保存產品標籤數據失敗:', error);
        }
    }

    // 渲染產品標籤
    renderProductTags(productId, container) {
        if (!container) return;

        const tags = this.getProductTags(productId);
        container.innerHTML = '';

        tags.forEach(tagId => {
            const tagInfo = this.getTagInfo(tagId);
            if (tagInfo) {
                const tagElement = this.createTagElement(tagInfo);
                container.appendChild(tagElement);
            }
        });
    }

    // 創建標籤元素
    createTagElement(tagInfo) {
        const tag = document.createElement('span');
        tag.className = 'product-tag';
        tag.style.cssText = `
            display: inline-block;
            background: ${tagInfo.color};
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            margin: 2px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            animation: tagPulse 2s infinite;
        `;
        tag.innerHTML = `${tagInfo.icon} ${tagInfo.name}`;
        return tag;
    }

    // 為所有產品卡片添加標籤
    initializeProductCards() {
        const productCards = document.querySelectorAll('.product-card, .product-item');
        
        productCards.forEach(card => {
            const productId = card.dataset.productId;
            if (productId) {
                let tagContainer = card.querySelector('.product-tags');
                
                if (!tagContainer) {
                    tagContainer = document.createElement('div');
                    tagContainer.className = 'product-tags';
                    tagContainer.style.cssText = `
                        position: absolute;
                        top: 8px;
                        left: 8px;
                        z-index: 10;
                        display: flex;
                        flex-wrap: wrap;
                        max-width: calc(100% - 16px);
                    `;
                    
                    // 插入到卡片的第一個子元素之前
                    card.style.position = 'relative';
                    card.insertBefore(tagContainer, card.firstChild);
                }
                
                this.renderProductTags(productId, tagContainer);
            }
        });
    }

    // 獲取帶有特定標籤的產品
    getProductsByTag(tagId) {
        const products = [];
        for (const [productId, tags] of Object.entries(this.productTags)) {
            if (tags.includes(tagId)) {
                products.push(productId);
            }
        }
        return products;
    }

    // 添加標籤動畫CSS
    addTagStyles() {
        if (document.getElementById('product-tag-styles')) return;

        const style = document.createElement('style');
        style.id = 'product-tag-styles';
        style.textContent = `
            @keyframes tagPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            .product-tag {
                transition: all 0.3s ease;
            }
            
            .product-tag:hover {
                transform: scale(1.1);
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            }
            
            .product-tags {
                pointer-events: none;
            }
            
            .product-tags .product-tag {
                pointer-events: auto;
            }
        `;
        
        document.head.appendChild(style);
    }
}

// 創建全局實例
window.ProductTagManager = new ProductTagManager();

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    if (window.ProductTagManager) {
        window.ProductTagManager.addTagStyles();
        
        // 延遲初始化，確保產品卡片已載入
        setTimeout(() => {
            window.ProductTagManager.initializeProductCards();
        }, 1000);
    }
});

// 導出供其他模塊使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductTagManager;
} 