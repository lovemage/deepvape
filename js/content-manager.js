// 內容管理系統 - 動態載入公告和價格
class ContentManager {
    constructor() {
        this.announcements = [];
        this.prices = {};
        this.pageProductPrices = {};
        this.init();
    }

    async init() {
        try {
            await Promise.all([
                this.loadAnnouncements(),
                this.loadPrices(),
                this.loadPageProductPrices()
            ]);
            this.syncPrices();
            this.updateUI();
        } catch (error) {
            console.error('內容載入失敗:', error);
        }
    }

    // 載入公告數據
    async loadAnnouncements() {
        try {
            const response = await fetch('/data/announcements.json');
            const data = await response.json();
            this.announcements = data.announcements.filter(announcement => {
                if (!announcement.active) return false;
                
                const now = new Date();
                const startDate = announcement.startDate ? new Date(announcement.startDate) : null;
                const endDate = announcement.endDate ? new Date(announcement.endDate) : null;
                
                if (startDate && now < startDate) return false;
                if (endDate && now > endDate) return false;
                
                return true;
            });
        } catch (error) {
            console.error('載入公告失敗:', error);
            this.announcements = [];
        }
    }

    // 載入全域價格數據
    async loadPrices() {
        try {
            const response = await fetch('/data/prices.json');
            const data = await response.json();
            this.prices = {};
            data.products.forEach(product => {
                this.prices[product.id] = product;
            });
            console.log('✅ 全域價格已載入:', this.prices);
        } catch (error) {
            console.error('載入全域價格失敗:', error);
            this.prices = {};
        }
    }

    // 載入個別產品頁面價格數據
    async loadPageProductPrices() {
        try {
            const productFiles = [
                'hta_pods', 'hta_vape', 'ilia_1', 'ilia_disposable', 'ilia_fabric',
                'ilia_pods', 'ilia_leather', 'ilia_5_device', 'ilia_ultra5_pods',
                'sp2_device', 'sp2_pods', 'lana_a8000', 'lana_pods'
            ];

            const promises = productFiles.map(async (file) => {
                try {
                    const response = await fetch(`/data/page_products/${file}.json`);
                    if (response.ok) {
                        const data = await response.json();
                        this.pageProductPrices[data.pageId] = {
                            price: data.price,
                            originalPrice: data.originalPrice,
                            discount: data.discount,
                            productName: data.productName
                        };
                    }
                } catch (error) {
                    console.warn(`載入產品頁面價格失敗: ${file}`, error);
                }
            });

            await Promise.all(promises);
            console.log('✅ 產品頁面價格已載入:', this.pageProductPrices);
        } catch (error) {
            console.error('載入產品頁面價格失敗:', error);
            this.pageProductPrices = {};
        }
    }

    // 同步價格 - 以全域價格為準
    syncPrices() {
        console.log('🔄 開始同步價格...');
        
        Object.keys(this.prices).forEach(productId => {
            const globalPrice = this.prices[productId];
            const pagePrice = this.pageProductPrices[productId];
            
            if (pagePrice && (
                pagePrice.price !== globalPrice.price ||
                pagePrice.originalPrice !== globalPrice.originalPrice ||
                pagePrice.discount !== globalPrice.discount
            )) {
                console.log(`⚠️ 發現價格不一致: ${productId}`, {
                    global: globalPrice,
                    page: pagePrice
                });
                
                // 以全域價格為準，更新頁面價格
                this.pageProductPrices[productId] = {
                    ...pagePrice,
                    price: globalPrice.price,
                    originalPrice: globalPrice.originalPrice,
                    discount: globalPrice.discount
                };
            }
        });
        
        console.log('✅ 價格同步完成');

        // 如果發現任何不一致，就準備一個下載按鈕
        if (Object.keys(this.pageProductPrices).length > 0) {
            this.preparePriceUpdateDownload(this.pageProductPrices);
        }
    }

