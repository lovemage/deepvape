/**
 * 通用庫存檢查器
 * 為所有產品頁面提供統一的庫存驗證功能
 */

class StockChecker {
    constructor() {
        this.productManager = null;
        this.initialized = false;
        this.init();
    }

    async init() {
        try {
            // 等待產品管理器載入
            if (window.ProductManager && window.ProductManager.initialized) {
                this.productManager = window.ProductManager;
                this.initialized = true;
                this.setupStockValidation();
            } else {
                // 監聽產品管理器載入完成事件
                window.addEventListener('productsLoaded', () => {
                    this.productManager = window.ProductManager;
                    this.initialized = true;
                    this.setupStockValidation();
                });
            }
        } catch (error) {
            console.error('庫存檢查器初始化失敗:', error);
        }
    }

    /**
     * 設置庫存驗證
     */
    setupStockValidation() {
        console.log('🔍 設置庫存驗證...');
        
        // 為顏色選項添加庫存檢查
        this.setupColorOptionValidation();
        
        // 為口味選項添加庫存檢查
        this.setupFlavorOptionValidation();
        
        // 為加入購物車按鈕添加庫存檢查
        this.setupAddToCartValidation();
        
        // 為數量控制添加庫存檢查
        this.setupQuantityValidation();
        
        console.log('✅ 庫存驗證設置完成');
    }

