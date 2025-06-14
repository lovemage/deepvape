const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event, context) => {
    // 只允許 POST 請求
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // 解析請求數據
        const movementData = JSON.parse(event.body);
        
        // 驗證庫存異動數據
        if (!movementData.productId || !movementData.type || !movementData.quantity) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: '庫存異動數據不完整' })
            };
        }

        // 讀取現有庫存異動記錄
        const movementsFilePath = path.join(process.cwd(), 'data', 'stock_movements.json');
        let movementsData;
        
        try {
            const movementsContent = await fs.readFile(movementsFilePath, 'utf8');
            movementsData = JSON.parse(movementsContent);
        } catch (error) {
            // 如果文件不存在，創建新的數據結構
            movementsData = { movements: [] };
        }

        // 添加新的庫存異動記錄
        movementsData.movements.push(movementData);

        // 保存庫存異動記錄
        await fs.writeFile(movementsFilePath, JSON.stringify(movementsData, null, 2));

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({
                success: true,
                message: '庫存異動記錄保存成功',
                movementId: movementData.id
            })
        };

    } catch (error) {
        console.error('保存庫存異動記錄失敗:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: '服務器錯誤',
                message: error.message
            })
        };
    }
}; 