    // 準備提供給用戶下載的更新文件
    preparePriceUpdateDownload(updatedData) {
        console.warn('⚠️ 偵測到本地產品檔案價格與全域設定不符。已為您準備好更新檔案。');

        const downloadBtn = document.createElement('button');
        downloadBtn.id = 'downloadPriceUpdates';
        downloadBtn.textContent = '📥 下載已同步的價格檔案';
        downloadBtn.style.position = 'fixed';
        downloadBtn.style.bottom = '20px';
        downloadBtn.style.right = '20px';
        downloadBtn.style.zIndex = '9999';
        downloadBtn.style.background = '#e94560';
        downloadBtn.style.color = 'white';
        downloadBtn.style.border = 'none';
        downloadBtn.style.padding = '10px 20px';
        downloadBtn.style.borderRadius = '5px';
        downloadBtn.style.cursor = 'pointer';
        downloadBtn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';

        downloadBtn.onclick = async () => {
            console.log('🔄 開始打包價格更新檔案...');
            const JSZip = window.JSZip;
            if (!JSZip) {
                alert('JSZip 庫未載入，無法打包檔案。請檢查腳本引用。');
                return;
            }
            const zip = new JSZip();

            for (const productId in updatedData) {
                const fileName = `${productId.replace('_product', '')}.json`;
                const fileContent = JSON.stringify(updatedData[productId], null, 2);
                zip.file(fileName, fileContent);
            }

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const downloadUrl = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = 'updated_page_prices.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);

            console.log('✅ 價格更新檔案已下載。請解壓縮並將檔案覆蓋到 /data/page_products/ 目錄下。');
            downloadBtn.textContent = '✅ 下載完成';
            downloadBtn.disabled = true;
            setTimeout(() => downloadBtn.remove(), 3000);
        };

        // 確保按鈕不會重複添加
        if (!document.getElementById('downloadPriceUpdates')) {
            document.body.appendChild(downloadBtn);
            
            // 同時在控制台顯示明確的操作指南
            console.log(
                '%c操作指南：\n' +
                '1. 點擊右下角的「下載已同步的價格檔案」按鈕。\n' +
                '2. 解壓縮下載的 `updated_page_prices.zip` 檔案。\n' +
                '3. 將解壓後的所有 .json 檔案，上傳並覆蓋到您專案的 `/data/page_products/` 目錄下。\n' +
                '4. 完成後，刷新此頁面，價格不一致的警告將會消失。',
                'background: #28a745; color: white; font-size: 14px; padding: 10px; border-radius: 5px;'
            );
        }
    }

    // 更新 UI
    updateUI() {
        this.updateAnnouncements();
        this.updatePrices();
    }

    // 更新公告顯示
    updateAnnouncements() {
        const announcementElement = document.getElementById('announcement');
        const announcementText = document.getElementById('announcementText');
        
        if (!announcementElement || !announcementText) return;

        if (this.announcements.length > 0) {
            // 顯示最高優先級的公告
            const sortedAnnouncements = this.announcements.sort((a, b) => {
                const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });

            const currentAnnouncement = sortedAnnouncements[0];
            announcementText.textContent = currentAnnouncement.text;
            
            // 設置優先級樣式
            announcementElement.className = `announcement priority-${currentAnnouncement.priority}`;
            announcementElement.style.display = 'block';

            // 如果有多個公告，可以輪播顯示
            if (sortedAnnouncements.length > 1) {
                this.startAnnouncementRotation(sortedAnnouncements);
            }
        } else {
            announcementElement.style.display = 'none';
        }
    }

    // 公告輪播
    startAnnouncementRotation(announcements) {
        let currentIndex = 0;
        const announcementText = document.getElementById('announcementText');
        const announcementElement = document.getElementById('announcement');

        setInterval(() => {
            currentIndex = (currentIndex + 1) % announcements.length;
            const announcement = announcements[currentIndex];
            
            announcementText.textContent = announcement.text;
            announcementElement.className = `announcement priority-${announcement.priority}`;
        }, 5000); // 每5秒切換一次
    }

