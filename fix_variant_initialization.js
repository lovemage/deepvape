/**
 * 變數選擇器初始化修復腳本
 * 解決系統性的初始化時序問題
 * 支援 Netlify 靜態網站託管環境
 */

// 統一的變數選擇器初始化函數
function createUnifiedVariantInitializer(productId, containerId = 'variantContainer') {
    return function initVariantSelector() {
        console.log(`🚀 開始初始化變數選擇器: ${productId}`);
        
        // Netlify 環境檢查
        if (window.NetlifyCompatibility) {
            console.log('🌐 Netlify 環境檢測完成');
        }
        
        // 檢查必要的依賴
        if (!window.VariantSelector) {
            console.error('❌ VariantSelector 類別未載入');
            
            // 在 Netlify 環境中嘗試重新載入
            if (window.NetlifyCompatibility?.isNetlify) {
                console.log('🔄 嘗試重新載入 VariantSelector...');
                setTimeout(initVariantSelector, 1000);
            }
            return;
        }

        if (!window.ProductManager) {
            console.error('❌ ProductManager 未載入');
            
            // 在 Netlify 環境中嘗試重新載入
            if (window.NetlifyCompatibility?.isNetlify) {
                console.log('🔄 嘗試重新載入 ProductManager...');
                setTimeout(initVariantSelector, 1000);
            }
            return;
        }

        if (!window.ProductManager.initialized) {
            console.log('⏳ ProductManager 未初始化，等待中...');
            // 設置重試機制，在 Netlify 環境中延長等待時間
            const retryDelay = window.NetlifyCompatibility?.isNetlify ? 1000 : 500;
            setTimeout(initVariantSelector, retryDelay);
            return;
        }

        try {
            // 檢查容器是否存在
            const container = document.getElementById(containerId);
            if (!container) {
                console.error(`找不到變數容器: ${containerId}`);
                return;
            }

            // 創建變數選擇器實例
            window.variantSelector = new VariantSelector(productId, containerId);
            
            // 設置變數變更回調
            window.variantSelector.setOnVariantChange((variant) => {
                console.log('選擇的變數:', variant.value);
                window.selectedVariant = variant;
                
                // 更新加入購物車按鈕
                if (typeof updateAddToCartButton === 'function') {
                    updateAddToCartButton(variant);
                }
                
                // 更新總價
                if (typeof updateTotalPrice === 'function') {
                    updateTotalPrice();
                }
                
                // 觸發自定義事件
                window.dispatchEvent(new CustomEvent('variantChanged', {
                    detail: { variant, productId }
                }));
            });

            console.log(`變數選擇器初始化成功: ${productId}`);
            
        } catch (error) {
            console.error(`變數選擇器初始化失敗: ${error.message}`);
        }
    };
}

// 產品頁面映射配置
const PRODUCT_PAGE_MAPPING = {
    'ilia_1_product.html': 'ilia_gen1',
    'ilia_fabric_product.html': 'ilia_fabric', 
    'ilia_leather_product.html': 'ilia_leather',
    'ilia_5_product.html': 'ilia_5_device',
    'ilia_pods_product.html': 'ilia_pods',
    'ilia_ultra5_pods_product.html': 'ilia_ultra5_pods',
    'ilia_disposable_product.html': 'ilia_disposable',
    'hta_vape_product.html': 'hta_vape',
    'hta_pods_product.html': 'hta_pods',
    'sp2_product.html': 'sp2_device',
    'sp2_pods_product.html': 'sp2_pods',
    'lana_pods_product.html': 'lana_pods',
    'lana_a8000_product.html': 'lana_a8000'
};

