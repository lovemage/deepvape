/**
 * DeepVape 變數選擇器 V2.0
 * 新版數據驅動 + 舊版完美視覺效果
 * 解決所有排版問題，保持所有現代化功能
 */

class VariantSelectorV2 {
    constructor(productId, containerId) {
        this.productId = productId;
        this.container = document.getElementById(containerId);
        this.selectedVariant = null;
        this.variants = [];
        this.onVariantChange = null;
        
        // 確保容器存在
        if (!this.container) {
            console.error(`找不到變數選擇器容器: ${containerId}`);
            return;
        }
        
        this.init();
    }

    async init() {
        try {
            console.log(`🚀 初始化變數選擇器 V2: ${this.productId}`);
            
            // 等待產品管理器初始化
            if (!window.ProductManager || !window.ProductManager.initialized) {
                console.log('⏳ 等待 ProductManager 初始化...');
                
                let retryCount = 0;
                const maxRetries = 20;
                
                const checkAndLoad = () => {
                    if (window.ProductManager && window.ProductManager.initialized) {
                        console.log('✅ ProductManager 已初始化，載入變數');
                        this.loadVariants();
                    } else if (retryCount < maxRetries) {
                        retryCount++;
                        console.log(`🔄 重試 ${retryCount}/${maxRetries}...`);
                        setTimeout(checkAndLoad, 500);
                    } else {
                        console.error('❌ ProductManager 初始化超時');
                        this.showError('載入失敗，請重新整理頁面');
                    }
                };
                
                // 監聽事件和定時檢查雙重保險
                window.addEventListener('productsLoaded', () => {
                    console.log('📡 收到 productsLoaded 事件');
                    this.loadVariants();
                });
                
                checkAndLoad();
            } else {
                console.log('✅ ProductManager 已就緒，直接載入變數');
                this.loadVariants();
            }
        } catch (error) {
            console.error('❌ 變數選擇器初始化失敗:', error);
            this.showError('初始化失敗');
        }
    }

    /**
     * 載入產品變數
     */
    loadVariants() {
        if (!window.ProductManager || !window.ProductManager.initialized) {
            console.error('❌ 產品管理器未初始化');
            this.showError('產品管理器未初始化');
            return;
        }

        try {
            this.variants = window.ProductManager.getProductVariants(this.productId);
            
            if (!this.variants || this.variants.length === 0) {
                console.warn(`⚠️ 產品 ${this.productId} 沒有變數數據`);
                this.showEmpty('此產品暫無可選變數');
                return;
            }

            console.log(`✅ 成功載入 ${this.productId} 的 ${this.variants.length} 個變數`);
            this.renderVariants();
            
        } catch (error) {
            console.error(`❌ 載入變數失敗: ${error.message}`);
            this.showError('載入變數失敗，請重新整理頁面');
        }
    }

