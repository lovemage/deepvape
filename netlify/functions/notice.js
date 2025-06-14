const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  // 設置 CORS 標頭
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  // 只允許 GET 請求
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // 讀取通知數據文件
    const noticePath = path.join(process.cwd(), 'data', 'notice.json');
    
    if (!fs.existsSync(noticePath)) {
      console.log('通知文件不存在，返回默認通知數據');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          notice: {
            enabled: true,
            title: "DeepVape 重要通知：",
            content: "受政策影響，為防止顧客個資洩露，即日起我們免費為您提供隱密包裝服務。包裹上不會註明內容物及店家，請放心選購。\n\n商品送達後我們會透過簡訊通知取貨，簡訊內容不會提及內容物及店家，亦不會致電打擾，請顧客及時留意簡訊。",
            type: "info",
            showIcon: true,
            backgroundColor: "#f8f9fa",
            textColor: "#495057",
            borderColor: "#dee2e6"
          }
        })
      };
    }

    const noticeData = JSON.parse(fs.readFileSync(noticePath, 'utf8'));
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(noticeData)
    };

  } catch (error) {
    console.error('讀取通知數據時發生錯誤:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        notice: {
          enabled: true,
          title: "DeepVape 重要通知：",
          content: "受政策影響，為防止顧客個資洩露，即日起我們免費為您提供隱密包裝服務。包裹上不會註明內容物及店家，請放心選購。\n\n商品送達後我們會透過簡訊通知取貨，簡訊內容不會提及內容物及店家，亦不會致電打擾，請顧客及時留意簡訊。",
          type: "info",
          showIcon: true,
          backgroundColor: "#f8f9fa",
          textColor: "#495057",
          borderColor: "#dee2e6"
        }
      })
    };
  }
}; 