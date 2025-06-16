// 調試 ProductManager 產品載入狀態
console.log('🔍 開始調試 ProductManager...');

// 模擬瀏覽器環境
global.window = global;
global.fetch = require('node-fetch');

// 載入 ProductManager
const fs = require('fs');
const ProductManagerCode = fs.readFileSync('js/product-manager.js', 'utf8');
eval(ProductManagerCode);

async function debugProductManager() {
    console.log('📊 創建 ProductManager 實例...');
    const productManager = new ProductManager();
    
    console.log('📋 產品映射表:');
    Object.entries(productManager.productMapping).forEach(([id, path]) => {
        console.log(`  ${id} → ${path}`);
    });
    
    console.log('\n🔍 檢查數據文件是否存在:');
    Object.entries(productManager.productMapping).forEach(([id, path]) => {
        const filePath = path.startsWith('/') ? path.substring(1) : path;
        const exists = fs.existsSync(filePath);
        console.log(`  ${exists ? '✅' : '❌'} ${id}: ${filePath}`);
    });
    
    console.log('\n📥 嘗試初始化 ProductManager...');
    try {
        await productManager.init();
        console.log('✅ ProductManager 初始化成功');
        
        console.log(`📦 載入的產品數量: ${productManager.products.size}`);
        console.log('📋 載入的產品列表:');
        for (const [productId, productData] of productManager.products) {
            console.log(`  ✅ ${productId}: ${productData.productName} (${productData.variants?.length || 0} 個變數)`);
        }
        
        // 測試幾個關鍵產品
        const testProducts = ['lana_a8000_product', 'ilia_1_product', 'sp2_device_product'];
        console.log('\n🧪 測試關鍵產品:');
        
        testProducts.forEach(productId => {
            const product = productManager.getProduct(productId);
            const variants = productManager.getProductVariants(productId);
            
            if (product) {
                console.log(`  ✅ ${productId}:`);
                console.log(`    名稱: ${product.productName}`);
                console.log(`    變數數量: ${variants.length}`);
                if (variants.length > 0) {
                    console.log(`    變數範例: ${variants[0].id} (${variants[0].value}) - 庫存: ${variants[0].stock}`);
                }
            } else {
                console.log(`  ❌ ${productId}: 產品數據未找到`);
            }
        });
        
    } catch (error) {
        console.error('❌ ProductManager 初始化失敗:', error);
    }
}

debugProductManager(); 