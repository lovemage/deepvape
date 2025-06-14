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
    // 讀取公告數據文件
    const announcementsPath = path.join(process.cwd(), 'data', 'announcements.json');
    
    if (!fs.existsSync(announcementsPath)) {
      console.log('公告文件不存在，返回默認公告');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([
          {
            id: 1,
            title: '歡迎來到 Deepvape',
            content: '🎉 新品上市！全館滿 $1500 免運費 🚚',
            priority: 2
          }
        ])
      };
    }

    const data = fs.readFileSync(announcementsPath, 'utf8');
    const announcementsData = JSON.parse(data);
    
    // 過濾活躍的公告
    const now = new Date();
    const activeAnnouncements = announcementsData.announcements.filter(announcement => {
      if (!announcement.active) return false;
      
      // 檢查開始日期
      if (announcement.startDate) {
        const startDate = new Date(announcement.startDate);
        if (now < startDate) return false;
      }
      
      // 檢查結束日期
      if (announcement.endDate) {
        const endDate = new Date(announcement.endDate);
        if (now > endDate) return false;
      }
      
      return true;
    });

    // 按優先級排序（high > medium > low）
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    activeAnnouncements.sort((a, b) => {
      return (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
    });

    // 轉換為前端期望的格式
    const formattedAnnouncements = activeAnnouncements.map((announcement, index) => ({
      id: index + 1,
      title: announcement.text.substring(0, 50), // 取前50個字符作為標題
      content: announcement.text,
      priority: priorityOrder[announcement.priority] || 1
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(formattedAnnouncements)
    };

  } catch (error) {
    console.error('讀取公告數據時發生錯誤:', error);
    
    // 返回默認公告
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify([
        {
          id: 1,
          title: '歡迎來到 Deepvape',
          content: '🎉 新品上市！全館滿 $1500 免運費 🚚',
          priority: 2
        }
      ])
    };
  }
}; 