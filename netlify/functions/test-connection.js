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

    try {
        // 檢查系統狀態
        const systemInfo = {
            timestamp: new Date().toISOString(),
            method: event.httpMethod,
            path: event.path,
            nodeVersion: process.version,
            environment: process.env.NODE_ENV || 'development',
            functionName: context.functionName,
            functionVersion: context.functionVersion,
            requestId: context.awsRequestId
        };

        // 檢查文件系統訪問
        const fs = require('fs').promises;
        const path = require('path');
        
        let fileSystemStatus = 'unknown';
        try {
            const dataPath = path.join(process.cwd(), 'data');
            await fs.access(dataPath);
            fileSystemStatus = 'accessible';
        } catch (error) {
            fileSystemStatus = `error: ${error.message}`;
        }

        const response = {
            status: 'success',
            message: 'Netlify Functions 運行正常',
            systemInfo,
            fileSystemStatus,
            availableFiles: []
        };

        // 嘗試列出 data 目錄的文件
        try {
            const dataPath = path.join(process.cwd(), 'data');
            const files = await fs.readdir(dataPath);
            response.availableFiles = files;
        } catch (error) {
            response.fileSystemError = error.message;
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response, null, 2)
        };

    } catch (error) {
        console.error('測試連接失敗:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                status: 'error',
                message: '系統錯誤',
                error: error.message,
                stack: error.stack
            }, null, 2)
        };
    }
}; 