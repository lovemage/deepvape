#!/usr/bin/env python3
"""
測試Telegram機器人數據庫操作
"""

import os
from app import app, db, Product, Announcement, Admin
from telegram_admin_bot import user_sessions

def test_bot_database_operations():
    """測試機器人數據庫操作"""
    print('🤖 測試Telegram機器人數據庫操作...')
    
    # 測試1: 導入檢查
    try:
        from telegram_admin_bot import AdminBot
        print('✅ 機器人模組導入成功')
    except Exception as e:
        print(f'❌ 機器人模組導入失敗: {e}')
        return False
    
    # 測試2: 數據庫查詢操作
    with app.app_context():
        try:
            # 模擬機器人查詢產品
            products = Product.query.all()
            print(f'✅ 產品查詢成功: {len(products)} 個產品')
            
            # 模擬機器人查詢公告
            announcements = Announcement.query.all()
            print(f'✅ 公告查詢成功: {len(announcements)} 個公告')
            
            # 模擬機器人統計功能
            total_stock = sum(p.stock_quantity for p in products)
            low_stock_products = [p for p in products if p.stock_quantity < 10]
            
            print(f'✅ 統計計算成功: 總庫存 {total_stock}, 低庫存 {len(low_stock_products)} 個')
            
        except Exception as e:
            print(f'❌ 數據庫查詢失敗: {e}')
            return False
    
    # 測試3: 會話管理
    try:
        # 模擬用戶會話
        test_user_id = 123456
        user_sessions[test_user_id] = {
            'logged_in': True,
            'username': 'test_admin',
            'state': None
        }
        
        if test_user_id in user_sessions:
            print('✅ 會話管理正常')
        
        # 清理測試會話
        del user_sessions[test_user_id]
        
    except Exception as e:
        print(f'❌ 會話管理失敗: {e}')
        return False
    
    # 測試4: 模擬數據庫修改操作
    with app.app_context():
        try:
            # 模擬價格修改
            test_product = Product.query.first()
            if test_product:
                original_price = test_product.price
                test_product.price = original_price + 1  # 測試修改
                db.session.commit()
                
                # 驗證修改
                updated_product = Product.query.get(test_product.id)
                if updated_product.price == original_price + 1:
                    print('✅ 產品價格修改測試成功')
                    
                    # 還原原價
                    test_product.price = original_price
                    db.session.commit()
                    print('✅ 數據還原成功')
                else:
                    print('❌ 產品價格修改驗證失敗')
                    return False
            
        except Exception as e:
            print(f'❌ 數據庫修改測試失敗: {e}')
            return False
    
    print('🎉 所有測試通過！機器人數據庫連接完全正常！')
    return True

def check_environment():
    """檢查環境配置"""
    print('\n🔧 檢查環境配置...')
    
    # 檢查Token設定
    token = os.environ.get('TELEGRAM_BOT_TOKEN')
    if token and token != 'YOUR_BOT_TOKEN_HERE':
        print(f'✅ Telegram Token 已設定: {token[:10]}...')
    else:
        print('⚠️  Telegram Token 未設定')
    
    # 檢查數據庫文件
    if os.path.exists('deepvape.db'):
        print('✅ 數據庫文件存在')
    else:
        print('❌ 數據庫文件不存在')
    
    # 檢查Flask配置
    with app.app_context():
        print(f'✅ Flask 應用配置: {app.config["SQLALCHEMY_DATABASE_URI"]}')

if __name__ == '__main__':
    print('🔍 Telegram 管理機器人數據庫連接測試')
    print('=' * 50)
    
    # 基本數據庫測試
    check_environment()
    
    # 機器人數據庫操作測試
    test_bot_database_operations()
    
    print('\n✅ 測試完成！') 