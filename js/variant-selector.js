/**
 * 產品變數選擇器
 * 動態載入後台產品變數數據，支援實時更新
 */

class VariantSelector {
    constructor(productId, containerId) {
        this.productId = productId;
        this.container = document.getElementById(containerId);
        this.selectedVariant = null;
        this.variants = [];
        this.onVariantChange = null;
        
        this.init();
    }

    async init() {
        try {
            // 等待產品管理器初始化
            if (!window.ProductManager || !window.ProductManager.initialized) {
                window.addEventListener('productsLoaded', () => {
                    this.loadVariants();
                });
            } else {
                this.loadVariants();
            }
        } catch (error) {
            console.error('變數選擇器初始化失敗:', error);
        }
    }

    /**
     * 載入產品變數
     */
    loadVariants() {
        if (!window.ProductManager) {
            console.error('產品管理器未初始化');
            return;
        }

        this.variants = window.ProductManager.getProductVariants(this.productId);
        this.renderVariants();
        
        console.log(`載入 ${this.productId} 的 ${this.variants.length} 個變數`);
    }

    /**
     * 渲染變數選項
     */
    renderVariants() {
        if (!this.container) {
            console.error('找不到變數容器');
            return;
        }

        // 清空現有內容
        this.container.innerHTML = '';

        if (this.variants.length === 0) {
            this.container.innerHTML = '<p class="no-variants">暫無可選變數</p>';
            return;
        }

        // 根據變數類型分組
        const variantsByType = this.groupVariantsByType();
        
        // 渲染每個類型的變數
        Object.entries(variantsByType).forEach(([type, variants]) => {
            this.renderVariantGroup(type, variants);
        });

        // 預選第一個可用變數
        this.selectFirstAvailableVariant();
    }

    /**
     * 按類型分組變數
     */
    groupVariantsByType() {
        const groups = {};
        this.variants.forEach(variant => {
            const type = variant.type || 'default';
            if (!groups[type]) {
                groups[type] = [];
            }
            groups[type].push(variant);
        });
        return groups;
    }

    /**
     * 渲染變數組
     */
    renderVariantGroup(type, variants) {
        const groupContainer = document.createElement('div');
        groupContainer.className = `variant-group variant-group-${type}`;
        
        // 添加組標題
        const title = document.createElement('h4');
        title.className = 'variant-group-title';
        title.textContent = this.getTypeLabel(type);
        groupContainer.appendChild(title);

        // 添加變數選項
        const optionsContainer = document.createElement('div');
        optionsContainer.className = `variant-options variant-options-${type}`;
        
        variants.forEach(variant => {
            const option = this.createVariantOption(variant, type);
            optionsContainer.appendChild(option);
        });

        groupContainer.appendChild(optionsContainer);
        this.container.appendChild(groupContainer);
    }

    /**
     * 創建變數選項元素
     */
    createVariantOption(variant, type) {
        const option = document.createElement('div');
        option.className = `variant-option variant-option-${type}`;
        option.dataset.variantId = variant.id;
        option.dataset.variantType = type;

        // 根據類型設置不同的顯示樣式
        if (type === 'color') {
            option.innerHTML = `
                <div class="color-swatch" style="background-color: ${this.getColorValue(variant.value)}"></div>
                <span class="variant-name">${variant.value}</span>
                <span class="variant-stock">${this.getStockLabel(variant.stock)}</span>
            `;
        } else {
            option.innerHTML = `
                <span class="variant-name">${variant.value}</span>
                <span class="variant-stock">${this.getStockLabel(variant.stock)}</span>
            `;
        }

        // 添加庫存狀態類別
        if (variant.stock === 0) {
            option.classList.add('out-of-stock');
        } else if (variant.stock <= 5) {
            option.classList.add('low-stock');
        }

        // 添加點擊事件
        option.addEventListener('click', () => {
            if (variant.stock > 0) {
                this.selectVariant(variant);
            }
        });

        return option;
    }

    /**
     * 獲取類型標籤
     */
    getTypeLabel(type) {
        const labels = {
            'color': '顏色選擇',
            'flavor': '口味選擇',
            'size': '尺寸選擇',
            'default': '選項'
        };
        return labels[type] || '選項';
    }

