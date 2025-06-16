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
            // 檢查是否是 PageProductManager 動態生成的元素
            const hasVariantId = option.dataset.variantId;
            
            if (hasVariantId) {
                // 如果是動態生成的元素，不要替換，而是增強現有功能
                console.log('🔧 檢測到 PageProductManager 管理的元素，增強現有功能');
                this.enhanceExistingColorOption(option);
                return;
            }
            
            // 對於靜態元素，使用原來的替換邏輯
            const newOption = option.cloneNode(true);
            option.parentNode.replaceChild(newOption, option);

            // 添加新的點擊事件（包含庫存檢查）
            newOption.addEventListener('click', (e) => {
                // 確保從正確的元素獲取顏色信息
                const colorElement = e.target.closest('.color-option') || e.currentTarget;
                const productId = this.getProductIdFromPage();
                
                // 支援兩種數據格式：data-color 或 data-variant-id
                let color = colorElement.dataset.color || colorElement.dataset.variantId;
                let variantId = colorElement.dataset.variantId;
                
                // 如果沒有 data-color，嘗試從 variant-id 或文本內容獲取顏色
                if (!color) {
                    if (variantId) {
                        // 從 variant-id 提取顏色名稱，或使用元素文本
                        color = colorElement.textContent.trim();
                    } else {
                        color = colorElement.textContent.trim();
                    }
                }
                
                console.log(`🎨 點擊顏色選項: ${color}, 產品ID: ${productId}`);
                console.log(`🔍 事件目標:`, e.target);
                console.log(`🔍 顏色元素:`, colorElement);
                console.log(`🔍 所有 data 屬性:`, colorElement.dataset);
                console.log(`🔍 變數ID: ${variantId}, 顏色: ${color}`);
                
                if (!productId || !color) {
                    console.warn('❌ 無法獲取產品ID或顏色信息', { productId, color, variantId, element: colorElement });
                    return;
                }

                // 檢查庫存
                const stockInfo = this.checkVariantStock(productId, color, 'color');
                
                if (stockInfo.stock <= 0) {
                    alert(`很抱歉，${color} 目前缺貨，請選擇其他顏色`);
                    return;
                }

                // 移除其他選中狀態
                document.querySelectorAll('.color-option').forEach(opt => {
                    opt.classList.remove('selected');
                });

                // 選中當前選項
                colorElement.classList.add('selected');

                // 更新庫存顯示
                this.updateStockDisplay(stockInfo);

                console.log(`選擇顏色: ${color}, 庫存: ${stockInfo.stock}`);
            });

            // 添加庫存狀態樣式
                            const color = newOption.dataset.color || newOption.dataset.variantId;
            const productId = this.getProductIdFromPage();
            
            if (productId && color) {
                const stockInfo = this.checkVariantStock(productId, color, 'color');
                this.applyStockStyles(newOption, stockInfo);
            }
        });
    }

    /**
     * 增強現有的顏色選項（不替換元素）
     */
    enhanceExistingColorOption(option) {
        // 添加庫存狀態樣式
        const variantId = option.dataset.variantId;
        const color = option.textContent.trim();
        const productId = this.getProductIdFromPage();
        
        console.log(`🎨 增強顏色選項: ${color} (${variantId})`);
        
        if (productId && color) {
            const stockInfo = this.checkVariantStock(productId, color, 'color');
            this.applyStockStyles(option, stockInfo);
            
            // 添加額外的庫存檢查事件監聽器（不替換現有的）
            option.addEventListener('click', (e) => {
                const selectedColor = e.currentTarget.textContent.trim();
                console.log(`🔍 庫存檢查 - 選擇顏色: ${selectedColor}`);
                
                const stockInfo = this.checkVariantStock(productId, selectedColor, 'color');
                if (stockInfo.stock <= 0) {
                    console.warn(`⚠️ ${selectedColor} 庫存不足: ${stockInfo.stock}`);
                } else {
                    console.log(`✅ ${selectedColor} 庫存充足: ${stockInfo.stock}`);
                }
                
                this.updateStockDisplay(stockInfo);
            });
        }
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
                const flavor = e.target.dataset.flavor || e.target.dataset.variantId;
                const productId = this.getProductIdFromPage();
                
                console.log(`🔍 StockChecker 調試信息:`);
                console.log(`  - 產品ID: ${productId}`);
                console.log(`  - 口味: ${flavor}`);
                console.log(`  - 目標元素:`, e.target);
                console.log(`  - 目標元素數據屬性:`, e.target.dataset);
                
                if (!productId || !flavor) {
                    console.warn('無法獲取產品ID或口味信息', { productId, flavor });
                    return;
                }

                // 檢查庫存
                const stockInfo = this.checkVariantStock(productId, flavor, 'flavor');
                
                if (stockInfo.stock <= 0) {
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
            const flavor = option.dataset.flavor || option.dataset.variantId;
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
            // 保存原始的 onclick 屬性值
            const originalOnClickAttr = button.getAttribute('onclick');
            
            // 移除原始的 onclick 屬性
            button.removeAttribute('onclick');
            
            // 添加新的點擊事件（包含庫存檢查）
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (!this.validateStockBeforeAddToCart()) {
                    return;
                }
                
                // 如果庫存檢查通過，執行原始的加入購物車邏輯
                if (originalOnClickAttr) {
                    // 解析並執行原始的 onclick 代碼
                    try {
                        // 提取產品ID參數
                        const match = originalOnClickAttr.match(/addToCart\(['"]([^'"]+)['"]\)/);
                        if (match && window.addToCart) {
                            const productId = match[1];
                            window.addToCart(productId);
                        } else {
                            // 備用：直接執行原始代碼
                            eval(originalOnClickAttr);
                        }
                    } catch (error) {
                        console.error('執行原始 onclick 失敗:', error);
                        // 最後備用：調用全局 addToCart
                        if (window.addToCart) {
                            window.addToCart();
                        }
                    }
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
                const stock = variant.stock || 0;
                return {
                    stock: stock,
                    available: stock > 0,
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
        // 優先從頁面元素獲取統一的產品ID
        const productElement = document.querySelector('[data-product-id]');
        if (productElement) {
            const productId = productElement.dataset.productId;
            console.log(`✅ 從元素獲取產品ID: ${productId}`);
            return productId;
        }

        // 備用：從 URL 獲取並映射到統一的產品ID
        const url = window.location.pathname;
        console.log(`🔍 檢查頁面 URL: ${url}`);
        
        let productId = null;
        
        // 使用統一的產品ID映射
        if (url.includes('sp2_product')) productId = 'sp2_device_product';
        else if (url.includes('sp2_pods')) productId = 'sp2_pods_product';
        else if (url.includes('hta_vape')) productId = 'hta_vape_product';
        else if (url.includes('hta_pods')) productId = 'hta_pods_product';
        else if (url.includes('ilia_1')) productId = 'ilia_1_product';
        else if (url.includes('ilia_5')) productId = 'ilia_5_device_product';
        else if (url.includes('ilia_fabric')) productId = 'ilia_fabric_product';
        else if (url.includes('ilia_leather')) productId = 'ilia_leather_product';
        else if (url.includes('ilia_disposable')) productId = 'ilia_disposable_product';
        else if (url.includes('ilia_ultra5_pods')) productId = 'ilia_ultra5_pods_product';
        else if (url.includes('ilia_pods')) productId = 'ilia_pods_product';
        else if (url.includes('lana_a8000')) productId = 'lana_a8000_product';
        else if (url.includes('lana_pods')) productId = 'lana_pods_product';

        if (productId) {
            console.log(`✅ 從 URL 識別產品ID: ${productId}`);
            return productId;
        }

        console.warn('❌ 無法確定產品ID');
        return null;
    }

    /**
     * 應用庫存狀態樣式
     */
    applyStockStyles(element, stockInfo) {
        // 移除現有的庫存狀態類別
        element.classList.remove('out-of-stock', 'low-stock', 'in-stock');

        if (stockInfo.stock <= 0) {
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
            if (stockInfo.stock <= 0) {
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
            variantValue = selectedColor.dataset.color || selectedColor.dataset.variantId;
            variantType = 'color';
        } else if (selectedFlavor) {
            variantValue = selectedFlavor.dataset.flavor || selectedFlavor.dataset.variantId;
            variantType = 'flavor';
        }

        if (variantValue) {
            const stockInfo = this.checkVariantStock(productId, variantValue, variantType);
            
            if (stockInfo.stock <= 0) {
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
            variantValue = selectedColor.dataset.color || selectedColor.dataset.variantId;
            variantType = 'color';
        } else if (selectedFlavor) {
            variantValue = selectedFlavor.dataset.flavor || selectedFlavor.dataset.variantId;
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
    // 等待 ProductManager 初始化完成
    const initStockChecker = () => {
        if (window.ProductManager && window.ProductManager.initialized) {
            if (!window.stockChecker) {
                window.stockChecker = new StockChecker();
                console.log('🔍 庫存檢查器已初始化');
            }
        } else {
            // 如果 ProductManager 還沒初始化，等待事件或重試
            if (window.ProductManager) {
                window.addEventListener('productsLoaded', () => {
                    if (!window.stockChecker) {
                        window.stockChecker = new StockChecker();
                        console.log('🔍 庫存檢查器已初始化（通過事件）');
                    }
                });
            } else {
                // 重試
                setTimeout(initStockChecker, 500);
            }
        }
    };
    
    // 延遲初始化，確保其他腳本已載入
    setTimeout(initStockChecker, 1000);
});

// 導出類別
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StockChecker;
} 