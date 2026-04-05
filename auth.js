// ===== GİRİŞ VE KAYIT SAYFALARI İÇİN =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth sistemi başlatıldı');
    
    // GİRİŞ FORMU
    const loginForm = document.getElementById('loginFormElement');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // KAYIT FORMU
    const regForm = document.getElementById('registerFormElement');
    if (regForm) {
        regForm.addEventListener('submit', handleRegister);
    }
    
    // ŞİFRE GÖSTER/GİZLE
    const toggleBtn = document.getElementById('togglePassBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            const passInput = document.getElementById('loginPass') || document.getElementById('regPass');
            const icon = toggleBtn.querySelector('i');
            if (passInput.type === 'password') {
                passInput.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                passInput.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    }
});

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPass').value;
    const errorDiv = document.getElementById('loginError');
    
    errorDiv.textContent = '';
    errorDiv.style.color = '#f44336';
    
    if (!email || !pass) {
        errorDiv.textContent = 'Lütfen tüm alanları doldurun';
        return;
    }
    
    if (pass.length < 6) {
        errorDiv.textContent = 'Şifre en az 6 karakter olmalıdır';
        return;
    }
    
    // GİRİŞ KONTROLÜ
    let userData = null;
    let isAdmin = false;
    
    if (email === 'djclubu@tahminarena.com' && pass === 'admin123') {
        userData = { name: 'Admin', email: email };
        isAdmin = true;
    } else if (email === 'demo@tahminarena.com' && pass === 'demo123') {
        userData = { name: 'Demo Kullanıcı', email: email };
    } else {
        const users = JSON.parse(localStorage.getItem('oa_users') || '[]');
        const foundUser = users.find(u => u.email === email && atob(u.pass) === pass);
        if (foundUser) {
            userData = { name: foundUser.name, email: foundUser.email };
        }
    }
    
    if (userData) {
        localStorage.setItem('oa_session', JSON.stringify({
            name: userData.name,
            email: userData.email,
            isAdmin: isAdmin
        }));
        errorDiv.style.color = '#4CAF50';
        errorDiv.textContent = 'Giriş başarılı! Yönlendiriliyor...';
        setTimeout(() => window.location.href = 'dashboard.html', 1000);
    } else {
        errorDiv.textContent = 'E-posta veya şifre hatalı!';
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regPass').value;
    const pass2 = document.getElementById('regPass2').value;
    const errorDiv = document.getElementById('regError');
    const sucDiv = document.getElementById('regSuccess');
    
    errorDiv.textContent = '';
    
    if (pass.length < 6) {
        errorDiv.textContent = 'Şifre en az 6 karakter!';
        return;
    }
    if (pass !== pass2) {
        errorDiv.textContent = 'Şifreler eşleşmiyor!';
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('oa_users') || '[]');
    if (users.find(u => u.email === email)) {
        errorDiv.textContent = 'Bu e-posta zaten kayıtlı!';
        return;
    }
    
    users.push({ name, email, pass: btoa(pass) });
    localStorage.setItem('oa_users', JSON.stringify(users));
    
    sucDiv.textContent = 'Kayıt başarılı! Yönlendiriliyorsunuz...';
    setTimeout(() => {
        localStorage.setItem('oa_session', JSON.stringify({ name, email, isAdmin: false }));
        window.location.href = 'dashboard.html';
    }, 1500);
}
