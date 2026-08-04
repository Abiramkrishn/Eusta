// Universal API Interceptor for GitHub Pages / Static Hosting Fallback
(function() {
  if (window.__apiInterceptorInstalled) return;
  window.__apiInterceptorInstalled = true;

  const originalFetch = window.fetch;

  const endpointMap = {
    '/api/products': 'db/products.json',
    '/api/categories': 'db/categories.json',
    '/api/enquiries': 'db/enquiries.json',
    '/api/settings': 'db/settings.json',
    '/api/users': 'db/users.json',
    '/api/subscription-plans': 'db/subscription_plans.json',
    '/api/subscriptions': 'db/subscriptions.json',
    '/api/analytics': 'db/product_clicks.json'
  };

  window.fetch = async function(resource, init) {
    let url = typeof resource === 'string' ? resource : (resource && resource.url ? resource.url : '');
    const cleanUrl = url.split('?')[0];

    const matchedKey = Object.keys(endpointMap).find(key => cleanUrl.endsWith(key) || cleanUrl.includes(key));

    if (matchedKey) {
      try {
        const response = await originalFetch(resource, init);
        if (response.ok) {
          return response;
        }
      } catch (err) {
        console.warn(`[API Interceptor] Fetch failed for ${url}, switching to static DB:`, err);
      }

      // Static fallback logic for GitHub Pages
      const dbFile = endpointMap[matchedKey];
      const pathname = window.location.pathname;

      let dbPath = dbFile;
      if (pathname.includes('/admin/') || pathname.includes('/super-admin/') || pathname.includes('/user/')) {
        dbPath = '../' + dbFile;
      }

      const method = (init && init.method) ? init.method.toUpperCase() : 'GET';
      const storageKey = 'eusta_static_' + matchedKey.replace('/api/', '');

      if (method === 'GET') {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          return new Response(stored, {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        try {
          const staticRes = await originalFetch(dbPath, { cache: 'no-cache' });
          if (staticRes.ok) {
            return staticRes;
          }
        } catch (e) {
          console.error(`[API Interceptor] Failed to fetch fallback file ${dbPath}:`, e);
        }
      } else {
        // Handle POST / PUT / DELETE mock response for static testing
        return new Response(JSON.stringify({ success: true, message: 'Saved in static mode' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return originalFetch(resource, init);
  };
})();

/**
 * Eusta Storefront Dynamic Theme & Branding Loader
 * Synchronizes colors, store logo, and branding settings from Admin Panel.
 */
(function() {
  function hexToRgba(hex, alpha) {
    if (!hex) return `rgba(177, 139, 94, ${alpha})`;
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    if (isNaN(num)) return `rgba(177, 139, 94, ${alpha})`;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function applyTheme(settings) {
    if (!settings) return;
    const root = document.documentElement;

    const primary = settings.primaryColor || '#B18B5E';
    const secondary = settings.secondaryColor || '#1A1A1A';
    const bg = settings.backgroundColor || '#FFFFFF';
    const text = settings.textColor || '#4A4A4A';
    const heading = settings.headingColor || secondary;

    // Apply CSS Variables
    root.style.setProperty('--clr-brand-gold', primary);
    root.style.setProperty('--accent-color-primary', primary);
    root.style.setProperty('--clr-brand-gold-light', hexToRgba(primary, 0.08));
    root.style.setProperty('--clr-brand-gold-glow', hexToRgba(primary, 0.25));
    root.style.setProperty('--clr-premium-dark', secondary);
    root.style.setProperty('--clr-common-heading', heading);
    root.style.setProperty('--clr-common-body', bg);
    root.style.setProperty('--clr-common-body-text', text);

    // Dynamic style block for elements that need direct color overrides
    let dynamicStyle = document.getElementById('eusta-dynamic-theme-style');
    if (!dynamicStyle) {
      dynamicStyle = document.createElement('style');
      dynamicStyle.id = 'eusta-dynamic-theme-style';
      document.head.appendChild(dynamicStyle);
    }

    dynamicStyle.innerHTML = `
      .enquire-btn, .deals-menu, .active-nav, .theme-accent-bg, .bd-product__tag-2 {
        background-color: ${primary} !important;
        border-color: ${primary} !important;
      }
      a:hover, .main-menu nav ul li:hover > a, .main-menu nav ul li.active > a, .theme-accent-color, .furniture-clr-hover:hover, .footer-info-text a:hover, .footer-link ul li a:hover {
        color: ${primary} !important;
      }
      .product-card:hover {
        border-color: ${primary} !important;
        box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.12), 0 4px 14px -2px ${hexToRgba(primary, 0.25)} !important;
      }
      .cus-product-badge, .deal-offer-badge {
        background-color: ${secondary} !important;
      }
      .deals-hero-premium::before {
        background: linear-gradient(135deg, ${secondary} 0%, ${primary} 100%) !important;
      }
      .deals-hero-badge {
        background-color: ${primary} !important;
        color: #ffffff !important;
        box-shadow: 0 4px 15px ${hexToRgba(primary, 0.35)} !important;
      }
      .premium-service-card {
        background-color: ${hexToRgba(primary, 0.08)} !important;
        border-color: ${hexToRgba(primary, 0.2)} !important;
      }
      .premium-service-card:hover {
        background-color: ${hexToRgba(primary, 0.18)} !important;
        border-color: ${primary} !important;
      }
      .premium-service-icon {
        color: ${primary} !important;
        border-color: ${hexToRgba(primary, 0.3)} !important;
      }
      .premium-service-icon i, .premium-service-icon .material-symbols-outlined {
        color: ${primary} !important;
      }
      .furniture-icon {
        color: ${primary} !important;
        background-color: ${hexToRgba(primary, 0.12)} !important;
        border-color: ${hexToRgba(primary, 0.3)} !important;
      }
      .theme-social a {
        color: ${primary} !important;
        border-color: ${hexToRgba(primary, 0.25)} !important;
      }
      .theme-social a:hover {
        background-color: ${primary} !important;
        border-color: ${primary} !important;
        color: #ffffff !important;
      }
      .footer-widget-title h4::after {
        background-color: ${primary} !important;
      }
      .header-search form {
        border-color: ${hexToRgba(primary, 0.35)} !important;
      }
      .header-search form:hover {
        border-color: ${primary} !important;
      }
      .header-search form:focus-within {
        border-color: ${primary} !important;
        box-shadow: 0 0 0 3.5px ${hexToRgba(primary, 0.15)} !important;
      }
      .header-search button, .header-search button i, .header-search button svg {
        color: ${primary} !important;
        stroke: ${primary} !important;
      }
      .header-search button svg path {
        stroke: ${primary} !important;
      }
      .product__details-tag a {
        background-color: ${hexToRgba(primary, 0.08)} !important;
        border-color: ${hexToRgba(primary, 0.35)} !important;
        color: ${primary} !important;
      }
      .product__details-tag a:hover {
        background-color: ${primary} !important;
        border-color: ${primary} !important;
        color: #ffffff !important;
      }
    `;

    // Apply Logo & Store Name
    const applyDomBranding = () => {
      const storeName = settings.businessName || settings.logoText || 'Eusta';
      
      // Update Title
      if (document.title.includes('Eusta') && storeName !== 'Eusta') {
        document.title = document.title.replace('Eusta', storeName);
      }

      // Update Logos
      if (settings.logoUrl) {
        let logoSrc = settings.logoUrl;
        // Adjust path if relative
        if (!logoSrc.startsWith('http') && !logoSrc.startsWith('/') && !logoSrc.startsWith('assets/')) {
          logoSrc = 'assets/imgs/logo/' + logoSrc;
        }

        const logoImgs = document.querySelectorAll('.header-logo img, .footer-logo img, .store-logo-img, img[alt*="logo"]');
        logoImgs.forEach(img => {
          img.src = logoSrc;
          img.alt = storeName;
        });
      }

      // Update Footer Brand Name
      const footerBrands = document.querySelectorAll('.footer-copyright, .copyright-text, .footer-widget p');
      footerBrands.forEach(el => {
        if (el.textContent && el.textContent.includes('Eusta') && storeName !== 'Eusta') {
          el.innerHTML = el.innerHTML.replace(/Eusta/g, storeName);
        }
      });
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyDomBranding);
    } else {
      applyDomBranding();
    }
  }

  // 1. Immediately apply cached theme to prevent layout flash (FOUC)
  try {
    const cached = localStorage.getItem('eusta_theme_settings');
    if (cached) {
      applyTheme(JSON.parse(cached));
    }
  } catch (e) {
    console.error('Error parsing cached theme:', e);
  }

  // 2. Fetch fresh theme settings from server
  fetch('/api/settings')
    .then(res => res.ok ? res.json() : null)
    .then(settings => {
      if (settings) {
        localStorage.setItem('eusta_theme_settings', JSON.stringify(settings));
        applyTheme(settings);
      }
    })
    .catch(err => {
      console.warn('Could not load dynamic theme from server, using local fallback:', err);
    });

  // Expose global helper for live previews
  window.EustaTheme = {
    applyTheme: applyTheme,
    hexToRgba: hexToRgba
  };
})();
