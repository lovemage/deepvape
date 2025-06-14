const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event, context) => {
    // 設定 CORS 標頭
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // 處理 OPTIONS 請求（CORS 預檢）
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // 只允許 POST 請求
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // 解析請求數據
        const orderData = JSON.parse(event.body);
        
        // 驗證訂單數據
        if (!orderData.orderId || !orderData.customer || !orderData.items) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: '訂單數據不完整' })
            };
        }

        // 讀取現有訂單數據
        const ordersFilePath = path.join(process.cwd(), 'data', 'orders.json');
        let ordersData;
        
        try {
            const ordersContent = await fs.readFile(ordersFilePath, 'utf8');
            ordersData = JSON.parse(ordersContent);
        } catch (error) {
            // 如果文件不存在，創建新的數據結構
            ordersData = { orders: [] };
        }

        // 檢查訂單是否已存在
        const existingOrderIndex = ordersData.orders.findIndex(
            order => order.orderId === orderData.orderId
        );

        if (existingOrderIndex > -1) {
            // 更新現有訂單
            ordersData.orders[existingOrderIndex] = orderData;
        } else {
            // 添加新訂單
            ordersData.orders.push(orderData);
        }

        // 保存訂單數據
        await fs.writeFile(ordersFilePath, JSON.stringify(ordersData, null, 2));

        // 更新訂單統計
        await updateOrderStats(orderData);

        // 發送通知（可選）
        await sendOrderNotification(orderData);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: '訂單保存成功',
                orderId: orderData.orderId
            })
        };

    } catch (error) {
        console.error('保存訂單失敗:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: '服務器錯誤',
                message: error.message
            })
        };
    }
};

// 更新訂單統計
async function updateOrderStats(orderData) {
    try {
        const statsFilePath = path.join(process.cwd(), 'data', 'order_stats.json');
        let statsData;

        try {
            const statsContent = await fs.readFile(statsFilePath, 'utf8');
            statsData = JSON.parse(statsContent);
        } catch (error) {
            statsData = {
                stats: {
                    totalOrders: 0,
                    totalRevenue: 0,
                    averageOrderValue: 0,
                    monthlyStats: [],
                    productStats: [],
                    lastUpdated: new Date().toISOString()
                }
            };
        }

        // 更新總計數據
        statsData.stats.totalOrders += 1;
        statsData.stats.totalRevenue += orderData.total;
        statsData.stats.averageOrderValue = statsData.stats.totalRevenue / statsData.stats.totalOrders;

        // 更新月度統計
        const orderMonth = new Date(orderData.orderDate).toISOString().slice(0, 7); // YYYY-MM
        let monthlyStatIndex = statsData.stats.monthlyStats.findIndex(
            stat => stat.month === orderMonth
        );

        if (monthlyStatIndex > -1) {
            statsData.stats.monthlyStats[monthlyStatIndex].orders += 1;
            statsData.stats.monthlyStats[monthlyStatIndex].revenue += orderData.total;
        } else {
            statsData.stats.monthlyStats.push({
                month: orderMonth,
                orders: 1,
                revenue: orderData.total
            });
        }

        // 更新產品銷售統計
        for (const item of orderData.items) {
            let productStatIndex = statsData.stats.productStats.findIndex(
                stat => stat.productId === item.productId
            );

            if (productStatIndex > -1) {
                statsData.stats.productStats[productStatIndex].totalSold += item.quantity;
                statsData.stats.productStats[productStatIndex].revenue += item.totalPrice;
            } else {
                statsData.stats.productStats.push({
                    productId: item.productId,
                    productName: item.productName,
                    totalSold: item.quantity,
                    revenue: item.totalPrice
                });
            }
        }

        statsData.stats.lastUpdated = new Date().toISOString();

        // 保存統計數據
        await fs.writeFile(statsFilePath, JSON.stringify(statsData, null, 2));

    } catch (error) {
        console.error('更新訂單統計失敗:', error);
    }
}

// 發送訂單通知
async function sendOrderNotification(orderData) {
    try {
        // 這裡可以實現發送郵件、LINE 通知等功能
        console.log(`新訂單通知: ${orderData.orderId}`);
        
        // 示例：發送到 Webhook
        // await fetch('YOUR_WEBHOOK_URL', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         text: `新訂單：${orderData.orderId}\n客戶：${orderData.customer.name}\n金額：NT$ ${orderData.total}`
        //     })
        // });

    } catch (error) {
        console.error('發送訂單通知失敗:', error);
    }
} 