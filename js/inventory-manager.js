/**
 * 庫存管理系統
 * 管理產品庫存、價格、變數等功能
 */

class InventoryManager {
    constructor() {
        this.products = [];
        this.prices = [];
        this.orders = [];
        this.stockMovements = [];
        this.initialized = false;
    }

    /**
     * 初始化庫存管理系統
     */
    async init() {
        try {
            await this.loadData();
            this.initialized = true;
            console.log('庫存管理系統初始化完成');
        } catch (error) {
            console.error('庫存管理系統初始化失敗:', error);
        }
    }

    /**
     * 載入所有數據
     */
    async loadData() {
        try {
            const [productsResponse, pricesResponse, ordersResponse, movementsResponse] = await Promise.all([
                fetch('/data/products.json'),
                fetch('/data/prices.json'),
                fetch('/data/orders.json'),
                fetch('/data/stock_movements.json')
            ]);

            this.products = (await productsResponse.json()).products || [];
            this.prices = (await pricesResponse.json()).products || [];
            this.orders = (await ordersResponse.json()).orders || [];
            this.stockMovements = (await movementsResponse.json()).movements || [];
        } catch (error) {
            console.error('載入數據失敗:', error);
            // 使用預設空數據
            this.products = [];
            this.prices = [];
            this.orders = [];
            this.stockMovements = [];
        }
    }

    /**
     * 根據產品ID獲取產品信息
     */
    getProduct(productId) {
        return this.products.find(product => product.id === productId);
    }

    /**
     * 根據產品ID獲取價格信息
     */
    getPrice(productId) {
        return this.prices.find(price => price.id === productId);
    }

    /**
     * 獲取產品變數（品相）
     */
    getProductVariants(productId) {
        const product = this.getProduct(productId);
        return product ? product.variants || [] : [];
    }

    /**
     * 根據變數ID獲取特定變數
     */
    getVariant(productId, variantId) {
        const variants = this.getProductVariants(productId);
        return variants.find(variant => variant.id === variantId);
    }

    /**
     * 檢查庫存是否充足
     */
    checkStock(productId, variantId, quantity) {
        const variant = this.getVariant(productId, variantId);
        if (!variant) {
            return { available: false, stock: 0, message: '找不到指定的產品變數' };
        }

        const available = variant.stock >= quantity;
        return {
            available,
            stock: variant.stock,
            message: available ? '庫存充足' : `庫存不足，目前庫存：${variant.stock}`
        };
    }

    /**
     * 計算產品價格（包含批量折扣）
     */
    calculatePrice(productId, quantity) {
        const priceInfo = this.getPrice(productId);
        if (!priceInfo) {
            return { unitPrice: 0, totalPrice: 0, discount: null };
        }

        let unitPrice = priceInfo.price;
        let discount = null;

        // 檢查批量價格
        if (priceInfo.bulkPricing && priceInfo.bulkPricing.length > 0) {
            const applicableBulkPrice = priceInfo.bulkPricing
                .filter(bulk => quantity >= bulk.minQuantity)
                .sort((a, b) => b.minQuantity - a.minQuantity)[0];

            if (applicableBulkPrice) {
                unitPrice = applicableBulkPrice.price;
                discount = {
                    type: 'bulk',
                    originalPrice: priceInfo.price,
                    discountedPrice: unitPrice,
                    minQuantity: applicableBulkPrice.minQuantity
                };
            }
        }

        return {
            unitPrice,
            totalPrice: unitPrice * quantity,
            discount
        };
    }

    /**
     * 更新庫存
     */
    updateStock(productId, variantId, quantity, type = 'out', reason = '', orderId = null) {
        const variant = this.getVariant(productId, variantId);
        if (!variant) {
            throw new Error('找不到指定的產品變數');
        }

        const oldStock = variant.stock;
        let newStock;

        switch (type) {
            case 'in':
                newStock = oldStock + quantity;
                break;
            case 'out':
                newStock = Math.max(0, oldStock - quantity);
                break;
            case 'adjustment':
                newStock = quantity;
                break;
            default:
                throw new Error('無效的庫存異動類型');
        }

        variant.stock = newStock;

        // 記錄庫存異動
        this.recordStockMovement({
            productId,
            variantId,
            type,
            quantity: type === 'adjustment' ? (newStock - oldStock) : quantity,
            reason,
            orderId,
            oldStock,
            newStock
        });

        return { oldStock, newStock };
    }

    /**
     * 記錄庫存異動
     */
    recordStockMovement(movement) {
        const record = {
            id: this.generateId(),
            productId: movement.productId,
            variantId: movement.variantId,
            type: movement.type,
            quantity: movement.quantity,
            reason: movement.reason || '',
            orderId: movement.orderId || null,
            operator: 'system',
            timestamp: new Date().toISOString(),
            notes: `庫存從 ${movement.oldStock} 變更為 ${movement.newStock}`
        };

        this.stockMovements.push(record);
        
        // 同步到 CMS
        this.syncStockMovementToCMS(record);
        
        return record;
    }

