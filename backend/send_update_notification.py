#!/usr/bin/env python3
"""
Deepvape 更新通知發送器
用於發送網站更新通知到 Telegram
"""

import os
import asyncio
from datetime import datetime
from telegram import Bot

# 配置
TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', 'YOUR_BOT_TOKEN_HERE')
NOTIFICATION_CHAT_ID = os.environ.get('NOTIFICATION_CHAT_ID', 'YOUR_CHAT_ID_HERE')

async def send_update_notification():
    """發送更新通知"""
    
    # 更新通知文案
    notification_text = """
🎉 **Deepvape 網站更新通知** 🎉

📅 **更新時間：** {update_time}

✨ **本次更新內容：**

📱 **移動端體驗優化**
• 手機版產品展示改為雙排顯示，一次可以看到更多商品
• 優化了不同手機螢幕尺寸的顯示效果
• 提升移動端購物瀏覽體驗

🎨 **界面設計簡化**
• 精簡導航選單，移除多餘按鈕
• 專注於產品展示和購物功能
• 整體界面更加簡潔美觀

🛍️ **購物流程優化**
• 導航列專注於產品分類瀏覽
• 保留核心功能：產品瀏覽、購物車
• 減少干擾元素，讓客戶更專注於選購商品

📞 **客服聯繫方式**
• 所有客服聯繫統一使用 LINE 官方帳號
• 確保客戶能快速獲得專業服務支援

---

🎯 **更新重點：讓您的購物體驗更流暢、更直觀！**

🌐 **立即體驗：** https://deepvape.org
📱 **Line客服：** https://line.me/ti/p/euNh8K-s3e

感謝您的支持！🙏
    """.format(update_time=datetime.now().strftime('%Y年%m月%d日 %H:%M'))
    
    try:
        bot = Bot(token=TELEGRAM_BOT_TOKEN)
        
        # 發送通知
        await bot.send_message(
            chat_id=NOTIFICATION_CHAT_ID,
            text=notification_text,
            parse_mode='Markdown'
        )
        
        print("✅ 更新通知發送成功！")
        print(f"📱 發送到聊天室：{NOTIFICATION_CHAT_ID}")
        print(f"⏰ 發送時間：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
    except Exception as e:
        print(f"❌ 發送通知失敗：{str(e)}")
        print("💡 請檢查：")
        print("1. TELEGRAM_BOT_TOKEN 是否正確設置")
        print("2. NOTIFICATION_CHAT_ID 是否正確")
        print("3. 機器人是否已加入目標聊天室")

async def send_price_table_notification():
    """發送價格表通知"""
    
    price_table_text = """
💰 **Deepvape 統一價格表**

📅 **更新日期：** {update_date}

🏷️ **所有產品價格已統一，請參考以下價格表：**

━━━━━━━━━━━━━━━━━━━━

🖥️ **主機系列**
┌─────────────────────┐
│ SP2 一代主機      NT$ 650 │
│ ILIA 一代主機     NT$ 650 │
│ ILIA 皮革主機     NT$ 650 │
│ ILIA 布紋主機     NT$ 650 │
│ HTA 黑桃主機      NT$ 450 │
└─────────────────────┘

💨 **煙彈系列**
┌─────────────────────┐
│ SP2 煙彈          NT$ 350 │
│ ILIA 煙彈         NT$ 300 │
│ LANA 煙彈         NT$ 280 │
│ HTA 煙彈          NT$ 260 │
└─────────────────────┘

🔥 **拋棄式系列**
┌─────────────────────┐
│ ILIA 拋棄式四代   NT$ 320 │
│ ├ 批發價(20支+)   NT$ 310 │
│ LANA A8000 拋棄式 NT$ 320 │
└─────────────────────┘

━━━━━━━━━━━━━━━━━━━━

✅ **價格保證：**
• 全站價格統一顯示
• 首頁、產品頁、購物車價格一致
• 批發優惠明確標示

🚚 **運費：** 全台 NT$ 60 (7-11/全家/萊爾富店到店)

📱 **訂購方式：**
• 🌐 官網：https://deepvape.org
• 📱 Line：@deepvape

⚠️ **注意事項：**
• 價格如有調整將另行通知
• 批發價格需達最低數量要求
• 所有產品均為正品保證

有任何問題歡迎聯繫客服！🙋‍♂️
    """.format(update_date=datetime.now().strftime('%Y年%m月%d日'))
    
    try:
        bot = Bot(token=TELEGRAM_BOT_TOKEN)
        
        # 發送價格表
        await bot.send_message(
            chat_id=NOTIFICATION_CHAT_ID,
            text=price_table_text,
            parse_mode='Markdown'
        )
        
        print("✅ 價格表通知發送成功！")
        
    except Exception as e:
        print(f"❌ 發送價格表失敗：{str(e)}")

async def main():
    """主函數"""
    print("🤖 Deepvape 更新通知發送器")
    print("=" * 40)
    
    if TELEGRAM_BOT_TOKEN == 'YOUR_BOT_TOKEN_HERE':
        print("❌ 請先設定 TELEGRAM_BOT_TOKEN 環境變數")
        print("💡 設定方式：")
        print("export TELEGRAM_BOT_TOKEN='your_bot_token_here'")
        print("export NOTIFICATION_CHAT_ID='your_chat_id_here'")
        return
    
    print("📤 發送更新通知...")
    await send_update_notification()
    
    print("\n📊 發送價格表...")
    await send_price_table_notification()
    
    print("\n🎉 所有通知發送完成！")

if __name__ == '__main__':
    asyncio.run(main()) 