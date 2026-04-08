// ===== Main Application v3 - Complete System =====

if (typeof couponService === 'undefined' && typeof CouponService !== 'undefined') {
  window.couponService = new CouponService();
}

class App {
  constructor() {
    this.liveMatches = [];
    this.analyses = [];
    this.isAnalyzing = false;
    this.init();
  }

  async init() {
    await this.waitForServices();
    if (document.getElementById('dashUserName')) {
      if (!authService.requireAuth()) return;
      this.initDashboard();
    }
    this.setupEventListeners();
  }
  
  async waitForServices() {
    let attempts = 0;
    while (typeof couponService === 'undefined' && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
  }

  async initDashboard() {
    const user = authService.getCurrentUser();
    document.getElementById('dashUserName').textContent = user.name;
    document.getElementById('dashUserEmail').textContent = user.email;
    this.updatePremiumUI();
    this.startClock();
    await this.loadLiveMatches();
    await this.loadAIAnalyses();
    if (typeof couponService !== 'undefined') {
      couponService.renderUserCoupon();
    }
    if (authService.isPremium()) {
      await this.generatePremiumCoupons();
    }
    this.startAutoRefresh();
  }

  setupEventListeners() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegister();
      });
    }
  }

  updatePremiumUI() {
    const isPremium = authService.isPremium();
    const lockIcon = document.getElementById('premiumNavLock');
    if (lockIcon) {
      lockIcon.className = isPremium ? 'fas fa-unlock premium-lock-icon' : 'fas fa-lock premium-lock-icon';
      lockIcon.style.color = isPremium ? 'var(--green)' : 'var(--accent)';
    }
    const premiumLocked = document.getElementById('premiumLocked');
    const premiumContent = document.getElementById('premiumContent');
    if (premiumLocked && premiumContent) {
      if (isPremium) {
        premiumLocked.classList.add('hidden');
        premiumContent.classList.remove('hidden');
      } else {
        premiumLocked.classList.remove('hidden');
        premiumContent.classList.add('hidden');
      }
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
      window.location.href = './dashboard.html';
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
    if (!name || !email || !password) {
      if (errorEl) errorEl.textContent = 'Tüm alanları doldurun!';
      return;
    }
    const result = authService.register(name, email, password, password2);
    if (result.success) {
      window.location.href = './dashboard.html';
    } else {
      if (errorEl) errorEl.textContent = result.error;
    }
  }

  async loadLiveMatches() {
    const container = document.getElementById('liveMatches');
    if (!container) return;
    container.innerHTML = `
      <div class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Canlı maçlar yükleniyor...</p>
      </div>
    `;
    try {
      const data = await apiService.getMatches();
      this.liveMatches = data.matches || [];
      const liveCountEl = document.getElementById('liveCount');
      const todayCountEl = document.getElementById('todayCount');
      if (liveCountEl) liveCountEl.textContent = data.isLive ? data.count : 0;
      if (todayCountEl) todayCountEl.textContent = data.isLive ? 0 : data.count;
      const apiInfo = document.getElementById('apiInfo');
      if (apiInfo) {
        apiInfo.innerHTML = `<span class="requests">${apiService.getRequestCount().toLocaleString()} / 75,000</span>`;
      }
      if (this.liveMatches.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-calendar"></i>
            <p>Şu anda canlı maç bulunmuyor.</p>
          </div>
        `;
        return;
      }
      this.renderLiveMatches();
    } catch (error) {
      console.error('Load matches error:', error);
      container.innerHTML = `
        <div class="empty-state error">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Maçlar yüklenirken hata oluştu.</p>
          <button onclick="app.loadLiveMatches()" class="btn-retry">Tekrar Dene</button>
        </div>
      `;
    }
  }

  renderLiveMatches() {
    const container = document.getElementById('liveMatches');
    if (!container) return;
    const isLive = this.liveMatches.some(m => ['1H', '2H', 'HT', 'ET'].includes(m.fixture?.status?.short));
    const title = isLive ? '🔴 Canlı Maçlar' : '📅 Programdaki Maçlar';
    container.innerHTML = `
      <div class="matches-header">
        <h3>${title} (${this.liveMatches.length})</h3>
      </div>
      <div class="matches-grid">
        ${this.liveMatches.map(match => this.renderMatchCard(match)).join('')}
      </div>
    `;
  }

  renderMatchCard(match) {
    if (!match || !match.fixture) return '';
    const isLive = ['1H', '2H', 'HT', 'ET'].includes(match.fixture?.status?.short);
    const status = match.fixture?.status;
    const isInCoupon = typeof couponService !== 'undefined' ? couponService.isInCoupon(match.fixture.id) : false;
    const matchTime = new Date(match.fixture?.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    return `
      <div class="match-card ${isLive ? 'live' : ''}">
        <div class="match-header">
          <div class="league-info">
            <img src="${match.league?.logo || ''}" alt="" onerror="this.style.display='none'">
            <span>${match.league?.name || 'Lig'}</span>
          </div>
          <div class="match-status ${isLive ? 'live' : ''}">
            ${isLive ? '<span class="live-dot"></span>' : ''}
            ${isLive ? status?.elapsed + "'" : matchTime}
          </div>
        </div>
        <div class="match-teams">
          <div class="team home">
            <img src="${match.teams?.home?.logo || ''}" alt="" onerror="this.style.display='none'">
            <span>${match.teams?.home?.name}</span>
          </div>
          <div class="score">
            <span>${match.goals?.home ?? '-'}</span>
            <span class="separator">:</span>
            <span>${match.goals?.away ?? '-'}</span>
          </div>
          <div class="team away">
            <span>${match.teams?.away?.name}</span>
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
  }

  toggleCouponMatch(fixtureId) {
    const match = this.liveMatches.find(m => m && m.fixture && m.fixture.id === fixtureId);
    if (!match || typeof couponService === 'undefined') return;
    if (couponService.isInCoupon(fixtureId)) {
      couponService.removeFromCoupon(fixtureId);
    } else {
      couponService.addToCoupon({
        fixtureId: match.fixture.id,
        homeTeam: match.teams.home.name,
        awayTeam: match.teams.away.name,
        league: match.league.name,
        matchTime: match.fixture.date,
        odds: 1.5
      });
    }
    const btn = document.getElementById(`btn-${fixtureId}`);
    if (!btn || typeof couponService === 'undefined') return;
    const isInCoupon = couponService.isInCoupon(fixtureId);
    btn.className = `add-to-coupon ${isInCoupon ? 'added' : ''}`;
    btn.innerHTML = `<i class="fas ${isInCoupon ? 'fa-check' : 'fa-plus'}"></i>${isInCoupon ? 'Kuponda' : 'Kupona Ekle'}`;
    if (typeof couponService !== 'undefined') {
      couponService.renderUserCoupon();
    }
  }

  addToCouponWithPrediction(fixtureId) {
    if (typeof couponService === 'undefined') return;
    const analysis = this.analyses.find(a => a.fixtureId === fixtureId);
    if (!analysis) return;
    if (couponService.isInCoupon(fixtureId)) {
      couponService.removeFromCoupon(fixtureId);
    } else {
      couponService.addToCoupon({
        fixtureId: analysis.fixtureId,
        homeTeam: analysis.homeTeam,
        awayTeam: analysis.awayTeam,
        league: analysis.league,
        matchTime: analysis.matchTime,
        selectedPrediction: analysis.bestMarket,
        odds: parseFloat(analysis.bestMarket.odds)
      });
    }
    const btn = document.getElementById(`ai-btn-${fixtureId}`);
    const isInCoupon = couponService.isInCoupon(fixtureId);
    if (btn) {
      btn.className = `add-to-coupon ${isInCoupon ? 'added' : ''}`;
      btn.innerHTML = `<i class="fas ${isInCoupon ? 'fa-check' : 'fa-plus'}"></i>${isInCoupon ? 'Kuponda' : 'Kupona Ekle'}`;
    }
    if (typeof couponService !== 'undefined') {
      couponService.renderUserCoupon();
    }
  }

  async loadAIAnalyses() {
    if (typeof couponService === 'undefined') return;
    const cached = couponService.getAnalyses();
    if (cached) {
      this.analyses = cached;
      this.renderAIAnalyses();
      return;
    }
    if (this.liveMatches.length === 0) return;
    const today = new Date().toISOString().split('T')[0];
    const analyzableMatches = this.liveMatches.filter(m => {
      const matchDate = new Date(m.fixture?.date).toISOString().split('T')[0];
      const status = m.fixture?.status?.short;
      return matchDate === today && ['NS', '1H', '2H', 'HT', 'ET'].includes(status);
    });
    if (analyzableMatches.length === 0) {
      const container = document.getElementById('aiCards');
      if (container) {
        container.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-calendar"></i>
            <p>Bugün için analiz edilecek maç bulunmuyor.</p>
            <small>Yarın için yeni tahminler gelecek.</small>
          </div>
        `;
      }
      return;
    }
    const container = document.getElementById('aiCards');
    if (container) {
      container.innerHTML = `
        <div class="loading-state">
          <i class="fas fa-brain fa-spin"></i>
          <p>Yapay zeka ${analyzableMatches.length} maçı analiz ediyor...</p>
          <small>Bu işlem biraz zaman alabilir</small>
        </div>
      `;
    }
    this.isAnalyzing = true;
    try {
      const matchesToAnalyze = analyzableMatches;
      this.analyses = await aiEngine.analyzeFixtures(matchesToAnalyze);
      if (typeof couponService !== 'undefined') {
        couponService.saveAnalyses(this.analyses);
      }
      this.renderAIAnalyses();
      this.generateDailyCoupon();
    } catch (error) {
      console.error('AI Analysis error:', error);
      if (container) {
        container.innerHTML = `
          <div class="empty-state error">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Analiz yapılırken hata oluştu.</p>
          </div>
        `;
      }
    }
    this.isAnalyzing = false;
  }

  renderAIAnalyses() {
    if (typeof couponService === 'undefined') return;
    const isPremium = authService.isPremium();
    couponService.renderAICards(this.analyses, isPremium);
  }

  generateDailyCoupon() {
    if (this.analyses.length === 0 || typeof couponService === 'undefined') return;
    const dailyCoupon = aiEngine.generatePremiumCoupons(this.analyses);
    if (dailyCoupon && dailyCoupon.coupons.length > 0) {
      couponService.savePremiumCoupons(dailyCoupon);
      this.renderDailyCoupon(dailyCoupon.coupons[0]);
    }
  }

  renderDailyCoupon(coupon) {
    const container = document.getElementById('couponHero');
    if (!container) return;
    const confidenceClass = coupon.avgConfidence >= 80 ? 'high' : 'medium';
    container.innerHTML = `
      <div class="daily-coupon-hero">
        <div class="hero-header">
          <i class="fas fa-ticket-alt"></i>
          <h3>Günlük Kupon</h3>
          <span class="confidence-badge ${confidenceClass}">%${coupon.avgConfidence} Güven</span>
        </div>
        <div class="hero-stats">
          <span class="total-odds">${coupon.totalOdds}x</span>
          <span class="match-count">${coupon.picks.length} Maç</span>
        </div>
        <button class="btn-add-all" onclick="app.addDailyToCoupon()">
          <i class="fas fa-plus"></i> Kuponuma Ekle
        </button>
      </div>
    `;
    const picksContainer = document.getElementById('couponMatches');
    if (picksContainer) {
      picksContainer.innerHTML = coupon.picks.map((pick, idx) => `
        <div class="pick-row">
          <div class="pick-number">${idx + 1}</div>
          <div class="pick-info">
            <div class="pick-teams">${pick.homeTeam} vs ${pick.awayTeam}</div>
            <div class="pick-league">${pick.league}</div>
          </div>
          <div class="pick-prediction">
            <span class="pick-label">${pick.prediction.label}</span>
            <span class="pick-odds">@${pick.odds}</span>
          </div>
          <div class="pick-prob">%${pick.prob}</div>
        </div>
      `).join('');
    }
  }

  addDailyToCoupon() {
    if (typeof couponService === 'undefined') return;
    const coupons = couponService.getPremiumCoupons();
    if (!coupons || !coupons.coupons || coupons.coupons.length === 0) return;
    const dailyCoupon = coupons.coupons[0];
    dailyCoupon.picks.forEach(pick => {
      if (!couponService.isInCoupon(pick.fixtureId)) {
        couponService.addToCoupon({
          fixtureId: pick.fixtureId,
          homeTeam: pick.homeTeam,
          awayTeam: pick.awayTeam,
          league: pick.league,
          matchTime: pick.matchTime,
          selectedPrediction: pick.prediction,
          odds: parseFloat(pick.odds)
        });
      }
    });
    couponService.renderUserCoupon();
    showSection('my-coupon');
  }

  async generatePremiumCoupons() {
    if (typeof couponService === 'undefined') return;
    const cached = couponService.getPremiumCoupons();
    if (cached) {
      couponService.renderPremiumCoupons(cached);
      return;
    }
    if (this.analyses.length === 0) return;
    const premiumCoupons = aiEngine.generatePremiumCoupons(this.analyses);
    if (premiumCoupons) {
      couponService.savePremiumCoupons(premiumCoupons);
      couponService.renderPremiumCoupons(premiumCoupons);
    }
  }

  addPremiumToCoupon(couponIndex) {
    if (typeof couponService === 'undefined') return;
    const coupons = couponService.getPremiumCoupons();
    if (!coupons || !coupons.coupons || !coupons.coupons[couponIndex]) return;
    const coupon = coupons.coupons[couponIndex];
    coupon.picks.forEach(pick => {
      if (!couponService.isInCoupon(pick.fixtureId)) {
        couponService.addToCoupon({
          fixtureId: pick.fixtureId,
          homeTeam: pick.homeTeam,
          awayTeam: pick.awayTeam,
          league: pick.league,
          matchTime: pick.matchTime,
          selectedPrediction: pick.prediction,
          odds: parseFloat(pick.odds)
        });
      }
    });
    couponService.renderUserCoupon();
    showSection('my-coupon');
  }

  startAutoRefresh() {
    setInterval(() => {
      this.loadLiveMatches();
    }, 60000);
    setInterval(() => {
      if (typeof couponService !== 'undefined') {
        couponService.checkSuccessfulPredictions(this.analyses);
      }
    }, 300000);
  }

  startClock() {
    const clockEl = document.getElementById('clock');
    if (!clockEl) return;
    const update = () => {
      clockEl.textContent = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };
    update();
    setInterval(update, 1000);
  }

  renderUserCoupon() {
    if (typeof couponService !== 'undefined') {
      couponService.renderUserCoupon();
    }
  }
}

function handleLogin(e) {
  e.preventDefault();
  app.handleLogin();
}

function handleRegister(e) {
  e.preventDefault();
  app.handleRegister();
}

function logout() {
  authService.logout();
  window.location.href = './index.html';
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
    ai: 'YZ Tahminleri',
    coupon: 'Günlük Kupon',
    'my-coupon': 'Oynadığım Kupon',
    successful: 'Tutan Analizler',
    premium: 'Premium Kuponlar'
  };
  const titleEl = document.getElementById('sectionTitle');
  if (titleEl) titleEl.textContent = titles[section] || '';
  if (section === 'successful') {
    if (typeof couponService !== 'undefined') {
      couponService.renderSuccessfulPredictions();
    }
  } else if (section === 'premium' && authService.isPremium()) {
    app.generatePremiumCoupons();
  }
}

function clearMyCoupon() {
  if (typeof couponService !== 'undefined') {
    couponService.clearCoupon();
  }
  app.renderUserCoupon();
}

function updateCouponWin() {
  const amount = parseFloat(document.getElementById('couponAmount')?.value) || 100;
  if (typeof couponService === 'undefined') return;
  const stats = couponService.getCouponStats();
  const win = (amount * parseFloat(stats.totalOdds)).toFixed(2);
  const winEl = document.getElementById('myCouponWin');
  if (winEl) winEl.textContent = win + '₺';
}

function filterLive(filter) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('onclick')?.includes(filter)) {
      btn.classList.add('active');
    }
  });
  let filtered = app.liveMatches;
  if (filter !== 'all') {
    filtered = app.liveMatches.filter(m => m.fixture?.status?.short === filter);
  }
  const container = document.getElementById('liveMatches');
  if (container) {
    container.innerHTML = `
      <div class="matches-header">
        <h3>Filtrelenmiş Maçlar (${filtered.length})</h3>
      </div>
      <div class="matches-grid">
        ${filtered.map(match => app.renderMatchCard(match)).join('')}
      </div>
    `;
  }
}

function filterByContinent(continent) {
  document.querySelectorAll('.continent-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('onclick')?.includes(continent)) {
      btn.classList.add('active');
    }
  });
  let filtered = app.liveMatches;
  if (continent !== 'all') {
    const continentCountries = {
      'europe': ['England', 'Spain', 'Italy', 'Germany', 'France', 'Portugal', 'Netherlands', 'Belgium', 'Scotland', 'Turkey', 'Greece', 'Switzerland', 'Austria', 'Denmark', 'Sweden', 'Norway', 'Finland', 'Poland', 'Czech-Republic', 'Romania', 'Bulgaria', 'Serbia', 'Croatia', 'Ukraine', 'Russia', 'Ireland', 'Wales'],
      'asia': ['Turkey', 'Japan', 'South-Korea', 'China', 'Saudi-Arabia', 'Qatar', 'UAE', 'Iran', 'Iraq', 'India', 'Indonesia', 'Thailand', 'Vietnam', 'Malaysia', 'Singapore', 'Uzbekistan', 'Jordan', 'Bahrain', 'Kuwait', 'Oman', 'Lebanon', 'Syria', 'Palestine', 'Yemen', 'Pakistan'],
      'africa': ['Egypt', 'Morocco', 'Algeria', 'Tunisia', 'Libya', 'South-Africa', 'Nigeria', 'Ghana', 'Senegal', 'Cameroon', 'Ivory-Coast', 'Mali', 'Burkina-Faso', 'DR-Congo', 'Congo', 'Ethiopia', 'Kenya', 'Tanzania', 'Uganda', 'Angola', 'Zambia', 'Zimbabwe', 'Mozambique', 'Sudan', 'Rwanda'],
      'southamerica': ['Argentina', 'Brazil', 'Chile', 'Uruguay', 'Paraguay', 'Bolivia', 'Peru', 'Colombia', 'Ecuador', 'Venezuela'],
      'northamerica': ['USA', 'Canada', 'Mexico', 'Costa-Rica', 'Honduras', 'Guatemala', 'Panama', 'El-Salvador', 'Jamaica', 'Trinidad-and-Tobago', 'Haiti', 'Dominican-Republic', 'Nicaragua'],
      'oceania': ['Australia', 'New-Zealand', 'Fiji', 'Papua-New-Guinea', 'Solomon-Islands', 'Tahiti', 'New-Caledonia']
    };
    const countries = continentCountries[continent] || [];
    filtered = app.liveMatches.filter(m => countries.includes(m.league?.country));
  }
  const container = document.getElementById('liveMatches');
  if (container) {
    container.innerHTML = `
      <div class="matches-header">
        <h3>${continent === 'all' ? 'Tüm Maçlar' : continent.charAt(0).toUpperCase() + continent.slice(1)} (${filtered.length})</h3>
      </div>
      <div class="matches-grid">
        ${filtered.map(match => app.renderMatchCard(match)).join('')}
      </div>
    `;
  }
}

function showPremiumModal() {
  alert('Premium üyelik için: djclubu@tahminarena.com adresine e-posta gönderin.');
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