    /**
     * 同步庫存異動記錄到 CMS
     */
    async syncStockMovementToCMS(movement) {
        try {
            const response = await fetch('/.netlify/functions/save-stock-movement', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(movement)
            });

            if (!response.ok) {
                throw new Error('庫存異動記錄同步失敗');
            }

            console.log('庫存異動記錄已同步到 CMS:', movement.id);
            return await response.json();
        } catch (error) {
            console.error('同步庫存異動記錄失敗:', error);
            // 不拋出錯誤，避免影響主要業務流程
        }
    }

    /**
     * 處理訂單（扣除庫存）
     */
    processOrder(orderData) {
        const results = [];
        const errors = [];

        // 先檢查所有商品的庫存
        for (const item of orderData.items) {
            const stockCheck = this.checkStock(item.productId, item.variantId, item.quantity);
            if (!stockCheck.available) {
                errors.push({
                    productId: item.productId,
                    variantId: item.variantId,
                    message: stockCheck.message
                });
            }
        }

        if (errors.length > 0) {
            throw new Error(`庫存不足：${errors.map(e => e.message).join(', ')}`);
        }

        // 扣除庫存
        for (const item of orderData.items) {
            try {
                const result = this.updateStock(
                    item.productId,
                    item.variantId,
                    item.quantity,
                    'out',
                    `訂單 ${orderData.orderId}`,
                    orderData.orderId
                );
                results.push({
                    productId: item.productId,
                    variantId: item.variantId,
                    ...result
                });
            } catch (error) {
                errors.push({
                    productId: item.productId,
                    variantId: item.variantId,
                    message: error.message
                });
            }
        }

        return { results, errors };
    }

    /**
     * 創建訂單
     */
    createOrder(orderData) {
        const orderId = orderData.orderId || this.generateOrderId();
        
        // 計算訂單總額
        let subtotal = 0;
        const processedItems = [];

        for (const item of orderData.items) {
            const priceInfo = this.calculatePrice(item.productId, item.quantity);
            const processedItem = {
                ...item,
                unitPrice: priceInfo.unitPrice,
                totalPrice: priceInfo.totalPrice,
                discount: priceInfo.discount
            };
            processedItems.push(processedItem);
            subtotal += priceInfo.totalPrice;
        }

        const order = {
            orderId,
            orderDate: new Date().toISOString(),
            status: 'pending',
            customer: orderData.customer,
            items: processedItems,
            subtotal,
            shipping: orderData.shipping || 0,
            total: subtotal + (orderData.shipping || 0),
            paymentMethod: orderData.paymentMethod || 'cash_on_delivery',
            shippingMethod: orderData.shippingMethod || 'home_delivery',
            notes: orderData.notes || '',
            lastUpdated: new Date().toISOString()
        };

        // 處理庫存
        try {
            this.processOrder(order);
            this.orders.push(order);
            return { success: true, order };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * 獲取庫存報告
     */
    getStockReport() {
        const report = {
            totalProducts: this.products.length,
            lowStockItems: [],
            outOfStockItems: [],
            totalStockValue: 0
        };

        for (const product of this.products) {
            for (const variant of product.variants || []) {
                const priceInfo = this.getPrice(product.id);
                const unitPrice = priceInfo ? priceInfo.price : 0;
                const stockValue = variant.stock * unitPrice;
                
                report.totalStockValue += stockValue;

                if (variant.stock === 0) {
                    report.outOfStockItems.push({
                        productId: product.id,
                        productName: product.name,
                        variantId: variant.id,
                        variantName: variant.value,
                        stock: variant.stock
                    });
                } else if (variant.stock <= 10) { // 低庫存警告線
                    report.lowStockItems.push({
                        productId: product.id,
                        productName: product.name,
                        variantId: variant.id,
                        variantName: variant.value,
                        stock: variant.stock
                    });
                }
            }
        }

        return report;
    }

    /**
     * 生成唯一ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 生成訂單編號
     */
    generateOrderId() {
        const date = new Date();
        const dateStr = date.getFullYear().toString() + 
                       (date.getMonth() + 1).toString().padStart(2, '0') + 
                       date.getDate().toString().padStart(2, '0');
        const timeStr = Date.now().toString().slice(-6);
        return `DV${dateStr}${timeStr}`;
    }

    /**
     * 保存數據到 localStorage（開發用）
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem('inventory_products', JSON.stringify(this.products));
            localStorage.setItem('inventory_orders', JSON.stringify(this.orders));
            localStorage.setItem('inventory_movements', JSON.stringify(this.stockMovements));
            console.log('數據已保存到 localStorage');
        } catch (error) {
            console.error('保存數據失敗:', error);
        }
    }

    /**
     * 從 localStorage 載入數據（開發用）
     */
    loadFromLocalStorage() {
        try {
            const products = localStorage.getItem('inventory_products');
            const orders = localStorage.getItem('inventory_orders');
            const movements = localStorage.getItem('inventory_movements');

            if (products) this.products = JSON.parse(products);
            if (orders) this.orders = JSON.parse(orders);
            if (movements) this.stockMovements = JSON.parse(movements);

            console.log('數據已從 localStorage 載入');
        } catch (error) {
            console.error('載入數據失敗:', error);
        }
    }
}

// 創建全域實例
window.InventoryManager = new InventoryManager();

// 自動初始化
document.addEventListener('DOMContentLoaded', () => {
    window.InventoryManager.init();
});

export default InventoryManager; 