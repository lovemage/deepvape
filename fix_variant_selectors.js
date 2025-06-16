/**
 * 修復所有產品頁面的變數選擇器問題
 * 這個腳本會統一所有產品頁面的變數選擇器實現
 */

const fs = require('fs');
const path = require('path');

// 產品ID映射表 - 將頁面產品ID映射到JSON數據文件的pageId
const PRODUCT_ID_MAPPING = {
    // 頁面使用的產品ID -> JSON文件中的pageId
    'hta_vape': 'hta_vape_product',
    'lana_pods': 'lana_pods_product', 
    'ilia_disposable': 'ilia_disposable_product',
    'ilia_pods': 'ilia_pods_product',
    'ilia_ultra5_pods': 'ilia_ultra5_pods_product',
    'ilia_5_device': 'ilia_5_product',
    'hta_pods': 'hta_pods_product',
    'sp2_pods': 'sp2_pods_product'
};

// 反向映射 - 從pageId到產品ID
const PAGE_TO_PRODUCT_ID = {
    'hta_vape_product': 'hta_vape',
    'lana_pods_product': 'lana_pods',
    'ilia_disposable_product': 'ilia_disposable', 
    'ilia_pods_product': 'ilia_pods',
    'ilia_ultra5_pods_product': 'ilia_ultra5_pods',
    'ilia_5_product': 'ilia_5_device',
    'hta_pods_product': 'hta_pods',
    'sp2_pods_product': 'sp2_pods'
};

// 標準化的變數選擇器初始化代碼
const STANDARD_VARIANT_SELECTOR_CODE = `
// 變數選擇器實例
let variantSelector = null;

// 初始化變數選擇器
function initVariantSelector() {
    if (window.VariantSelector && window.ProductManager && window.ProductManager.initialized) {
        // 獲取當前頁面的產品ID
        const pageId = getCurrentPageId();
        const productId = getProductIdFromPageId(pageId);
        
        if (!productId) {
            console.error('無法確定產品ID:', pageId);
            return;
        }
        
        variantSelector = new VariantSelector(productId, 'variantContainer');
        
        // 設置變數變更回調
        variantSelector.setOnVariantChange((variant) => {
            console.log('選擇的變數:', variant.value);
            updateAddToCartButton(variant);
            if (typeof updateTotalPrice === 'function') {
                updateTotalPrice();
            }
        });
    } else {
        // 如果依賴未載入，稍後重試
        setTimeout(initVariantSelector, 500);
    }
}

// 獲取當前頁面ID
function getCurrentPageId() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    return filename.replace('.html', '');
}

// 從頁面ID獲取產品ID
function getProductIdFromPageId(pageId) {
    const mapping = {
        'hta_vape_product': 'hta_vape',
        'lana_pods_product': 'lana_pods',
        'ilia_disposable_product': 'ilia_disposable',
        'ilia_pods_product': 'ilia_pods',
        'ilia_ultra5_pods_product': 'ilia_ultra5_pods',
        'ilia_5_product': 'ilia_5_device',
        'hta_pods_product': 'hta_pods',
        'sp2_pods_product': 'sp2_pods'
    };
    return mapping[pageId];
}

// 更新加入購物車按鈕狀態
function updateAddToCartButton(variant) {
    const addToCartBtn = document.querySelector('.pulse-button');
    if (!addToCartBtn) return;

    if (variant && variant.stock > 0) {
        addToCartBtn.disabled = false;
        addToCartBtn.innerHTML = \`<i class="fas fa-shopping-cart"></i> 加入購物車 - \${variant.value}\`;
        addToCartBtn.style.opacity = '1';
    } else {
        addToCartBtn.disabled = true;
        addToCartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> 請選擇變數';
        addToCartBtn.style.opacity = '0.6';
    }
}
`;

