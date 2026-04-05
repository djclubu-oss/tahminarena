// auth.js - Giriş işlemleri

function togglePass(id, el) {
  const inp = document.getElementById(id);
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
  el.innerHTML = inp.type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;
  const errEl = document.getElementById('loginError');
  
  if (!errEl) return;
  
  // Demo girişi
  if (email === 'demo@tahminarena.com' && pass === 'demo123') {
    localStorage.setItem('oa_session', JSON.stringify({ name: 'Demo Kullanıcı', email }));
    window.location.href = 'dashboard.html';
    return;
  }
  
  // Admin girişi
  if (email === 'djclubu@tahminarena.com' && pass === 'demo123') {
    localStorage.setItem('oa_session', JSON.stringify({ name: 'Admin', email, isAdmin: true }));
    window.location.href = 'dashboard.html';
    return;
  }
  
  errEl.textContent = 'E-posta veya şifre hatalı!';
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass = document.getElementById('regPass').value;
  const pass2 = document.getElementById('regPass2').value;
  const errEl = document.getElementById('regError');
  
  if (pass.length < 6) { errEl.textContent = 'Şifre en az 6 karakter!'; return; }
  if (pass !== pass2) { errEl.textContent = 'Şifreler eşleşmiyor!'; return; }
  
  const users = JSON.parse(localStorage.getItem('oa_users') || '[]');
  if (users.find(u => u.email === email)) { errEl.textContent = 'Bu e-posta zaten kayıtlı!'; return; }
  
  users.push({ name, email, pass: btoa(pass) });
  localStorage.setItem('oa_users', JSON.stringify(users));
  
  document.getElementById('regSuccess').textContent = 'Kayıt başarılı!';
  setTimeout(() => {
    localStorage.setItem('oa_session', JSON.stringify({ name, email }));
    window.location.href = 'dashboard.html';
  }, 1500);
}
