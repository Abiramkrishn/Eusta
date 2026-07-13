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
