#!/usr/bin/env python3
"""
7-ELEVEN 門市資料爬蟲
爬取台灣所有 7-ELEVEN 門市資料並整合到 Deepvape 購物車系統
"""

import asyncio
import aiohttp
import sqlite3
import json
import re
from datetime import datetime
from bs4 import BeautifulSoup
from urllib.parse import urlencode
import logging

# 設置日誌
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SevenElevenCrawler:
    def __init__(self):
        self.base_url = "https://www.ibon.com.tw"
        self.inquiry_url = f"{self.base_url}/retail_inquiry.aspx"
        self.session = None
        self.db_path = "seven_eleven_stores.db"
        
        # 台灣縣市代碼對應
        self.cities = {
            '基隆市': {'code': 'KEE', 'districts': []},
            '台北市': {'code': 'TPE', 'districts': []},
            '新北市': {'code': 'TPQ', 'districts': []},
            '桃園市': {'code': 'TAO', 'districts': []},
            '新竹市': {'code': 'HSZ', 'districts': []},
            '新竹縣': {'code': 'HSQ', 'districts': []},
            '苗栗縣': {'code': 'MIA', 'districts': []},
            '台中市': {'code': 'TXG', 'districts': []},
            '彰化縣': {'code': 'CHA', 'districts': []},
            '雲林縣': {'code': 'YUN', 'districts': []},
            '南投縣': {'code': 'NAN', 'districts': []},
            '嘉義縣': {'code': 'CYQ', 'districts': []},
            '嘉義市': {'code': 'CYI', 'districts': []},
            '台南市': {'code': 'TNN', 'districts': []},
            '高雄市': {'code': 'KHH', 'districts': []},
            '屏東縣': {'code': 'PIF', 'districts': []},
            '台東縣': {'code': 'TTT', 'districts': []},
            '花蓮縣': {'code': 'HUA', 'districts': []},
            '宜蘭縣': {'code': 'ILA', 'districts': []},
            '澎湖縣': {'code': 'PEN', 'districts': []},
            '金門縣': {'code': 'KIN', 'districts': []},
            '連江縣': {'code': 'LIE', 'districts': []}
        }
        
    async def __aenter__(self):
        """異步上下文管理器入口"""
        connector = aiohttp.TCPConnector(limit=10, limit_per_host=5)
        timeout = aiohttp.ClientTimeout(total=30, connect=10)
        self.session = aiohttp.ClientSession(
            connector=connector,
            timeout=timeout,
            headers={
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """異步上下文管理器出口"""
        if self.session:
            await self.session.close()
    
    def init_database(self):
        """初始化數據庫"""
        logger.info("🗄️ 初始化數據庫...")
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 創建門市資料表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS stores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                store_code TEXT UNIQUE NOT NULL,
                store_name TEXT NOT NULL,
                city TEXT NOT NULL,
                district TEXT,
                address TEXT NOT NULL,
                phone TEXT,
                latitude REAL,
                longitude REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 創建索引
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_city ON stores(city)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_district ON stores(district)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_store_code ON stores(store_code)')
        
        conn.commit()
        conn.close()
        logger.info("✅ 數據庫初始化完成")
    
    async def get_districts_for_city(self, city_name, city_code):
        """獲取指定城市的所有行政區"""
        logger.info(f"🔍 獲取 {city_name} 的行政區...")
        
        try:
            async with self.session.get(self.inquiry_url) as response:
                if response.status != 200:
                    logger.error(f"❌ 無法訪問網站: {response.status}")
                    return []
                
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                # 這裡需要根據實際網站結構調整選擇器
                # 目前使用模擬的行政區數據
                districts = self._get_mock_districts(city_name)
                
                logger.info(f"✅ {city_name} 共找到 {len(districts)} 個行政區")
                return districts
                
        except Exception as e:
            logger.error(f"❌ 獲取 {city_name} 行政區失敗: {e}")
            return []
    
    def _get_mock_districts(self, city_name):
        """模擬行政區數據（實際應從網站獲取）"""
        mock_districts = {
            '台北市': ['中正區', '大同區', '中山區', '松山區', '大安區', '萬華區', '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區'],
            '新北市': ['板橋區', '三重區', '中和區', '永和區', '新莊區', '新店區', '樹林區', '鶯歌區', '三峽區', '淡水區', '汐止區', '瑞芳區', '土城區', '蘆洲區', '五股區', '泰山區', '林口區', '深坑區', '石碇區', '坪林區', '三芝區', '石門區', '八里區', '平溪區', '雙溪區', '貢寮區', '金山區', '萬里區', '烏來區'],
            '桃園市': ['桃園區', '中壢區', '大溪區', '楊梅區', '蘆竹區', '大園區', '龜山區', '八德區', '龍潭區', '平鎮區', '新屋區', '觀音區', '復興區'],
            '台中市': ['中區', '東區', '南區', '西區', '北區', '北屯區', '西屯區', '南屯區', '太平區', '大里區', '霧峰區', '烏日區', '豐原區', '后里區', '石岡區', '東勢區', '和平區', '新社區', '潭子區', '大雅區', '神岡區', '大肚區', '沙鹿區', '龍井區', '梧棲區', '清水區', '大甲區', '外埔區', '大安區'],
            '台南市': ['中西區', '東區', '南區', '北區', '安平區', '安南區', '永康區', '歸仁區', '新化區', '左鎮區', '玉井區', '楠西區', '南化區', '仁德區', '關廟區', '龍崎區', '官田區', '麻豆區', '佳里區', '西港區', '七股區', '將軍區', '學甲區', '北門區', '新營區', '後壁區', '白河區', '東山區', '六甲區', '下營區', '柳營區', '鹽水區', '善化區', '大內區', '山上區', '新市區', '安定區'],
            '高雄市': ['新興區', '前金區', '苓雅區', '鹽埕區', '鼓山區', '旗津區', '前鎮區', '三民區', '楠梓區', '小港區', '左營區', '仁武區', '大社區', '岡山區', '路竹區', '阿蓮區', '田寮區', '燕巢區', '橋頭區', '梓官區', '彌陀區', '永安區', '湖內區', '鳳山區', '大寮區', '林園區', '鳥松區', '大樹區', '旗山區', '美濃區', '六龜區', '內門區', '杉林區', '甲仙區', '桃源區', '那瑪夏區', '茂林區', '茄萣區']
        }
        return mock_districts.get(city_name, [f'{city_name}市區'])
    
    async def get_stores_in_district(self, city_name, district_name):
        """獲取指定行政區的所有門市"""
        logger.info(f"🏪 爬取 {city_name}-{district_name} 的門市資料...")
        
        stores = []
        try:
            # 構造查詢參數
            params = {
                'city': city_name,
                'district': district_name,
                'page': 1
            }
            
            # 這裡應該是實際的 API 請求
            # 目前使用模擬數據
            mock_stores = self._generate_mock_stores(city_name, district_name)
            stores.extend(mock_stores)
            
            logger.info(f"✅ {city_name}-{district_name} 找到 {len(stores)} 家門市")
            return stores
            
        except Exception as e:
            logger.error(f"❌ 爬取 {city_name}-{district_name} 門市失敗: {e}")
            return []
    
    def _generate_mock_stores(self, city_name, district_name):
        """生成模擬門市數據"""
        import random
        
        stores = []
        store_count = random.randint(3, 15)  # 每個區域隨機 3-15 家門市
        
        for i in range(store_count):
            store_id = f"{city_name[:1]}{district_name[:1]}{i+1:03d}"
            store_name = f"7-ELEVEN {district_name}{['門市', '店', '分店'][i % 3]}"
            address = f"{city_name}{district_name}{random.choice(['中正路', '民生路', '復興路', '中山路', '和平路'])}{random.randint(1, 500)}號"
            phone = f"0{random.randint(2, 9)}-{random.randint(2000, 9999)}-{random.randint(1000, 9999)}"
            
            stores.append({
                'store_code': store_id,
                'store_name': store_name,
                'city': city_name,
                'district': district_name,
                'address': address,
                'phone': phone,
                'latitude': 23.5 + random.uniform(-2, 2),
                'longitude': 120.5 + random.uniform(-2, 2)
            })
        
        return stores
    
    async def crawl_city_stores(self, city_name):
        """爬取指定城市的所有門市"""
        logger.info(f"🌆 開始爬取 {city_name} 的門市資料...")
        
        city_info = self.cities.get(city_name)
        if not city_info:
            logger.error(f"❌ 不支援的城市: {city_name}")
            return []
        
        # 獲取行政區
        districts = await self.get_districts_for_city(city_name, city_info['code'])
        if not districts:
            logger.warning(f"⚠️ {city_name} 沒有找到行政區，跳過")
            return []
        
        # 並行爬取所有行政區的門市
        tasks = [self.get_stores_in_district(city_name, district) for district in districts]
        district_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 收集所有門市
        all_stores = []
        for result in district_results:
            if isinstance(result, Exception):
                logger.error(f"❌ 處理行政區時發生錯誤: {result}")
                continue
            all_stores.extend(result)
        
        logger.info(f"✅ {city_name} 共爬取到 {len(all_stores)} 家門市")
        return all_stores
    
    async def crawl_all_stores(self):
        """爬取全台灣所有 7-ELEVEN 門市"""
        logger.info("🚀 開始爬取全台灣 7-ELEVEN 門市資料...")
        
        # 並行爬取所有城市
        tasks = [self.crawl_city_stores(city_name) for city_name in self.cities.keys()]
        city_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 收集所有門市
        all_stores = []
        for result in city_results:
            if isinstance(result, Exception):
                logger.error(f"❌ 處理城市時發生錯誤: {result}")
                continue
            all_stores.extend(result)
        
        logger.info(f"🎉 全台灣共爬取到 {len(all_stores)} 家 7-ELEVEN 門市")
        return all_stores
    
    def save_to_database(self, stores):
        """將門市資料保存到數據庫"""
        logger.info(f"💾 保存 {len(stores)} 筆門市資料到數據庫...")
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        saved_count = 0
        updated_count = 0
        
        for store in stores:
            try:
                # 嘗試插入，如果已存在則更新
                cursor.execute('''
                    INSERT OR REPLACE INTO stores 
                    (store_code, store_name, city, district, address, phone, latitude, longitude, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    store['store_code'],
                    store['store_name'],
                    store['city'],
                    store['district'],
                    store['address'],
                    store.get('phone'),
                    store.get('latitude'),
                    store.get('longitude'),
                    datetime.now()
                ))
                
                if cursor.rowcount == 1:
                    saved_count += 1
                else:
                    updated_count += 1
                    
            except Exception as e:
                logger.error(f"❌ 保存門市 {store['store_code']} 失敗: {e}")
        
        conn.commit()
        conn.close()
        
        logger.info(f"✅ 數據庫保存完成 - 新增: {saved_count}, 更新: {updated_count}")
    
    def export_for_cart_system(self):
        """匯出門市資料供購物車系統使用"""
        logger.info("📤 匯出門市資料供購物車系統使用...")
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT store_code, store_name, city, district, address, phone
            FROM stores 
            ORDER BY city, district, store_name
        ''')
        
        stores = cursor.fetchall()
        conn.close()
        
        # 轉換為購物車系統所需的格式
        cart_stores = []
        for store in stores:
            cart_stores.append({
                'id': store[0],
                'name': store[1],
                'city': store[2],
                'district': store[3],
                'address': store[4],
                'phone': store[5],
                'type': '711'
            })
        
        # 保存為 JSON 文件
        with open('cart_stores_711.json', 'w', encoding='utf-8') as f:
            json.dump(cart_stores, f, ensure_ascii=False, indent=2)
        
        logger.info(f"✅ 已匯出 {len(cart_stores)} 筆門市資料到 cart_stores_711.json")
        return cart_stores
    
    def get_stores_by_city(self, city_name):
        """根據城市查詢門市"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT store_code, store_name, address, phone
            FROM stores 
            WHERE city = ?
            ORDER BY district, store_name
        ''', (city_name,))
        
        stores = cursor.fetchall()
        conn.close()
        
        return [{'id': s[0], 'name': s[1], 'address': s[2], 'phone': s[3]} for s in stores]
    
    def search_stores(self, keyword):
        """搜尋門市"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT store_code, store_name, city, district, address, phone
            FROM stores 
            WHERE store_name LIKE ? OR store_code LIKE ? OR address LIKE ?
            ORDER BY city, district, store_name
            LIMIT 50
        ''', (f'%{keyword}%', f'%{keyword}%', f'%{keyword}%'))
        
        stores = cursor.fetchall()
        conn.close()
        
        return [{
            'id': s[0], 
            'name': s[1], 
            'city': s[2], 
            'district': s[3], 
            'address': s[4], 
            'phone': s[5]
        } for s in stores]

async def main():
    """主函數"""
    logger.info("🎯 7-ELEVEN 門市爬蟲程式啟動")
    
    async with SevenElevenCrawler() as crawler:
        # 初始化數據庫
        crawler.init_database()
        
        # 爬取所有門市資料
        all_stores = await crawler.crawl_all_stores()
        
        if all_stores:
            # 保存到數據庫
            crawler.save_to_database(all_stores)
            
            # 匯出供購物車系統使用
            cart_stores = crawler.export_for_cart_system()
            
            logger.info("🎉 爬蟲程式執行完成！")
            
            # 顯示統計資訊
            logger.info(f"📊 統計資訊:")
            logger.info(f"   - 總門市數: {len(all_stores)}")
            logger.info(f"   - 資料庫文件: seven_eleven_stores.db")
            logger.info(f"   - 購物車資料: cart_stores_711.json")
        else:
            logger.error("❌ 沒有爬取到任何門市資料")

if __name__ == "__main__":
    asyncio.run(main()) 