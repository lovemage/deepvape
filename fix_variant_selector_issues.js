/**
 * 修復產品頁面變數選擇器問題
 * 統一產品ID和修復初始化邏輯
 */

const fs = require('fs');
const path = require('path');

// 需要修復的產品文件和對應的正確產品ID
const FIXES = [
    {
        file: 'ilia_fabric_product.html',
        oldId: 'ilia_fabric',
        newId: 'ilia_fabric_product',
        productName: 'ILIA 布紋主機'
    },
    {
        file: 'hta_vape_product.html',
        oldId: 'hta_vape',
        newId: 'hta_vape_product',
        productName: 'HTA 黑桃主機'
    },
    {
        file: 'ilia_pods_product.html',
        oldId: 'ilia_pods',
        newId: 'ilia_pods_product',
        productName: 'ILIA 發光煙彈'
    },
    {
        file: 'sp2_pods_product.html',
        oldId: 'sp2_pods',
        newId: 'sp2_pods_product',
        productName: 'SP2 煙彈'
    }
];

/**
 * 修復單個產品文件
 */
function fixProductFile(fix) {
    const filePath = path.join(__dirname, fix.file);
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ 文件不存在: ${fix.file}`);
        return false;
    }
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let hasChanges = false;
        
        // 1. 修復 VariantSelector 初始化中的產品ID
        const variantSelectorPattern = new RegExp(`new VariantSelector\\('${fix.oldId}'`, 'g');
        if (variantSelectorPattern.test(content)) {
            content = content.replace(variantSelectorPattern, `new VariantSelector('${fix.newId}'`);
            hasChanges = true;
            console.log(`✅ 修復 ${fix.file} 的 VariantSelector 產品ID`);
        }
        
        // 2. 修復產品物件中的ID
        const productIdPattern = new RegExp(`id: '${fix.oldId}'`, 'g');
        if (productIdPattern.test(content)) {
            content = content.replace(productIdPattern, `id: '${fix.newId}'`);
            hasChanges = true;
            console.log(`✅ 修復 ${fix.file} 的產品物件ID`);
        }
        
        // 3. 修復 productId 變數
        const productIdVarPattern = new RegExp(`const productId = '${fix.oldId}'`, 'g');
        if (productIdVarPattern.test(content)) {
            content = content.replace(productIdVarPattern, `const productId = '${fix.newId}'`);
            hasChanges = true;
            console.log(`✅ 修復 ${fix.file} 的 productId 變數`);
        }
        
        // 4. 確保產品物件有 variant 字段（針對有 flavor 的產品）
        if (fix.file.includes('pods')) {
            const flavorPattern = /flavor: selectedVariant\.value,(?!\s*variant:)/g;
            if (flavorPattern.test(content)) {
                content = content.replace(flavorPattern, 'flavor: selectedVariant.value,\n                variant: selectedVariant.value,');
                hasChanges = true;
                console.log(`✅ 修復 ${fix.file} 的 variant 字段`);
            }
        } else {
            // 針對有 color 的產品
            const colorPattern = /color: selectedVariant\.value,(?!\s*variant:)/g;
            if (colorPattern.test(content)) {
                content = content.replace(colorPattern, 'color: selectedVariant.value,\n                variant: selectedVariant.value,');
                hasChanges = true;
                console.log(`✅ 修復 ${fix.file} 的 variant 字段`);
            }
        }
        
        if (hasChanges) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ 已修復: ${fix.file}`);
            return true;
        } else {
            console.log(`⚪ 無需修改: ${fix.file}`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ 修復失敗 ${fix.file}:`, error.message);
        return false;
    }
}

/**
 * 修復所有產品文件
 */
function fixAllVariantSelectors() {
    console.log('🔧 開始修復產品頁面變數選擇器問題...\n');
    
    let successCount = 0;
    
    FIXES.forEach(fix => {
        console.log(`\n🔍 檢查 ${fix.file}...`);
        if (fixProductFile(fix)) {
            successCount++;
        }
    });
    
    console.log(`\n🎉 修復完成！`);
    console.log(`✅ 成功修復: ${successCount} 個文件`);
    console.log(`⚪ 無需修改: ${FIXES.length - successCount} 個文件`);
}

// 執行修復
if (require.main === module) {
    fixAllVariantSelectors();
}

module.exports = {
    fixProductFile,
    fixAllVariantSelectors
}; 