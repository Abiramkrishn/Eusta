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

  // Update UI elements on DOM load
  document.addEventListener("DOMContentLoaded", function() {
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