// 自動檢測當前頁面並初始化對應的變數選擇器
function autoInitializeVariantSelector() {
    const currentPage = window.location.pathname.split('/').pop();
    const productId = PRODUCT_PAGE_MAPPING[currentPage];
    
    if (productId) {
        console.log(`🔍 檢測到產品頁面: ${currentPage} -> ${productId}`);
        
        // 檢查是否已有頁面自定義的初始化函數
        if (typeof window.initVariantSelector === 'function') {
            console.log('✅ 使用頁面現有的 initVariantSelector 函數');
            return; // 不覆蓋現有函數
        }
        
        console.log('🔧 創建統一的變數選擇器初始化函數');
        
        // 創建初始化函數
        const initFunction = createUnifiedVariantInitializer(productId);
        
        // 設置全域初始化函數（只在沒有現有函數時）
        window.initVariantSelector = initFunction;
        
        // 立即嘗試初始化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initFunction);
        } else {
            initFunction();
        }
        
        // 監聽 ProductManager 載入完成事件
        window.addEventListener('productsLoaded', initFunction);
        
    } else {
        console.log(`ℹ️ 當前頁面不是產品頁面: ${currentPage}`);
    }
}

// 統一的加入購物車按鈕更新函數
function updateAddToCartButton(variant) {
    const addToCartBtn = document.querySelector('.pulse-button, .add-to-cart-btn, .add-to-cart');
    if (!addToCartBtn) return;

    if (variant && variant.stock > 0) {
        addToCartBtn.disabled = false;
        const originalText = addToCartBtn.innerHTML;
        const iconMatch = originalText.match(/<i[^>]*><\/i>/);
        const icon = iconMatch ? iconMatch[0] : '<i class="fas fa-shopping-cart"></i>';
        addToCartBtn.innerHTML = `${icon} 加入購物車 - ${variant.value}`;
        addToCartBtn.style.opacity = '1';
        addToCartBtn.style.cursor = 'pointer';
    } else {
        addToCartBtn.disabled = true;
        const originalText = addToCartBtn.innerHTML;
        const iconMatch = originalText.match(/<i[^>]*><\/i>/);
        const icon = iconMatch ? iconMatch[0] : '<i class="fas fa-shopping-cart"></i>';
        
        if (variant) {
            addToCartBtn.innerHTML = `${icon} 缺貨 - ${variant.value}`;
        } else {
            addToCartBtn.innerHTML = `${icon} 請先選擇選項`;
        }
        addToCartBtn.style.opacity = '0.6';
        addToCartBtn.style.cursor = 'not-allowed';
    }
}

// 統一的購物車功能
function createUnifiedAddToCart(productId, productName, basePrice) {
    return function addToCart() {
        if (!window.selectedVariant) {
            alert('請先選擇產品選項！');
            return;
        }

        if (window.selectedVariant.stock <= 0) {
            alert('該選項目前缺貨！');
            return;
        }

        const quantity = parseInt(document.getElementById('quantity')?.value || '1');
        const finalPrice = basePrice + (window.selectedVariant.priceModifier || 0);
        
        const product = {
            id: productId,
            name: productName,
            variant: window.selectedVariant.value,
            variantId: window.selectedVariant.id,
            price: finalPrice,
            quantity: quantity,
            image: document.getElementById('mainImage')?.src || '',
            category: productId.includes('pods') ? 'pods' : 
                     productId.includes('disposable') ? 'disposable' : 'device'
        };
        
        // 取得現有購物車
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // 檢查是否已存在相同產品和變數
        const existingItemIndex = cart.findIndex(item => 
            item.id === product.id && item.variantId === product.variantId
        );
        
        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += product.quantity;
        } else {
            cart.push(product);
        }
        
        // 儲存購物車
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // 更新購物車計數器
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }
        
        // 顯示成功訊息
        alert(`已將 ${product.name} (${product.variant}) x${product.quantity} 加入購物車！`);
        
        console.log('加入購物車:', product);
    };
}

// 調試工具
window.debugVariantSelector = function() {
    console.log('=== 變數選擇器調試信息 ===');
    console.log('ProductManager:', window.ProductManager);
    console.log('ProductManager.initialized:', window.ProductManager?.initialized);
    console.log('VariantSelector:', window.VariantSelector);
    console.log('variantSelector instance:', window.variantSelector);
    console.log('selectedVariant:', window.selectedVariant);
    
    if (window.variantSelector) {
        console.log('變數統計:', window.variantSelector.getVariantStats());
    }
};

// 暫時禁用自動執行，讓頁面原本的邏輯運行
// setTimeout(() => {
//     autoInitializeVariantSelector();
// }, 100);

console.log('🔧 變數選擇器修復腳本載入完成'); 