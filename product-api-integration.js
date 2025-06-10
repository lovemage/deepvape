/**
 * 產品頁面 API 整合腳本
 * 用於從後台 API 獲取產品數據並更新頁面內容
 */

// 產品頁面映射
const PRODUCT_PAGE_MAP = {
    'sp2_product.html': 'SP2 一代主機',
    'ilia_1_product.html': 'ILIA 一代主機',
    'ilia_leather_product.html': 'ILIA 皮革主機',
    'ilia_fabric_product.html': 'ILIA 哩亞布紋主機',
    'hta_vape_product.html': 'HTA 黑桃主機',
    'ilia_pods_product.html': 'ILIA 發光煙彈',
    'sp2_pods_product.html': 'SP2 煙彈',
    'ilia_disposable_product.html': 'ILIA 拋棄式四代'
};

// 獲取當前頁面的產品名稱
function getCurrentProductName() {
    const currentPage = window.location.pathname.split('/').pop();
    return PRODUCT_PAGE_MAP[currentPage];
}

// 從後台 API 載入產品數據
async function loadProductData() {
    const productName = getCurrentProductName();
    if (!productName) {
        console.log('無法識別當前產品頁面');
        return null;
    }

    try {
        const response = await fetch('http://127.0.0.1:5001/api/products');
        if (response.ok) {
            const products = await response.json();
            const product = products.find(p => p.name === productName);
            
            if (product) {
                console.log('成功載入產品數據:', product.name);
                return product;
            } else {
                console.log('找不到產品:', productName);
                return null;
            }
        } else {
            console.error('API 請求失敗');
            return null;
        }
    } catch (error) {
        console.error('載入產品數據時發生錯誤:', error);
        return null;
    }
}

// 更新產品頁面內容
function updateProductPage(product) {
    if (!product) return;

    // 更新標題
    const titleElement = document.querySelector('.product-title');
    if (titleElement) {
        titleElement.textContent = product.name;
    }

    // 更新價格
    const priceElement = document.querySelector('.product-price .price-amount');
    if (priceElement) {
        priceElement.textContent = `NT$ ${product.price}`;
    }

    // 更新描述
    const descElement = document.querySelector('.product-description');
    if (descElement) {
        descElement.textContent = product.description;
    }

    // 更新主圖片
    const mainImageElement = document.querySelector('#mainImage');
    if (mainImageElement && product.main_image) {
        mainImageElement.src = product.main_image;
        mainImageElement.alt = product.name;
    }

    // 更新徽章
    const badgeElement = document.querySelector('.product-badge');
    if (badgeElement && product.badge_text) {
        badgeElement.innerHTML = getBadgeIcon(product.badge_type) + ' ' + product.badge_text;
    }

    // 更新規格表
    updateSpecifications(product);

    // 更新變體選項（顏色、口味等）
    updateVariants(product);

    // 更新頁面標題
    document.title = `${product.name} - Deepvape 頂級電子菸專賣店`;

    // 更新 meta 描述
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && product.meta_description) {
        metaDesc.setAttribute('content', product.meta_description);
    }
}

// 更新規格表
function updateSpecifications(product) {
    if (!product.specifications) return;

    try {
        const specs = JSON.parse(product.specifications);
        const specsContainer = document.querySelector('.specs-table tbody');
        
        if (specsContainer) {
            specsContainer.innerHTML = '';
            
            Object.entries(specs).forEach(([key, value]) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="spec-label">${key}</td>
                    <td class="spec-value">${value}</td>
                `;
                specsContainer.appendChild(row);
            });
        }
    } catch (error) {
        console.error('解析規格數據時發生錯誤:', error);
    }
}

// 更新變體選項
function updateVariants(product) {
    if (!product.variants) return;

    try {
        const variants = JSON.parse(product.variants);
        
        variants.forEach(variant => {
            if (variant.name === '顏色' || variant.name === '皮革顏色') {
                updateColorOptions(variant.value);
            } else if (variant.name === '口味') {
                updateFlavorOptions(variant.value);
            }
        });
    } catch (error) {
        console.error('解析變體數據時發生錯誤:', error);
    }
}

// 更新顏色選項
function updateColorOptions(colorString) {
    const colorGrid = document.querySelector('.color-grid');
    if (!colorGrid) return;

    const colors = colorString.split(',');
    colorGrid.innerHTML = '';

    colors.forEach((color, index) => {
        const colorOption = document.createElement('div');
        colorOption.className = `color-option ${index === 0 ? 'selected' : ''}`;
        colorOption.setAttribute('data-color', color.trim());
        colorOption.textContent = color.trim();
        
        colorOption.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
        
        colorGrid.appendChild(colorOption);
    });
}

// 更新口味選項
function updateFlavorOptions(flavorString) {
    const flavorGrid = document.querySelector('.flavor-grid');
    if (!flavorGrid) return;

    const flavors = flavorString.split(',');
    flavorGrid.innerHTML = '';

    flavors.forEach((flavor, index) => {
        const flavorOption = document.createElement('div');
        flavorOption.className = `flavor-option ${index === 0 ? 'selected' : ''}`;
        flavorOption.setAttribute('data-flavor', flavor.trim());
        flavorOption.textContent = flavor.trim();
        
        flavorOption.addEventListener('click', function() {
            document.querySelectorAll('.flavor-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
        
        flavorGrid.appendChild(flavorOption);
    });
}

// 獲取徽章圖標
function getBadgeIcon(badgeType) {
    const icons = {
        hot: '<i class="fas fa-fire"></i>',
        new: '<i class="fas fa-star"></i>',
        safe: '<i class="fas fa-shield-alt"></i>',
        limited: '<i class="fas fa-gem"></i>'
    };
    return icons[badgeType] || '<i class="fas fa-tag"></i>';
}

// 更新加入購物車功能
function updateAddToCartFunction(product) {
    window.addToCartWithAPI = function() {
        const selectedColor = document.querySelector('.color-option.selected')?.dataset.color || '';
        const selectedFlavor = document.querySelector('.flavor-option.selected')?.dataset.flavor || '';
        const quantity = parseInt(document.getElementById('quantity')?.value || 1);
        
        const cartItem = {
            name: product.name,
            price: product.price,
            quantity: quantity,
            image: product.main_image,
            flavor: selectedFlavor || selectedColor,
            description: product.description
        };

        // 獲取現有購物車
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // 檢查是否已存在相同商品和口味/顏色
        const existingItem = cart.find(item => 
            item.name === cartItem.name && item.flavor === cartItem.flavor
        );
        
        if (existingItem) {
            existingItem.quantity += cartItem.quantity;
        } else {
            cart.push(cartItem);
        }
        
        // 更新本地存儲
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // 顯示成功訊息
        const variant = selectedFlavor || selectedColor;
        const variantText = variant ? ` (${variant})` : '';
        alert(`已將 ${quantity} 個 ${product.name}${variantText} 加入購物車！\n\n即將轉接至購物車頁面。`);
        
        // 跳轉到購物車頁面
        setTimeout(() => {
            window.location.href = 'cart.html';
        }, 1000);
    };
}

// 初始化產品頁面
async function initProductPage() {
    const product = await loadProductData();
    if (product) {
        updateProductPage(product);
        updateAddToCartFunction(product);
    }
}

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', initProductPage); 