exports.handler = async (event, context) => {
  // 設定CORS標頭
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // 處理預檢請求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // 只允許GET請求
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: '方法不被允許' }),
    };
  }

  try {
    // 從環境變數獲取API金鑰
    const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!API_KEY) {
      throw new Error('Google Maps API金鑰未設定');
    }

    // 獲取查詢參數
    const { city, district, keyword = '7-ELEVEN', storeType = '711' } = event.queryStringParameters || {};
    
    // 根據門市類型設定關鍵字
    let searchKeyword = keyword;
    if (storeType === 'family') {
      searchKeyword = '全家';
    } else if (storeType === '711') {
      searchKeyword = '7-ELEVEN';
    }
    
    if (!city || !district) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '請提供city和district參數' }),
      };
    }

    // 構建搜尋查詢
    const query = `${searchKeyword} ${city}${district}`;
    
    // 呼叫Google Places API
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}&language=zh-TW&type=convenience_store`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google API請求失敗: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 根據門市類型過濾結果
    let filteredResults;
    if (storeType === 'family') {
      filteredResults = data.results.filter(place => 
        place.name.includes('全家') || 
        place.name.includes('FamilyMart') ||
        place.name.includes('Family')
      );
    } else {
      filteredResults = data.results.filter(place => 
        place.name.includes('7-ELEVEN') || 
        place.name.includes('7-11') ||
        place.name.includes('統一超商')
      );
    }

    // 格式化回傳資料
    const stores = filteredResults.map(place => ({
      storeId: place.place_id,
      storeName: place.name,
      storeAddress: place.formatted_address,
      location: place.geometry.location,
      rating: place.rating,
      openNow: place.opening_hours?.open_now,
      photos: place.photos?.slice(0, 1) || []
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        stores: stores,
        total: stores.length,
        query: query
      }),
    };

  } catch (error) {
    console.error('搜尋門市錯誤:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: '搜尋門市失敗',
        message: error.message
      }),
    };
  }
}; 