    /**
     * 獲取顏色值（用於顏色樣本）
     */
    getColorValue(colorName) {
        const colorMap = {
            '黑色': '#000000',
            '白色': '#ffffff',
            '紅色': '#ff0000',
            '藍色': '#0000ff',
            '綠色': '#00ff00',
            '黃色': '#ffff00',
            '紫色': '#800080',
            '橙色': '#ffa500',
            '粉色': '#ffc0cb',
            '灰色': '#808080'
        };
        
        // 嘗試從顏色名稱中提取顏色
        for (const [name, color] of Object.entries(colorMap)) {
            if (colorName.includes(name)) {
                return color;
            }
        }
        
        // 預設顏色
        return '#cccccc';
    }

    /**
     * 獲取庫存標籤
     */
    getStockLabel(stock) {
        if (stock === 0) {
            return '缺貨';
        } else if (stock <= 5) {
            return `僅剩 ${stock}`;
        } else {
            return '現貨';
        }
    }

    /**
     * 選擇變數
     */
    selectVariant(variant) {
        // 移除之前的選中狀態
        this.container.querySelectorAll('.variant-option.selected').forEach(option => {
            option.classList.remove('selected');
        });

        // 添加新的選中狀態
        const option = this.container.querySelector(`[data-variant-id="${variant.id}"]`);
        if (option) {
            option.classList.add('selected');
        }

        this.selectedVariant = variant;

        // 觸發變數變更事件
        if (this.onVariantChange) {
            this.onVariantChange(variant);
        }

        // 觸發自定義事件
        this.container.dispatchEvent(new CustomEvent('variantChanged', {
            detail: { variant, selector: this }
        }));

        console.log('選擇變數:', variant);
    }

    /**
     * 預選第一個可用變數
     */
    selectFirstAvailableVariant() {
        const availableVariant = this.variants.find(variant => variant.stock > 0);
        if (availableVariant) {
            this.selectVariant(availableVariant);
        }
    }

    /**
     * 獲取當前選中的變數
     */
    getSelectedVariant() {
        return this.selectedVariant;
    }

    /**
     * 根據ID選擇變數
     */
    selectVariantById(variantId) {
        const variant = this.variants.find(v => v.id === variantId);
        if (variant) {
            this.selectVariant(variant);
            return true;
        }
        return false;
    }

    /**
     * 重新載入變數數據
     */
    async reload() {
        if (window.ProductManager) {
            await window.ProductManager.reloadProduct(this.productId);
            this.loadVariants();
        }
    }

    /**
     * 設置變數變更回調
     */
    setOnVariantChange(callback) {
        this.onVariantChange = callback;
    }

    /**
     * 獲取變數統計信息
     */
    getVariantStats() {
        const total = this.variants.length;
        const inStock = this.variants.filter(v => v.stock > 0).length;
        const outOfStock = this.variants.filter(v => v.stock === 0).length;
        const lowStock = this.variants.filter(v => v.stock > 0 && v.stock <= 5).length;

        return {
            total,
            inStock,
            outOfStock,
            lowStock,
            totalStock: this.variants.reduce((sum, v) => sum + v.stock, 0)
        };
    }

    /**
     * 過濾變數
     */
    filterVariants(filterFn) {
        const options = this.container.querySelectorAll('.variant-option');
        options.forEach(option => {
            const variantId = option.dataset.variantId;
            const variant = this.variants.find(v => v.id === variantId);
            
            if (variant && filterFn(variant)) {
                option.style.display = '';
            } else {
                option.style.display = 'none';
            }
        });
    }

    /**
     * 重置過濾器
     */
    resetFilter() {
        const options = this.container.querySelectorAll('.variant-option');
        options.forEach(option => {
            option.style.display = '';
        });
    }

    /**
     * 銷毀選擇器
     */
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.selectedVariant = null;
        this.variants = [];
        this.onVariantChange = null;
    }
}

// 全域工廠函數
window.createVariantSelector = function(productId, containerId) {
    return new VariantSelector(productId, containerId);
};

// 導出類別
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VariantSelector;
} 