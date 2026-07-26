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
