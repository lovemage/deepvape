const fs = require('fs');

console.log('🔍 檢查產品數據文件...\n');

// ProductManager 的映射表
const productMapping = {
    'sp2_device_product': '/data/page_products/sp2_device.json',
    'ilia_1_product': '/data/page_products/ilia_1.json',
    'ilia_5_device_product': '/data/page_products/ilia_5_device.json',
    'ilia_ultra5_pods_product': '/data/page_products/ilia_ultra5_pods.json',
    'ilia_leather_product': '/data/page_products/ilia_leather.json',
    'ilia_fabric_product': '/data/page_products/ilia_fabric.json',
    'hta_vape_product': '/data/page_products/hta_vape.json',
    'ilia_pods_product': '/data/page_products/ilia_pods.json',
    'sp2_pods_product': '/data/page_products/sp2_pods.json',
    'hta_pods_product': '/data/page_products/hta_pods.json',
    'lana_pods_product': '/data/page_products/lana_pods.json',
    'ilia_disposable_product': '/data/page_products/ilia_disposable.json',
    'lana_a8000_product': '/data/page_products/lana_a8000.json'
};

console.log('📋 檢查所有產品數據文件:');
let missingFiles = [];
let validFiles = [];

Object.entries(productMapping).forEach(([productId, filePath]) => {
    const actualPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    const exists = fs.existsSync(actualPath);
    
    if (exists) {
        try {
            const content = JSON.parse(fs.readFileSync(actualPath, 'utf8'));
            const variantCount = content.variants ? content.variants.length : 0;
            console.log(`✅ ${productId}`);
            console.log(`   文件: ${actualPath}`);
            console.log(`   pageId: ${content.pageId}`);
            console.log(`   產品名: ${content.productName}`);
            console.log(`   變數數量: ${variantCount}`);
            
            // 檢查 pageId 是否匹配
            if (content.pageId !== productId) {
                console.log(`   ⚠️ pageId 不匹配! 期望: ${productId}, 實際: ${content.pageId}`);
            }
            
            validFiles.push(productId);
        } catch (error) {
            console.log(`❌ ${productId}: JSON 格式錯誤 - ${error.message}`);
        }
    } else {
        console.log(`❌ ${productId}: 文件不存在 - ${actualPath}`);
        missingFiles.push(productId);
    }
    console.log('');
});

console.log('📊 總結:');
console.log(`✅ 有效文件: ${validFiles.length}`);
console.log(`❌ 缺失文件: ${missingFiles.length}`);

if (missingFiles.length > 0) {
    console.log('\n❌ 缺失的文件:');
    missingFiles.forEach(id => console.log(`  - ${id}`));
}

// 檢查 ilia_5_device_product.html 是否存在
console.log('\n🔍 檢查特殊情況:');
const specialFiles = [
    'ilia_5_device_product.html',
    'ilia_5_product.html'
];

specialFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`${exists ? '✅' : '❌'} ${file}`);
}); 