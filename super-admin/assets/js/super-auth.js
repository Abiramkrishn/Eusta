(async function() {
  const token = localStorage.getItem('superToken');
  if (!token) {
    window.location.href = 'auth-login.html';
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
    if (!data.success || data.user.role !== 'superadmin') {
      throw new Error('Forbidden');
    }
    
    document.addEventListener("DOMContentLoaded", function() {
      const userNames = document.querySelectorAll(".user-name");
      userNames.forEach(el => el.textContent = data.user.name);
      
      const userEmails = document.querySelectorAll("small.text-muted");
      userEmails.forEach(el => {
        if (el.textContent === "admin@eusta.com") {
          el.textContent = data.user.email;
        }
      });

      const logoutBtns = document.querySelectorAll("a[href='auth-login.html']");
      logoutBtns.forEach(btn => {
        btn.addEventListener("click", function(e) {
          e.preventDefault();
          localStorage.removeItem('superToken');
          localStorage.removeItem('superUser');
          window.location.href = 'auth-login.html';
        });
      });
    });
  } catch (err) {
    console.error("Super Admin auth check failed:", err);
    localStorage.removeItem('superToken');
    localStorage.removeItem('superUser');
    window.location.href = 'auth-login.html';
  }
})();
