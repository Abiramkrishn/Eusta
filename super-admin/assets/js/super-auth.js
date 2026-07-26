(async function() {
  const token = localStorage.getItem('superToken');
  if (!token) {
    window.location.href = 'auth-login.html';
    return;
  }

  let user = { name: 'Super Admin', email: 'admin@eusta.com', role: 'superadmin' };
  const storedUser = localStorage.getItem('superUser');
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
    console.warn("Super Admin backend check unavailable, using cached session:", err);
  }

  document.addEventListener("DOMContentLoaded", function() {
    const userNames = document.querySelectorAll(".user-name");
    userNames.forEach(el => el.textContent = user.name || 'Super Admin');
    
    const userEmails = document.querySelectorAll("small.text-muted");
    userEmails.forEach(el => {
      if (el.textContent === "admin@eusta.com" || el.textContent === "") {
        el.textContent = user.email || "admin@eusta.com";
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
})();