    /**
     * 設置顏色選項庫存檢查
     */
    setupColorOptionValidation() {
        const colorOptions = document.querySelectorAll('.color-option');
        if (colorOptions.length === 0) return;

        console.log(`設置 ${colorOptions.length} 個顏色選項的庫存檢查`);

        colorOptions.forEach(option => {
            // 移除原有的點擊事件
            const newOption = option.cloneNode(true);
            option.parentNode.replaceChild(newOption, option);

            // 添加新的點擊事件（包含庫存檢查）
            newOption.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                const productId = this.getProductIdFromPage();
                
                if (!productId || !color) {
                    console.warn('無法獲取產品ID或顏色信息');
                    return;
                }

                // 檢查庫存
                const stockInfo = this.checkVariantStock(productId, color, 'color');
                
                if (stockInfo.stock === 0) {
                    alert(`很抱歉，${color} 目前缺貨，請選擇其他顏色`);
                    return;
                }

                // 移除其他選中狀態
                document.querySelectorAll('.color-option').forEach(opt => {
                    opt.classList.remove('selected');
                });

                // 選中當前選項
                e.target.classList.add('selected');

                // 更新庫存顯示
                this.updateStockDisplay(stockInfo);

                console.log(`選擇顏色: ${color}, 庫存: ${stockInfo.stock}`);
            });

            // 添加庫存狀態樣式
            const color = option.dataset.color;
            const productId = this.getProductIdFromPage();
            
            if (productId && color) {
                const stockInfo = this.checkVariantStock(productId, color, 'color');
                this.applyStockStyles(option, stockInfo);
            }
        });
    }

    /**
     * 設置口味選項庫存檢查
     */
    setupFlavorOptionValidation() {
        const flavorOptions = document.querySelectorAll('.flavor-option');
        if (flavorOptions.length === 0) return;

        console.log(`設置 ${flavorOptions.length} 個口味選項的庫存檢查`);

        flavorOptions.forEach(option => {
            // 移除原有的點擊事件
            const newOption = option.cloneNode(true);
            option.parentNode.replaceChild(newOption, option);

            // 添加新的點擊事件（包含庫存檢查）
            newOption.addEventListener('click', (e) => {
                const flavor = e.target.dataset.flavor;
                const productId = this.getProductIdFromPage();
                
                if (!productId || !flavor) {
                    console.warn('無法獲取產品ID或口味信息');
                    return;
                }

                // 檢查庫存
                const stockInfo = this.checkVariantStock(productId, flavor, 'flavor');
                
                if (stockInfo.stock === 0) {
                    alert(`很抱歉，${flavor} 口味目前缺貨，請選擇其他口味`);
                    return;
                }

                // 移除其他選中狀態
                document.querySelectorAll('.flavor-option').forEach(opt => {
                    opt.classList.remove('selected');
                });

                // 選中當前選項
                e.target.classList.add('selected');

                // 更新庫存顯示
                this.updateStockDisplay(stockInfo);

                console.log(`選擇口味: ${flavor}, 庫存: ${stockInfo.stock}`);
            });

            // 添加庫存狀態樣式
            const flavor = option.dataset.flavor;
            const productId = this.getProductIdFromPage();
            
            if (productId && flavor) {
                const stockInfo = this.checkVariantStock(productId, flavor, 'flavor');
                this.applyStockStyles(option, stockInfo);
            }
        });
    }

    /**
     * 設置加入購物車庫存檢查
     */
    setupAddToCartValidation() {
        const addToCartButtons = document.querySelectorAll('button[onclick*="addToCart"], .add-to-cart-btn, .pulse-button');
        
        addToCartButtons.forEach(button => {
            // 保存原始的點擊處理器
            const originalOnClick = button.onclick;
            
            // 移除原始的 onclick 屬性
            button.removeAttribute('onclick');
            
            // 添加新的點擊事件（包含庫存檢查）
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (!this.validateStockBeforeAddToCart()) {
                    return;
                }
                
                // 如果庫存檢查通過，執行原始的加入購物車邏輯
                if (originalOnClick) {
                    originalOnClick.call(button);
                } else if (window.addToCart) {
                    window.addToCart();
                }
            });
        });
    }

    /**
     * 設置數量控制庫存檢查
     */
    setupQuantityValidation() {
        const quantityInput = document.getElementById('quantity');
        if (!quantityInput) return;

        quantityInput.addEventListener('change', () => {
            this.validateQuantityAgainstStock();
        });

        // 監聽數量增加按鈕
        const increaseButtons = document.querySelectorAll('button[onclick*="increase"], .quantity-btn');
        increaseButtons.forEach(button => {
            if (button.textContent.includes('+') || button.innerHTML.includes('plus')) {
                button.addEventListener('click', () => {
                    setTimeout(() => this.validateQuantityAgainstStock(), 100);
                });
            }
        });
    }

    /**
     * 檢查變數庫存
     */
    checkVariantStock(productId, variantValue, variantType) {
        if (!this.productManager) {
            return { stock: 999, available: true }; // 預設有庫存
        }

        try {
            const variants = this.productManager.getProductVariants(productId);
            const variant = variants.find(v => 
                v.value === variantValue || 
                v.name === variantValue ||
                (variantType === 'color' && v.value.includes(variantValue)) ||
                (variantType === 'flavor' && v.value.includes(variantValue))
            );

            if (variant) {
                return {
                    stock: variant.stock || 0,
                    available: (variant.stock || 0) > 0,
                    variant: variant
                };
            }

            // 如果找不到變數，返回預設值
            return { stock: 999, available: true };
        } catch (error) {
            console.error('檢查庫存失敗:', error);
            return { stock: 999, available: true };
        }
    }

    /**
     * 從頁面獲取產品ID
     */
    getProductIdFromPage() {
        // 嘗試從多個來源獲取產品ID
        const url = window.location.pathname;
        
        if (url.includes('sp2_product')) return 'sp2_host';
        if (url.includes('sp2_pods')) return 'sp2_pods';
        if (url.includes('hta_vape')) return 'hta_spade';
        if (url.includes('hta_pods')) return 'hta_pods';
        if (url.includes('ilia_1')) return 'ilia_1';
        if (url.includes('ilia_fabric')) return 'ilia_fabric';
        if (url.includes('ilia_leather')) return 'ilia_leather';
        if (url.includes('ilia_disposable')) return 'ilia_disposable';
        if (url.includes('lana_pods')) return 'lana_pods';
        if (url.includes('lana_a8000')) return 'lana_a8000';

        // 嘗試從頁面元素獲取
        const productElement = document.querySelector('[data-product-id]');
        if (productElement) {
            return productElement.dataset.productId;
        }

        console.warn('無法確定產品ID');
        return null;
    }

    /**
     * 應用庫存狀態樣式
     */
    applyStockStyles(element, stockInfo) {
        // 移除現有的庫存狀態類別
        element.classList.remove('out-of-stock', 'low-stock', 'in-stock');

        if (stockInfo.stock === 0) {
            element.classList.add('out-of-stock');
            element.style.opacity = '0.5';
            element.style.cursor = 'not-allowed';
        } else if (stockInfo.stock <= 5) {
            element.classList.add('low-stock');
            element.style.opacity = '0.8';
        } else {
            element.classList.add('in-stock');
            element.style.opacity = '1';
            element.style.cursor = 'pointer';
        }
    }

    /**
     * 更新庫存顯示
     */
    updateStockDisplay(stockInfo) {
        let stockElement = document.querySelector('.stock-status, .stock-info');
        
        if (!stockElement) {
            // 創建庫存顯示元素
            stockElement = document.createElement('div');
            stockElement.className = 'stock-status';
            
            // 嘗試插入到價格元素後面
            const priceElement = document.querySelector('.product-price, .price');
            if (priceElement) {
                priceElement.parentNode.insertBefore(stockElement, priceElement.nextSibling);
            }
        }

        if (stockElement) {
            if (stockInfo.stock === 0) {
                stockElement.innerHTML = '<span style="color: #e94560;">⚠️ 缺貨</span>';
            } else if (stockInfo.stock <= 5) {
                stockElement.innerHTML = `<span style="color: #ffab00;">⚠️ 庫存剩餘: ${stockInfo.stock}</span>`;
            } else {
                stockElement.innerHTML = `<span style="color: #00d25b;">✅ 現貨供應</span>`;
            }
        }
    }

    /**
     * 加入購物車前驗證庫存
     */
    validateStockBeforeAddToCart() {
        const productId = this.getProductIdFromPage();
        if (!productId) return true; // 無法確定產品ID時允許繼續

        // 檢查選中的變數
        const selectedColor = document.querySelector('.color-option.selected');
        const selectedFlavor = document.querySelector('.flavor-option.selected');
        
        let variantValue = null;
        let variantType = null;

        if (selectedColor) {
            variantValue = selectedColor.dataset.color;
            variantType = 'color';
        } else if (selectedFlavor) {
            variantValue = selectedFlavor.dataset.flavor;
            variantType = 'flavor';
        }

        if (variantValue) {
            const stockInfo = this.checkVariantStock(productId, variantValue, variantType);
            
            if (stockInfo.stock === 0) {
                alert(`很抱歉，${variantValue} 目前缺貨，無法加入購物車`);
                return false;
            }

            // 檢查數量
            const quantityInput = document.getElementById('quantity');
            if (quantityInput) {
                const quantity = parseInt(quantityInput.value) || 1;
                if (quantity > stockInfo.stock) {
                    alert(`庫存不足！${variantValue} 目前庫存：${stockInfo.stock}，您選擇的數量：${quantity}`);
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * 驗證數量與庫存
     */
    validateQuantityAgainstStock() {
        const quantityInput = document.getElementById('quantity');
        if (!quantityInput) return;

        const productId = this.getProductIdFromPage();
        if (!productId) return;

        // 獲取選中的變數
        const selectedColor = document.querySelector('.color-option.selected');
        const selectedFlavor = document.querySelector('.flavor-option.selected');
        
        let variantValue = null;
        let variantType = null;

        if (selectedColor) {
            variantValue = selectedColor.dataset.color;
            variantType = 'color';
        } else if (selectedFlavor) {
            variantValue = selectedFlavor.dataset.flavor;
            variantType = 'flavor';
        }

        if (variantValue) {
            const stockInfo = this.checkVariantStock(productId, variantValue, variantType);
            const quantity = parseInt(quantityInput.value) || 1;
            const maxQuantity = Math.min(stockInfo.stock, 10);

            if (quantity > maxQuantity) {
                quantityInput.value = maxQuantity;
                alert(`最多只能購買 ${maxQuantity} 個（庫存限制）`);
            }
        }
    }

    /**
     * 重新載入庫存數據
     */
    async reload() {
        if (this.productManager && this.productManager.reload) {
            await this.productManager.reload();
            this.setupStockValidation();
        }
    }
}

// 自動初始化庫存檢查器
document.addEventListener('DOMContentLoaded', () => {
    // 延遲初始化，確保其他腳本已載入
    setTimeout(() => {
        if (!window.stockChecker) {
            window.stockChecker = new StockChecker();
            console.log('🔍 庫存檢查器已初始化');
        }
    }, 1000);
});

// 導出類別
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StockChecker;
} 