const express = require('express');
const cors = require('cors');
const { Client } = require('@googlemaps/google-maps-services-js');

const app = express();
const port = 3000;

// 中間件
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // 提供靜態檔案

// Google Maps API客戶端
const googleMapsClient = new Client({});
const GOOGLE_MAPS_API_KEY = '***REMOVED***';

// 模擬資料庫
let carts = new Map(); // 購物車資料
let stores = new Map(); // 門市資料快取

class CartAPI {
    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        // 獲取購物車資訊
        app.get('/api/cart/:cartId', (req, res) => {
            const { cartId } = req.params;
            const cart = carts.get(cartId) || this.createNewCart(cartId);
            res.json(cart);
        });

        // 設定取貨門市
        app.post('/api/cart/store', async (req, res) => {
            try {
                const { selectedStore, cartId } = req.body;
                
                if (!selectedStore || !cartId) {
                    return res.status(400).json({ 
                        error: '缺少必要參數：selectedStore 或 cartId' 
                    });
                }

                // 驗證門市資訊
                const validatedStore = await this.validateStore(selectedStore);
                
                // 更新購物車
                let cart = carts.get(cartId) || this.createNewCart(cartId);
                cart.selectedStore = validatedStore;
                cart.updatedAt = new Date().toISOString();
                
                carts.set(cartId, cart);

                res.json({
                    success: true,
                    message: '門市設定成功',
                    cart: cart
                });

            } catch (error) {
                console.error('設定門市錯誤:', error);
                res.status(500).json({ 
                    error: '設定門市失敗',
                    details: error.message 
                });
            }
        });

        // 搜尋門市
        app.get('/api/stores/search', async (req, res) => {
            try {
                const { city, district, keyword } = req.query;
                
                if (!city || !district) {
                    return res.status(400).json({ 
                        error: '請提供城市和區域參數' 
                    });
                }

                const stores = await this.searchStores(city, district, keyword);
                res.json({
                    success: true,
                    stores: stores,
                    total: stores.length
                });

            } catch (error) {
                console.error('搜尋門市錯誤:', error);
                res.status(500).json({ 
                    error: '搜尋門市失敗',
                    details: error.message 
                });
            }
        });

        // 獲取門市詳細資訊
        app.get('/api/stores/:storeId', async (req, res) => {
            try {
                const { storeId } = req.params;
                const storeDetails = await this.getStoreDetails(storeId);
                
                if (!storeDetails) {
                    return res.status(404).json({ 
                        error: '找不到指定門市' 
                    });
                }

                res.json({
                    success: true,
                    store: storeDetails
                });

            } catch (error) {
                console.error('獲取門市詳情錯誤:', error);
                res.status(500).json({ 
                    error: '獲取門市詳情失敗',
                    details: error.message 
                });
            }
        });

        // 計算配送費用
        app.post('/api/cart/shipping', (req, res) => {
            try {
                const { cartId, deliveryMethod } = req.body;
                const cart = carts.get(cartId);
                
                if (!cart) {
                    return res.status(404).json({ 
                        error: '找不到購物車' 
                    });
                }

                const shippingCost = this.calculateShipping(cart, deliveryMethod);
                
                // 更新購物車配送資訊
                cart.shipping = {
                    method: deliveryMethod,
                    cost: shippingCost,
                    estimatedDays: deliveryMethod === 'store_pickup' ? 1 : 3
                };
                cart.total = cart.subtotal + shippingCost;
                
                carts.set(cartId, cart);

                res.json({
                    success: true,
                    shipping: cart.shipping,
                    total: cart.total
                });

            } catch (error) {
                console.error('計算配送費用錯誤:', error);
                res.status(500).json({ 
                    error: '計算配送費用失敗',
                    details: error.message 
                });
            }
        });

