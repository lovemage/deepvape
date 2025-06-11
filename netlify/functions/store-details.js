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

    // 獲取place_id參數
    const { place_id } = event.queryStringParameters || {};
    
    if (!place_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '請提供place_id參數' }),
      };
    }

    // 呼叫Google Places Details API
    const fields = 'name,formatted_address,geometry,formatted_phone_number,opening_hours,photos,rating';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=${fields}&key=${API_KEY}&language=zh-TW`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google API請求失敗: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Google Places API錯誤: ${data.status}`);
    }

    // 格式化門市詳情
    const place = data.result;
    const storeDetails = {
      storeId: place_id,
      storeName: place.name,
      storeAddress: place.formatted_address,
      storePhone: place.formatted_phone_number,
      location: place.geometry.location,
      rating: place.rating,
      openingHours: place.opening_hours?.weekday_text || [],
      isOpenNow: place.opening_hours?.open_now,
      photos: place.photos?.slice(0, 3).map(photo => ({
        photoReference: photo.photo_reference,
        width: photo.width,
        height: photo.height
      })) || []
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        store: storeDetails
      }),
    };

  } catch (error) {
    console.error('獲取門市詳情錯誤:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: '獲取門市詳情失敗',
        message: error.message
      }),
    };
  }
}; 