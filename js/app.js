// ===== Main Application v3 - Complete System =====

if (typeof couponService === 'undefined' && typeof CouponService !== 'undefined') {
  window.couponService = new CouponService();
}

class App {
  constructor() {
    this.liveMatches = [];
    this.todayMatches = [];
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
    await this.loadTodayMatches();
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

  // CANLI MAÇLAR - Sadece gerçek canlı maçlar
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
      const data = await apiService.getLiveMatches();
      this.liveMatches = data.matches || [];
      const liveCountEl = document.getElementById('liveCount');
      if (liveCountEl) liveCountEl.textContent = data.count;
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

  // BUGÜNKÜ MAÇLAR - YZ Tahminleri için
  async loadTodayMatches() {
    try {
      const data = await apiService.getMatches();
      this.todayMatches = data.matches || [];
      const todayCountEl = document.getElementById('todayCount');
      if (todayCountEl) todayCountEl.textContent = this.todayMatches.length;
    } catch (error) {
      console.error('Load today matches error:', error);
    }
  }

  renderLiveMatches() {
    const container = document.getElementById('liveMatches');
    if (!container) return;
    const title = '🔴 Canlı Maçlar';
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

  // YZ TAHMİNLERİ - Bugünün tüm maçları, 24 saatte bir sıfırlanır
  async loadAIAnalyses() {
    if (typeof couponService === 'undefined') return;
    
    // Cache kontrolü - 24 saatte bir sıfırlanır
    const cached = couponService.getAnalyses();
    if (cached) {
      this.analyses = cached;
      this.renderAIAnalyses();
      return;
    }

    // Bugünün maçlarını kullan
    if (this.todayMatches.length === 0) {
      await this.loadTodayMatches();
    }

    if (this.todayMatches.length === 0) {
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

    // Sadece bugün oynanacak maçları analiz et
    const today = new Date().toISOString().split('T')[0];
    const analyzableMatches = this.todayMatches.filter(m => {
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
    // Canlı maçları her 60 saniyede bir yenile
    setInterval(() => {
      this.loadLiveMatches();
    }, 60000);

    // 24 saatte bir tüm verileri sıfırla ve yenile
    setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        // Cache'i temizle
        localStorage.removeItem(STORAGE_KEYS.AI_ANALYSES);
        localStorage.removeItem(STORAGE_KEYS.PREMIUM_COUPONS);
        // Verileri yeniden yükle
        this.loadTodayMatches();
        this.loadAIAnalyses();
      }
    }, 60000); // Her dakika kontrol et

    // Biten maçları kontrol et
    setInterval(() => {
      if (typeof couponService !== 'undefined') {
        couponService.checkSuccessfulPredictions(this.analyses);
      }
    }, 300000);
  }

  startClock
