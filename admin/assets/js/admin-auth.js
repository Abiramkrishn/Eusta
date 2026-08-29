// Universal API Interceptor for GitHub Pages / Static Hosting Fallback & Anti-Flash Theme Loader
(function() {
  // Synchronous Zero-Flash Admin Theme Engine
  window.applyAdminTheme = function(primaryColor, secondaryColor) {
    if (!primaryColor) primaryColor = '#B18B5E';
    if (!secondaryColor) secondaryColor = '#1A1A1A';

    const hexToRgba = (hex, alpha) => {
      hex = (hex || '#B18B5E').replace('#', '');
      if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
      const num = parseInt(hex, 16);
      if (isNaN(num)) return `rgba(177, 139, 94, ${alpha})`;
      const r = (num >> 16) & 255;
      const g = (num >> 8) & 255;
      const b = num & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const darkenColor = (hex, percent) => {
      hex = (hex || '#B18B5E').replace('#', '');
      if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
      let num = parseInt(hex, 16);
      if (isNaN(num)) return '#8B5E34';
      let r = Math.max(0, Math.floor(((num >> 16) & 255) * (1 - percent / 100)));
      let g = Math.max(0, Math.floor(((num >> 8) & 255) * (1 - percent / 100)));
      let b = Math.max(0, Math.floor((num & 255) * (1 - percent / 100)));
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    };

    const gradientEnd = darkenColor(primaryColor, 35);

    const root = document.documentElement;
    root.style.setProperty('--gold', primaryColor);
    root.style.setProperty('--gold-hover', primaryColor);
    root.style.setProperty('--gold-light', hexToRgba(primaryColor, 0.12));
    root.style.setProperty('--gold-border', hexToRgba(primaryColor, 0.25));
    root.style.setProperty('--shadow-gold', `0 8px 30px ${hexToRgba(primaryColor, 0.18)}`);

    let dynamicStyle = document.getElementById('eustaAdminDynamicTheme');
    if (!dynamicStyle) {
      dynamicStyle = document.createElement('style');
      dynamicStyle.id = 'eustaAdminDynamicTheme';
    }
    if (document.head) {
      document.head.appendChild(dynamicStyle);
    } else {
      root.appendChild(dynamicStyle);
    }

    dynamicStyle.innerHTML = `
      .ea-sidebar__link.active, .ea-sidebar__nav-item.active, .ea-nav-item.active, .ea-tab.active {
        background: ${primaryColor} !important;
        color: #ffffff !important;
        box-shadow: 0 4px 14px ${hexToRgba(primaryColor, 0.35)} !important;
      }
      .ea-nav-item.active .ea-nav-icon, .ea-nav-item.active .material-symbols-outlined {
        color: #ffffff !important;
      }
      .ea-nav-item:hover {
        color: ${primaryColor} !important;
      }
      .ea-nav-item:hover .ea-nav-icon {
        color: ${primaryColor} !important;
      }
      .ea-btn-primary, button.btn-primary, .ea-btn-primary:focus, #upgradePlanBtn, button.ea-btn-primary {
        background-color: ${primaryColor} !important;
        border-color: ${primaryColor} !important;
        color: #ffffff !important;
        box-shadow: 0 4px 14px ${hexToRgba(primaryColor, 0.35)} !important;
      }
      .ea-btn-primary:hover, button.btn-primary:hover {
        background-color: ${primaryColor} !important;
        opacity: 0.9;
      }
      .ea-plan-banner {
        background: linear-gradient(135deg, ${primaryColor} 0%, ${gradientEnd} 100%) !important;
      }
      .ea-sidebar__footer-card {
        background: ${hexToRgba(primaryColor, 0.1)} !important;
        border-color: ${hexToRgba(primaryColor, 0.25)} !important;
      }
      .ea-sidebar__footer-card strong {
        color: ${primaryColor} !important;
      }
      .ea-user-avatar {
        background-color: ${primaryColor} !important;
        color: #ffffff !important;
      }
      .ea-badge-gold, .ea-sidebar__logo-badge {
        background-color: ${hexToRgba(primaryColor, 0.12)} !important;
        color: ${primaryColor} !important;
        border-color: ${hexToRgba(primaryColor, 0.25)} !important;
      }
      .ea-stat-icon, .ea-cat-icon {
        background: ${hexToRgba(primaryColor, 0.12)} !important;
        border-color: ${hexToRgba(primaryColor, 0.25)} !important;
      }
      .ea-stat-icon .material-symbols-outlined, .ea-cat-icon .material-symbols-outlined {
        color: ${primaryColor} !important;
      }
      .ea-stat-card:hover, .ea-cat-card:hover {
        border-color: ${primaryColor} !important;
        box-shadow: 0 8px 30px ${hexToRgba(primaryColor, 0.18)} !important;
      }
      .ea-stat-card:hover .ea-stat-icon, .ea-cat-card:hover .ea-cat-icon {
        background: ${primaryColor} !important;
      }
      .ea-stat-card:hover .ea-stat-icon .material-symbols-outlined, .ea-cat-card:hover .ea-cat-icon .material-symbols-outlined {
        color: #ffffff !important;
      }
      .ea-stat-arrow {
        color: ${primaryColor} !important;
      }
      .page-item.active .page-link, .pagination .active a, .pagination .active span, .ea-pagination-btn.active {
        background-color: ${primaryColor} !important;
        border-color: ${primaryColor} !important;
        color: #ffffff !important;
      }
      .ea-input:focus, .ea-select:focus, .ea-textarea:focus {
        border-color: ${primaryColor} !important;
        box-shadow: 0 0 0 3px ${hexToRgba(primaryColor, 0.15)} !important;
      }
    `;

    // Dynamic element color enforcement
    const heroBanners = document.querySelectorAll('#tab-about-customizer [style*="linear-gradient"], #tab-contact-customizer [style*="linear-gradient"]');
    heroBanners.forEach(hero => {
      hero.style.background = `linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor} 100%)`;
    });

    const badgeEls = document.querySelectorAll('#veBadge, #vePillarsBadge, #ceBadge, #ceFormBadge');
    badgeEls.forEach(el => {
      el.style.background = hexToRgba(primaryColor, 0.12);
      el.style.color = primaryColor;
      el.style.borderColor = hexToRgba(primaryColor, 0.25);
    });

    const statEls = document.querySelectorAll('#veExpYears, #ceEmail1, #cePhone1');
    statEls.forEach(el => {
      el.style.color = primaryColor;
    });

    const addBtnEls = document.querySelectorAll('#tab-about-customizer button[onclick*="add"], #tab-contact-customizer button[onclick*="add"]');
    addBtnEls.forEach(btn => {
      btn.style.borderColor = primaryColor;
      btn.style.color = primaryColor;
      btn.style.background = hexToRgba(primaryColor, 0.08);
    });
  };

  // Run immediate synchronous theme application from cached localStorage
  try {
    const cachedP = localStorage.getItem('eusta_admin_primaryColor');
    const cachedS = localStorage.getItem('eusta_admin_secondaryColor');
    if (cachedP) {
      window.applyAdminTheme(cachedP, cachedS);
    } else {
      const storedSettings = localStorage.getItem('eusta_static_settings');
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        if (parsed && parsed.primaryColor) {
          window.applyAdminTheme(parsed.primaryColor, parsed.secondaryColor);
        }
      }
    }
  } catch(e) {}

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
    '/api/subscriptions': 'db/subscriptions.json'
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

(async function() {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    window.location.href = 'signin.html';
    return;
  }

  let user = { name: 'Admin User', email: 'admin@eusta.com', role: 'admin' };
  const storedUser = localStorage.getItem('adminUser');
  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch (e) {}
  }

  try {
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        user = data.user;
      }
    }
  } catch (err) {
    console.warn("Backend auth check unavailable, proceeding with cached session:", err);
  }

  // Dynamic Admin Theme Customizer Engine
  window.applyAdminTheme = function(primaryColor, secondaryColor) {
    if (!primaryColor) primaryColor = '#B18B5E';
    if (!secondaryColor) secondaryColor = '#1A1A1A';

    const hexToRgba = (hex, alpha) => {
      hex = (hex || '#B18B5E').replace('#', '');
      if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
      const num = parseInt(hex, 16);
      if (isNaN(num)) return `rgba(177, 139, 94, ${alpha})`;
      const r = (num >> 16) & 255;
      const g = (num >> 8) & 255;
      const b = num & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const darkenColor = (hex, percent) => {
      hex = (hex || '#B18B5E').replace('#', '');
      if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
      let num = parseInt(hex, 16);
      if (isNaN(num)) return '#8B5E34';
      let r = Math.max(0, Math.floor(((num >> 16) & 255) * (1 - percent / 100)));
      let g = Math.max(0, Math.floor(((num >> 8) & 255) * (1 - percent / 100)));
      let b = Math.max(0, Math.floor((num & 255) * (1 - percent / 100)));
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    };

    const root = document.documentElement;
    root.style.setProperty('--gold', primaryColor);
    root.style.setProperty('--gold-hover', primaryColor);
    root.style.setProperty('--gold-light', hexToRgba(primaryColor, 0.12));
    root.style.setProperty('--gold-border', hexToRgba(primaryColor, 0.25));
    root.style.setProperty('--shadow-gold', `0 8px 30px ${hexToRgba(primaryColor, 0.18)}`);

    let dynamicStyle = document.getElementById('eustaAdminDynamicTheme');
    if (!dynamicStyle) {
      dynamicStyle = document.createElement('style');
      dynamicStyle.id = 'eustaAdminDynamicTheme';
      document.head.appendChild(dynamicStyle);
    }

    dynamicStyle.innerHTML = `
      .ea-sidebar__link.active, .ea-sidebar__nav-item.active, .ea-nav-item.active, .ea-tab.active {
        background: ${primaryColor} !important;
        color: #ffffff !important;
        box-shadow: 0 4px 14px ${hexToRgba(primaryColor, 0.35)} !important;
      }
      .ea-nav-item.active .ea-nav-icon, .ea-nav-item.active .material-symbols-outlined {
        color: #ffffff !important;
      }
      .ea-nav-item:hover {
        color: ${primaryColor} !important;
      }
      .ea-nav-item:hover .ea-nav-icon {
        color: ${primaryColor} !important;
      }
      .ea-btn-primary, button.btn-primary, .ea-btn-primary:focus, #upgradePlanBtn, button.ea-btn-primary {
        background-color: ${primaryColor} !important;
        border-color: ${primaryColor} !important;
        color: #ffffff !important;
        box-shadow: 0 4px 14px ${hexToRgba(primaryColor, 0.35)} !important;
      }
      .ea-btn-primary:hover, button.btn-primary:hover {
        background-color: ${primaryColor} !important;
        opacity: 0.9;
      }
      .ea-plan-banner {
        background: linear-gradient(135deg, ${primaryColor} 0%, ${darkenColor(primaryColor, 35)} 100%) !important;
      }
      .ea-sidebar__footer-card {
        background: ${hexToRgba(primaryColor, 0.1)} !important;
        border-color: ${hexToRgba(primaryColor, 0.25)} !important;
      }
      .ea-sidebar__footer-card strong {
        color: ${primaryColor} !important;
      }
      .ea-user-avatar {
        background-color: ${primaryColor} !important;
        color: #ffffff !important;
      }
      .ea-badge-gold, .ea-sidebar__logo-badge {
        background-color: ${hexToRgba(primaryColor, 0.12)} !important;
        color: ${primaryColor} !important;
        border-color: ${hexToRgba(primaryColor, 0.25)} !important;
      }
      .ea-stat-icon, .ea-cat-icon {
        background: ${hexToRgba(primaryColor, 0.12)} !important;
        border-color: ${hexToRgba(primaryColor, 0.25)} !important;
      }
      .ea-stat-icon .material-symbols-outlined, .ea-cat-icon .material-symbols-outlined {
        color: ${primaryColor} !important;
      }
      .ea-stat-card:hover, .ea-cat-card:hover {
        border-color: ${primaryColor} !important;
        box-shadow: 0 8px 30px ${hexToRgba(primaryColor, 0.18)} !important;
      }
      .ea-stat-card:hover .ea-stat-icon, .ea-cat-card:hover .ea-cat-icon {
        background: ${primaryColor} !important;
      }
      .ea-stat-card:hover .ea-stat-icon .material-symbols-outlined, .ea-cat-card:hover .ea-cat-icon .material-symbols-outlined {
        color: #ffffff !important;
      }
      .ea-stat-arrow {
        color: ${primaryColor} !important;
      }
      .page-item.active .page-link, .pagination .active a, .pagination .active span, .ea-pagination-btn.active {
        background-color: ${primaryColor} !important;
        border-color: ${primaryColor} !important;
        color: #ffffff !important;
      }
      .ea-input:focus, .ea-select:focus, .ea-textarea:focus {
        border-color: ${primaryColor} !important;
        box-shadow: 0 0 0 3px ${hexToRgba(primaryColor, 0.15)} !important;
      }
    `;

    // Dynamic element color enforcement
    const heroBanners = document.querySelectorAll('#tab-about-customizer [style*="linear-gradient"], #tab-contact-customizer [style*="linear-gradient"]');
    heroBanners.forEach(hero => {
      hero.style.background = `linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor} 100%)`;
    });

    const badgeEls = document.querySelectorAll('#veBadge, #vePillarsBadge, #ceBadge, #ceFormBadge');
    badgeEls.forEach(el => {
      el.style.background = hexToRgba(primaryColor, 0.12);
      el.style.color = primaryColor;
      el.style.borderColor = hexToRgba(primaryColor, 0.25);
    });

    const statEls = document.querySelectorAll('#veExpYears, #ceEmail1, #cePhone1');
    statEls.forEach(el => {
      el.style.color = primaryColor;
    });

    const addBtnEls = document.querySelectorAll('#tab-about-customizer button[onclick*="add"], #tab-contact-customizer button[onclick*="add"]');
    addBtnEls.forEach(btn => {
      btn.style.borderColor = primaryColor;
      btn.style.color = primaryColor;
      btn.style.background = hexToRgba(primaryColor, 0.08);
    });
  };

  // Run immediate theme application from cached localStorage if available
  try {
    const cachedP = localStorage.getItem('eusta_admin_primaryColor');
    const cachedS = localStorage.getItem('eusta_admin_secondaryColor');
    if (cachedP) {
      window.applyAdminTheme(cachedP, cachedS);
    } else {
      const storedSettings = localStorage.getItem('eusta_static_settings');
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        if (parsed && parsed.primaryColor) {
          window.applyAdminTheme(parsed.primaryColor, parsed.secondaryColor);
        }
      }
    }
  } catch(e) {}

  // Update UI elements on DOM load
  document.addEventListener("DOMContentLoaded", async function() {
    // Re-apply cached theme on DOM load to catch all dynamic elements
    try {
      const cachedP = localStorage.getItem('eusta_admin_primaryColor');
      const cachedS = localStorage.getItem('eusta_admin_secondaryColor');
      if (cachedP) window.applyAdminTheme(cachedP, cachedS);
    } catch(e) {}

    // Fetch latest settings from server/API
    try {
      const settingsRes = await fetch('/api/settings');
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        if (settings && settings.primaryColor) {
          localStorage.setItem('eusta_admin_primaryColor', settings.primaryColor);
          if (settings.secondaryColor) localStorage.setItem('eusta_admin_secondaryColor', settings.secondaryColor);
          window.applyAdminTheme(settings.primaryColor, settings.secondaryColor);
        }
      }
    } catch(e) {
      console.warn("Could not load admin theme settings:", e);
    }

    const userNames = document.querySelectorAll(".ea-user-name");
    userNames.forEach(el => el.textContent = user.name || 'Admin User');
    
    const userAvatars = document.querySelectorAll(".ea-user-avatar");
    userAvatars.forEach(el => {
      const name = user.name || 'Admin User';
      const initials = name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
      el.textContent = initials;
    });

    // Wire up logout triggers
    const logoutBtns = document.querySelectorAll("a[href='signin.html']");
    logoutBtns.forEach(btn => {
      btn.addEventListener("click", function(e) {
        e.preventDefault();
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = 'signin.html';
      });
    });
  });
})();
