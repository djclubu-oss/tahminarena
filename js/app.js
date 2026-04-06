// ===== Main Application =====

class App {
  constructor() {
    this.currentSection = 'live';
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
    
    const nameEl = document.getElementById('dashUserName');
    const emailEl = document.getElementById('dashUserEmail');
    if (nameEl) nameEl.textContent = user.name;
    if (emailEl) emailEl.textContent = user.email;

    this.startClock();
    this.loadMyCoupon();
    await this.loadLiveMatches();
    this.startLiveUpdates();
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
      window.location.href = 'dashboard.html';
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
    const successEl = document.getElementById('regSuccess');

    if (password !== password2) {
      if (errorEl) errorEl.textContent = 'Şifreler eşleşmiyor!';
      return;
    }

    const result = authService.register(name, email, password);
    
    if (result.success) {
      if (successEl) successEl.textContent = 'Kayıt başarılı! Yönlendiriliyorsunuz...';
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);
    } else {
      if (errorEl) errorEl.textContent = result.error;
    }
  }

  async loadLiveMatches() {
    try {
      const container = document.getElementById('liveMatches');
      if (container) {
        container.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i><p>Tüm liglerden canlı maçlar yükleniyor...</p></div>';
      }

      const data = await apiService.getLiveMatchesWithOdds();
      this.liveMatches = data.response || [];

      document.getElementById('liveCount').textContent = this.liveMatches.length;
      
      const apiInfo = document.getElementById('apiInfo');
      if (apiInfo) {
        apiInfo.innerHTML = `<span class="requests">${apiService.getRequestCount()} / 75,000</span>`;
      }

      if (this.liveMatches.length === 0) {
        if (container) {
          container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar"></i><p>Şu an canlı maç yok.</p><small>Tüm dünya liglerinden maçlar takip ediliyor.</small></div>';
        }
        return;
      }

      this.renderLiveMatches(this.liveMatches);

    } catch (error) {
      console.error('Load live matches error:', error);
      const container = document.getElementById('liveMatches');
      if (container) {
        container.innerHTML = `<div class="empty-state error"><i class="fas fa-exclamation-triangle"></i><p>Maçlar yüklenirken hata oluştu.</p><small>${error.message}</small></div>`;
      }
    }
  }

  renderLiveMatches(matches) {
    const container = document.getElementById('liveMatches');
    if (!container) return;

    container.innerHTML = matches.map(match => {
      const isLive = ['1H', '2H', 'HT', 'ET'].includes(match.fixture?.status?.short);
      const status = match.fixture?.status;
      const league = match.league;
      const odds = match.odds;
      const isInCoupon = this.myCoupon.some(c => c.fixtureId === match.fixture.id);

      return `
        <div class="match-card ${isLive ? 'live' : ''}" data-fixture="${match.fixture.id}">
          <div class="match-header">
            <span class="league">
              <img src="${league.logo}" alt="" style="width: 20px; height: 20px; margin-right: 8px; vertical-align: middle;" onerror="this.style.display='none'">
              ${league.name}
            </span>
            <span class="match-status ${isLive ? 'live' : ''}">
              ${isLive ? '<span class="live-indicator-dot"></span>' : ''}
              ${status.short === 'HT' ? 'Devre Arası' : status.elapsed + "'"}
            </span>
          </div>
          
          <div class="match-teams">
            <div class="team home">
              <img src="${match.teams.home.logo}" alt="" onerror="this.style.display='none'">
              <span>${match.teams.home.name}</span>
            </div>
            
            <div class="score ${match.goals.home !== null ? 'score-update' : ''}">
              <span class="home-goals">${match.goals.home ?? '-'}</span>
              <span class="separator">-</span>
              <span class="away-goals">${match.goals.away ?? '-'}</span>
            </div>
            
            <div class="team away">
              <span>${match.teams.away.name}</span>
              <img src="${match.teams.away.logo}" alt="" onerror="this.style.display='none'">
            </div>
          </div>
          
          ${odds ? `
            <div class="live-odds">
              <div class="odd-box">
                <span class="label">1</span>
                <span class="value">${odds.matchWinner?.home || '-'}</span>
              </div>
              <div class="odd-box">
                <span class="label">X</span>
                <span class="value">${odds.matchWinner?.draw || '-'}</span>
              </div>
              <div class="odd-box">
                <span class="label">2</span>
                <span class="value">${odds.matchWinner?.away || '-'}</span>
              </div>
              <div class="odd-box">
                <span class="label">Üst 2.5</span>
                <span class="value">${odds.overUnder?.over || '-'}</span>
              </div>
              <div class="odd-box">
                <span class="label">Alt 2.5</span>
                <span class="value">${odds.overUnder?.under || '-'}</span>
              </div>
              <div class="odd-box">
                <span class="label">KG Var</span>
                <span class="value">${odds.btts?.yes || '-'}</span>
              </div>
            </div>
          ` : ''}
          
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

  startLiveUpdates() {
    setInterval(() => {
      this.loadLiveMatches();
    }, 30000);
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
        time: match.fixture.status.elapsed + "'",
        odds: match.odds?.matchWinner?.home || '1.80'
      });
    }

    const key = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.USER_COUPON : 'ta_user_coupon';
    localStorage.setItem(key, JSON.stringify(this.myCoupon));

    this.updateCouponButton(fixtureId, index < 0);
    this.updateMyCouponUI();
  }

  updateCouponButton(fixtureId, added) {
    const btn = document.getElementById(`btn-${fixtureId}`);
    if (btn) {
      btn.className = `add-to-coupon ${added ? 'added' : ''}`;
      btn.innerHTML = `<i class="fas ${added ? 'fa-check' : 'fa-plus'}"></i> ${added ? 'Kuponda' : 'Kupona Ekle'}`;
    }
  }

  loadMyCoupon() {
    const key = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.USER_COUPON : 'ta_user_coupon';
    const saved = localStorage.getItem(key);
    if (saved) {
      this.myCoupon = JSON.parse(saved);
      this.updateMyCouponUI();
    }
  }

  updateMyCouponUI() {
    const countEl = document.getElementById('my-coupon-count');
    const countDisplayEl = document.getElementById('myCouponCount');
    const oddsEl = document.getElementById('myCouponOdds');
    const winEl = document.getElementById('myCouponWin');
    const container = document.getElementById('myCouponMatches');

    if (countEl) {
      countEl.textContent = this.myCoupon.length;
      countEl.style.display = this.myCoupon.length > 0 ? 'inline-flex' : 'none';
    }

    if (countDisplayEl) countDisplayEl.textContent = this.myCoupon.length;
    
    const totalOdds = this.myCoupon.reduce((acc, c) => acc * parseFloat(c.odds), 1).toFixed(2);
    if (oddsEl) oddsEl.textContent = totalOdds;

    const amount = parseFloat(document.getElementById('couponAmount')?.value || 100);
    if (winEl) winEl.textContent = (amount * totalOdds).toFixed(0) + '₺';

    if (container) {
      if (this.myCoupon.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-ticket-alt"></i>
            <p>Henüz maç eklemediniz.</p>
            <small>Canlı maçlardan seçim yaparak kupon oluşturun.</small>
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
              <span class="match-status live">${match.time}</span>
            </div>
            
            <div class="match-teams">
              <div class="team home">
                <span>${match.homeTeam}</span>
              </div>
              <div class="score">${match.score}</div>
              <div class="team away">
                <span>${match.awayTeam}</span>
              </div>
            </div>
            
            <div class="match-prediction">
              <span>Oran: @${match.odds}</span>
            </div>
          </div>
        `).join('');
      }
    }
  }

  removeFromCoupon(index) {
    const match = this.myCoupon[index];
    this.myCoupon.splice(index, 1);
    
    const key = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.USER_COUPON : 'ta_user_coupon';
    localStorage.setItem(key, JSON.stringify(this.myCoupon));
    
    this.updateCouponButton(match.fixtureId, false);
    this.updateMyCouponUI();
  }

  clearMyCoupon() {
    this.myCoupon.forEach(c => {
      this.updateCouponButton(c.fixtureId, false);
    });
    
    this.myCoupon = [];
    const key = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.USER_COUPON : 'ta_user_coupon';
    localStorage.removeItem(key);
    this.updateMyCouponUI();
  }

  updateCouponWin() {
    this.updateMyCouponUI();
  }

  filterLive(status) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.textContent.includes(status) || (status === 'all' && btn.textContent === 'Tümü')) {
        btn.classList.add('active');
      }
    });

    if (status === 'all') {
      this.renderLiveMatches(this.liveMatches);
    } else {
      const filtered = this.liveMatches.filter(m => m.fixture?.status?.short === status);
      this.renderLiveMatches(filtered);
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
        ai: 'YZ Tahmin Motoru',
        coupon: 'Günlük Kupon',
        'my-coupon': 'Oynadığım Kupon',
        successful: 'Tutan Analizler',
        premium: 'Premium Kupon'
      };
      const titleEl = document.getElementById('sectionTitle');
      if (titleEl) titleEl.textContent = titles[section] || '';

      if (section === 'my-coupon') {
        this.updateMyCouponUI();
      }
    };
  }

  startClock() {
    const clockEl = document.getElementById('clock');
    if (!clockEl) return;

    const update = () => {
      clockEl.textContent = new Date().toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
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
  window.location.href = 'index.html';
}

function togglePass(id, el) {
  const input = document.getElementById(id);
  if (input.type === 'password') {
    input.type = 'text';
    el.innerHTML = '<i class="fas fa-eye-slash"></i>';
  } else {
    input.type = 'password';
    el.innerHTML = '<i class="fas fa-eye"></i>';
  }
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

function filterLive(status) {
  window.app.filterLive(status);
}

function clearMyCoupon() {
  window.app.clearMyCoupon();
}

function updateCouponWin() {
  window.app.updateCouponWin();
}
