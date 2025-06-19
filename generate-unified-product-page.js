/**
 * DeepVape 統一產品頁面生成器
 * 將現有產品頁面轉換為統一框架格式
 */

const fs = require('fs').promises;
const path = require('path');

// 產品配置映射
const productConfigs = {
    'ilia_1_product': {
        theme: 'ilia',
        productName: 'ILIA 一代主機',
        productSubtitle: '7W~8W功率 • 450mAH電池 • TYPE-C充電',
        productPrice: 650,
        productDescription: 'ILIA 一代主機，極致口感體驗，多色選擇',
        productKeywords: 'ILIA, 一代主機, 電子煙, 主機, 多色選擇',
        productImagePath: 'ilia_1/ilia_gen1_main_device.jpg',
        variantTitle: '選擇顏色',
        variantType: '顏色',
        productFeatures: `
            <ul class="feature-list">
                <li>7W~8W 穩定功率輸出</li>
                <li>450mAH 大容量電池</li>
                <li>TYPE-C 快速充電</li>
                <li>通用一代煙彈設計</li>
                <li>多種顏色選擇</li>
                <li>三天非人為損壞保固</li>
            </ul>
        `,
        productSpecifications: `
            <li><span class="spec-label">功率</span><span class="spec-value">7W~8W</span></li>
            <li><span class="spec-label">電池容量</span><span class="spec-value">450mAH</span></li>
            <li><span class="spec-label">充電規格</span><span class="spec-value">TYPE-C 5V/1A</span></li>
            <li><span class="spec-label">材質</span><span class="spec-value">通用一代煙彈產品</span></li>
            <li><span class="spec-label">保固</span><span class="spec-value">購買起三天內非人為損壞</span></li>
        `,
        productHighlights: `
            <div class="highlights-grid">
                <div class="highlight-card">
                    <h4>穩定功率</h4>
                    <p>7W~8W 穩定功率輸出，確保每一口都有完美體驗</p>
                </div>
                <div class="highlight-card">
                    <h4>長效續航</h4>
                    <p>450mAH 大容量電池，滿足全天使用需求</p>
                </div>
                <div class="highlight-card">
                    <h4>快速充電</h4>
                    <p>TYPE-C 接口，充電更快更方便</p>
                </div>
            </div>
        `
    },
    'sp2_pods_product': {
        theme: 'sp2',
        productName: '思博瑞 SP2 煙彈',
        productSubtitle: '36種口味選擇 • 2.0ML大容量 • 3%尼古丁含量',
        productPrice: 350,
        productDescription: 'SP2 煙彈，36種豐富口味，2.0ML大容量，極致口感體驗',
        productKeywords: 'SP2, 煙彈, 電子煙, 36種口味, 思博瑞',
        productImagePath: 'sp2_pods/sp2_pods_main.webp',
        variantTitle: '選擇口味',
        variantType: '口味',
        productFeatures: `
            <ul class="feature-list">
                <li>36種豐富口味選擇</li>
                <li>2.0ML大容量設計</li>
                <li>3%尼古丁含量</li>
                <li>一盒三入裝</li>
                <li>優質霧化體驗</li>
                <li>食品級材質安全</li>
            </ul>
        `,
        productSpecifications: `
            <li><span class="spec-label">品牌</span><span class="spec-value">思博瑞 SP2</span></li>
            <li><span class="spec-label">容量</span><span class="spec-value">2.0ML</span></li>
            <li><span class="spec-label">尼古丁含量</span><span class="spec-value">3%</span></li>
            <li><span class="spec-label">包裝規格</span><span class="spec-value">一盒三入</span></li>
            <li><span class="spec-label">口味數量</span><span class="spec-value">36種口味</span></li>
            <li><span class="spec-label">材質</span><span class="spec-value">食品級安全材質</span></li>
        `,
        productHighlights: `
            <div class="highlights-grid">
                <div class="highlight-card">
                    <h4>豐富口味</h4>
                    <p>36種精選口味，滿足不同喜好需求</p>
                </div>
                <div class="highlight-card">
                    <h4>大容量設計</h4>
                    <p>2.0ML 大容量，更持久的使用體驗</p>
                </div>
                <div class="highlight-card">
                    <h4>安全材質</h4>
                    <p>食品級材質，安全可靠有保障</p>
                </div>
            </div>
        `
    },
    'ilia_ultra5_pods_product': {
        theme: 'ilia',
        productName: 'ILIA Ultra5 煙彈',
        productSubtitle: '23種口味選擇 • 2.0ML大容量 • 五代通用設計',
        productPrice: 320,
        productDescription: 'ILIA Ultra5 煙彈，23種豐富口味，五代通用設計，黑色油杯設計',
        productKeywords: 'ILIA Ultra5, 煙彈, 電子煙, 23種口味, 五代通用',
        productImagePath: 'ilia_pod5/ilia-pod5.jpg',
        variantTitle: '選擇口味',
        variantType: '口味',
        productFeatures: `
            <ul class="feature-list">
                <li>23種精選口味</li>
                <li>2.0ML大容量設計</li>
                <li>3%尼古丁含量</li>
                <li>五代通用設計</li>
                <li>膠囊型包裝</li>
                <li>黑色油杯設計</li>
            </ul>
        `,
        productSpecifications: `
            <li><span class="spec-label">品牌</span><span class="spec-value">ILIA Ultra5</span></li>
            <li><span class="spec-label">容量</span><span class="spec-value">2.0ML</span></li>
            <li><span class="spec-label">尼古丁含量</span><span class="spec-value">3%</span></li>
            <li><span class="spec-label">包裝規格</span><span class="spec-value">膠囊型包裝</span></li>
            <li><span class="spec-label">口味數量</span><span class="spec-value">23種口味</span></li>
            <li><span class="spec-label">適用設備</span><span class="spec-value">五代通用設計</span></li>
        `,
        productHighlights: `
            <div class="highlights-grid">
                <div class="highlight-card">
                    <h4>五代通用</h4>
                    <p>與五代主機完美兼容，無縫體驗</p>
                </div>
                <div class="highlight-card">
                    <h4>膠囊包裝</h4>
                    <p>獨特膠囊型包裝，保鮮更持久</p>
                </div>
                <div class="highlight-card">
                    <h4>黑色油杯</h4>
                    <p>黑色油杯設計，時尚美觀更有質感</p>
                </div>
            </div>
        `
    }
    // 可以繼續添加其他產品...
};

