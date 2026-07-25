// Eusta Premium Javascript Enhancements
document.addEventListener("DOMContentLoaded", function() {
    // 1. WhatsApp Configuration
    // Change this to your actual store WhatsApp number (with country code, no "+" or dashes)
    const WHATSAPP_NUMBER = "91XXXXXXXXXX"; 
    
    // 2. Inject Modern Bottom Navigation Bar with Labels & Uniform Icons
    const bottomMenu = document.querySelector(".mobile-bottom-menu");
    if (bottomMenu) {
        bottomMenu.innerHTML = `
            <a href="index.html" class="menu-item" id="nav-home">
                <i class="fa-solid fa-house"></i>
                <span>Home</span>
            </a>
            <a href="product.html" class="menu-item" id="nav-shop">
                <i class="fa-solid fa-bag-shopping"></i>
                <span>Shop</span>
            </a>
            <a href="deals.html" class="menu-item deals-icon" id="nav-deals">
                <i class="fa-solid fa-tags"></i>
                <span>Deals</span>
            </a>
            <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I have a general inquiry about Eusta Furniture.")}" class="menu-item" target="_blank" rel="noopener noreferrer" id="nav-chat">
                <i class="fa-brands fa-whatsapp"></i>
                <span>Chat</span>
            </a>
        `;

        // Dynamic Bottom Navigation Active Class
        const currentPath = window.location.pathname;
        const menuItems = bottomMenu.querySelectorAll(".menu-item");
        
        menuItems.forEach(item => {
            const itemHref = item.getAttribute("href");
            if (itemHref && currentPath.includes(itemHref)) {
                item.classList.add("active");
            } else if (currentPath === "/" || currentPath.endsWith("index.html")) {
                if (itemHref === "index.html") {
                    item.classList.add("active");
                }
            }
        });
    }

    // 3. Inject Persistent WhatsApp FAB
    if (!document.querySelector(".whatsapp-fab")) {
        const fab = document.createElement("a");
        fab.className = "whatsapp-fab";
        fab.setAttribute("target", "_blank");
        fab.setAttribute("rel", "noopener noreferrer");
        fab.innerHTML = '<i class="fab fa-whatsapp"></i>';
        
        // General inquiry text
        const generalText = encodeURIComponent("Hi, I have a general inquiry about Eusta Furniture.");
        fab.setAttribute("href", `https://wa.me/${WHATSAPP_NUMBER}?text=${generalText}`);
        
        document.body.appendChild(fab);
    }

    // 4. Dynamic WhatsApp Product Enquiry Links
    // For product listings
    const productCards = document.querySelectorAll(".product-card");
    productCards.forEach(card => {
        const titleEl = card.querySelector("h6 a, h6");
        const priceEl = card.querySelector(".price-wrapper b, b");
        const enquireBtn = card.querySelector(".enquire-btn");
        
        if (enquireBtn && titleEl) {
            const title = titleEl.textContent.trim();
            const price = priceEl ? priceEl.textContent.trim() : "";
            
            let message = `Hi, I am interested in "${title}"`;
            if (price) {
                message += ` priced at ${price}`;
            }
            message += `. Please provide more details.`;
            
            const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
            enquireBtn.setAttribute("href", whatsappUrl);
            enquireBtn.setAttribute("target", "_blank");
            enquireBtn.setAttribute("rel", "noopener noreferrer");
        }
    });

    // For product details page
    const detailsContent = document.querySelector(".product__details-content");
    if (detailsContent) {
        const titleEl = detailsContent.querySelector(".product__details-title");
        const priceEl = detailsContent.querySelector(".product__details-price .new-price");
        const skuEl = detailsContent.querySelector(".sku a") || detailsContent.querySelector(".sku");
        const wtspBtn = detailsContent.querySelector(".wtsp-btn");
        
        if (wtspBtn && titleEl) {
            const title = titleEl.textContent.trim();
            const price = priceEl ? priceEl.textContent.trim() : "";
            let sku = skuEl ? skuEl.textContent.trim() : "";
            if (sku.toUpperCase().startsWith("SKU:")) {
                sku = sku.substring(4).trim();
            }
            
            let message = `Hi, I am interested in the product: "${title}"`;
            if (sku) {
                message += ` (SKU: ${sku})`;
            }
            if (price) {
                message += ` priced at ${price}`;
            }
            message += `. Please provide more details and availability.`;
            
            const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
            wtspBtn.setAttribute("href", whatsappUrl);
            wtspBtn.setAttribute("target", "_blank");
            wtspBtn.setAttribute("rel", "noopener noreferrer");
        }
    }
});

