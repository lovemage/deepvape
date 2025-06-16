/**
 * Netlify 兼容性檢查和修復腳本
 * 解決靜態網站託管環境中的 JavaScript 執行問題
 */

class NetlifyCompatibility {
    constructor() {
        this.isNetlify = this.detectNetlifyEnvironment();
        this.baseUrl = this.getBaseUrl();
        this.init();
    }

    /**
     * 檢測是否在 Netlify 環境中
     */
    detectNetlifyEnvironment() {
        // 檢查 URL 是否包含 netlify.app 或 netlify.com
        const hostname = window.location.hostname;
        const isNetlifyDomain = hostname.includes('netlify.app') || 
                               hostname.includes('netlify.com') ||
                               hostname.includes('deepvape.org');
        
        // 檢查是否有 Netlify 特定的全域變數
        const hasNetlifyGlobals = typeof window.netlifyIdentity !== 'undefined';
        
        return isNetlifyDomain || hasNetlifyGlobals;
    }

    /**
     * 獲取正確的基礎 URL
     */
    getBaseUrl() {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const port = window.location.port;
        
        let baseUrl = `${protocol}//${hostname}`;
        if (port && port !== '80' && port !== '443') {
            baseUrl += `:${port}`;
        }
        
        return baseUrl;
    }

    /**
     * 初始化兼容性修復
     */
    init() {
        console.log('🌐 Netlify 兼容性檢查開始');
        console.log(`環境檢測: ${this.isNetlify ? 'Netlify' : '本地/其他'}`);
        console.log(`基礎 URL: ${this.baseUrl}`);

        if (this.isNetlify) {
            this.applyNetlifyFixes();
        }

        this.setupGlobalErrorHandling();
        this.checkResourceAvailability();
    }

    /**
     * 應用 Netlify 特定修復
     */
    applyNetlifyFixes() {
        console.log('🔧 應用 Netlify 特定修復');

        // 修復 fetch 路徑
        this.patchFetchPaths();
        
        // 設置 CORS 處理
        this.setupCORSHandling();
        
        // 修復相對路徑問題
        this.fixRelativePaths();
    }

    /**
     * 修復 fetch 請求路徑
     */
    patchFetchPaths() {
        const originalFetch = window.fetch;
        
        window.fetch = async (url, options = {}) => {
            let fixedUrl = url;
            
            // 修復相對路徑
            if (typeof url === 'string' && !url.startsWith('http') && !url.startsWith('//')) {
                if (!url.startsWith('/')) {
                    fixedUrl = '/' + url;
                }
                fixedUrl = this.baseUrl + fixedUrl;
            }
            
            console.log(`📡 Fetch 請求: ${url} -> ${fixedUrl}`);
            
            try {
                const response = await originalFetch(fixedUrl, {
                    ...options,
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers
                    }
                });
                
                if (!response.ok) {
                    console.warn(`⚠️ HTTP ${response.status}: ${fixedUrl}`);
                }
                
                return response;
            } catch (error) {
                console.error(`❌ Fetch 失敗: ${fixedUrl}`, error);
                throw error;
            }
        };
    }

    /**
     * 設置 CORS 處理
     */
    setupCORSHandling() {
        // 監聽 CORS 錯誤
        window.addEventListener('error', (event) => {
            if (event.message && event.message.includes('CORS')) {
                console.error('🚫 CORS 錯誤檢測到:', event.message);
                this.handleCORSError(event);
            }
        });
    }

    /**
     * 處理 CORS 錯誤
     */
    handleCORSError(event) {
        console.log('🔄 嘗試 CORS 錯誤恢復');
        
        // 可以在這裡實現備用載入策略
        // 例如使用 Netlify Functions 作為代理
    }

    /**
     * 修復相對路徑問題
     */
    fixRelativePaths() {
        // 修復圖片路徑
        this.fixImagePaths();
        
        // 修復腳本路徑
        this.fixScriptPaths();
    }

    /**
     * 修復圖片路徑
     */
    fixImagePaths() {
        const images = document.querySelectorAll('img[src]');
        images.forEach(img => {
            const src = img.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('//') && !src.startsWith('/')) {
                img.setAttribute('src', '/' + src);
            }
        });
    }

    /**
     * 修復腳本路徑
     */
    fixScriptPaths() {
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            const src = script.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('//') && !src.startsWith('/')) {
                script.setAttribute('src', '/' + src);
            }
        });
    }

    /**
     * 設置全域錯誤處理
     */
    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('🚨 全域錯誤:', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('🚨 未處理的 Promise 拒絕:', event.reason);
        });
    }

    /**
     * 檢查資源可用性
     */
    async checkResourceAvailability() {
        console.log('🔍 檢查關鍵資源可用性');

        const criticalResources = [
            '/data/page_products/ilia_1.json',
            '/js/product-manager.js',
            '/js/variant-selector.js'
        ];

        for (const resource of criticalResources) {
            try {
                const response = await fetch(resource, { method: 'HEAD' });
                const status = response.ok ? '✅' : '❌';
                console.log(`${status} ${resource}: ${response.status}`);
            } catch (error) {
                console.log(`❌ ${resource}: 無法訪問`);
            }
        }
    }

    /**
     * 創建資源載入器
     */
    createResourceLoader() {
        return {
            loadJSON: async (path) => {
                try {
                    const response = await fetch(path);
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    return await response.json();
                } catch (error) {
                    console.error(`載入 JSON 失敗: ${path}`, error);
                    return null;
                }
            },

            loadScript: (src) => {
                return new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = src;
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }
        };
    }

    /**
     * 等待 DOM 準備就緒
     */
    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    /**
     * 等待特定全域變數載入
     */
    waitForGlobal(globalName, timeout = 10000) {
        return new Promise((resolve, reject) => {
            if (window[globalName]) {
                resolve(window[globalName]);
                return;
            }

            const startTime = Date.now();
            const checkInterval = setInterval(() => {
                if (window[globalName]) {
                    clearInterval(checkInterval);
                    resolve(window[globalName]);
                } else if (Date.now() - startTime > timeout) {
                    clearInterval(checkInterval);
                    reject(new Error(`等待 ${globalName} 超時`));
                }
            }, 100);
        });
    }

    /**
     * 診斷工具
     */
    diagnose() {
        console.log('🔧 Netlify 兼容性診斷');
        console.log('環境信息:', {
            userAgent: navigator.userAgent,
            hostname: window.location.hostname,
            protocol: window.location.protocol,
            isNetlify: this.isNetlify,
            baseUrl: this.baseUrl
        });

        console.log('全域變數檢查:', {
            ProductManager: !!window.ProductManager,
            VariantSelector: !!window.VariantSelector,
            netlifyIdentity: !!window.netlifyIdentity
        });

        console.log('DOM 狀態:', {
            readyState: document.readyState,
            scriptsLoaded: document.querySelectorAll('script').length,
            imagesLoaded: document.querySelectorAll('img').length
        });
    }
}

// 創建全域實例
window.NetlifyCompatibility = new NetlifyCompatibility();

// 提供診斷工具
window.diagnoseNetlify = () => window.NetlifyCompatibility.diagnose();

console.log('🌐 Netlify 兼容性腳本載入完成'); 