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
    this.setupNavigation();
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

    if (!email || !password) {
      if (errorEl) errorEl.textContent = 'E-posta ve şifre gereklidir!';
      return;
    }

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
    container.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i><p>Maçlar yükleniyor...</p></div>';

    try {
      const data = await apiService.getLiveMatches();
      console.log('Loaded matches:', data);
      
      this.liveMatches = data.response || [];

      document.getElementById('liveCount').textContent = this.liveMatches.length;
      document.getElementById('apiInfo').innerHTML = `<span class="requests">${apiService.getRequestCount()} / 75,000</span>`;

      if (this.liveMatches.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar"></i><p>Bugün maç yok.</p></div>';
        return;
      }

      this.renderLiveMatches();

    } catch (error) {
      console.error('Load error:', error);
      container.innerHTML = `<div class="empty-state error"><i class="fas fa-exclamation-triangle"></i><p>Hata: ${error.message}</p></div>`;
    }
  }

  renderLiveMatches() {
    const container = document.getElementById('liveMatches');
    
    container.innerHTML = this.liveMatches.map(match => {
      const isLive = ['1H', '2H', 'HT', 'ET'].includes(match.fixture?.status?.short);
      const status = match.fixture?.status;
      const isInCoupon = this.myCoupon.some(c => c.fixtureId === match.fixture.id);
      const matchTime = new Date(match.fixture?.date).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});

      return `
        <div class="match-card ${isLive ? 'live' : ''}">
          <div class="match-header">
            <span class="league">
              <img src="${match.league?.logo || ''}" alt="" onerror="this.style.display='none'">
              ${match.league?.name || 'Lig'}
            </span>
            <span class="match-status ${isLive ? 'live' : ''}">
              ${isLive ? '<span class="live-indicator-dot"></span> Canlı' : matchTime}
            </span>
          </div>
          
          <div class="match-teams">
            <div class="team home">
              <img src="${match.teams?.home?.logo || ''}" alt="" onerror="this.style.display='none'">
              <span>${match.teams?.home?.name || 'Ev Sahibi'}</span>
            </div>
            
            <div class="score">
              <span>${match.goals?.home ?? '-'}</span>
              <span class="separator">-</span>
              <span>${match.goals?.away ?? '-'}</span>
            </div>
            
            <div class="team away">
              <span>${match.teams?.away?.name || 'Deplasman'}</span>
              <img src="${match.teams?.away?.logo || ''}" alt="" onerror="this.style.display='none'">
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
        score: `${match.goals.home}-${match.goals.away}`,
        odds: '1.80'
      });
    }

    localStorage.setItem('ta_user_coupon', JSON.stringify(this.myCoupon));

    const btn = document.getElementById(`btn-${fixtureId}`);
    const added = index < 0;
    btn.className = `add-to-coupon ${added ? 'added' : ''}`;
    btn.innerHTML = `<i class="fas ${added ? 'fa-check' : 'fa-plus'}"></i> ${added ? 'Kuponda' : 'Kupona Ekle'}`;
    
    this.updateMyCouponUI();
  }

  loadMyCoupon() {
    const saved = localStorage.getItem('ta_user_coupon');
    if (saved) {
      this.myCoupon = JSON.parse(saved);
      this.updateMyCouponUI();
    }
  }

  updateMyCouponUI() {
    const countEl = document.getElementById('my-coupon-count');
    if (countEl) {
      countEl.textContent = this.myCoupon.length;
      countEl.style.display = this.myCoupon.length > 0 ? 'inline-flex' : 'none';
    }

    const container = document.getElementById('myCouponMatches');
    if (!container) return;

    if (this.myCoupon.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-ticket-alt"></i>
          <p>Henüz maç eklemediniz.</p>
        </div>
      `;
    } else {
      container.innerHTML = this.myCoupon.map((match, idx) => `
        <div class="match-card" style="position: relative;">
          <button class="remove-from-coupon" onclick="app.removeFromCoupon(${idx})">
            <i class="fas fa-times"></i>
          </button>
          <div class="match-header">
            <span class="league">${match.league}</span>
          </div>
          <div class="match-teams">
            <div class="team"><span>${match.homeTeam}</span></div>
            <div class="score">${match.score}</div>
            <div class="team"><span>${match.awayTeam}</span></div>
          </div>
        </div>
      `).join('');
    }
  }

  removeFromCoupon(index) {
    const match = this.myCoupon[index];
    this.myCoupon.splice(index, 1);
    localStorage.setItem('ta_user_coupon', JSON.stringify(this.myCoupon));
    this.updateCouponButton(match.fixtureId, false);
    this.updateMyCouponUI();
  }

  updateCouponButton(fixtureId, added) {
    const btn = document.getElementById(`btn-${fixtureId}`);
    if (btn) {
      btn.className = `add-to-coupon ${added ? '' : 'added'}`;
      btn.innerHTML = `<i class="fas ${added ? 'fa-plus' : 'fa-check'}"></i> ${added ? 'Kupona Ekle' : 'Kuponda'}`;
    }
  }

  setupNavigation() {
    window.showSection = (section) => {
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

      if (section === 'my-coupon') this.updateMyCouponUI();
    };
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

function clearMyCoupon() {
  app.myCoupon = [];
  localStorage.removeItem('ta_user_coupon');
  app.updateMyCouponUI();
}

function updateCouponWin() {
  app.updateMyCouponUI();
}
