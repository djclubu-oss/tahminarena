// ===== Main Application =====

class App {
  constructor() {
    this.liveMatches = [];
    this.myCoupon = [];
    this.init();
  }

  async init() {
    if (document.getElementById('dashUserName')) {
      if (!authService.requireAuth()) return;
      this.initDashboard();
    }
    this.setupEventListeners();
  }

  async initDashboard() {
    const user = authService.getCurrentUser();
    
    document.getElementById('dashUserName').textContent = user.name;
    document.getElementById('dashUserEmail').textContent = user.email;

    this.startClock();
    this.loadMyCoupon();
    await this.loadLiveMatches();
  }

  setupEventListeners() {
    const loginForm = document.querySelector('form[onsubmit="handleLogin(event)"]');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    const registerForm = document.querySelector('form[onsubmit="handleRegister(event)"]');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegister();
      });
    }
  }

  handleLogin() {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPass')?.value;
    const errorEl = document.getElementById('loginError');

    const result = authService.login(email, password);
    
    if (result.success) {
      window.location.href = '/dashboard.html';
    } else {
      if (errorEl) errorEl.textContent = result.error;
    }
  }

  handleRegister() {
    const name = document.getElementById('regName')?.value;
    const email = document.getElementById('regEmail')?.value;
    const password = document.getElementById('regPass')?.value;
    const password2 = document.getElementById('regPass2')?.value;
    const errorEl = document.getElementById('regError');

    if (password !== password2) {
      if (errorEl) errorEl.textContent = 'Şifreler eşleşmiyor!';
      return;
    }

    const result = authService.register(name, email, password);
    
    if (result.success) {
      window.location.href = '/dashboard.html';
    } else {
      if (errorEl) errorEl.textContent = result.error;
    }
  }

  async loadLiveMatches() {
    const container = document.getElementById('liveMatches');
    container.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i><p>Canlı maçlar yükleniyor...</p></div>';

    try {
      const data = await apiService.getLiveMatches();
      console.log('API Data:', data);
      
      this.liveMatches = data.response || [];

      document.getElementById('liveCount').textContent = this.liveMatches.length;
      document.getElementById('apiInfo').innerHTML = `<span class="requests">${apiService.getRequestCount()} / 75,000</span>`;

      if (this.liveMatches.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar"></i><p>Şu an canlı maç yok.</p></div>';
        return;
      }

      this.renderLiveMatches();

    } catch (error) {
      console.error('Load error:', error);
      container.innerHTML = `<div class="empty-state error"><i class="fas fa-exclamation-triangle"></i><p>Hata: ${error.message}</p><small>Lütfen sayfayı yenileyin (F5)</small></div>`;
    }
  }

  renderLiveMatches() {
    const container = document.getElementById('liveMatches');
    
    container.innerHTML = this.liveMatches.map(match => {
      const isLive = ['1H', '2H', 'HT', 'ET'].includes(match.fixture?.status?.short);
      const status = match.fixture?.status;
      const isInCoupon = this.myCoupon.some(c => c.fixtureId === match.fixture.id);

      return `
        <div class="match-card ${isLive ? 'live' : ''}">
          <div class="match-header">
            <span class="league">${match.league?.name || 'Lig'}</span>
            <span class="match-status ${isLive ? 'live' : ''}">
              ${isLive ? '<span class="live-indicator-dot"></span>' : ''}
              ${status?.elapsed || 0}'
            </span>
          </div>
          
          <div class="match-teams">
            <div class="team home">
              <span>${match.teams?.home?.name || 'Ev Sahibi'}</span>
            </div>
            
            <div class="score">
              <span>${match.goals?.home ?? 0}</span>
              <span class="separator">-</span>
              <span>${match.goals?.away ?? 0}</span>
            </div>
            
            <div class="team away">
              <span>${match.teams?.away?.name || 'Deplasman'}</span>
            </div>
          </div>
          
          <button class="add-to-coupon ${isInCoupon ? 'added' : ''}" 
                  onclick="app.toggleCouponMatch(${match.fixture.id})"
                  id="btn-${match.fixture.id}">
            <i class="fas ${isInCoupon ? 'fa-check' : 'fa-plus'}"></i>
            ${isInCoupon ? 'Kuponda' : 'Kupona Ekle'}
          </button>
        </div>
      `;
    }).join('');
  }

  toggleCouponMatch(fixtureId) {
    const match = this.liveMatches.find(m => m.fixture.id === fixtureId);
    if (!match) return;

    const index = this.myCoupon.findIndex(c => c.fixtureId === fixtureId);
    
    if (index >= 0) {
      this.myCoupon.splice(index, 1);
    } else {
      this.myCoupon.push({
        fixtureId: match.fixture.id,
        homeTeam: match.teams.home.name,
        awayTeam: match.teams.away.name,
        league: match.league.name,
        score: `${match.goals.home}-${match.goals.away}`
      });
    }

    localStorage.setItem('ta_user_coupon', JSON.stringify(this.myCoupon));

    const btn = document.getElementById(`btn-${fixtureId}`);
    const added = index < 0;
    btn.className = `add-to-coupon ${added ? 'added' : ''}`;
    btn.innerHTML = `<i class="fas ${added ? 'fa-check' : 'fa-plus'}"></i> ${added ? 'Kuponda' : 'Kupona Ekle'}`;
  }

  loadMyCoupon() {
    const saved = localStorage.getItem('ta_user_coupon');
    if (saved) {
      this.myCoupon = JSON.parse(saved);
    }
  }

  startClock() {
    const clockEl = document.getElementById('clock');
    if (!clockEl) return;

    const update = () => {
      clockEl.textContent = new Date().toLocaleTimeString('tr-TR', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    };

    update();
    setInterval(update, 1000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});

function handleLogin(e) {
  e.preventDefault();
  window.app.handleLogin();
}

function handleRegister(e) {
  e.preventDefault();
  window.app.handleRegister();
}

function logout() {
  authService.logout();
  window.location.href = '/';
}

function togglePass(id, el) {
  const input = document.getElementById(id);
  input.type = input.type === 'password' ? 'text' : 'password';
  el.innerHTML = input.type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

function showSection(section) {
  ['live', 'ai', 'coupon', 'my-coupon', 'successful', 'premium'].forEach(s => {
    const el = document.getElementById(`sec-${s}`);
    if (el) el.classList.add('hidden');
  });

  const selectedEl = document.getElementById(`sec-${section}`);
  if (selectedEl) selectedEl.classList.remove('hidden');

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('onclick')?.includes(section)) {
      item.classList.add('active');
    }
  });

  const titles = {
    live: 'Canlı Maçlar',
    'my-coupon': 'Oynadığım Kupon',
    premium: 'Premium Kupon'
  };
  const titleEl = document.getElementById('sectionTitle');
  if (titleEl) titleEl.textContent = titles[section] || '';
}

function clearMyCoupon() {
  app.myCoupon = [];
  localStorage.removeItem('ta_user_coupon');
  location.reload();
}
