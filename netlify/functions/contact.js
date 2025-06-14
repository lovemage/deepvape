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
    // 讀取聯繫信息數據文件
    const contactPath = path.join(process.cwd(), 'data', 'contact.json');
    
    if (!fs.existsSync(contactPath)) {
      console.log('聯繫信息文件不存在，返回默認聯繫信息');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          contact: {
            email: "service@deepvape.com",
            line_id: "@deepvape",
            service_hours: "週一至週五 10:00-18:00",
            telegram: "https://t.me/deepvape_support",
            instagram: "https://instagram.com/deepvape_official",
            facebook: "https://facebook.com/deepvape.official"
          }
        })
      };
    }

    const contactData = JSON.parse(fs.readFileSync(contactPath, 'utf8'));
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(contactData)
    };

  } catch (error) {
    console.error('讀取聯繫信息時發生錯誤:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        contact: {
          email: "service@deepvape.com",
          line_id: "@deepvape",
          service_hours: "週一至週五 10:00-18:00",
          telegram: "https://t.me/deepvape_support",
          instagram: "https://instagram.com/deepvape_official",
          facebook: "https://facebook.com/deepvape.official"
        }
      })
    };
  }
}; 