const fs = require('fs');

// 所有產品頁面
const productPages = [
    'sp2_product.html',
    'sp2_pods_product.html', 
    'hta_vape_product.html',
    'hta_pods_product.html',
    'ilia_1_product.html',
    'ilia_5_product.html',  // 注意這裡是 ilia_5_product.html
    'ilia_fabric_product.html',
    'ilia_leather_product.html',
    'ilia_disposable_product.html',
    'ilia_ultra5_pods_product.html',
    'ilia_pods_product.html',
    'lana_a8000_product.html',
    'lana_pods_product.html'
];

console.log('🔧 開始修復所有產品的 addToCart 函數...\n');

productPages.forEach(htmlFile => {
    if (!fs.existsSync(htmlFile)) {
        console.log(`❌ 文件不存在: ${htmlFile}`);
        return;
    }
    
    console.log(`📄 處理: ${htmlFile}`);
    
    let content = fs.readFileSync(htmlFile, 'utf8');
    
    // 檢查是否有 addToCart 函數依賴 variantSelector
    const hasVariantSelectorDependency = content.includes('if (!variantSelector)') || 
                                        content.includes('variantSelector.getSelectedVariant()');
    
    if (hasVariantSelectorDependency) {
        console.log('  🔧 發現 VariantSelector 依賴，需要修復');
        
        // 找到 addToCart 函數的開始和結束位置
        const addToCartStart = content.indexOf('function addToCart()');
        if (addToCartStart === -1) {
            console.log('  ❌ 未找到 addToCart 函數');
            return;
        }
        
        // 找到函數結束位置（找到對應的 }）
        let braceCount = 0;
        let functionStart = content.indexOf('{', addToCartStart);
        let functionEnd = functionStart;
        
        for (let i = functionStart; i < content.length; i++) {
            if (content[i] === '{') braceCount++;
            if (content[i] === '}') braceCount--;
            if (braceCount === 0) {
                functionEnd = i;
                break;
            }
        }
        
        // 提取產品ID
        const productIdMatch = content.match(/data-product-id="([^"]+)"/);
        if (!productIdMatch) {
            console.log('  ❌ 未找到產品ID');
            return;
        }
        
        const productId = productIdMatch[1];
        console.log(`  📋 產品ID: ${productId}`);
        
        // 創建新的 addToCart 函數
        const newAddToCartFunction = `function addToCart() {
            // 檢查是否選擇了變數
            const selectedColorOption = document.querySelector('.color-option.selected, .flavor-option.selected, .variant-option.selected');
            if (!selectedColorOption) {
                alert('請先選擇產品選項！');
                return;
            }
            
            // 獲取選中的變數信息
            const variantId = selectedColorOption.dataset.variantId || 
                             selectedColorOption.dataset.color || 
                             selectedColorOption.dataset.flavor;
            const variantValue = selectedColorOption.textContent.trim() || 
                               selectedColorOption.dataset.color || 
                               selectedColorOption.dataset.flavor;
            
            if (!variantId || !variantValue) {
                alert('無法獲取選中的產品選項，請重新選擇！');
                return;
            }
            
            // 檢查庫存（如果有 StockChecker）
            if (window.StockChecker && window.StockChecker.initialized) {
                const stockInfo = window.StockChecker.checkVariantStock('${productId}', variantId, 'variant');
                if (stockInfo.stock <= 0) {
                    alert(\`很抱歉，\${variantValue} 目前缺貨！\`);
                    return;
                }
            }
            
            const quantity = parseInt(document.getElementById('quantity')?.value || '1');
            
            // 獲取產品基本信息
            const productNameElement = document.querySelector('h1, .product-title, .product-name');
            const productName = productNameElement ? productNameElement.textContent.trim() : '產品';
            
            const priceElement = document.querySelector('.price, .product-price, [class*="price"]');
            let price = 0;
            if (priceElement) {
                const priceText = priceElement.textContent.replace(/[^0-9]/g, '');
                price = parseInt(priceText) || 0;
            }
            
            const product = {
                id: '${productId}',
                name: productName,
                price: price,
                variant: variantValue,
                variantId: variantId,
                quantity: quantity,
                image: document.querySelector('.main-image img, .product-image img')?.src || '',
                category: 'product'
            };
            
            // 加入購物車
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const existingIndex = cart.findIndex(item => 
                item.id === product.id && item.variantId === product.variantId
            );
            
            if (existingIndex > -1) {
                cart[existingIndex].quantity += product.quantity;
            } else {
                cart.push(product);
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // 更新購物車計數
            if (typeof updateCartCount === 'function') {
                updateCartCount();
            }
            
            alert(\`✅ 已將 \${quantity} 個 \${productName} (\${variantValue}) 加入購物車！\`);
        }`;
        
        // 替換函數
        const beforeFunction = content.substring(0, addToCartStart);
        const afterFunction = content.substring(functionEnd + 1);
        
        content = beforeFunction + newAddToCartFunction + afterFunction;
        
        // 寫回文件
        fs.writeFileSync(htmlFile, content, 'utf8');
        console.log('  ✅ addToCart 函數已修復');
        
    } else {
        console.log('  ✅ 無需修復');
    }
    
    console.log('');
});

console.log('🎉 所有產品的 addToCart 函數修復完成！'); 