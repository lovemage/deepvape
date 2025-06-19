/**
 * 產品頁面管理器
 * 從 Netlify CMS 後台數據載入產品信息並更新頁面
 */

class PageProductManager {
    constructor() {
        this.pageData = null;
        this.initialized = false;
    }

    /**
     * 初始化產品頁面管理器
     */
    async init(pageId) {
        try {
            await this.loadPageData(pageId);
            this.updatePageContent();
            this.setupVariantSelection();
            this.setupQuantityControls();
            this.setupAddToCart();
            this.initialized = true;
            console.log(`產品頁面管理器已初始化: ${pageId}`);
        } catch (error) {
            console.error('產品頁面管理器初始化失敗:', error);
        }
    }

    /**
     * 載入頁面產品數據
     */
    async loadPageData(pageId) {
        try {
            // 根據頁面ID載入對應的數據文件
            const dataFile = this.getDataFileByPageId(pageId);
            console.log(`嘗試載入數據文件: ${dataFile} (產品ID: ${pageId})`);
            
            const response = await fetch(dataFile);
            
            if (!response.ok) {
                throw new Error(`載入數據失敗: ${response.status} - ${dataFile}`);
            }
            
            this.pageData = await response.json();
            console.log('✅ 頁面數據已載入:', this.pageData);
        } catch (error) {
            console.warn('⚠️ 載入頁面數據失敗，使用備用數據:', error.message);
            // 使用預設數據或從 DOM 獲取現有數據
            this.loadFallbackData(pageId);
        }
    }

    /**
     * 根據頁面ID獲取數據文件路徑
     */
    getDataFileByPageId(pageId) {
        const dataFileMap = {
            'hta_pods_product': '/data/page_products/hta_pods.json',
            'hta_vape_product': '/data/page_products/hta_vape.json',
            'ilia_1_product': '/data/page_products/ilia_1.json',
            'ilia_disposable_product': '/data/page_products/ilia_disposable.json',
            'ilia_fabric_product': '/data/page_products/ilia_fabric.json',
            'ilia_pods_product': '/data/page_products/ilia_pods.json',
            'ilia_leather_product': '/data/page_products/ilia_leather.json',
            'ilia_5_device_product': '/data/page_products/ilia_5_device.json',
            'ilia_ultra5_pods_product': '/data/page_products/ilia_ultra5_pods.json',
            'sp2_device_product': '/data/page_products/sp2_device.json',
            'sp2_pods_product': '/data/page_products/sp2_pods.json',
            'lana_a8000_product': '/data/page_products/lana_a8000.json',
            'lana_pods_product': '/data/page_products/lana_pods.json'
        };

        return dataFileMap[pageId] || '/data/page_products/default.json';
    }

    /**
     * 載入備用數據（從 DOM 獲取）
     */
    loadFallbackData(pageId) {
        const productInfo = document.querySelector('.product-info');
        if (!productInfo) return;

        // 從 DOM 獲取現有數據
        const titleElement = document.querySelector('.product-title');
        const priceElement = document.querySelector('.product-price');
        
        this.pageData = {
            pageId: pageId,
            productName: titleElement ? titleElement.textContent.trim() : '產品名稱',
            price: this.extractPriceFromText(priceElement ? priceElement.textContent : '0'),
            variants: this.extractVariantsFromDOM(),
            status: 'active',
            lastUpdated: new Date().toISOString()
        };

        console.log('✅ 使用備用數據:', this.pageData);
    }