// Category Icon Helper: Seamlessly renders preset vector icons or custom uploaded image URLs
window.getCategoryIconHTML = function(iconName) {
  if (!iconName) return '<i class="fa-solid fa-shapes"></i>';

  if (iconName.startsWith('http://') || iconName.startsWith('https://') || iconName.startsWith('data:') || iconName.startsWith('/') || iconName.startsWith('assets/')) {
    return `<img src="${iconName}" alt="Category" style="width:26px; height:26px; object-fit:contain;">`;
  }

  const iconMap = {
    // Home & Furniture
    'chair': 'fa-chair',
    'furniture': 'fa-chair',
    'sofa': 'fa-couch',
    'sofas': 'fa-couch',
    'weekend': 'fa-couch',
    'bed': 'fa-bed',
    'beds': 'fa-bed',
    'dining': 'fa-utensils',
    'table_restaurant': 'fa-utensils',
    'wardrobes': 'fa-door-closed',
    'door_sliding': 'fa-door-closed',
    'coffee_table': 'fa-mug-hot',
    'table_bar': 'fa-mug-hot',
    'office_chair': 'fa-desktop',
    'desk': 'fa-desktop',
    'recliners': 'fa-couch',
    'airline_seat_recline_extra': 'fa-couch',
    'decor': 'fa-palette',
    'auto_awesome': 'fa-wand-magic-sparkles',
    'lighting': 'fa-lightbulb',
    'lightbulb': 'fa-lightbulb',
    'light': 'fa-lightbulb',
    'textiles': 'fa-layer-group',
    'texture': 'fa-layer-group',
    'kitchen': 'fa-utensils',
    'countertops': 'fa-utensils',
    'storage': 'fa-box-open',
    'inventory_2': 'fa-box-open',

    // Fashion & Apparel
    'clothing': 'fa-shirt',
    'checkroom': 'fa-shirt',
    'outerwear': 'fa-vest',
    'styler': 'fa-vest',
    'suits': 'fa-user-tie',
    'dry_cleaning': 'fa-user-tie',
    'footwear': 'fa-socks',
    'steps': 'fa-socks',
    'jewelry': 'fa-gem',
    'diamond': 'fa-gem',
    'watches': 'fa-clock',
    'watch': 'fa-clock',
    'bags': 'fa-bag-shopping',
    'shopping_bag': 'fa-bag-shopping',
    'eyewear': 'fa-glasses',
    'glasses': 'fa-glasses',

    // Electronics & Tech
    'mobiles': 'fa-mobile-screen-button',
    'smartphone': 'fa-mobile-screen-button',
    'laptops': 'fa-laptop',
    'laptop': 'fa-laptop',
    'audio': 'fa-headphones',
    'headphones': 'fa-headphones',
    'cameras': 'fa-camera',
    'photo_camera': 'fa-camera',
    'tv': 'fa-tv',
    'gaming': 'fa-gamepad',
    'sports_esports': 'fa-gamepad',
    'cables': 'fa-plug',
    'electrical_services': 'fa-plug',
    'hardware': 'fa-microchip',
    'memory': 'fa-microchip',

    // Gardening & Outdoor
    'plants': 'fa-seedling',
    'potted_plant': 'fa-seedling',
    'lawn': 'fa-seedling',
    'grass': 'fa-seedling',
    'trees': 'fa-tree',
    'nature': 'fa-tree',
    'patio': 'fa-sun',
    'home_work': 'fa-sun',
    'irrigation': 'fa-faucet-drip',
    'water_drop': 'fa-faucet-drip',

    // Beauty, Cosmetics & Health
    'cosmetics': 'fa-wand-magic-sparkles',
    'auto_fix_high': 'fa-wand-magic-sparkles',
    'skincare': 'fa-pump-soap',
    'sanitizer': 'fa-pump-soap',
    'spa': 'fa-spa',
    'haircare': 'fa-scissors',
    'content_cut': 'fa-scissors',
    'wellness': 'fa-heart-pulse',
    'favorite': 'fa-heart-pulse',

    // Grocery & Food
    'produce': 'fa-apple-whole',
    'nutrition': 'fa-apple-whole',
    'bakery': 'fa-bread-slice',
    'bakery_dining': 'fa-bread-slice',
    'beverages': 'fa-wine-glass',
    'local_bar': 'fa-wine-glass',
    'snacks': 'fa-cookie-bite',
    'lunch_dining': 'fa-cookie-bite',
    'food': 'fa-utensils',
    'restaurant': 'fa-utensils',

    // Sports & Fitness
    'gym': 'fa-dumbbell',
    'fitness_center': 'fa-dumbbell',
    'cycling': 'fa-person-biking',
    'directions_bike': 'fa-person-biking',
    'sports': 'fa-volleyball',
    'sports_soccer': 'fa-volleyball',
    'camping': 'fa-person-hiking',
    'hiking': 'fa-person-hiking',

    // Baby & Kids
    'baby': 'fa-baby',
    'child_care': 'fa-baby',
    'toys': 'fa-puzzle-piece',
    'extension': 'fa-puzzle-piece',

    // Automotive & Tools
    'automotive': 'fa-car',
    'directions_car': 'fa-car',
    'tools': 'fa-wrench',
    'build': 'fa-wrench',
    'construction': 'fa-screwdriver-wrench',

    // Books & Craft
    'books': 'fa-book',
    'book': 'fa-book',
    'stationery': 'fa-pen-nib',
    'edit': 'fa-pen-nib',
    'craft': 'fa-palette',
    'palette': 'fa-palette'
  };

  const cleanKey = iconName.toLowerCase().trim();
  const faClass = iconMap[cleanKey];

  if (faClass) {
    return `<i class="fa-solid ${faClass}"></i>`;
  }

  return `<span class="material-symbols-outlined">${iconName}</span>`;
};
