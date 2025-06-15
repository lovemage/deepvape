/**
 * 優惠券管理系統
 * 處理優惠券的驗證、計算和管理
 */

class CouponManager {
    constructor() {
        this.coupons = [];
        this.appliedCoupon = null;
        this.init();
    }

    async init() {
        try {
            await this.loadCoupons();
            console.log('優惠券管理系統初始化完成');
        } catch (error) {
            console.error('優惠券管理系統初始化失敗:', error);
        }
    }

    // 載入優惠券數據
    async loadCoupons() {
        try {
            const response = await fetch('/data/coupons.json');
            if (response.ok) {
                const data = await response.json();
                this.coupons = data.coupons || [];
            } else {
                console.warn('無法載入優惠券數據，使用空數據');
                this.coupons = [];
            }
        } catch (error) {
            console.error('載入優惠券數據失敗:', error);
            this.coupons = [];
        }
    }

    // 驗證優惠券
    validateCoupon(code, cartTotal = 0) {
        if (!code || typeof code !== 'string') {
            return {
                valid: false,
                message: '請輸入優惠券代碼'
            };
        }

        const coupon = this.coupons.find(c => 
            c.code.toLowerCase() === code.toLowerCase() && c.active
        );

        if (!coupon) {
            return {
                valid: false,
                message: '優惠券代碼無效'
            };
        }

        // 檢查使用次數
        if (coupon.usedCount >= coupon.totalCount) {
            return {
                valid: false,
                message: '優惠券已用完'
            };
        }

        // 檢查有效期
        const now = new Date();
        const startDate = new Date(coupon.startDate);
        const endDate = new Date(coupon.endDate);

        if (now < startDate) {
            return {
                valid: false,
                message: '優惠券尚未生效'
            };
        }

        if (now > endDate) {
            return {
                valid: false,
                message: '優惠券已過期'
            };
        }

        // 檢查最低消費金額
        if (coupon.minAmount && cartTotal < coupon.minAmount) {
            return {
                valid: false,
                message: `最低消費金額 NT$ ${coupon.minAmount}`
            };
        }

        return {
            valid: true,
            coupon: coupon,
            message: '優惠券可使用'
        };
    }

    // 計算折扣金額
    calculateDiscount(coupon, cartTotal) {
        if (!coupon || cartTotal <= 0) return 0;

        let discount = 0;

        if (coupon.discountType === 'percentage') {
            // 百分比折扣
            discount = Math.round(cartTotal * (coupon.discountValue / 100));
        } else if (coupon.discountType === 'fixed') {
            // 固定金額折扣
            discount = coupon.discountValue;
        }

        // 確保折扣不超過購物車總額
        return Math.min(discount, cartTotal);
    }

    // 應用優惠券
    applyCoupon(code, cartTotal) {
        const validation = this.validateCoupon(code, cartTotal);
        
        if (!validation.valid) {
            return {
                success: false,
                message: validation.message
            };
        }

        const discount = this.calculateDiscount(validation.coupon, cartTotal);
        this.appliedCoupon = validation.coupon;

        return {
            success: true,
            coupon: validation.coupon,
            discount: discount,
            message: `已套用優惠券：${validation.coupon.name}`
        };
    }

    // 移除優惠券
    removeCoupon() {
        this.appliedCoupon = null;
        return {
            success: true,
            message: '已移除優惠券'
        };
    }

    // 獲取當前應用的優惠券
    getAppliedCoupon() {
        return this.appliedCoupon;
    }

    // 獲取優惠券折扣描述
    getDiscountDescription(coupon) {
        if (!coupon) return '';

        if (coupon.discountType === 'percentage') {
            return `${coupon.discountValue}% 折扣`;
        } else if (coupon.discountType === 'fixed') {
            return `NT$ ${coupon.discountValue} 折扣`;
        }

        return '';
    }

    // 使用優惠券（增加使用次數）
    async useCoupon(code) {
        try {
            // 這裡應該調用後端API來更新使用次數
            // 暫時在前端模擬
            const coupon = this.coupons.find(c => c.code === code);
            if (coupon) {
                coupon.usedCount = (coupon.usedCount || 0) + 1;
            }
            
            return {
                success: true,
                message: '優惠券使用成功'
            };
        } catch (error) {
            console.error('使用優惠券失敗:', error);
            return {
                success: false,
                message: '優惠券使用失敗'
            };
        }
    }

    // 獲取所有可用優惠券
    getAvailableCoupons() {
        const now = new Date();
        return this.coupons.filter(coupon => {
            const startDate = new Date(coupon.startDate);
            const endDate = new Date(coupon.endDate);
            
            return coupon.active && 
                   coupon.usedCount < coupon.totalCount &&
                   now >= startDate && 
                   now <= endDate;
        });
    }
}

// 創建全局實例
window.CouponManager = new CouponManager();

// 導出供其他模塊使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CouponManager;
} 