        // 結帳
        app.post('/api/checkout', async (req, res) => {
            try {
                const { cartId, customerInfo, paymentMethod } = req.body;
                const cart = carts.get(cartId);
                
                if (!cart) {
                    return res.status(404).json({ 
                        error: '找不到購物車' 
                    });
                }

                if (!cart.selectedStore && cart.shipping?.method === 'store_pickup') {
                    return res.status(400).json({ 
                        error: '請選擇取貨門市' 
                    });
                }

                // 建立訂單
                const order = await this.createOrder(cart, customerInfo, paymentMethod);
                
                // 清空購物車
                carts.delete(cartId);

                res.json({
                    success: true,
                    message: '訂單建立成功',
                    order: order
                });

            } catch (error) {
                console.error('結帳錯誤:', error);
                res.status(500).json({ 
                    error: '結帳失敗',
                    details: error.message 
                });
            }
        });
    }

    // 建立新購物車
    createNewCart(cartId) {
        const cart = {
            id: cartId,
            items: [],
            subtotal: 0,
            total: 0,
            selectedStore: null,
            shipping: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        carts.set(cartId, cart);
        return cart;
    }

    // 驗證門市資訊
    async validateStore(storeData) {
        try {
            // 如果有place_id，使用Google Places API驗證
            if (storeData.placeId && storeData.placeId.startsWith('ChIJ')) {
                const response = await googleMapsClient.placeDetails({
                    params: {
                        place_id: storeData.placeId,
                        fields: 'name,formatted_address,geometry,formatted_phone_number,opening_hours',
                        key: GOOGLE_MAPS_API_KEY,
                        language: 'zh-TW'
                    }
                });

                const place = response.data.result;
                return {
                    storeId: storeData.placeId,
                    storeName: place.name,
                    storeAddress: place.formatted_address,
                    storePhone: place.formatted_phone_number,
                    location: place.geometry.location,
                    openingHours: place.opening_hours?.weekday_text || [],
                    verified: true
                };
            }

            // 否則返回原始資料（標記為未驗證）
            return {
                ...storeData,
                verified: false
            };

        } catch (error) {
            console.error('驗證門市失敗:', error);
            return {
                ...storeData,
                verified: false,
                error: '無法驗證門市資訊'
            };
        }
    }

    // 搜尋門市
    async searchStores(city, district, keyword = '7-ELEVEN') {
        try {
            const query = `${keyword} ${city}${district}`;
            const cacheKey = `${city}_${district}_${keyword}`;
            
            // 檢查快取
            if (stores.has(cacheKey)) {
                return stores.get(cacheKey);
            }

            // 使用Google Places API搜尋
            const response = await googleMapsClient.textSearch({
                params: {
                    query: query,
                    type: 'convenience_store',
                    language: 'zh-TW',
                    key: GOOGLE_MAPS_API_KEY
                }
            });

            const results = response.data.results
                .filter(place => 
                    place.name.includes('7-ELEVEN') || 
                    place.name.includes('7-11') ||
                    place.name.includes('統一超商')
                )
                .map(place => ({
                    storeId: place.place_id,
                    storeName: place.name,
                    storeAddress: place.formatted_address,
                    location: place.geometry.location,
                    rating: place.rating,
                    openNow: place.opening_hours?.open_now
                }));

            // 快取結果（1小時）
            stores.set(cacheKey, results);
            setTimeout(() => stores.delete(cacheKey), 3600000);

            return results;

        } catch (error) {
            console.error('搜尋門市API錯誤:', error);
            
            // 返回模擬資料
            return this.getMockStores(city, district);
        }
    }

    // 獲取門市詳細資訊
    async getStoreDetails(storeId) {
        try {
            if (storeId.startsWith('mock_')) {
                return this.getMockStoreDetails(storeId);
            }

            const response = await googleMapsClient.placeDetails({
                params: {
                    place_id: storeId,
                    fields: 'name,formatted_address,geometry,formatted_phone_number,opening_hours,photos',
                    key: GOOGLE_MAPS_API_KEY,
                    language: 'zh-TW'
                }
            });

            const place = response.data.result;
            return {
                storeId: storeId,
                storeName: place.name,
                storeAddress: place.formatted_address,
                storePhone: place.formatted_phone_number,
                location: place.geometry.location,
                openingHours: place.opening_hours?.weekday_text || [],
                photos: place.photos?.slice(0, 3) || []
            };

        } catch (error) {
            console.error('獲取門市詳情錯誤:', error);
            return null;
        }
    }

    // 模擬門市資料
    getMockStores(city, district) {
        return [
            {
                storeId: 'mock_001',
                storeName: `7-ELEVEN ${district}門市`,
                storeAddress: `${city}${district}中正路123號`,
                location: { lat: 25.0330, lng: 121.5654 },
                rating: 4.2,
                openNow: true
            },
            {
                storeId: 'mock_002',
                storeName: `7-ELEVEN ${district}二門市`,
                storeAddress: `${city}${district}民生路456號`,
                location: { lat: 25.0340, lng: 121.5664 },
                rating: 4.0,
                openNow: true
            },
            {
                storeId: 'mock_003',
                storeName: `7-ELEVEN ${district}三門市`,
                storeAddress: `${city}${district}忠孝路789號`,
                location: { lat: 25.0350, lng: 121.5674 },
                rating: 4.3,
                openNow: false
            }
        ];
    }

    getMockStoreDetails(storeId) {
        const mockDetails = {
            'mock_001': {
                storeId: 'mock_001',
                storeName: '7-ELEVEN 中正門市',
                storeAddress: '台北市中正區中正路123號',
                storePhone: '02-2345-6789',
                location: { lat: 25.0330, lng: 121.5654 },
                openingHours: [
                    '星期一: 24 小時營業',
                    '星期二: 24 小時營業',
                    '星期三: 24 小時營業',
                    '星期四: 24 小時營業',
                    '星期五: 24 小時營業',
                    '星期六: 24 小時營業',
                    '星期日: 24 小時營業'
                ]
            }
        };

        return mockDetails[storeId] || null;
    }

    // 計算配送費用
    calculateShipping(cart, deliveryMethod) {
        switch (deliveryMethod) {
            case 'store_pickup':
                return 0; // 門市取貨免運費
            case 'home_delivery':
                return cart.subtotal >= 1000 ? 0 : 60; // 滿1000免運
            case 'express_delivery':
                return 120; // 快速配送
            default:
                return 60;
        }
    }

    // 建立訂單
    async createOrder(cart, customerInfo, paymentMethod) {
        const orderId = 'ORD' + Date.now();
        
        const order = {
            id: orderId,
            customerId: customerInfo.id || 'guest',
            customerInfo: customerInfo,
            items: cart.items,
            subtotal: cart.subtotal,
            shipping: cart.shipping,
            total: cart.total,
            selectedStore: cart.selectedStore,
            paymentMethod: paymentMethod,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        // 這裡可以儲存到真實資料庫
        console.log('新訂單建立:', order);
        
        return order;
    }
}

// 初始化API
new CartAPI();

// 啟動伺服器
app.listen(port, () => {
    console.log(`🚀 購物車API伺服器運行在 http://localhost:${port}`);
    console.log('📍 門市選擇頁面: http://localhost:3000/store_selector.html');
    console.log('🛒 API端點:');
    console.log('  - GET  /api/cart/:cartId - 獲取購物車');
    console.log('  - POST /api/cart/store - 設定取貨門市');
    console.log('  - GET  /api/stores/search - 搜尋門市');
    console.log('  - GET  /api/stores/:storeId - 門市詳情');
    console.log('  - POST /api/cart/shipping - 計算配送費');
    console.log('  - POST /api/checkout - 結帳');
});

module.exports = app; 