// 讀取模板文件
async function readTemplate() {
    try {
        return await fs.readFile('product-template.html', 'utf8');
    } catch (error) {
        console.error('❌ 無法讀取模板文件:', error.message);
        throw error;
    }
}

// 替換模板變數
function replaceTemplateVariables(template, config) {
    let result = template;
    
    // 基本變數替換
    const replacements = {
        '{PRODUCT_THEME}': config.theme,
        '{PRODUCT_TITLE}': config.productName,
        '{PRODUCT_NAME}': config.productName,
        '{PRODUCT_SUBTITLE}': config.productSubtitle,
        '{PRODUCT_PRICE}': config.productPrice,
        '{PRODUCT_DESCRIPTION}': config.productDescription,
        '{PRODUCT_KEYWORDS}': config.productKeywords,
        '{PRODUCT_IMAGE_PATH}': config.productImagePath,
        '{PRODUCT_IMAGE}': config.productImagePath,
        '{PRODUCT_PAGE_URL}': `${config.productId}.html`,
        '{PRODUCT_ID}': config.productId,
        '{VARIANT_TITLE}': config.variantTitle,
        '{VARIANT_TYPE}': config.variantType,
        '{PRODUCT_FEATURES}': config.productFeatures,
        '{PRODUCT_SPECIFICATIONS}': config.productSpecifications,
        '{PRODUCT_HIGHLIGHTS}': config.productHighlights
    };
    
    // 執行替換
    for (const [placeholder, value] of Object.entries(replacements)) {
        result = result.replace(new RegExp(placeholder, 'g'), value);
    }
    
    return result;
}

// 生成單個產品頁面
async function generateProductPage(productId, config) {
    try {
        console.log(`🔄 生成 ${productId} 產品頁面...`);
        
        const template = await readTemplate();
        const fullConfig = {
            productId,
            ...config
        };
        
        const pageContent = replaceTemplateVariables(template, fullConfig);
        const outputPath = `${productId}_unified.html`;
        
        await fs.writeFile(outputPath, pageContent, 'utf8');
        
        console.log(`✅ ${productId} 頁面已生成: ${outputPath}`);
        return outputPath;
    } catch (error) {
        console.error(`❌ 生成 ${productId} 頁面失敗:`, error.message);
        throw error;
    }
}

// 生成所有產品頁面
async function generateAllPages() {
    console.log('🚀 開始生成統一格式的產品頁面...\n');
    
    const generatedFiles = [];
    
    for (const [productId, config] of Object.entries(productConfigs)) {
        try {
            const filePath = await generateProductPage(productId, config);
            generatedFiles.push(filePath);
        } catch (error) {
            console.error(`跳過 ${productId}:`, error.message);
        }
    }
    
    console.log(`\n🎉 完成！共生成 ${generatedFiles.length} 個產品頁面:`);
    generatedFiles.forEach(file => console.log(`   - ${file}`));
    
    console.log('\n📝 下一步驟:');
    console.log('1. 檢查生成的頁面是否正確');
    console.log('2. 測試變數選擇器功能');
    console.log('3. 確認響應式設計');
    console.log('4. 備份舊頁面後替換');
}

// 備份現有頁面
async function backupExistingPages() {
    console.log('📁 備份現有產品頁面...');
    
    for (const productId of Object.keys(productConfigs)) {
        try {
            const originalFile = `${productId}.html`;
            const backupFile = `${productId}_backup_${Date.now()}.html`;
            
            await fs.copyFile(originalFile, backupFile);
            console.log(`✅ 已備份: ${originalFile} -> ${backupFile}`);
        } catch (error) {
            console.log(`⚠️ 無法備份 ${productId}.html (可能不存在)`);
        }
    }
}

// 主要執行函數
async function main() {
    try {
        console.log('🎯 DeepVape 產品頁面統一化工具\n');
        
        // 檢查模板文件是否存在
        try {
            await fs.access('product-template.html');
        } catch {
            console.error('❌ 找不到 product-template.html 模板文件');
            console.log('請確保模板文件存在於當前目錄');
            return;
        }
        
        // 備份現有頁面
        await backupExistingPages();
        console.log('');
        
        // 生成新頁面
        await generateAllPages();
        
    } catch (error) {
        console.error('❌ 執行失敗:', error.message);
        process.exit(1);
    }
}

// 如果是直接執行此腳本
if (require.main === module) {
    main();
}

module.exports = {
    generateProductPage,
    generateAllPages,
    productConfigs
}; 