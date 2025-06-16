/**
 * 統一產品管理系統
 * 從各個產品頁面數據文件載入變數信息，支援後台新增變數的實時更新
 */

class ProductManager {
    constructor() {
        this.products = new Map();
        this.productMapping = {
            // 主機系列
            'sp2_device': '/data/page_products/sp2_device.json',
            'ilia_gen1': '/data/page_products/ilia_1.json',
            'ilia_5_device': '/data/page_products/ilia_5_device.json',
            'ilia_ultra5_pods': '/data/page_products/ilia_ultra5_pods.json',
            'ilia_leather': '/data/page_products/ilia_leather.json',
            'ilia_fabric': '/data/page_products/ilia_fabric.json',
            'hta_vape': '/data/page_products/hta_vape.json',
            
            // 煙彈系列
            'ilia_pods': '/data/page_products/ilia_pods.json',
            'sp2_pods': '/data/page_products/sp2_pods.json',
            'hta_pods': '/data/page_products/hta_pods.json',
            'lana_pods': '/data/page_products/lana_pods.json',
            
            // 拋棄式系列
            'ilia_disposable': '/data/page_products/ilia_disposable.json',
            'lana_a8000': '/data/page_products/lana_a8000.json'
        };
        this.initialized = false;
    }

    /**
     * 初始化產品管理系統
     */
    async init() {
        try {
            await this.loadAllProducts();
            this.initialized = true;
            console.log('產品管理系統初始化完成');
            
            // 觸發產品載入完成事件
            window.dispatchEvent(new CustomEvent('productsLoaded', {
                detail: { productManager: this }
            }));
            
            return true;
        } catch (error) {
            console.error('產品管理系統初始化失敗:', error);
            return false;
        }
    }

    /**
     * 載入所有產品數據
     */
    async loadAllProducts() {
        const loadPromises = Object.entries(this.productMapping).map(
            ([productId, dataPath]) => this.loadProduct(productId, dataPath)
        );
        
        await Promise.all(loadPromises);
    }

