(async function() {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    window.location.href = 'signin.html';
    return;
  }
  try {
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      throw new Error('Unauthorized');
    }
    const data = await res.json();
    if (!data.success || (data.user.role !== 'admin' && data.user.role !== 'superadmin')) {
      throw new Error('Forbidden');
    }
    
    // Update UI elements on DOM load
    document.addEventListener("DOMContentLoaded", function() {
      const userNames = document.querySelectorAll(".ea-user-name");
      userNames.forEach(el => el.textContent = data.user.name);
      
      const userAvatars = document.querySelectorAll(".ea-user-avatar");
      userAvatars.forEach(el => {
        const initials = data.user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
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
  } catch (err) {
    console.error("Auth check failed:", err);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = 'signin.html';
  }
})();