    // 更新價格顯示
    updatePrices() {
        // 更新所有產品價格 - 優先使用同步後的價格
        Object.keys(this.prices).forEach(productId => {
            const product = this.prices[productId];
            const syncedPrice = this.pageProductPrices[productId] || product;
            
            // 更新產品卡片價格（首頁）
            const priceElements = document.querySelectorAll(`[data-product-id="${productId}"] .product-price, [data-product-id="${productId.replace('_product', '')}"] .product-price`);
            
            priceElements.forEach(element => {
                if (syncedPrice.originalPrice && syncedPrice.originalPrice > syncedPrice.price) {
                    element.innerHTML = `
                        NT$ ${syncedPrice.price}
                        <small style="text-decoration: line-through; color: #888; margin-left: 8px;">NT$ ${syncedPrice.originalPrice}</small>
                    `;
                } else {
                    element.textContent = `NT$ ${syncedPrice.price}`;
                }
            });

            // 更新折扣標籤
            if (syncedPrice.discount) {
                const discountElements = document.querySelectorAll(`[data-product-id="${productId}"] .discount-badge, [data-product-id="${productId.replace('_product', '')}"] .discount-badge`);
                discountElements.forEach(element => {
                    element.textContent = syncedPrice.discount;
                    element.style.display = 'inline-block';
                });
            }
        });

        // 如果在產品詳細頁面，也更新產品頁面的價格
        this.updateProductPagePrice();
    }

    // 更新產品詳細頁面價格
    updateProductPagePrice() {
        const productInfo = document.querySelector('.product-info[data-product-id]');
        if (!productInfo) return;

        const productId = productInfo.dataset.productId;
        const syncedPrice = this.pageProductPrices[productId] || this.prices[productId];
        
        if (!syncedPrice) return;

        const priceElement = document.querySelector('.product-price');
        if (priceElement) {
            let priceHTML = `NT$ ${syncedPrice.price}`;
            
            if (syncedPrice.originalPrice && syncedPrice.originalPrice > syncedPrice.price) {
                priceHTML += ` <span style="text-decoration: line-through; color: #888; font-size: 0.9em; margin-left: 8px;">NT$ ${syncedPrice.originalPrice}</span>`;
            }
            
            if (syncedPrice.discount) {
                priceHTML += ` <span style="color: #e94560; font-size: 0.9em; margin-left: 8px;">${syncedPrice.discount}</span>`;
            }
            
            priceElement.innerHTML = priceHTML;
        }
    }

    // 獲取產品價格（優先使用同步後的價格）
    getPrice(productId) {
        const syncedPrice = this.pageProductPrices[productId] || this.prices[productId];
        return syncedPrice?.price || 0;
    }

    // 獲取當前公告
    getCurrentAnnouncements() {
        return this.announcements;
    }

    // 手動重新載入價格（用於價格更新後的即時同步）
    async reloadPrices() {
        console.log('🔄 手動重新載入價格...');
        await Promise.all([
            this.loadPrices(),
            this.loadPageProductPrices()
        ]);
        this.syncPrices();
        this.updatePrices();
        console.log('✅ 價格重新載入完成');
    }
}

// 全域實例
window.contentManager = new ContentManager();

// 關閉公告功能
function closeAnnouncement() {
    const announcementElement = document.getElementById('announcement');
    if (announcementElement) {
        announcementElement.style.display = 'none';
        // 保存用戶關閉狀態到 localStorage
        localStorage.setItem('announcementClosed', 'true');
    }
}

// 檢查用戶是否已關閉公告
function checkAnnouncementStatus() {
    const isClosed = localStorage.getItem('announcementClosed');
    if (isClosed === 'true') {
        const announcementElement = document.getElementById('announcement');
        if (announcementElement) {
            announcementElement.style.display = 'none';
        }
    }
}

// 頁面載入時檢查公告狀態
document.addEventListener('DOMContentLoaded', checkAnnouncementStatus);

// 提供全域函數供其他腳本使用
window.reloadPrices = () => {
    if (window.contentManager) {
        return window.contentManager.reloadPrices();
    }
}; 