    /**
     * 載入單個產品數據
     */
    async loadProduct(productId, dataPath) {
        try {
            console.log(`嘗試載入產品數據: ${productId} from ${dataPath}`);
            
            const response = await fetch(dataPath);
            
            if (!response.ok) {
                console.warn(`HTTP ${response.status}: 無法載入產品數據 ${dataPath}`);
                
                // 在 Netlify 上嘗試備用路徑
                const alternativePath = dataPath.startsWith('/') ? dataPath.substring(1) : '/' + dataPath;
                console.log(`嘗試備用路徑: ${alternativePath}`);
                
                const altResponse = await fetch(alternativePath);
                if (altResponse.ok) {
                    const productData = await altResponse.json();
                    this.products.set(productId, productData);
                    console.log(`✅ 已載入產品 (備用路徑): ${productId} (${productData.productName})`);
                    return;
                }
                
                console.error(`❌ 所有路徑都無法載入: ${productId}`);
                return;
            }
            
            const productData = await response.json();
            this.products.set(productId, productData);
            
            console.log(`✅ 已載入產品: ${productId} (${productData.productName})`);
        } catch (error) {
            console.error(`❌ 載入產品 ${productId} 失敗:`, error);
            
            // 提供錯誤詳情
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                console.error('網路錯誤：可能是 CORS 問題或文件不存在');
            }
        }
    }

    /**
     * 獲取產品信息
     */
    getProduct(productId) {
        return this.products.get(productId);
    }

    /**
     * 獲取產品變數列表
     */
    getProductVariants(productId) {
        const product = this.getProduct(productId);
        return product?.variants || [];
    }

    /**
     * 根據變數ID獲取特定變數
     */
    getVariant(productId, variantId) {
        const variants = this.getProductVariants(productId);
        return variants.find(variant => variant.id === variantId);
    }

    /**
     * 獲取產品價格
     */
    getProductPrice(productId) {
        const product = this.getProduct(productId);
        return {
            price: product?.price || 0,
            originalPrice: product?.originalPrice || null,
            discount: product?.discount || null
        };
    }

    /**
     * 檢查庫存是否充足
     */
    checkStock(productId, variantId, quantity) {
        const variant = this.getVariant(productId, variantId);
        if (!variant) {
            return { 
                available: false, 
                stock: 0, 
                message: '找不到指定的產品變數' 
            };
        }

        const available = variant.stock >= quantity;
        return {
            available,
            stock: variant.stock,
            message: available ? '庫存充足' : `庫存不足，目前庫存：${variant.stock}`
        };
    }

    /**
     * 計算總庫存
     */
    getTotalStock(productId) {
        const variants = this.getProductVariants(productId);
        return variants.reduce((total, variant) => total + (variant.stock || 0), 0);
    }

    /**
     * 獲取庫存狀態
     */
    getStockStatus(productId) {
        const totalStock = this.getTotalStock(productId);
        
        if (totalStock === 0) {
            return { status: 'out-of-stock', label: '缺貨', class: 'out-of-stock' };
        } else if (totalStock <= 10) {
            return { status: 'low-stock', label: '低庫存', class: 'low-stock' };
        } else {
            return { status: 'in-stock', label: '現貨', class: 'in-stock' };
        }
    }

    /**
     * 更新變數庫存
     */
    updateVariantStock(productId, variantId, newStock) {
        const variant = this.getVariant(productId, variantId);
        if (variant) {
            const oldStock = variant.stock;
            variant.stock = newStock;
            
            console.log(`更新庫存: ${productId}/${variantId} ${oldStock} → ${newStock}`);
            return { success: true, oldStock, newStock };
        }
        
        return { success: false, message: '找不到指定的變數' };
    }

    /**
     * 減少庫存（用於下單）
     */
    reduceStock(productId, variantId, quantity) {
        const variant = this.getVariant(productId, variantId);
        if (!variant) {
            return { success: false, message: '找不到指定的變數' };
        }

        if (variant.stock < quantity) {
            return { success: false, message: '庫存不足' };
        }

        const oldStock = variant.stock;
        variant.stock -= quantity;
        
        console.log(`減少庫存: ${productId}/${variantId} ${oldStock} → ${variant.stock}`);
        return { success: true, oldStock, newStock: variant.stock };
    }

    /**
     * 重新載入特定產品（用於實時更新）
     */
    async reloadProduct(productId) {
        const dataPath = this.productMapping[productId];
        if (dataPath) {
            await this.loadProduct(productId, dataPath);
            return true;
        }
        return false;
    }

    /**
     * 重新載入所有產品
     */
    async reloadAllProducts() {
        await this.loadAllProducts();
    }

    /**
     * 獲取所有產品列表
     */
    getAllProducts() {
        const productList = [];
        for (const [productId, productData] of this.products) {
            productList.push({
                id: productId,
                name: productData.productName,
                price: productData.price,
                originalPrice: productData.originalPrice,
                discount: productData.discount,
                variants: productData.variants || [],
                totalStock: this.getTotalStock(productId),
                status: this.getStockStatus(productId)
            });
        }
        return productList;
    }

    /**
     * 搜索產品變數
     */
    searchVariants(productId, searchTerm) {
        const variants = this.getProductVariants(productId);
        if (!searchTerm) return variants;
        
        const term = searchTerm.toLowerCase();
        return variants.filter(variant => 
            variant.name?.toLowerCase().includes(term) ||
            variant.value?.toLowerCase().includes(term)
        );
    }

    /**
     * 獲取產品統計信息
     */
    getProductStats(productId) {
        const product = this.getProduct(productId);
        if (!product) return null;

        const variants = product.variants || [];
        const totalStock = this.getTotalStock(productId);
        const inStockVariants = variants.filter(v => v.stock > 0).length;
        const outOfStockVariants = variants.filter(v => v.stock === 0).length;

        return {
            productName: product.productName,
            totalVariants: variants.length,
            inStockVariants,
            outOfStockVariants,
            totalStock,
            averageStock: variants.length > 0 ? Math.round(totalStock / variants.length) : 0,
            status: this.getStockStatus(productId)
        };
    }

    /**
     * 驗證產品數據完整性
     */
    validateProductData(productId) {
        const product = this.getProduct(productId);
        if (!product) {
            return { valid: false, errors: ['產品不存在'] };
        }

        const errors = [];
        
        if (!product.productName) errors.push('缺少產品名稱');
        if (!product.price || product.price <= 0) errors.push('價格無效');
        if (!product.variants || product.variants.length === 0) errors.push('沒有產品變數');
        
        product.variants?.forEach((variant, index) => {
            if (!variant.id) errors.push(`變數 ${index + 1} 缺少 ID`);
            if (!variant.name) errors.push(`變數 ${index + 1} 缺少名稱`);
            if (!variant.value) errors.push(`變數 ${index + 1} 缺少值`);
            if (typeof variant.stock !== 'number') errors.push(`變數 ${index + 1} 庫存數據無效`);
        });

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

// 創建全域實例
window.ProductManager = new ProductManager();

// 自動初始化
document.addEventListener('DOMContentLoaded', async () => {
    console.log('開始初始化產品管理系統...');
    await window.ProductManager.init();
});

// 導出類別供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductManager;
} 