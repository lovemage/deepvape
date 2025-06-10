#!/usr/bin/env python3
"""
測試變體系統
"""

from app import app, db, ProductVariant

def test_variants():
    with app.app_context():
        variants = ProductVariant.query.all()
        print(f'✅ 成功讀取 {len(variants)} 個產品變體')
        for v in variants[:5]:
            print(f'  • {v.product.name} - {v.variant_name}: {v.stock_quantity}')

if __name__ == '__main__':
    test_variants() 