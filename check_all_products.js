const fs = require('fs');
const path = require('path');

// 所有產品頁面列表
const productPages = [
    'sp2_product.html',
    'sp2_pods_product.html', 
    'hta_vape_product.html',
    'hta_pods_product.html',
    'ilia_1_product.html',
    'ilia_5_device_product.html',
    'ilia_fabric_product.html',
    'ilia_leather_product.html',
    'ilia_disposable_product.html',
    'ilia_ultra5_pods_product.html',
    'ilia_pods_product.html',
    'lana_a8000_product.html',
    'lana_pods_product.html'
];

// 對應的數據文件
const dataFiles = [
    'data/page_products/sp2_device.json',
    'data/page_products/sp2_pods.json',
    'data/page_products/hta_vape.json', 
    'data/page_products/hta_pods.json',
    'data/page_products/ilia_1.json',
    'data/page_products/ilia_5_device.json',
    'data/page_products/ilia_fabric.json',
    'data/page_products/ilia_leather.json',
    'data/page_products/ilia_disposable.json',
    'data/page_products/ilia_ultra5_pods.json',
    'data/page_products/ilia_pods.json',
    'data/page_products/lana_a8000.json',
    'data/page_products/lana_pods.json'
];

console.log('🔍 開始全面檢查所有產品頁面...\n');

let allIssues = [];

for (let i = 0; i < productPages.length; i++) {
    const htmlFile = productPages[i];
    const jsonFile = dataFiles[i];
    
    console.log(`\n📄 檢查產品: ${htmlFile}`);
    console.log(`📊 對應數據: ${jsonFile}`);
    
    let issues = [];
    
    // 1. 檢查HTML文件是否存在
    if (!fs.existsSync(htmlFile)) {
        issues.push(`❌ HTML文件不存在: ${htmlFile}`);
        continue;
    }
    
    // 2. 檢查JSON數據文件是否存在
    if (!fs.existsSync(jsonFile)) {
        issues.push(`❌ JSON數據文件不存在: ${jsonFile}`);
    }
    
    // 3. 讀取HTML內容
    const htmlContent = fs.readFileSync(htmlFile, 'utf8');
    
    // 4. 檢查產品ID設定
    const productIdMatch = htmlContent.match(/data-product-id="([^"]+)"/);
    if (!productIdMatch) {
        issues.push(`❌ 未找到 data-product-id 屬性`);
    } else {
        const productId = productIdMatch[1];
        console.log(`  📋 產品ID: ${productId}`);
        
        // 檢查產品ID格式是否正確
        if (!productId.endsWith('_product')) {
            issues.push(`⚠️ 產品ID格式可能不正確: ${productId} (應該以 _product 結尾)`);
        }
    }
    
    // 5. 檢查VariantSelector初始化
    const variantSelectorMatch = htmlContent.match(/new VariantSelector\(['"]([^'"]+)['"]/);
    if (!variantSelectorMatch) {
        issues.push(`❌ 未找到 VariantSelector 初始化`);
    } else {
        const variantSelectorId = variantSelectorMatch[1];
        console.log(`  🎛️ VariantSelector ID: ${variantSelectorId}`);
        
        if (productIdMatch && variantSelectorId !== productIdMatch[1]) {
            issues.push(`⚠️ VariantSelector ID (${variantSelectorId}) 與 data-product-id (${productIdMatch[1]}) 不匹配`);
        }
    }
    
    // 6. 檢查PageProductManager初始化
    const pageManagerMatch = htmlContent.match(/new PageProductManager\(\)/);
    if (!pageManagerMatch) {
        issues.push(`❌ 未找到 PageProductManager 初始化`);
    } else {
        console.log(`  📊 找到 PageProductManager 初始化`);
        
        // 檢查 PageProductManager.init 調用
        const initMatch = htmlContent.match(/pageProductManager\.init\(['"]([^'"]+)['"]\)/);
        if (initMatch) {
            const initId = initMatch[1];
            console.log(`  📊 PageProductManager init ID: ${initId}`);
            
            if (productIdMatch && initId !== productIdMatch[1]) {
                issues.push(`⚠️ PageProductManager init ID (${initId}) 與 data-product-id (${productIdMatch[1]}) 不匹配`);
            }
        } else {
            issues.push(`⚠️ 未找到 PageProductManager.init 調用`);
        }
    }
    
    // 7. 檢查addToCart函數調用
    const addToCartMatches = htmlContent.match(/onclick="addToCart\(([^)]*)\)"/g);
    if (!addToCartMatches) {
        issues.push(`❌ 未找到 addToCart 函數調用`);
    } else {
        console.log(`  🛒 找到 ${addToCartMatches.length} 個 addToCart 調用`);
        
        // 檢查是否有參數
        const hasParams = addToCartMatches.some(match => match.includes('addToCart(') && !match.includes('addToCart()'));
        if (hasParams) {
            console.log(`  ⚠️ 部分 addToCart 調用包含參數，可能需要檢查`);
        }
    }
    
    // 8. 檢查JSON數據文件內容
    if (fs.existsSync(jsonFile)) {
        try {
            const jsonContent = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
            console.log(`  📊 JSON pageId: ${jsonContent.pageId}`);
            console.log(`  📦 變數數量: ${jsonContent.variants ? jsonContent.variants.length : 0}`);
            
            // 檢查pageId是否與HTML中的產品ID匹配
            if (productIdMatch && jsonContent.pageId !== productIdMatch[1]) {
                issues.push(`⚠️ JSON pageId (${jsonContent.pageId}) 與 HTML data-product-id (${productIdMatch[1]}) 不匹配`);
            }
            
            // 檢查是否有變數數據
            if (!jsonContent.variants || jsonContent.variants.length === 0) {
                issues.push(`⚠️ JSON文件中沒有變數數據`);
            }
            
        } catch (error) {
            issues.push(`❌ JSON文件格式錯誤: ${error.message}`);
        }
    }
    
    // 9. 檢查必要的腳本引用
    const requiredScripts = [
        'js/variant-selector.js',
        'js/page-product-manager.js', 
        'js/product-manager.js',
        'js/stock-checker.js'
    ];
    
    for (const script of requiredScripts) {
        if (!htmlContent.includes(script)) {
            issues.push(`⚠️ 缺少腳本引用: ${script}`);
        }
    }
    
    // 輸出檢查結果
    if (issues.length === 0) {
        console.log(`  ✅ 所有檢查通過`);
    } else {
        console.log(`  ❌ 發現 ${issues.length} 個問題:`);
        issues.forEach(issue => console.log(`    ${issue}`));
        allIssues.push({ product: htmlFile, issues: issues });
    }
}

console.log('\n' + '='.repeat(60));
console.log('📋 全面檢查結果摘要');
console.log('='.repeat(60));

if (allIssues.length === 0) {
    console.log('🎉 所有產品頁面檢查通過！');
} else {
    console.log(`❌ 發現問題的產品數量: ${allIssues.length}/${productPages.length}`);
    console.log('\n📝 問題詳情:');
    
    allIssues.forEach(({ product, issues }) => {
        console.log(`\n📄 ${product}:`);
        issues.forEach(issue => console.log(`  ${issue}`));
    });
    
    console.log('\n🔧 建議修復步驟:');
    console.log('1. 確保所有產品的 data-product-id、VariantSelector、PageProductManager 使用相同ID');
    console.log('2. 確保 JSON 文件的 pageId 與 HTML 產品ID 匹配');
    console.log('3. 檢查所有必要的腳本文件是否正確引用');
    console.log('4. 確保 addToCart 函數調用格式正確');
}

console.log('\n🔍 檢查完成！'); 