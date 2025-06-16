/**
 * 批量修復產品頁面加入購物車邏輯
 * 解決多餘彈窗問題，簡化購物流程
 */

const fs = require('fs');
const path = require('path');

// 產品頁面文件列表
const PRODUCT_FILES = [
    'ilia_1_product.html',
    'ilia_fabric_product.html', 
    'ilia_leather_product.html',
    'ilia_5_product.html',
    'ilia_pods_product.html',
    'ilia_ultra5_pods_product.html',
    'ilia_disposable_product.html',
    'hta_vape_product.html',
    'hta_pods_product.html',
    'sp2_product.html',
    'sp2_pods_product.html',
    'lana_pods_product.html',
    'lana_a8000_product.html'
];

// 產品ID映射
const PRODUCT_ID_MAPPING = {
    'ilia_1_product.html': 'ilia_1_product',
    'ilia_fabric_product.html': 'ilia_fabric_product',
    'ilia_leather_product.html': 'ilia_leather_product',
    'ilia_5_product.html': 'ilia_5_product',
    'ilia_pods_product.html': 'ilia_pods_product',
    'ilia_ultra5_pods_product.html': 'ilia_ultra5_pods_product',
    'ilia_disposable_product.html': 'ilia_disposable_product',
    'hta_vape_product.html': 'hta_vape_product',
    'hta_pods_product.html': 'hta_pods_product',
    'sp2_product.html': 'sp2_device_product',
    'sp2_pods_product.html': 'sp2_pods_product',
    'lana_pods_product.html': 'lana_pods_product',
    'lana_a8000_product.html': 'lana_a8000_product'
};

// 圖片路徑映射
const IMAGE_MAPPING = {
    'ilia_1_product': '/ilia_1/ilia_1_main.webp',
    'ilia_fabric_product': '/ilia_fabric/ilia_fabric_main.webp',
    'ilia_leather_product': '/ilia_leather/ilia_leather_main.webp',
    'ilia_5_product': '/ilia_5/ilia_5_main.webp',
    'ilia_pods_product': '/ilia_pods/ilia_pods_main.webp',
    'ilia_ultra5_pods_product': '/ilia_ultra5_pods/ilia_ultra5_pods_main.webp',
    'ilia_disposable_product': '/ilia_disposable/ilia_disposable_main.webp',
    'hta_vape_product': '/hta_vape/hta_vape_main.webp',
    'hta_pods_product': '/hta_pods/hta_pods_main.webp',
    'sp2_device_product': '/sp2_v/sp2_device_main_showcase.jpg',
    'sp2_pods_product': '/sp2_pods/sp2_pods_main.webp',
    'lana_pods_product': '/lana_pods/lana_pods_main.webp',
    'lana_a8000_product': '/lana_a8000/lana_a8000_main.webp'
};

/**
 * 修復單個產品文件
 */
function fixProductFile(filename) {
    const filePath = path.join(__dirname, filename);
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ 文件不存在: ${filename}`);
        return false;
    }
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let hasChanges = false;
        
        const productId = PRODUCT_ID_MAPPING[filename];
        const imagePath = IMAGE_MAPPING[productId];
        
        // 1. 修復產品ID
        const oldIdPatterns = [
            /id: ['"]ilia_gen1['"]/g,
            /id: ['"]ilia_pods['"]/g,
            /id: ['"]sp2_host['"]/g,
            /id: ['"]hta_vape['"]/g,
            /id: ['"]lana_pods['"]/g
        ];
        
        oldIdPatterns.forEach(pattern => {
            if (pattern.test(content)) {
                content = content.replace(pattern, `id: '${productId}'`);
                hasChanges = true;
            }
        });
        
        // 2. 修復圖片路徑
        if (imagePath) {
            const imagePatterns = [
                /image: ['"][^'"]*['"]/g
            ];
            
            imagePatterns.forEach(pattern => {
                const matches = content.match(pattern);
                if (matches) {
                    matches.forEach(match => {
                        if (!match.includes(imagePath)) {
                            content = content.replace(match, `image: '${imagePath}'`);
                            hasChanges = true;
                        }
                    });
                }
            });
        }
        
        // 3. 統一成功訊息格式
        const alertPatterns = [
            /alert\(`已將[^`]*加入購物車！`\)/g,
            /alert\('已將[^']*加入購物車！'\)/g
        ];
        
        alertPatterns.forEach(pattern => {
            content = content.replace(pattern, (match) => {
                if (!match.includes('✅')) {
                    const newMatch = match.replace('已將', '✅ 已將');
                    hasChanges = true;
                    return newMatch;
                }
                return match;
            });
        });
        
        // 4. 確保有 variant 字段
        const productObjectPattern = /const\s+(?:product|cartItem)\s*=\s*{[^}]*}/g;
        content = content.replace(productObjectPattern, (match) => {
            if (match.includes('color:') && !match.includes('variant:')) {
                const colorMatch = match.match(/color:\s*([^,}]+)/);
                if (colorMatch) {
                    const colorValue = colorMatch[1];
                    const newMatch = match.replace(colorMatch[0], `${colorMatch[0]},\n                variant: ${colorValue}`);
                    hasChanges = true;
                    return newMatch;
                }
            } else if (match.includes('flavor:') && !match.includes('variant:')) {
                const flavorMatch = match.match(/flavor:\s*([^,}]+)/);
                if (flavorMatch) {
                    const flavorValue = flavorMatch[1];
                    const newMatch = match.replace(flavorMatch[0], `${flavorMatch[0]},\n                variant: ${flavorValue}`);
                    hasChanges = true;
                    return newMatch;
                }
            }
            return match;
        });
        
        if (hasChanges) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ 已修復: ${filename}`);
            return true;
        } else {
            console.log(`⚪ 無需修改: ${filename}`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ 修復失敗 ${filename}:`, error.message);
        return false;
    }
}

/**
 * 批量修復所有產品文件
 */
function fixAllProducts() {
    console.log('🔧 開始批量修復產品頁面加入購物車邏輯...\n');
    
    let successCount = 0;
    let totalCount = PRODUCT_FILES.length;
    
    PRODUCT_FILES.forEach(filename => {
        if (fixProductFile(filename)) {
            successCount++;
        }
    });
    
    console.log(`\n🎉 修復完成！`);
    console.log(`✅ 成功修復: ${successCount} 個文件`);
    console.log(`⚪ 無需修改: ${totalCount - successCount} 個文件`);
    console.log(`📁 總計處理: ${totalCount} 個文件`);
}

// 執行修復
if (require.main === module) {
    fixAllProducts();
}

module.exports = {
    fixProductFile,
    fixAllProducts
}; 