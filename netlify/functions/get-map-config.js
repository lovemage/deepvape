exports.handler = async (event, context) => {
  // 設定CORS標頭
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // 處理預檢請求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
            // 使用新的API金鑰
        const apiKey = 'AIzaSyCEXKlt8GuddzTW9m_sTFI5J_25F41ctt0';
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        apiKey: apiKey
      })
    };
  } catch (error) {
    console.error('取得地圖配置失敗:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '伺服器錯誤'
      })
    };
  }
}; 