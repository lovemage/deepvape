/**
 * 購物車問題修復腳本
 * 解決產品圖片遺失和變數載入問題
 */

// 產品ID映射表 - 統一產品頁面和數據文件的ID
const PRODUCT_ID_MAPPING = {
    'sp2_host': 'sp2_device_product',
    'ilia_gen1': 'ilia_1_product',
    'ilia_fabric': 'ilia_fabric_product',
    'ilia_leather': 'ilia_leather_product',
    'ilia_5': 'ilia_5_product',
    'ilia_pods': 'ilia_pods_product',
    'ilia_ultra5_pods': 'ilia_ultra5_pods_product',
    'ilia_disposable': 'ilia_disposable_product',
    'hta_vape': 'hta_vape_product',
    'hta_pods': 'hta_pods_product',
    'sp2_pods': 'sp2_pods_product',
    'lana_pods': 'lana_pods_product',
    'lana_a8000': 'lana_a8000_product'
};

// 產品圖片映射表 - 修復圖片路徑問題
const PRODUCT_IMAGE_MAPPING = {
    'sp2_host': '/sp2_v/sp2_device_main_showcase.jpg',
    'sp2_device_product': '/sp2_v/sp2_device_main_showcase.jpg',
    'ilia_gen1': '/ilia_1/ilia_1_main.webp',
    'ilia_1_product': '/ilia_1/ilia_1_main.webp',
    'ilia_fabric': '/ilia_fabric/ilia_fabric_main.webp',
    'ilia_fabric_product': '/ilia_fabric/ilia_fabric_main.webp',
    'ilia_leather': '/ilia_leather/ilia_leather_main.webp',
    'ilia_leather_product': '/ilia_leather/ilia_leather_main.webp',
    'ilia_5': '/ilia_5/ilia_5_main.webp',
    'ilia_5_product': '/ilia_5/ilia_5_main.webp',
    'ilia_pods': '/ilia_pods/ilia_pods_main.webp',
    'ilia_pods_product': '/ilia_pods/ilia_pods_main.webp',
    'ilia_ultra5_pods': '/ilia_ultra5_pods/ilia_ultra5_pods_main.webp',
    'ilia_ultra5_pods_product': '/ilia_ultra5_pods/ilia_ultra5_pods_main.webp',
    'ilia_disposable': '/ilia_disposable/ilia_disposable_main.webp',
    'ilia_disposable_product': '/ilia_disposable/ilia_disposable_main.webp',
    'hta_vape': '/hta_vape/hta_vape_main.webp',
    'hta_vape_product': '/hta_vape/hta_vape_main.webp',
    'hta_pods': '/hta_pods/hta_pods_main.webp',
    'hta_pods_product': '/hta_pods/hta_pods_main.webp',
    'sp2_pods': '/sp2_pods/sp2_pods_main.webp',
    'sp2_pods_product': '/sp2_pods/sp2_pods_main.webp',
    'lana_pods': '/lana_pods/lana_pods_main.webp',
    'lana_pods_product': '/lana_pods/lana_pods_main.webp',
    'lana_a8000': '/lana_a8000/lana_a8000_main.webp',
    'lana_a8000_product': '/lana_a8000/lana_a8000_main.webp'
};

/**
 * 修復購物車中的產品數據
 */
function fixCartData() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        let hasChanges = false;

        const fixedCart = cart.map(item => {
            const fixedItem = { ...item };
            
            // 修復產品ID
            if (PRODUCT_ID_MAPPING[item.id]) {
                fixedItem.productId = PRODUCT_ID_MAPPING[item.id];
                hasChanges = true;
            }
            
            // 修復圖片路徑
            if (PRODUCT_IMAGE_MAPPING[item.id] || PRODUCT_IMAGE_MAPPING[fixedItem.productId]) {
                const correctImage = PRODUCT_IMAGE_MAPPING[item.id] || PRODUCT_IMAGE_MAPPING[fixedItem.productId];
                if (fixedItem.image !== correctImage) {
                    fixedItem.image = correctImage;
                    hasChanges = true;
                }
            }
            
            // 確保變數信息完整
            if (!fixedItem.variant && (fixedItem.color || fixedItem.flavor)) {
                fixedItem.variant = fixedItem.color || fixedItem.flavor;
                hasChanges = true;
            }
            
            return fixedItem;
        });

        if (hasChanges) {
            localStorage.setItem('cart', JSON.stringify(fixedCart));
            console.log('✅ 購物車數據已修復');
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('❌ 修復購物車數據失敗:', error);
        return false;
    }
}

/**
 * 增強購物車渲染函數
 */
function enhanceCartRendering() {
    // 如果購物車頁面存在 renderCart 函數，增強它
    if (typeof window.renderCart === 'function') {
        const originalRenderCart = window.renderCart;
        
        window.renderCart = function() {
            // 先修復數據
            fixCartData();
            
            // 然後調用原始渲染函數
            return originalRenderCart.apply(this, arguments);
        };
        
        console.log('✅ 購物車渲染函數已增強');
    }
}

/**
 * 修復管理器初始化問題
 */
async function fixManagerInitialization() {
    try {
        // 確保 InventoryManager 正確初始化
        if (window.InventoryManager && !window.InventoryManager.initialized) {
            await window.InventoryManager.init();
            console.log('✅ InventoryManager 已初始化');
        }
        
        // 確保 OrderManager 正確初始化
        if (window.OrderManager && !window.OrderManager.initialized) {
            await window.OrderManager.init();
            console.log('✅ OrderManager 已初始化');
        }
        
        return true;
    } catch (error) {
        console.error('❌ 管理器初始化失敗:', error);
        return false;
    }
}

/**
 * 主修復函數
 */
async function fixCartIssues() {
    console.log('🔧 開始修復購物車問題...');
    
    // 1. 修復購物車數據
    const dataFixed = fixCartData();
    
    // 2. 增強購物車渲染
    enhanceCartRendering();
    
    // 3. 修復管理器初始化
    const managersFixed = await fixManagerInitialization();
    
    // 4. 重新載入購物車（如果在購物車頁面）
    if (typeof window.loadCart === 'function') {
        window.loadCart();
        console.log('✅ 購物車已重新載入');
    }
    
    console.log('🎉 購物車修復完成！', {
        dataFixed,
        managersFixed,
        timestamp: new Date().toISOString()
    });
}

// 自動執行修復
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixCartIssues);
} else {
    fixCartIssues();
}

// 導出修復函數供手動調用
window.fixCartIssues = fixCartIssues;
window.fixCartData = fixCartData; 