#!/usr/bin/env python3
"""
數據庫連接測試腳本
"""

from app import app, db, Product, Announcement, Admin

def test_database():
    """測試數據庫連接"""
    with app.app_context():
        try:
            print('🔍 測試數據庫連接...')
            
            # 測試產品表
            products = Product.query.count()
            print(f'✅ 產品數據: {products} 個產品')
            
            # 測試公告表
            announcements = Announcement.query.count()
            print(f'✅ 公告數據: {announcements} 個公告')
            
            # 測試管理員表
            admins = Admin.query.count()
            print(f'✅ 管理員數據: {admins} 個管理員')
            
            # 測試具體查詢
            if products > 0:
                first_product = Product.query.first()
                print(f'📦 第一個產品: {first_product.name} - NT${first_product.price}')
            
            if announcements > 0:
                first_announcement = Announcement.query.first()
                print(f'📢 第一個公告: {first_announcement.title}')
            
            if admins > 0:
                first_admin = Admin.query.first()
                print(f'👤 管理員帳號: {first_admin.username}')
            
            print('✅ 數據庫連接完全正常！')
            return True
            
        except Exception as e:
            print(f'❌ 數據庫連接失敗: {e}')
            return False

if __name__ == '__main__':
    test_database() 