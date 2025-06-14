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
    // 讀取 hero 數據文件
    const heroPath = path.join(process.cwd(), 'data', 'hero.json');
    
    if (!fs.existsSync(heroPath)) {
      console.log('Hero 文件不存在，返回默認 hero 數據');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          hero: {
            images: [
              {
                id: 1,
                url: "deepvape_main.png",
                alt: "Deepvape 電子菸主機與煙彈",
                title: "Deepvape - 頂級電子菸專賣店",
                subtitle: "VAPE煙彈、主機、拋棄式",
                description: "探索最新科技與極致品味的完美結合，為您帶來前所未有的電子菸體驗",
                active: true
              }
            ],
            autoplay: true,
            interval: 5000,
            showIndicators: true,
            showNavigation: true
          }
        })
      };
    }

    const heroData = JSON.parse(fs.readFileSync(heroPath, 'utf8'));
    
    // 過濾活躍的圖片
    if (heroData.hero && heroData.hero.images) {
      heroData.hero.images = heroData.hero.images.filter(img => img.active);
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(heroData)
    };

  } catch (error) {
    console.error('讀取 Hero 數據時發生錯誤:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        hero: {
          images: [
            {
              id: 1,
              url: "deepvape_main.png",
              alt: "Deepvape 電子菸主機與煙彈",
              title: "Deepvape - 頂級電子菸專賣店",
              subtitle: "VAPE煙彈、主機、拋棄式",
              description: "探索最新科技與極致品味的完美結合，為您帶來前所未有的電子菸體驗",
              active: true
            }
          ],
          autoplay: true,
          interval: 5000,
          showIndicators: true,
          showNavigation: true
        }
      })
    };
  }
}; 