/**
 * 購物車動畫系統
 * 提供統一的加入購物車動畫效果
 */

class CartAnimation {
    constructor() {
        this.isAnimating = false;
        this.init();
    }

    init() {
        // 創建動畫樣式
        this.injectStyles();
        
        // 創建通知容器
        this.createNotificationContainer();
    }

    /**
     * 注入動畫樣式
     */
    injectStyles() {
        if (document.getElementById('cart-animation-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'cart-animation-styles';
        styles.textContent = `
            /* 通知容器 */
            .cart-notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            }

            /* 通知樣式 */
            .cart-notification {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                gap: 0.75rem;
                font-weight: 500;
                font-size: 0.95rem;
                margin-bottom: 10px;
                transform: translateX(100%) scale(0.8);
                opacity: 0;
                transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.2);
                position: relative;
                overflow: hidden;
            }

            .cart-notification::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: left 0.5s;
            }

            .cart-notification.show {
                transform: translateX(0) scale(1);
                opacity: 1;
            }

            .cart-notification.show::before {
                left: 100%;
            }

            .cart-notification.success {
                background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            }

            .cart-notification.warning {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            }

            .cart-notification.info {
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            }

            .cart-notification-icon {
                font-size: 1.2rem;
                animation: pulse 2s infinite;
            }

            .cart-notification-content {
                flex: 1;
            }

            .cart-notification-title {
                font-weight: 600;
                margin-bottom: 0.25rem;
                font-size: 1rem;
            }

            .cart-notification-message {
                font-size: 0.85rem;
                opacity: 0.9;
            }

            /* 飛行動畫 */
            .flying-product {
                position: fixed;
                width: 60px;
                height: 60px;
                border-radius: 10px;
                background: white;
                box-shadow: 0 5px 20px rgba(0,0,0,0.3);
                z-index: 9999;
                pointer-events: none;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }

            .flying-product img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 8px;
            }

            .flying-product-icon {
                font-size: 1.5rem;
                color: #667eea;
            }

            /* 購物車圖標脈衝效果 */
            .cart-pulse {
                animation: cartPulse 0.6s ease-out;
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            @keyframes cartPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.3); }
                100% { transform: scale(1); }
            }

            /* 按鈕點擊效果 */
            .btn-cart-clicked {
                animation: btnCartClick 0.3s ease-out;
            }

            @keyframes btnCartClick {
                0% { transform: scale(1); }
                50% { transform: scale(0.95); }
                100% { transform: scale(1); }
            }

            /* 成功粒子效果 */
            .success-particles {
                position: fixed;
                pointer-events: none;
                z-index: 9998;
            }

            .particle {
                position: absolute;
                width: 6px;
                height: 6px;
                background: #38ef7d;
                border-radius: 50%;
                animation: particleFloat 1.5s ease-out forwards;
            }

            @keyframes particleFloat {
                0% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-100px) scale(0);
                }
            }

            /* 響應式設計 */
            @media (max-width: 768px) {
                .cart-notification-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                }

                .cart-notification {
                    transform: translateY(-100%) scale(0.8);
                }

                .cart-notification.show {
                    transform: translateY(0) scale(1);
                }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * 創建通知容器
     */
    createNotificationContainer() {
        if (document.querySelector('.cart-notification-container')) return;

        const container = document.createElement('div');
        container.className = 'cart-notification-container';
        document.body.appendChild(container);
    }

    /**
     * 獲取產品圖片路徑
     */
    getProductImage(productName, productImage) {
        // 如果已提供圖片路徑，直接使用
        if (productImage) {
            return productImage;
        }

        // 產品圖片映射表
        const productImageMap = {
            'LANA A8000': '/lana_a8000/lana_a8000.webp',
            'LANA Pods': '/lana_pods/lana_ceramic_pods_main.webp',
            'SP2 Device': '/sp2_v/sp2_device_main_showcase.jpg',
            'SP2 Pods': '/sp2_pods/sp2_pods_main.webp',
            'ILIA 1': '/ilia_1/ilia_gen1_main_device.jpg',
            'ILIA 5': '/ilia_device5/IMAGE 2025-06-16 13:24:03.jpg',
            'ILIA Pods': '/ilia_pod5/ilia-pod5.jpg',
            'ILIA Ultra5 Pods': '/ilia_pod5/ilia-pod5.jpg',
            'ILIA 拋棄式': '/ilia_a_4/-哩亞拋棄式-1000x1000.jpg.webp',
            'ILIA 布料': '/ilia_Bu/ilia_fabric_device_main.png',
            'ILIA 皮革': '/ilia_L/ilia_leather_device_showcase.jpg',
            'HTA Vape': '/hta_vape/hta_spade_device.webp',
            'HTA Pods': '/hta_pods/hta_spade_pods.webp'
        };

        // 嘗試精確匹配
        if (productImageMap[productName]) {
            return productImageMap[productName];
        }

        // 嘗試模糊匹配
        for (const [key, value] of Object.entries(productImageMap)) {
            if (productName.includes(key) || key.includes(productName)) {
                return value;
            }
        }

        // 從頁面中自動檢測產品圖片
        const productImg = document.querySelector('.product-image img, .product-showcase img, .main-product-image img');
        if (productImg && productImg.src) {
            return productImg.src;
        }

        // 返回 null，將使用圖標
        return null;
    }

    /**
     * 顯示加入購物車動畫
     */
    async showAddToCartAnimation(options = {}) {
        const {
            productName = '商品',
            variant = '',
            price = 0,
            quantity = 1,
            productImage = null,
            sourceElement = null,
            type = 'success'
        } = options;

        if (this.isAnimating) return;
        this.isAnimating = true;

        try {
            // 獲取正確的產品圖片
            const finalProductImage = this.getProductImage(productName, productImage);

            // 1. 按鈕點擊效果
            if (sourceElement) {
                sourceElement.classList.add('btn-cart-clicked');
                setTimeout(() => {
                    sourceElement.classList.remove('btn-cart-clicked');
                }, 300);
            }

            // 2. 飛行動畫
            if (sourceElement) {
                await this.createFlyingAnimation(sourceElement, finalProductImage);
            }

            // 3. 購物車圖標脈衝
            this.pulseCartIcon();

            // 4. 成功粒子效果
            if (type === 'success') {
                this.createSuccessParticles();
            }

            // 5. 顯示通知
            this.showNotification({
                type,
                title: type === 'success' ? '✨ 加入購物車成功！' : '⚠️ 注意',
                message: type === 'success' 
                    ? `${productName}${variant ? ` (${variant})` : ''} × ${quantity}` 
                    : productName,
                duration: 3000
            });

            // 6. 更新購物車數量（帶動畫）
            this.updateCartCountWithAnimation();

        } finally {
            setTimeout(() => {
                this.isAnimating = false;
            }, 1000);
        }
    }

    /**
     * 創建飛行動畫
     */
    createFlyingAnimation(sourceElement, productImage) {
        return new Promise((resolve) => {
            const flyingProduct = document.createElement('div');
            flyingProduct.className = 'flying-product';

            // 設置飛行元素內容
            if (productImage) {
                const img = document.createElement('img');
                img.alt = 'Product';
                
                // 添加圖片載入錯誤處理
                img.onerror = () => {
                    console.warn('產品圖片載入失敗，使用備用圖標:', productImage);
                    // 移除圖片，添加備用圖標
                    flyingProduct.innerHTML = '';
                    const icon = document.createElement('i');
                    icon.className = 'fas fa-box flying-product-icon';
                    flyingProduct.appendChild(icon);
                };
                
                img.onload = () => {
                    console.log('產品圖片載入成功:', productImage);
                };
                
                // 設置圖片源（放在事件監聽器之後）
                img.src = productImage;
                flyingProduct.appendChild(img);
            } else {
                const icon = document.createElement('i');
                icon.className = 'fas fa-box flying-product-icon';
                flyingProduct.appendChild(icon);
            }

            // 獲取起始位置
            const sourceRect = sourceElement.getBoundingClientRect();
            const startX = sourceRect.left + sourceRect.width / 2;
            const startY = sourceRect.top + sourceRect.height / 2;

            // 獲取目標位置（購物車圖標）
            const cartIcon = document.querySelector('#cart-count') || 
                           document.querySelector('.fa-shopping-cart') ||
                           document.querySelector('[href*="cart"]');
            
            let endX = window.innerWidth - 50;
            let endY = 50;

            if (cartIcon) {
                const cartRect = cartIcon.getBoundingClientRect();
                endX = cartRect.left + cartRect.width / 2;
                endY = cartRect.top + cartRect.height / 2;
            }

            // 設置初始位置
            flyingProduct.style.left = startX - 30 + 'px';
            flyingProduct.style.top = startY - 30 + 'px';

            document.body.appendChild(flyingProduct);

            // 執行飛行動畫
            setTimeout(() => {
                flyingProduct.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                flyingProduct.style.left = endX - 30 + 'px';
                flyingProduct.style.top = endY - 30 + 'px';
                flyingProduct.style.transform = 'scale(0.3)';
                flyingProduct.style.opacity = '0';

                setTimeout(() => {
                    if (flyingProduct.parentNode) {
                        flyingProduct.parentNode.removeChild(flyingProduct);
                    }
                    resolve();
                }, 800);
            }, 50);
        });
    }

    /**
     * 購物車圖標脈衝效果
     */
    pulseCartIcon() {
        const cartIcon = document.querySelector('#cart-count') || 
                        document.querySelector('.fa-shopping-cart') ||
                        document.querySelector('[href*="cart"]');

        if (cartIcon) {
            cartIcon.classList.add('cart-pulse');
            setTimeout(() => {
                cartIcon.classList.remove('cart-pulse');
            }, 600);
        }
    }

    /**
     * 創建成功粒子效果
     */
    createSuccessParticles() {
        const container = document.createElement('div');
        container.className = 'success-particles';
        
        // 在購物車圖標位置創建粒子
        const cartIcon = document.querySelector('#cart-count') || 
                        document.querySelector('.fa-shopping-cart') ||
                        document.querySelector('[href*="cart"]');

        let centerX = window.innerWidth - 50;
        let centerY = 50;

        if (cartIcon) {
            const cartRect = cartIcon.getBoundingClientRect();
            centerX = cartRect.left + cartRect.width / 2;
            centerY = cartRect.top + cartRect.height / 2;
        }

        container.style.left = centerX + 'px';
        container.style.top = centerY + 'px';

        // 創建多個粒子
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const angle = (i / 8) * Math.PI * 2;
            const distance = 30 + Math.random() * 20;
            
            particle.style.left = Math.cos(angle) * distance + 'px';
            particle.style.top = Math.sin(angle) * distance + 'px';
            particle.style.animationDelay = Math.random() * 0.3 + 's';
            
            container.appendChild(particle);
        }

        document.body.appendChild(container);

        setTimeout(() => {
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
        }, 1500);
    }

    /**
     * 顯示通知
     */
    showNotification(options = {}) {
        const {
            type = 'success',
            title = '通知',
            message = '',
            duration = 3000
        } = options;

        const container = document.querySelector('.cart-notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `cart-notification ${type}`;

        const iconMap = {
            success: 'fa-check-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle',
            error: 'fa-times-circle'
        };

        notification.innerHTML = `
            <div class="cart-notification-icon">
                <i class="fas ${iconMap[type] || iconMap.success}"></i>
            </div>
            <div class="cart-notification-content">
                <div class="cart-notification-title">${title}</div>
                ${message ? `<div class="cart-notification-message">${message}</div>` : ''}
            </div>
        `;

        container.appendChild(notification);

        // 顯示動畫
        setTimeout(() => {
            notification.classList.add('show');
        }, 50);

        // 自動移除
        setTimeout(() => {
            notification.style.transform = window.innerWidth <= 768 
                ? 'translateY(-100%) scale(0.8)' 
                : 'translateX(100%) scale(0.8)';
            notification.style.opacity = '0';

            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 400);
        }, duration);
    }

    /**
     * 更新購物車數量（帶動畫）
     */
    updateCartCountWithAnimation() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            // 數字變化動畫
            const currentCount = parseInt(cartCountElement.textContent) || 0;
            this.animateNumber(cartCountElement, currentCount, totalItems);
        }
    }

    /**
     * 數字變化動畫
     */
    animateNumber(element, from, to) {
        const duration = 500;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.round(from + (to - from) * progress);
            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * 顯示警告通知
     */
    showWarning(message) {
        this.showNotification({
            type: 'warning',
            title: '⚠️ 注意',
            message: message,
            duration: 3000
        });
    }

    /**
     * 顯示錯誤通知
     */
    showError(message) {
        this.showNotification({
            type: 'error',
            title: '❌ 錯誤',
            message: message,
            duration: 4000
        });
    }

    /**
     * 顯示信息通知
     */
    showInfo(message) {
        this.showNotification({
            type: 'info',
            title: 'ℹ️ 信息',
            message: message,
            duration: 2500
        });
    }
}

// 創建全域實例
window.CartAnimation = new CartAnimation();

// 向後兼容的函數
window.showNotification = function(message, type = 'success') {
    if (type === 'success') {
        window.CartAnimation.showAddToCartAnimation({
            productName: message.replace('✅ 已將 ', '').replace(' 加入購物車！', ''),
            type: 'success'
        });
    } else if (type === 'warning') {
        window.CartAnimation.showWarning(message);
    } else if (type === 'error') {
        window.CartAnimation.showError(message);
    } else {
        window.CartAnimation.showInfo(message);
    }
};

// 導出類
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartAnimation;
} 