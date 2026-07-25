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
      .enquire-btn, .deals-menu, .active-nav, .theme-accent-bg {
        background-color: ${primary} !important;
        border-color: ${primary} !important;
      }
      a:hover, .main-menu nav ul li:hover > a, .main-menu nav ul li.active > a, .theme-accent-color {
        color: ${primary} !important;
      }
      .product-card:hover {
        border-color: ${hexToRgba(primary, 0.4)} !important;
      }
      .cus-product-badge, .deal-offer-badge {
        background-color: ${secondary} !important;
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
