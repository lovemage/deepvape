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
            console.log(`初始化變數選擇器: ${this.productId}`);
            
            // 等待產品管理器初始化
            if (!window.ProductManager || !window.ProductManager.initialized) {
                console.log('等待 ProductManager 初始化...');
                
                // 設置超時重試機制
                let retryCount = 0;
                const maxRetries = 20; // 最多等待10秒
                
                const checkAndLoad = () => {
                    if (window.ProductManager && window.ProductManager.initialized) {
                        console.log('ProductManager 已初始化，載入變數');
                        this.loadVariants();
                    } else if (retryCount < maxRetries) {
                        retryCount++;
                        console.log(`重試 ${retryCount}/${maxRetries}...`);
                        setTimeout(checkAndLoad, 500);
                    } else {
                        console.error('ProductManager 初始化超時');
                        this.container.innerHTML = '<p class="error">載入失敗，請重新整理頁面</p>';
                    }
                };
                
                // 監聽事件和定時檢查雙重保險
                window.addEventListener('productsLoaded', () => {
                    console.log('收到 productsLoaded 事件');
                    this.loadVariants();
                });
                
                checkAndLoad();
            } else {
                console.log('ProductManager 已就緒，直接載入變數');
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
            this.container.innerHTML = '<p class="error">產品管理器未初始化</p>';
            return;
        }

        if (!window.ProductManager.initialized) {
            console.error('產品管理器未完成初始化');
            this.container.innerHTML = '<p class="error">產品管理器未完成初始化</p>';
            return;
        }

        try {
            this.variants = window.ProductManager.getProductVariants(this.productId);
            
            if (!this.variants || this.variants.length === 0) {
                console.warn(`產品 ${this.productId} 沒有變數數據`);
                this.container.innerHTML = '<p class="warning">此產品暫無可選變數</p>';
                return;
            }

            console.log(`成功載入 ${this.productId} 的 ${this.variants.length} 個變數`);
            this.renderVariants();
            
        } catch (error) {
            console.error(`載入變數失敗: ${error.message}`);
            this.container.innerHTML = '<p class="error">載入變數失敗，請重新整理頁面</p>';
        }
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
        groupContainer.className = `variant-group variant-group-${type} dv-variant-group dv-variant-group--${type}`;
        
        // 添加組標題
        const title = document.createElement('h4');
        title.className = 'variant-group-title dv-variant-group-title';
        title.textContent = this.getTypeLabel(type);
        groupContainer.appendChild(title);

        // 添加變數選項 - 使用新的 BEM 類名 + 向後兼容舊類名
        const optionsContainer = document.createElement('div');
        optionsContainer.className = `variant-options variant-options-${type} dv-variant-options dv-variant-options--${type}`;
        
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
        option.className = `variant-option variant-option-${type} dv-variant-option dv-variant-option--${type}`;
        option.dataset.variantId = variant.id;
        option.dataset.variantType = type;
        option.dataset.stock = variant.stock; // 添加庫存數據

        // 根據類型設置不同的顯示樣式
        if (type === 'color') {
            option.innerHTML = `
                <div class="color-swatch dv-color-swatch" style="background-color: ${this.getColorValue(variant.value)}"></div>
                <span class="variant-name dv-variant-name">${variant.value}</span>
                <span class="variant-stock dv-variant-stock">${this.getStockLabel(variant.stock)}</span>
            `;
        } else {
            option.innerHTML = `
                <span class="variant-name dv-variant-name">${variant.value}</span>
                <span class="variant-stock dv-variant-stock">${this.getStockLabel(variant.stock)}</span>
            `;
        }

        // 添加庫存狀態類別 - 使用新的 BEM 類名 + 向後兼容舊類名
        if (variant.stock === 0) {
            option.classList.add('out-of-stock', 'dv-variant-option--out-of-stock');
        } else if (variant.stock <= 5) {
            option.classList.add('low-stock', 'dv-variant-option--low-stock');
        }

        // 添加點擊事件
        option.addEventListener('click', () => {
            if (variant.stock > 0) {
                this.selectVariant(variant);
            } else {
                // 顯示缺貨提示
                alert(`很抱歉，${variant.value} 目前缺貨，請選擇其他選項`);
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
        // 移除之前的選中狀態 - 同時處理新舊類名
        this.container.querySelectorAll('.variant-option.selected, .dv-variant-option--selected').forEach(option => {
            option.classList.remove('selected', 'dv-variant-option--selected');
        });

        // 添加新的選中狀態 - 使用新的 BEM 類名 + 向後兼容舊類名
        const option = this.container.querySelector(`[data-variant-id="${variant.id}"]`);
        if (option) {
            option.classList.add('selected', 'dv-variant-option--selected');
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