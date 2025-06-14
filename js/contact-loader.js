// 通用聯繫信息載入器
class ContactLoader {
    constructor() {
        this.apiUrl = '/.netlify/functions/contact';
        this.defaultContact = {
            email: "service@deepvape.com",
            line_id: "@deepvape",
            service_hours: "週一至週五 10:00-18:00",
            telegram: "https://t.me/deepvape_support",
            instagram: "https://instagram.com/deepvape_official",
            facebook: "https://facebook.com/deepvape.official"
        };
    }

    // 載入聯繫信息
    async loadContactInfo() {
        try {
            const response = await fetch(this.apiUrl);
            if (response.ok) {
                const data = await response.json();
                const contact = data.contact;
                this.updateContactElements(contact);
                return contact;
            } else {
                console.log('使用默認聯繫信息');
                this.updateContactElements(this.defaultContact);
                return this.defaultContact;
            }
        } catch (error) {
            console.log('無法載入聯繫信息:', error);
            this.updateContactElements(this.defaultContact);
            return this.defaultContact;
        }
    }

    // 更新頁面中的聯繫信息元素
    updateContactElements(contact) {
        // 更新 LINE ID
        const lineIdElements = document.querySelectorAll('#lineId, .line-id');
        lineIdElements.forEach(el => {
            if (el) el.textContent = contact.line_id;
        });

        // 更新 Email
        const emailElements = document.querySelectorAll('#email, .email');
        emailElements.forEach(el => {
            if (el) el.textContent = contact.email;
        });

        // 更新服務時間
        const serviceHoursElements = document.querySelectorAll('#serviceHours, .service-hours');
        serviceHoursElements.forEach(el => {
            if (el) el.textContent = contact.service_hours;
        });

        // 更新社交媒體連結
        const facebookLinks = document.querySelectorAll('#facebookLink, .facebook-link');
        facebookLinks.forEach(el => {
            if (el) el.href = contact.facebook;
        });

        const instagramLinks = document.querySelectorAll('#instagramLink, .instagram-link');
        instagramLinks.forEach(el => {
            if (el) el.href = contact.instagram;
        });

        const telegramLinks = document.querySelectorAll('#telegramLink, .telegram-link');
        telegramLinks.forEach(el => {
            if (el) el.href = contact.telegram;
        });
    }

    // 初始化 - 自動載入聯繫信息
    init() {
        // 如果頁面已載入完成，立即執行
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.loadContactInfo();
            });
        } else {
            this.loadContactInfo();
        }
    }
}

// 創建全局實例
window.contactLoader = new ContactLoader();

// 自動初始化
window.contactLoader.init();

// 提供全局函數供其他腳本使用
window.loadContactInfo = () => window.contactLoader.loadContactInfo(); 