    /**
     * 從文字中提取價格
     */
    extractPriceFromText(text) {
        const match = text.match(/NT\$?\s*(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    /**
     * 從 DOM 提取變數信息
     */
    extractVariantsFromDOM() {
        const variants = [];
        
        // 首先嘗試從 VariantSelector 容器提取
        const variantContainer = document.getElementById('variantContainer');
        if (variantContainer) {
            const variantElements = variantContainer.querySelectorAll('.variant-option, .flavor-option, .color-option');
            
            variantElements.forEach((element, index) => {
                const value = element.textContent.trim();
                const type = element.classList.contains('flavor-option') || element.dataset.type === 'flavor' ? 'flavor' : 'color';
                
                variants.push({
                    id: `variant_${index}`,
                    name: type === 'flavor' ? '口味' : '顏色',
                    type: type,
                    value: value,
                    stock: 50, // 預設庫存
                    priceModifier: 0,
                    sku: `SKU-${index}`
                });
            });
        }
        
        // 如果沒有找到，嘗試傳統的選擇器
        if (variants.length === 0) {
            const variantElements = document.querySelectorAll('.flavor-option, .color-option');
            
            variantElements.forEach((element, index) => {
                const value = element.textContent.trim();
                const type = element.classList.contains('flavor-option') ? 'flavor' : 'color';
                
                variants.push({
                    id: `variant_${index}`,
                    name: type === 'flavor' ? '口味' : '顏色',
                    type: type,
                    value: value,
                    stock: 50, // 預設庫存
                    priceModifier: 0,
                    sku: `SKU-${index}`
                });
            });
        }

        return variants;
    }

    /**
     * 更新頁面內容
     */
    updatePageContent() {
        if (!this.pageData) return;

        // 更新產品名稱
        const titleElement = document.querySelector('.product-title');
        if (titleElement) {
            titleElement.textContent = this.pageData.productName;
        }

        // 更新價格
        const priceElement = document.querySelector('.product-price');
        if (priceElement) {
            let priceText = `NT$ ${this.pageData.price}`;
            if (this.pageData.originalPrice && this.pageData.originalPrice > this.pageData.price) {
                priceText += ` <span style="text-decoration: line-through; color: #888; font-size: 0.8em;">NT$ ${this.pageData.originalPrice}</span>`;
            }
            if (this.pageData.discount) {
                priceText += ` <span style="color: #e94560; font-size: 0.8em;">${this.pageData.discount}</span>`;
            }
            priceElement.innerHTML = priceText;
        }

        // 更新變數選項
        this.updateVariantOptions();

        // 更新庫存狀態
        this.updateStockStatus();
    }

    /**
     * 更新變數選項
     */
    updateVariantOptions() {
        if (!this.pageData.variants || this.pageData.variants.length === 0) return;

        // 找到變數容器 - 優先使用 VariantSelector 容器
        let variantContainer = document.getElementById('variantContainer') || document.querySelector('.flavor-grid');
        if (!variantContainer) {
            variantContainer = document.querySelector('.flavor-grid, .color-grid');
        }
        if (!variantContainer) return;

        // 清空現有選項
        variantContainer.innerHTML = '';

        // 添加新的變數選項
        this.pageData.variants.forEach((variant, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = `${variant.type}-option variant-option`;
            optionElement.dataset.variantId = variant.id;
            optionElement.dataset.stock = variant.stock;
            optionElement.dataset.type = variant.type;
            optionElement.textContent = variant.value;

            // 添加庫存狀態
            if (variant.stock === 0) {
                optionElement.classList.add('out-of-stock');
                optionElement.style.opacity = '0.5';
                optionElement.style.cursor = 'not-allowed';
                optionElement.title = '缺貨';
            } else if (variant.stock <= 5) {
                optionElement.classList.add('low-stock');
                optionElement.title = `庫存剩餘: ${variant.stock}`;
            }

            // 移除預設選中，讓選擇邏輯統一處理
            // if (index === 0 && variant.stock > 0) {
            //     optionElement.classList.add('selected');
            // }

            variantContainer.appendChild(optionElement);
        });

        // 使用事件委派後，不再需要在此處重新綁定
    }

    /**
     * 更新庫存狀態
     */
    updateStockStatus() {
        const selectedVariant = this.getSelectedVariant();
        if (!selectedVariant) return;

        // 更新庫存顯示
        let stockElement = document.querySelector('.stock-status');
        if (!stockElement) {
            stockElement = document.createElement('div');
            stockElement.className = 'stock-status';
            const priceElement = document.querySelector('.product-price');
            if (priceElement) {
                priceElement.parentNode.insertBefore(stockElement, priceElement.nextSibling);
            }
        }

        if (selectedVariant.stock === 0) {
            stockElement.innerHTML = '<span style="color: #e94560;">⚠️ 缺貨</span>';
        } else if (selectedVariant.stock <= 5) {
            stockElement.innerHTML = `<span style="color: #ffab00;">⚠️ 庫存剩餘: ${selectedVariant.stock}</span>`;
        } else {
            stockElement.innerHTML = `<span style="color: #00d25b;">✅ 現貨供應</span>`;
        }
    }

    /**
     * 設置變數選擇功能 (使用事件委派)
     */
    setupVariantSelection() {
        const variantContainer = document.getElementById('variantContainer') || document.querySelector('.flavor-grid');
        if (!variantContainer) {
            console.warn('變數容器未找到，無法設置選擇功能。');
            return;
        }

        // 使用事件委派，只在容器上設置一個監聽器
        variantContainer.addEventListener('click', (event) => {
            const option = event.target.closest('.variant-option, .flavor-option, .color-option');

            if (!option) {
                return; // 點擊的不是選項按鈕
            }

            if (option.classList.contains('out-of-stock')) {
                alert('此商品目前缺貨，請選擇其他選項。');
                return;
            }

            // 移除容器內所有按鈕的 'selected' class
            const allOptions = variantContainer.querySelectorAll('.variant-option, .flavor-option, .color-option');
            allOptions.forEach(opt => opt.classList.remove('selected'));
            
            // 為當前點擊的按鈕添加 'selected' class
            option.classList.add('selected');

            // 更新相關UI
            this.updatePriceWithModifier();
            this.updateAddToCartButton();
            this.updateStockStatus();
        });

        // 頁面載入後，首次更新按鈕狀態
        this.updateAddToCartButton();
    }

    /**
     * 更新價格（含變數調整）
     */
    updatePriceWithModifier() {
        const selectedVariant = this.getSelectedVariant();
        if (!selectedVariant) return;

        const basePrice = this.pageData.price;
        const finalPrice = basePrice + (selectedVariant.priceModifier || 0);
        
        const priceElement = document.querySelector('.product-price');
        if (priceElement) {
            let priceText = `NT$ ${finalPrice}`;
            if (selectedVariant.priceModifier !== 0) {
                priceText += ` <span style="font-size: 0.8em; color: #888;">(基價: NT$ ${basePrice})</span>`;
            }
            priceElement.innerHTML = priceText;
        }
    }

    /**
     * 獲取當前選中的變數
     */
    getSelectedVariant() {
        const selectedElement = document.querySelector('.flavor-option.selected, .color-option.selected, .variant-option.selected');
        if (!selectedElement) return null;

        const variantId = selectedElement.dataset.variantId;
        return this.pageData.variants.find(v => v.id === variantId);
    }

    /**
     * 更新加入購物車按鈕狀態
     */
    updateAddToCartButton() {
        const addToCartBtn = document.querySelector('.add-to-cart');
        if (!addToCartBtn) return;

        const selectedVariant = this.getSelectedVariant();
        
        if (selectedVariant && selectedVariant.stock > 0) {
            addToCartBtn.disabled = false;
            addToCartBtn.innerHTML = `
                <i class="fas fa-shopping-cart" style="margin-right: 0.5rem;"></i>
                加入購物車 - NT$ ${this.pageData.price + (selectedVariant.priceModifier || 0)}
            `;
        } else if (selectedVariant && selectedVariant.stock === 0) {
            addToCartBtn.disabled = true;
            addToCartBtn.innerHTML = `
                <i class="fas fa-times-circle" style="margin-right: 0.5rem;"></i>
                缺貨中
            `;
        } else {
            addToCartBtn.disabled = true;
            addToCartBtn.innerHTML = `
                <i class="fas fa-hand-pointer" style="margin-right: 0.5rem;"></i>
                請先選擇${this.pageData.variants[0]?.type === 'flavor' ? '口味' : '顏色'}
            `;
        }
    }

    /**
     * 設置數量控制
     */
    setupQuantityControls() {
        const quantityInput = document.getElementById('quantity');
        const increaseBtn = document.querySelector('.quantity-btn[onclick*="increase"]');
        const decreaseBtn = document.querySelector('.quantity-btn[onclick*="decrease"]');

        if (!quantityInput) return;

        // 重新綁定數量控制事件
        if (increaseBtn) {
            increaseBtn.onclick = () => this.increaseQuantity();
        }
        if (decreaseBtn) {
            decreaseBtn.onclick = () => this.decreaseQuantity();
        }

        // 監聽數量輸入變化
        quantityInput.addEventListener('change', () => {
            this.validateQuantity();
        });
    }

    /**
     * 增加數量
     */
    increaseQuantity() {
        const quantityInput = document.getElementById('quantity');
        const selectedVariant = this.getSelectedVariant();
        
        if (!quantityInput || !selectedVariant) return;

        const currentValue = parseInt(quantityInput.value);
        const maxQuantity = Math.min(selectedVariant.stock, 10); // 最大10個或庫存數量

        if (currentValue < maxQuantity) {
            quantityInput.value = currentValue + 1;
        } else {
            alert(`最多只能購買 ${maxQuantity} 個`);
        }
    }

    /**
     * 減少數量
     */
    decreaseQuantity() {
        const quantityInput = document.getElementById('quantity');
        if (!quantityInput) return;

        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    }

    /**
     * 驗證數量
     */
    validateQuantity() {
        const quantityInput = document.getElementById('quantity');
        const selectedVariant = this.getSelectedVariant();
        
        if (!quantityInput || !selectedVariant) return;

        const value = parseInt(quantityInput.value);
        const maxQuantity = Math.min(selectedVariant.stock, 10);

        if (value > maxQuantity) {
            quantityInput.value = maxQuantity;
            alert(`最多只能購買 ${maxQuantity} 個`);
        } else if (value < 1) {
            quantityInput.value = 1;
        }
    }

    /**
     * 設置加入購物車功能
     */
    setupAddToCart() {
        const addToCartBtn = document.querySelector('.add-to-cart');
        if (!addToCartBtn) {
            console.warn('找不到加入購物車按鈕');
            return;
        }

        // 強制移除旧的 onclick 属性，避免冲突
        addToCartBtn.removeAttribute('onclick');
        
        // 绑定新的事件处理器
        addToCartBtn.addEventListener('click', () => {
            this.addToCart();
        });

        console.log('✅ 已強制綁定新的 addToCart 事件');
    }

    /**
     * 加入購物車
     */
    addToCart() {
        const selectedVariant = this.getSelectedVariant();
        const quantityInput = document.getElementById('quantity');
        
        if (!selectedVariant) {
            alert('請先選擇口味！');
            return;
        }

        if (!quantityInput) {
            alert('數量輸入錯誤');
            return;
        }

        const quantity = parseInt(quantityInput.value);
        
        // 檢查庫存
        if (selectedVariant.stock === 0) {
            alert('此變數目前缺貨');
            return;
        }

        if (quantity > selectedVariant.stock) {
            alert(`庫存不足，最多只能購買 ${selectedVariant.stock} 個`);
            return;
        }

        // 創建購物車商品
        const cartItem = {
            id: `${this.pageData.pageId}_${selectedVariant.id}`,
            name: this.pageData.productName,
            variant: selectedVariant.value,
            variantId: selectedVariant.id,
            price: this.pageData.price + (selectedVariant.priceModifier || 0),
            quantity: quantity,
            image: selectedVariant.image || 'default-image.webp',
            sku: selectedVariant.sku,
            maxStock: selectedVariant.stock
        };

        // 添加到購物車
        this.addItemToCart(cartItem);

        // 詢問是否前往購物車
        if (confirm(`已將 ${quantity} 個 ${this.pageData.productName} (${selectedVariant.value}) 加入購物車！\n\n是否前往購物車結帳？`)) {
            window.location.href = 'cart.html';
        }
    }

    /**
     * 添加商品到購物車
     */
    addItemToCart(item) {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // 檢查是否已存在相同商品和變數
        const existingIndex = cart.findIndex(cartItem => 
            cartItem.id === item.id
        );

        if (existingIndex > -1) {
            // 更新數量
            const newQuantity = cart[existingIndex].quantity + item.quantity;
            if (newQuantity <= item.maxStock) {
                cart[existingIndex].quantity = newQuantity;
            } else {
                alert(`購物車中已有此商品，總數量不能超過庫存 ${item.maxStock} 個`);
                return;
            }
        } else {
            // 添加新商品
            cart.push(item);
        }

        // 保存到 localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        console.log('商品已加入購物車:', item);
    }

    /**
     * 獲取頁面ID
     */
    getPageId() {
        // 從 DOM 獲取頁面ID
        const productInfo = document.querySelector('.product-info[data-product-id]');
        if (productInfo) {
            const productId = productInfo.dataset.productId;
            console.log(`從 DOM 獲取產品ID: ${productId}`);
            return productId;
        }

        // 從 URL 獲取
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '');
        const pageId = filename.endsWith('_product') ? filename : filename + '_product';
        console.log(`從 URL 獲取產品ID: ${pageId}`);
        return pageId;
    }
}

// 導出類供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PageProductManager;
} 