// 標準化的加入購物車函數
const STANDARD_ADD_TO_CART_CODE = `
// 加入購物車功能
async function addToCart() {
    try {
        // 檢查產品管理系統是否已初始化
        if (!window.ProductManager || !window.ProductManager.initialized) {
            alert('產品數據載入中，請稍後再試');
            return;
        }

        // 檢查是否選擇了變數
        if (!variantSelector) {
            alert('變數選擇器未初始化，請重新載入頁面');
            return;
        }

        const selectedVariant = variantSelector.getSelectedVariant();
        if (!selectedVariant) {
            alert('請選擇產品變數');
            return;
        }

        const quantity = parseInt(document.getElementById('quantity').value);
        const pageId = getCurrentPageId();
        const productId = getProductIdFromPageId(pageId);
        
        // 檢查庫存
        const stockCheck = window.ProductManager.checkStock(productId, selectedVariant.id, quantity);
        if (!stockCheck.available) {
            alert(\`庫存不足！\${stockCheck.message}\`);
            return;
        }

        // 獲取產品價格
        const priceInfo = window.ProductManager.getProductPrice(productId);
        const unitPrice = priceInfo.price + (selectedVariant.priceModifier || 0);
        
        // 創建產品對象
        const product = {
            id: productId,
            name: document.querySelector('.product-title').textContent.trim(),
            variant: selectedVariant.value,
            price: unitPrice,
            originalPrice: priceInfo.originalPrice,
            quantity: quantity,
            image: getProductImage(),
            variantId: selectedVariant.id
        };

        // 獲取現有購物車
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // 檢查是否已存在相同產品和變數
        const existingIndex = cart.findIndex(item => 
            item.id === product.id && item.variantId === product.variantId
        );

        if (existingIndex > -1) {
            const newQuantity = cart[existingIndex].quantity + product.quantity;
            
            // 再次檢查庫存
            const newStockCheck = window.ProductManager.checkStock(productId, selectedVariant.id, newQuantity);
            if (!newStockCheck.available) {
                alert(\`庫存不足！目前庫存：\${newStockCheck.stock}，購物車已有：\${cart[existingIndex].quantity}\`);
                return;
            }
            
            cart[existingIndex].quantity = newQuantity;
        } else {
            cart.push(product);
        }

        // 保存到 localStorage
        localStorage.setItem('cart', JSON.stringify(cart));

        // 更新購物車數量顯示
        if (window.updateCartCount) {
            window.updateCartCount();
        }

        // 顯示成功訊息
        let message = \`已將 \${quantity} 個 \${product.name} (\${selectedVariant.value}) 加入購物車！\`;
        if (priceInfo.discount) {
            message += \`\\n🎉 特價商品：\${priceInfo.discount}\`;
        }
        message += \`\\n\\n是否前往購物車結帳？\`;

        if (confirm(message)) {
            window.location.href = 'cart.html';
        }

    } catch (error) {
        console.error('加入購物車失敗:', error);
        alert('加入購物車失敗，請稍後再試');
    }
}

// 獲取產品圖片
function getProductImage() {
    const mainImage = document.querySelector('#mainImage, .product-image img, .main-image img');
    if (mainImage) {
        return mainImage.src.replace(window.location.origin, '');
    }
    return '/images/default-product.webp';
}
`;

// 導出配置和代碼模板
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PRODUCT_ID_MAPPING,
        PAGE_TO_PRODUCT_ID,
        STANDARD_VARIANT_SELECTOR_CODE,
        STANDARD_ADD_TO_CART_CODE
    };
}

console.log('變數選擇器修復腳本已準備就緒');
console.log('需要手動應用到以下頁面:');
Object.keys(PRODUCT_ID_MAPPING).forEach(page => {
    console.log(`- ${page} (產品ID: ${PRODUCT_ID_MAPPING[page]})`);
});

console.log('\\n修復步驟:');
console.log('1. 將口味/顏色選擇容器改為 <div id="variantContainer">');
console.log('2. 替換 JavaScript 中的選擇邏輯');
console.log('3. 更新 addToCart 函數');
// 產品頁面映射
const productPages = {
    'sp2_pods_product.html': 'sp2_pods',
    'hta_pods_product.html': 'hta_pods', 
    'lana_pods_product.html': 'lana_pods',
    'hta_vape_product.html': 'hta_vape'
};

