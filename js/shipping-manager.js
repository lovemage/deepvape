/**
 * 運費管理器 - 處理滿額免運和運費計算
 */
class ShippingManager {
    constructor() {
        this.settings = null;
        this.initialized = false;
    }

    /**
     * 初始化運費管理器
     */
    async init() {
        try {
            console.log('初始化運費管理器...');
            await this.loadShippingSettings();
            this.initialized = true;
            console.log('運費管理器初始化完成');
        } catch (error) {
            console.error('運費管理器初始化失敗:', error);
            // 使用預設設定
            this.settings = this.getDefaultSettings();
            this.initialized = true;
        }
    }

    /**
     * 載入運費設定
     */
    async loadShippingSettings() {
        try {
            const response = await fetch('/data/shipping-settings.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.settings = await response.json();
            console.log('運費設定載入成功:', this.settings);
        } catch (error) {
            console.warn('載入運費設定失敗，使用預設設定:', error);
            this.settings = this.getDefaultSettings();
        }
    }

    /**
     * 獲取預設運費設定
     */
    getDefaultSettings() {
        return {
            freeShipping: {
                enabled: true,
                threshold: 1000,
                description: "全館滿$1000免運費",
                showOnCart: true,
                showOnProduct: true
            },
            shippingRates: {
                standard: 60,
                outlying: 140
            },
            specialRules: []
        };
    }

    /**
     * 計算運費
     * @param {number} subtotal - 商品小計
     * @param {string} shippingMethod - 配送方式 ('standard', 'outlying')
     * @param {Array} items - 商品列表（可選，用於特殊規則）
     * @returns {Object} 運費計算結果
     */
    calculateShipping(subtotal, shippingMethod = 'standard', items = []) {
        if (!this.initialized || !this.settings) {
            console.warn('運費管理器未初始化，使用預設運費');
            return {
                shippingFee: 60,
                isFreeShipping: false,
                freeShippingThreshold: 1000,
                remainingForFreeShipping: Math.max(0, 1000 - subtotal),
                description: "全館滿$1000免運費"
            };
        }

        const { freeShipping, shippingRates, specialRules } = this.settings;

        // 檢查是否符合免運條件
        const isFreeShipping = freeShipping.enabled && subtotal >= freeShipping.threshold;

        // 如果符合免運條件，運費為0
        if (isFreeShipping) {
            return {
                shippingFee: 0,
                isFreeShipping: true,
                freeShippingThreshold: freeShipping.threshold,
                remainingForFreeShipping: 0,
                description: freeShipping.description
            };
        }

        // 檢查特殊規則
        let applicableRule = null;
        if (specialRules && specialRules.length > 0) {
            applicableRule = specialRules.find(rule => 
                rule.active && this.checkSpecialRuleCondition(rule, items, subtotal)
            );
        }

        // 如果有適用的特殊規則
        if (applicableRule) {
            const specialFreeShipping = applicableRule.freeShippingThreshold && 
                                      subtotal >= applicableRule.freeShippingThreshold;
            
            return {
                shippingFee: specialFreeShipping ? 0 : applicableRule.shippingFee,
                isFreeShipping: specialFreeShipping,
                freeShippingThreshold: applicableRule.freeShippingThreshold || freeShipping.threshold,
                remainingForFreeShipping: specialFreeShipping ? 0 : 
                    Math.max(0, (applicableRule.freeShippingThreshold || freeShipping.threshold) - subtotal),
                description: specialFreeShipping ? 
                    `${applicableRule.name} - 免運費` : 
                    `${applicableRule.name} - NT$ ${applicableRule.shippingFee}`,
                specialRule: applicableRule.name
            };
        }

        // 使用標準運費
        const standardShippingFee = shippingRates[shippingMethod] || shippingRates.standard;

        return {
            shippingFee: standardShippingFee,
            isFreeShipping: false,
            freeShippingThreshold: freeShipping.threshold,
            remainingForFreeShipping: Math.max(0, freeShipping.threshold - subtotal),
            description: freeShipping.description
        };
    }

    /**
     * 檢查特殊規則條件（簡化版本，可根據需要擴展）
     */
    checkSpecialRuleCondition(rule, items, subtotal) {
        // 這裡可以根據實際需求實現更複雜的條件檢查
        // 目前只是一個基礎框架
        return false;
    }

    /**
     * 獲取免運提示文字
     * @param {number} subtotal - 當前小計
     * @returns {string} 提示文字
     */
    getFreeShippingHint(subtotal) {
        if (!this.initialized || !this.settings) {
            return "全館滿$1000免運費";
        }

        const { freeShipping } = this.settings;
        
        if (!freeShipping.enabled) {
            return "";
        }

        if (subtotal >= freeShipping.threshold) {
            return "🎉 已享免運優惠！";
        }

        const remaining = freeShipping.threshold - subtotal;
        return `再消費 NT$ ${remaining} 即可享免運優惠！`;
    }

    /**
     * 獲取運費設定
     */
    getSettings() {
        return this.settings;
    }

    /**
     * 獲取免運門檻
     */
    getFreeShippingThreshold() {
        if (!this.initialized || !this.settings) {
            return 1000;
        }
        return this.settings.freeShipping.threshold;
    }

    /**
     * 檢查是否啟用免運
     */
    isFreeShippingEnabled() {
        if (!this.initialized || !this.settings) {
            return true;
        }
        return this.settings.freeShipping.enabled;
    }

    /**
     * 獲取標準運費
     */
    getStandardShippingRate() {
        if (!this.initialized || !this.settings) {
            return 60;
        }
        return this.settings.shippingRates.standard;
    }

    /**
     * 獲取離島運費
     */
    getOutlyingShippingRate() {
        if (!this.initialized || !this.settings) {
            return 140;
        }
        return this.settings.shippingRates.outlying;
    }

    /**
     * 更新運費設定（用於動態更新）
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        console.log('運費設定已更新:', this.settings);
    }
}

// 創建全域實例
window.ShippingManager = new ShippingManager();

// 自動初始化
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await window.ShippingManager.init();
    } catch (error) {
        console.error('運費管理器自動初始化失敗:', error);
    }
}); 