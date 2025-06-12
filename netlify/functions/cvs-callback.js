// 處理 7-11 超商取貨 API 的 POST 回調
exports.handler = async (event, context) => {
    console.log('收到 CVS 回調請求');
    console.log('Method:', event.httpMethod);
    console.log('Headers:', event.headers);
    console.log('Body:', event.body);
    
    // 允許 CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'text/html; charset=utf-8'
    };
    
    // 處理 OPTIONS 請求
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }
    
    // 處理 GET 請求（測試用）
    if (event.httpMethod === 'GET') {
        const queryParams = event.queryStringParameters || {};
        console.log('GET 參數:', queryParams);
        
        // 生成包含門市資訊的 HTML 頁面
        const html = generateCallbackHTML(queryParams);
        
        return {
            statusCode: 200,
            headers,
            body: html
        };
    }
    
    // 處理 POST 請求（7-11 API 會使用 POST）
    if (event.httpMethod === 'POST') {
        let storeData = {};
        
        // 解析 POST 資料
        if (event.headers['content-type'] && event.headers['content-type'].includes('application/x-www-form-urlencoded')) {
            // URL encoded 格式
            const params = new URLSearchParams(event.body);
            storeData = {
                storeId: params.get('CVSStoreID') || params.get('storeId'),
                storeName: params.get('CVSStoreName') || params.get('storeName'),
                storeAddress: params.get('CVSAddress') || params.get('storeAddress'),
                storePhone: params.get('CVSTelephone') || params.get('storePhone')
            };
        } else if (event.headers['content-type'] && event.headers['content-type'].includes('application/json')) {
            // JSON 格式
            try {
                const jsonData = JSON.parse(event.body);
                storeData = {
                    storeId: jsonData.CVSStoreID || jsonData.storeId,
                    storeName: jsonData.CVSStoreName || jsonData.storeName,
                    storeAddress: jsonData.CVSAddress || jsonData.storeAddress,
                    storePhone: jsonData.CVSTelephone || jsonData.storePhone
                };
            } catch (e) {
                console.error('JSON 解析錯誤:', e);
            }
        }
        
        console.log('解析的門市資料:', storeData);
        
        // 生成包含門市資訊的 HTML 頁面
        const html = generateCallbackHTML(storeData);
        
        return {
            statusCode: 200,
            headers,
            body: html
        };
    }
    
    // 其他請求方法
    return {
        statusCode: 405,
        headers,
        body: 'Method Not Allowed'
    };
};

// 生成回調 HTML 頁面
function generateCallbackHTML(storeData) {
    const { storeId, storeName, storeAddress, storePhone } = storeData;
    
    return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>門市選擇處理中 | DeepVape</title>
    <style>
        body {
            font-family: 'PingFang TC', 'PingFang SC', 'Helvetica Neue', 'Arial', sans-serif;
            background: linear-gradient(135deg, #083e12 0%, #041348 100%);
            color: #ffffff;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }
        .container {
            background: rgba(4, 19, 72, 0.8);
            border: 1px solid rgba(26, 254, 73, 0.2);
            border-radius: 20px;
            padding: 2rem;
            text-align: center;
            max-width: 500px;
            width: 100%;
        }
        .loading {
            font-size: 3rem;
            margin-bottom: 1rem;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .status {
            font-size: 1.2rem;
            margin-bottom: 1rem;
        }
        .store-info {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 1rem;
            margin: 1rem 0;
            text-align: left;
        }
        .store-info div {
            margin: 0.5rem 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="loading">⏳</div>
        <div class="status">正在處理門市選擇...</div>
        ${storeId ? `
        <div class="store-info">
            <div><strong>門市編號：</strong>${storeId}</div>
            <div><strong>門市名稱：</strong>${storeName || '未提供'}</div>
            <div><strong>門市地址：</strong>${storeAddress || '未提供'}</div>
            <div><strong>門市電話：</strong>${storePhone || '未提供'}</div>
        </div>
        ` : '<div>未收到門市資料</div>'}
    </div>
    
    <script>
        // 自動將門市資訊傳回父視窗
        (function() {
            const storeData = {
                storeId: '${storeId || ''}',
                storeName: '${storeName || ''}',
                storeAddress: '${storeAddress || ''}',
                storePhone: '${storePhone || ''}'
            };
            
            console.log('準備傳送門市資料:', storeData);
            
            // 確保資料有效
            if (storeData.storeId || storeData.storeName) {
                // 傳送給父視窗
                if (window.opener && !window.opener.closed) {
                    window.opener.postMessage({
                        type: 'storeSelected',
                        storeInfo: storeData
                    }, '*');
                    console.log('已傳送資料給 opener');
                }
                
                // 傳送給父框架
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({
                        type: 'storeSelected',
                        storeInfo: storeData
                    }, '*');
                    console.log('已傳送資料給 parent');
                }
                
                // 2秒後自動關閉視窗
                setTimeout(() => {
                    window.close();
                }, 2000);
            } else {
                console.error('門市資料無效');
                document.querySelector('.status').textContent = '未收到有效的門市資料';
            }
        })();
    </script>
</body>
</html>`;
} 