    /**
     * 渲染變數選項 - 生成與舊版完全一致的HTML結構
     */
    renderVariants() {
        if (!this.container) {
            console.error('❌ 找不到變數容器');
            return;
        }

        // 清空現有內容
        this.container.innerHTML = '';

        if (this.variants.length === 0) {
            this.showEmpty('暫無可選變數');
            return;
        }

        // 檢測容器類型，決定渲染方式
        const containerClass = this.container.className;
        const isColorGrid = containerClass.includes('color-grid') || containerClass.includes('color');
        const isFlavorGrid = containerClass.includes('flavor-grid') || containerClass.includes('flavor');
        
        // 根據變數類型分組
        const variantsByType = this.groupVariantsByType();
        
        // 如果容器是特定類型的網格，直接渲染選項
        if (isColorGrid || isFlavorGrid) {
            const type = isColorGrid ? 'color' : 'flavor';
            const variants = variantsByType[type] || this.variants;
            this.renderVariantOptions(variants, type);
        } else {
            // 通用容器，渲染所有類型
            Object.entries(variantsByType).forEach(([type, variants]) => {
                this.renderVariantGroup(type, variants);
            });
        }

        // 預選第一個可用變數
        this.selectFirstAvailableVariant();
        
        console.log('🎨 變數選擇器渲染完成');
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
     * 渲染變數組（包含標題）
     */
    renderVariantGroup(type, variants) {
        // 創建組容器
        const groupContainer = document.createElement('div');
        groupContainer.className = `variant-group variant-group-${type}`;
        
        // 添加組標題
        const title = document.createElement('h4');
        title.className = 'variant-group-title';
        title.textContent = this.getTypeLabel(type);
        groupContainer.appendChild(title);

        // 創建選項容器
        const optionsContainer = document.createElement('div');
        optionsContainer.className = `${type}-grid`;
        
        // 渲染選項
        variants.forEach(variant => {
            const option = this.createVariantOption(variant, type);
            optionsContainer.appendChild(option);
        });

        groupContainer.appendChild(optionsContainer);
        this.container.appendChild(groupContainer);
    }

    /**
     * 直接渲染變數選項（不包含標題）
     */
    renderVariantOptions(variants, type) {
        variants.forEach(variant => {
            const option = this.createVariantOption(variant, type);
            this.container.appendChild(option);
        });
    }

    /**
     * 創建變數選項元素 - 生成與舊版完全一致的HTML結構
     */
    createVariantOption(variant, type) {
        const option = document.createElement('div');
        
        // 使用舊版類名，確保樣式完全一致
        option.className = `${type}-option`;
        
        // 設置數據屬性
        option.dataset.variantId = variant.id;
        option.dataset.variantType = type;
        option.dataset.stock = variant.stock;
        option.dataset[type] = variant.value; // 兼容舊版數據屬性

        // 設置內容 - 與舊版完全一致
        option.textContent = variant.value;

        // 添加庫存狀態類別
        if (variant.stock === 0) {
            option.classList.add('out-of-stock');
            option.title = '缺貨';
        } else if (variant.stock <= 5) {
            option.classList.add('low-stock');
            option.title = `庫存剩餘: ${variant.stock}`;
        }

        // 添加點擊事件
        option.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (variant.stock > 0) {
                this.selectVariant(variant, option);
            } else {
                // 顯示缺貨提示
                this.showStockAlert(variant.value);
            }
        });

        return option;
    }

    /**
     * 選擇變數
     */
    selectVariant(variant, optionElement = null) {
        // 移除之前的選中狀態 - 使用舊版類名
        this.container.querySelectorAll('.color-option.selected, .flavor-option.selected, .variant-option.selected').forEach(option => {
            option.classList.remove('selected');
        });

        // 添加新的選中狀態
        if (!optionElement) {
            optionElement = this.container.querySelector(`[data-variant-id="${variant.id}"]`);
        }
        
        if (optionElement) {
            optionElement.classList.add('selected');
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

        console.log('✅ 選擇變數:', variant.value);
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
     * 顯示錯誤狀態
     */
    showError(message) {
        this.container.innerHTML = `
            <div class="variant-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * 顯示空狀態
     */
    showEmpty(message) {
        this.container.innerHTML = `
            <div class="variant-empty">
                <i class="fas fa-info-circle"></i>
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * 顯示庫存警告
     */
    showStockAlert(variantValue) {
        // 創建現代化的提示
        if (window.createToast) {
            window.createToast(`很抱歉，${variantValue} 目前缺貨，請選擇其他選項`, 'warning');
        } else {
            alert(`很抱歉，${variantValue} 目前缺貨，請選擇其他選項`);
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
        const options = this.container.querySelectorAll('.color-option, .flavor-option, .variant-option');
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
        const options = this.container.querySelectorAll('.color-option, .flavor-option, .variant-option');
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

    /**
     * 調試工具
     */
    debug() {
        console.log('🔧 變數選擇器調試信息:', {
            productId: this.productId,
            container: this.container,
            variants: this.variants,
            selectedVariant: this.selectedVariant,
            stats: this.getVariantStats()
        });
    }
}

// 向後兼容 - 保持舊的類名
window.VariantSelector = VariantSelectorV2;

// 全域實例管理
window.variantSelectors = new Map();

/**
 * 創建變數選擇器實例的便捷函數
 */
window.createVariantSelector = function(productId, containerId) {
    const selector = new VariantSelectorV2(productId, containerId);
    window.variantSelectors.set(containerId, selector);
    return selector;
};

/**
 * 獲取變數選擇器實例
 */
window.getVariantSelector = function(containerId) {
    return window.variantSelectors.get(containerId);
};

console.log('🚀 VariantSelector V2.0 載入完成 - 新版功能，舊版視覺'); 