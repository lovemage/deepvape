/**
 * 訂單管理系統
 * 處理訂單創建、狀態更新、與庫存系統整合
 */

class OrderManager {
    constructor() {
        this.orders = [];
        this.initialized = false;
    }

    /**
     * 初始化訂單管理系統
     */
    async init() {
        try {
            await this.loadOrders();
            this.initialized = true;
            console.log('訂單管理系統初始化完成');
        } catch (error) {
            console.error('訂單管理系統初始化失敗:', error);
        }
    }

    /**
     * 載入訂單數據
     */
    async loadOrders() {
        try {
            const response = await fetch('/data/orders.json');
            const data = await response.json();
            this.orders = data.orders || [];
        } catch (error) {
            console.error('載入訂單數據失敗:', error);
            this.orders = [];
        }
    }

    /**
     * 從購物車創建訂單
     */
    async createOrderFromCart(customerInfo, shippingInfo, paymentInfo) {
        try {
            // 獲取購物車內容
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            if (cart.length === 0) {
                throw new Error('購物車為空');
            }

            console.log('📦 處理購物車商品:', cart);

            // 準備訂單商品數據（簡化版本，不依賴複雜的庫存檢查）
            const orderItems = [];
            let subtotal = 0;

            for (const cartItem of cart) {
                const orderItem = {
                    productId: cartItem.id || cartItem.productId,
                    productName: cartItem.name,
                    variant: this.getVariantDisplay(cartItem),
                    variantId: this.getVariantId(cartItem),
                    quantity: cartItem.quantity,
                    unitPrice: cartItem.price,
                    totalPrice: cartItem.price * cartItem.quantity,
                    image: cartItem.image
                };

                orderItems.push(orderItem);
                subtotal += orderItem.totalPrice;
            }

            // 計算運費
            const shipping = this.calculateShipping(shippingInfo.method, subtotal);
            const total = subtotal + shipping;

            // 生成訂單ID
            const orderId = this.generateOrderId();

            // 創建完整訂單數據
            const order = {
                orderId: orderId,
                orderDate: new Date().toISOString(),
                status: 'pending',
                customer: {
                    name: customerInfo.name,
                    phone: customerInfo.phone,
                    email: customerInfo.email || '',
                    address: shippingInfo.address || '',
                    notes: customerInfo.notes || ''
                },
                store: shippingInfo.store || {
                    id: 'unknown',
                    name: '未指定門市',
                    address: '未指定地址'
                },
                items: orderItems,
                subtotal: subtotal,
                shipping: shipping,
                total: total,
                paymentMethod: paymentInfo.method,
                shippingMethod: shippingInfo.method,
                notes: shippingInfo.notes || '',
                lastUpdated: new Date().toISOString()
            };

            console.log('📋 創建的訂單數據:', order);

            // 保存訂單到本地存儲
            this.saveOrderToLocalStorage(order);
            
            // 嘗試同步到 Netlify CMS
            try {
                await this.syncOrderToCMS(order);
                console.log('✅ 訂單已同步到後端');
            } catch (syncError) {
                console.warn('⚠️ 訂單同步失敗，但已保存到本地:', syncError);
                // 不拋出錯誤，因為訂單已經創建成功
            }

            return {
                success: true,
                order: order,
                message: '訂單創建成功'
            };

        } catch (error) {
            console.error('❌ 創建訂單失敗:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 獲取產品變數ID
     */
    getVariantId(cartItem) {
        // 根據產品類型和選擇的變數生成變數ID
        const productId = cartItem.id || cartItem.productId;
        
        if (cartItem.color) {
            return `${productId}_${cartItem.color.replace(/\s+/g, '_').toLowerCase()}`;
        } else if (cartItem.flavor) {
            return `${productId}_${cartItem.flavor.replace(/\s+/g, '_').toLowerCase()}`;
        }
        
        // 如果沒有變數，使用預設變數
        return `${productId}_default`;
    }

    /**
     * 獲取變數顯示文字
     */
    getVariantDisplay(cartItem) {
        if (cartItem.color) return cartItem.color;
        if (cartItem.flavor) return cartItem.flavor;
        return '標準版';
    }

    /**
     * 計算運費
     */
    calculateShipping(shippingMethod, subtotal) {
        switch (shippingMethod) {
            case 'convenience_store':
                return subtotal >= 1000 ? 0 : 60; // 滿千免運
            case 'home_delivery':
                return subtotal >= 1500 ? 0 : 100; // 滿1500免運
            case 'pickup':
                return 0;
            default:
                return 100;
        }
    }

    /**
     * 保存訂單到本地存儲
     */
    saveOrderToLocalStorage(order) {
        try {
            const existingOrders = JSON.parse(localStorage.getItem('pending_orders') || '[]');
            existingOrders.push(order);
            localStorage.setItem('pending_orders', JSON.stringify(existingOrders));
        } catch (error) {
            console.error('保存訂單到本地存儲失敗:', error);
        }
    }

    /**
     * 同步訂單到 Netlify CMS
     */
    async syncOrderToCMS(order) {
        try {
            console.log('開始同步訂單到 CMS:', order.orderId);
            
            // 發送到 Netlify Functions 進行數據庫更新
            const result = await this.sendOrderToAPI(order);
            console.log('訂單同步成功:', result);
            
            return true;
        } catch (error) {
            console.error('同步訂單到 CMS 失敗:', error);
            
            // 如果同步失敗，至少保存到本地存儲
            console.log('訂單同步失敗，已保存到本地存儲等待重試');
            return false;
        }
    }

    /**
     * 發送訂單到後端 API（如果有的話）
     */
    async sendOrderToAPI(order) {
        try {
            const response = await fetch('/.netlify/functions/save-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(order)
            });

            if (!response.ok) {
                throw new Error('API 請求失敗');
            }

            return await response.json();
        } catch (error) {
            console.error('發送訂單到 API 失敗:', error);
            throw error;
        }
    }

    /**
     * 獲取訂單狀態
     */
    getOrderStatus(orderId) {
        const order = this.orders.find(o => o.orderId === orderId);
        return order ? order.status : null;
    }

    /**
     * 更新訂單狀態
     */
    updateOrderStatus(orderId, status, notes = '') {
        const order = this.orders.find(o => o.orderId === orderId);
        if (order) {
            order.status = status;
            order.lastUpdated = new Date().toISOString();
            if (notes) {
                order.notes = (order.notes || '') + '\n' + notes;
            }
            return true;
        }
        return false;
    }

    /**
     * 獲取客戶訂單歷史
     */
    getCustomerOrders(phone) {
        return this.orders.filter(order => order.customer.phone === phone);
    }

    /**
     * 生成訂單確認頁面數據
     */
    generateOrderConfirmationData(order) {
        return {
            orderId: order.orderId,
            orderDate: new Date(order.orderDate).toLocaleDateString('zh-TW'),
            customer: order.customer,
            items: order.items,
            subtotal: order.subtotal,
            shipping: order.shipping,
            total: order.total,
            paymentMethod: this.getPaymentMethodText(order.paymentMethod),
            shippingMethod: this.getShippingMethodText(order.shippingMethod),
            status: this.getStatusText(order.status)
        };
    }

    /**
     * 獲取付款方式文字
     */
    getPaymentMethodText(method) {
        const methods = {
            'cash_on_delivery': '貨到付款',
            'bank_transfer': '銀行轉帳',
            'credit_card': '信用卡',
            'line_pay': 'LINE Pay'
        };
        return methods[method] || method;
    }

    /**
     * 獲取配送方式文字
     */
    getShippingMethodText(method) {
        const methods = {
            'home_delivery': '宅配到府',
            'convenience_store': '超商取貨',
            'pickup': '自取'
        };
        return methods[method] || method;
    }

    /**
     * 獲取訂單狀態文字
     */
    getStatusText(status) {
        const statuses = {
            'pending': '待處理',
            'processing': '處理中',
            'shipped': '已出貨',
            'delivered': '已送達',
            'cancelled': '已取消'
        };
        return statuses[status] || status;
    }

    /**
     * 驗證客戶信息
     */
    validateCustomerInfo(customerInfo) {
        const errors = [];

        if (!customerInfo.name || customerInfo.name.trim().length < 2) {
            errors.push('請輸入正確的姓名');
        }

        if (!customerInfo.phone || !/^09\d{8}$/.test(customerInfo.phone)) {
            errors.push('請輸入正確的手機號碼');
        }

        if (customerInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
            errors.push('請輸入正確的電子郵件');
        }

        return errors;
    }

    /**
     * 驗證配送信息
     */
    validateShippingInfo(shippingInfo) {
        const errors = [];

        if (!shippingInfo.method) {
            errors.push('請選擇配送方式');
        }

        if (shippingInfo.method === 'home_delivery' && !shippingInfo.address) {
            errors.push('宅配到府需要填寫地址');
        }

        return errors;
    }

    /**
     * 驗證付款信息
     */
    validatePaymentInfo(paymentInfo) {
        const errors = [];

        if (!paymentInfo.method) {
            errors.push('請選擇付款方式');
        }

        return errors;
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
}

// 創建全域實例
window.OrderManager = new OrderManager();

// 自動初始化
document.addEventListener('DOMContentLoaded', () => {
    window.OrderManager.init();
});

export default OrderManager; 