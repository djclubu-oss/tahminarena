// ===== Main Application =====

class App {
  constructor() {
    this.currentSection = 'live';
    this.analyses = [];
    this.liveMatches = [];
    this.myCoupon = [];
    this.init();
  }

  async init() {
    // Check authentication
    if (document.getElementById('dashUserName')) {
      if (!authService.requireAuth()) return;
      this.initDashboard();
    }

    // Setup event listeners
    this.setupEventListeners();
  }

  // Initialize dashboard
  async initDashboard() {
    const user = authService.getCurrentUser();
    
    // Set user info
    const nameEl = document.getElementById('dashUserName');
    const emailEl = document.getElementById('dashUserEmail');
    if (nameEl) nameEl.textContent = user.name;
    if (emailEl) emailEl.textContent = user.email;

    // Start clock
    this.startClock();

    // Load my coupon from storage
    this.loadMyCoupon();

    // Load initial data
    await this.loadLiveMatches();

    // Start live updates
    this.startLiveUpdates();

    // Setup navigation
    this.setupNavigation();
  }

  // Setup event listeners
  setupEventListeners() {
    // Login form
    const loginForm = document.querySelector('form[onsubmit="handleLogin(event)"]');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Register form
    const registerForm = document.querySelector('form[onsubmit="handleRegister(event)"]');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegister();
      });
    }
  }

  // Handle login
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

  // Handle register
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

  // Load live matches from ALL leagues
  async loadLiveMatches() {
    try {
      // Show loading
      const container = document.getElementById('liveMatches');
      if (container) {
        container.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i><p>Tüm liglerden canlı maçlar yükleniyor...</p></div>';
      }

      // Get live matches with odds
      const data = await apiService.getLiveMatchesWithOdds();
      this.liveMatches = data.response || [];

      // Update counts
      document.getElementById('liveCount').textContent = this.liveMatches.length;
      
      // Update API info
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

      // Render matches
      this.renderLiveMatches(this.liveMatches);

    } catch (error) {
      console.error('Load live matches error:', error);
      const container = document.getElementById('liveMatches');
      if (container) {
        container.innerHTML = `<div class="empty-state error">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Maçlar yüklenirken hata oluştu.</p>
          <small>${error.message}</small>
        </div>`;
      }
    }
  }

  // Render live matches with odds
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

  // Start live updates
  startLiveUpdates() {
    // Her 30 saniyede bir güncelle
    setInterval(() => {
      this.loadLiveMatches();
    }, 30000);
  }

  // Toggle match in my coupon
  toggleCouponMatch(fixtureId) {
    const match = this.liveMatches.find(m => m.fixture.id === fixtureId);
    if (!match) return;

    const index = this.myCoupon.findIndex(c => c.fixtureId === fixtureId);
    
    if (index >= 0) {
      // Remove from coupon
      this.myCoupon.splice(index, 1);
    } else {
      // Add to coupon
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

    // Save to storage
    localStorage.setItem(STORAGE_KEYS.USER_COUPON, JSON.stringify(this.myCoupon));

    // Update UI
    this.updateCouponButton(fixtureId, index < 0);
    this.updateMyCouponUI();
  }

  // Update coupon button
  updateCouponButton(fixtureId, added) {
    const btn = document.getElementById(`btn-${fixtureId}`);
    if (btn) {
      btn.className = `add-to-coupon ${added ? 'added' : ''}`;
      btn.innerHTML = `<i class="fas ${added ? 'fa-check' : 'fa-plus'}"></i> ${added ? 'Kuponda' : 'Kupona Ekle'}`;
    }
  }

  // Load my coupon from storage
  loadMyCoupon() {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_COUPON);
    if (saved) {
      this.myCoupon = JSON.parse(saved);
      this.updateMyCouponUI();
    }
  }

  // Update my coupon UI
  updateMyCouponUI() {
    const countEl = document.getElementById('my-coupon-count');
    const countDisplayEl = document.getElementById('myCouponCount');
    const oddsEl = document.getElementById('myCouponOdds');
    const winEl = document.getElementById('myCouponWin');
    const container = document.getElementById('myCouponMatches');

    // Update badge
    if (countEl) {
      countEl.textContent = this.myCoupon.length;
      countEl.style.display = this.myCoupon.length > 0 ? 'inline-flex' : 'none';
    }

    // Update stats
    if (countDisplayEl) countDisplayEl.textContent = this.myCoupon.length;
    
    const totalOdds = this.myCoupon.reduce((acc, c) => acc * parseFloat(c.odds), 1).toFixed(2);
    if (oddsEl) oddsEl.textContent = totalOdds;

    const amount = parseFloat(document.getElementById('couponAmount')?.value || 100);
    if (winEl) winEl.textContent = (amount * totalOdds).toFixed(0) + '₺';

    // Update list
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

  // Remove from coupon
  removeFromCoupon(index) {
    const match = this.myCoupon[index];
    this.myCoupon.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.USER_COUPON, JSON.stringify(this.myCoupon));
    
    // Update button in live matches
    this.updateCouponButton(match.fixtureId, false);
    this.updateMyCouponUI();
  }

  // Clear my coupon
  clearMyCoupon() {
    // Update all buttons
    this.myCoupon.forEach(c => {
      this.updateCouponButton(c.fixtureId, false);
    });
    
    this.myCoupon = [];
    localStorage.removeItem(STORAGE_KEYS.USER_COUPON);
    this.updateMyCouponUI();
  }

  // Update coupon win calculation
  updateCouponWin() {
    this.updateMyCouponUI();
  }

  // Filter live matches
  filterLive(status) {
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.textContent.includes(status) || (status === 'all' && btn.textContent === 'Tümü')) {
        btn.classList.add('active');
      }
    });

    // Filter matches
    if (status === 'all') {
      this.renderLiveMatches(this.liveMatches);
    } else {
      const filtered = this.liveMatches.filter(m => m.fixture?.status?.short === status);
      this.renderLiveMatches(filtered);
    }
  }

  // Setup navigation
  setupNavigation() {
    window.showSection = (section) => {
      // Hide all sections
      ['live', 'ai', 'coupon', 'my-coupon', 'successful', 'premium'].forEach(s => {
        const el = document.getElementById(`sec-${s}`);
        if (el) el.classList.add('hidden');
      });

      // Show selected section
      const selectedEl = document.getElementById(`sec-${section}`);
      if (selectedEl) selectedEl.classList.remove('hidden');

      // Update nav active state
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick')?.includes(section)) {
          item.classList.add('active');
        }
      });

      // Update title
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

      // Render section content
      if (section === 'my-coupon') {
        this.updateMyCouponUI();
      }
    };
  }

  // Start clock
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

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});

// Global functions for HTML onclick
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
