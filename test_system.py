#!/usr/bin/env python3
"""
系統整合測試腳本
測試前後端數據同步和功能完整性
"""

import requests
import json
import time
from urllib.parse import urljoin

# 測試配置
BACKEND_URL = 'http://127.0.0.1:5001'
FRONTEND_URL = 'http://127.0.0.1:3000'

def test_backend_api():
    """測試後台 API"""
    print("🔍 測試後台 API...")
    
    try:
        # 測試產品 API
        response = requests.get(f'{BACKEND_URL}/api/products')
        if response.status_code == 200:
            products = response.json()
            print(f"✅ 產品 API 正常，共 {len(products)} 個產品")
            
            # 檢查產品數據完整性
            for product in products[:3]:  # 檢查前3個產品
                required_fields = ['name', 'price', 'description', 'category']
                missing_fields = [field for field in required_fields if not product.get(field)]
                if missing_fields:
                    print(f"⚠️  產品 {product.get('name', 'Unknown')} 缺少字段: {missing_fields}")
                else:
                    print(f"✅ 產品 {product['name']} 數據完整")
        else:
            print(f"❌ 產品 API 失敗: {response.status_code}")
            return False
            
        # 測試公告 API
        response = requests.get(f'{BACKEND_URL}/api/announcements')
        if response.status_code == 200:
            announcements = response.json()
            print(f"✅ 公告 API 正常，共 {len(announcements)} 個公告")
        else:
            print(f"⚠️  公告 API 失敗: {response.status_code}")
            
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ 無法連接到後台服務器")
        return False
    except Exception as e:
        print(f"❌ 後台 API 測試失敗: {e}")
        return False

def test_frontend_pages():
    """測試前端頁面"""
    print("\n🔍 測試前端頁面...")
    
    pages_to_test = [
        ('index.html', '首頁'),
        ('cart.html', '購物車頁面'),
        ('sp2_product.html', 'SP2 產品頁面'),
        ('ilia_1_product.html', 'ILIA 一代產品頁面'),
        ('shopping_guide.html', '購物說明頁面'),
        ('order_confirmation.html', '訂單確認頁面')
    ]
    
    success_count = 0
    
    for page, name in pages_to_test:
        try:
            response = requests.get(f'{FRONTEND_URL}/{page}')
            if response.status_code == 200:
                print(f"✅ {name} 載入正常")
                success_count += 1
            else:
                print(f"❌ {name} 載入失敗: {response.status_code}")
        except requests.exceptions.ConnectionError:
            print(f"❌ 無法連接到前端服務器")
            break
        except Exception as e:
            print(f"❌ {name} 測試失敗: {e}")
    
    print(f"\n📊 前端頁面測試結果: {success_count}/{len(pages_to_test)} 頁面正常")
    return success_count == len(pages_to_test)

def test_api_integration():
    """測試 API 整合腳本"""
    print("\n🔍 測試 API 整合...")
    
    try:
        # 檢查 API 整合腳本是否存在
        response = requests.get(f'{FRONTEND_URL}/product-api-integration.js')
        if response.status_code == 200:
            print("✅ API 整合腳本載入正常")
            
            # 檢查腳本內容
            script_content = response.text
            required_functions = [
                'loadProductData',
                'updateProductPage',
                'getCurrentProductName',
                'updateAddToCartFunction'
            ]
            
            missing_functions = [func for func in required_functions if func not in script_content]
            if missing_functions:
                print(f"⚠️  API 整合腳本缺少函數: {missing_functions}")
            else:
                print("✅ API 整合腳本函數完整")
                
            return True
        else:
            print(f"❌ API 整合腳本載入失敗: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ API 整合測試失敗: {e}")
        return False

def test_data_consistency():
    """測試數據一致性"""
    print("\n🔍 測試數據一致性...")
    
    try:
        # 獲取後台產品數據
        response = requests.get(f'{BACKEND_URL}/api/products')
        if response.status_code != 200:
            print("❌ 無法獲取後台產品數據")
            return False
            
        products = response.json()
        
        # 檢查關鍵產品是否存在
        expected_products = [
            'SP2 一代主機',
            'ILIA 一代主機',
            'ILIA 皮革主機',
            'ILIA 發光煙彈',
            'ILIA 拋棄式四代'
        ]
        
        found_products = [p['name'] for p in products]
        missing_products = [name for name in expected_products if name not in found_products]
        
        if missing_products:
            print(f"⚠️  缺少產品: {missing_products}")
        else:
            print("✅ 所有關鍵產品都存在")
            
        # 檢查價格數據
        price_issues = []
        for product in products:
            if not product.get('price') or product['price'] <= 0:
                price_issues.append(product['name'])
                
        if price_issues:
            print(f"⚠️  價格數據異常的產品: {price_issues}")
        else:
            print("✅ 所有產品價格數據正常")
            
        return len(missing_products) == 0 and len(price_issues) == 0
        
    except Exception as e:
        print(f"❌ 數據一致性測試失敗: {e}")
        return False

def test_cart_functionality():
    """測試購物車功能"""
    print("\n🔍 測試購物車功能...")
    
    # 這裡主要檢查購物車頁面是否能正常載入
    # 實際的購物車功能需要在瀏覽器中測試
    try:
        response = requests.get(f'{FRONTEND_URL}/cart.html')
        if response.status_code == 200:
            content = response.text
            
            # 檢查關鍵功能是否存在
            required_elements = [
                'updateCartWithLatestProductInfo',
                'displayCartItems',
                'createOrder',
                'selectStoreType'
            ]
            
            missing_elements = [elem for elem in required_elements if elem not in content]
            if missing_elements:
                print(f"⚠️  購物車頁面缺少功能: {missing_elements}")
                return False
            else:
                print("✅ 購物車頁面功能完整")
                return True
        else:
            print(f"❌ 購物車頁面載入失敗: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 購物車功能測試失敗: {e}")
        return False

def main():
    """主測試函數"""
    print("🚀 開始系統整合測試...\n")
    
    test_results = []
    
    # 執行各項測試
    test_results.append(("後台 API", test_backend_api()))
    test_results.append(("前端頁面", test_frontend_pages()))
    test_results.append(("API 整合", test_api_integration()))
    test_results.append(("數據一致性", test_data_consistency()))
    test_results.append(("購物車功能", test_cart_functionality()))
    
    # 統計結果
    passed_tests = sum(1 for _, result in test_results if result)
    total_tests = len(test_results)
    
    print(f"\n{'='*50}")
    print("📋 測試結果摘要:")
    print(f"{'='*50}")
    
    for test_name, result in test_results:
        status = "✅ 通過" if result else "❌ 失敗"
        print(f"{test_name:<15} {status}")
    
    print(f"\n📊 總體結果: {passed_tests}/{total_tests} 項測試通過")
    
    if passed_tests == total_tests:
        print("🎉 所有測試通過！系統運行正常。")
        return True
    else:
        print("⚠️  部分測試失敗，請檢查相關功能。")
        return False

if __name__ == '__main__':
    success = main()
    exit(0 if success else 1) 