// 通用的變數選擇器 JavaScript 代碼
const variantSelectorJS = `
        // 變數選擇器實例
        let variantSelector = null;

        // 初始化變數選擇器
        function initVariantSelector() {
            if (window.VariantSelector && window.ProductManager && window.ProductManager.initialized) {
                variantSelector = new VariantSelector('PRODUCT_ID', 'variantContainer');
                
                // 設置變數變更回調
                variantSelector.setOnVariantChange((variant) => {
                    console.log('選擇的變數:', variant.value);
                    updateAddToCartButton(variant);
                });
            } else {
                // 如果依賴未載入，稍後重試
                setTimeout(initVariantSelector, 500);
            }
        }

        // 更新加入購物車按鈕狀態
        function updateAddToCartButton(variant) {
            const addToCartBtn = document.querySelector('.pulse-button, .add-to-cart-btn, .add-to-cart');
            if (!addToCartBtn) return;

            if (variant && variant.stock > 0) {
                addToCartBtn.disabled = false;
                const originalText = addToCartBtn.innerHTML;
                const iconMatch = originalText.match(/<i[^>]*><\\/i>/);
                const icon = iconMatch ? iconMatch[0] : '<i class="fas fa-shopping-cart"></i>';
                addToCartBtn.innerHTML = \`\${icon} 加入購物車 - \${variant.value}\`;
                addToCartBtn.style.opacity = '1';
            } else {
                addToCartBtn.disabled = true;
                const originalText = addToCartBtn.innerHTML;
                const iconMatch = originalText.match(/<i[^>]*><\\/i>/);
                const icon = iconMatch ? iconMatch[0] : '<i class="fas fa-shopping-cart"></i>';
                addToCartBtn.innerHTML = \`\${icon} 請選擇選項\`;
                addToCartBtn.style.opacity = '0.6';
            }
        }

        // 更新購物車數量顯示
        function updateCartCount() {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            
            const cartCountElements = document.querySelectorAll('.cart-count');
            cartCountElements.forEach(element => {
                element.textContent = totalItems;
                element.style.display = totalItems > 0 ? 'block' : 'none';
            });
        }
`;

// 通用的 addToCart 函數
const addToCartJS = `
        // Add to Cart
        function addToCart() {
            if (!variantSelector) {
                alert('變數選擇器未初始化，請稍後再試');
                return;
            }

            const selectedVariant = variantSelector.getSelectedVariant();
            if (!selectedVariant) {
                alert('請先選擇選項！');
                return;
            }

            if (selectedVariant.stock <= 0) {
                alert('所選選項目前缺貨，請選擇其他選項！');
                return;
            }

            const quantity = parseInt(document.getElementById('quantity').value);
            const productId = 'PRODUCT_ID';
            const productName = 'PRODUCT_NAME';
            const price = PRODUCT_PRICE;

            // Create cart item object
            const cartItem = {
                id: \`\${productId}_\${selectedVariant.id}\`,
                name: \`\${productName} - \${selectedVariant.value}\`,
                price: price,
                quantity: quantity,
                variant: selectedVariant.value,
                variantId: selectedVariant.id,
                image: 'PRODUCT_IMAGE',
                category: 'PRODUCT_CATEGORY'
            };

            // Get existing cart or create new one
            let cart = JSON.parse(localStorage.getItem('cart')) || [];

            // Check if item already exists in cart
            const existingItemIndex = cart.findIndex(item => item.id === cartItem.id);

            if (existingItemIndex > -1) {
                // Update quantity if item exists
                cart[existingItemIndex].quantity += quantity;
            } else {
                // Add new item to cart
                cart.push(cartItem);
            }

            // Save cart to localStorage
            localStorage.setItem('cart', JSON.stringify(cart));

            // Show success message
            alert(\`已將 \${quantity} 個 \${productName} (\${selectedVariant.value}) 加入購物車！\`);

            // Update cart count if cart counter exists
            updateCartCount();
        }
`;

// 初始化代碼
const initJS = `
            // 初始化變數選擇器
            updateCartCount();
            
            // 等待產品管理器初始化後再初始化變數選擇器
            if (window.ProductManager && window.ProductManager.initialized) {
                initVariantSelector();
            } else {
                window.addEventListener('productsLoaded', initVariantSelector);
            }
`;

console.log('變數選擇器修復腳本已準備就緒');
console.log('需要手動應用到以下頁面:');
Object.keys(productPages).forEach(page => {
    console.log(`- ${page} (產品ID: ${productPages[page]})`);
});

console.log('\\n修復步驟:');
console.log('1. 將口味/顏色選擇容器改為 <div id="variantContainer">');
console.log('2. 替換 JavaScript 中的選擇邏輯');
console.log('3. 更新 addToCart 函數');
console.log('4. 添加初始化代碼'); 