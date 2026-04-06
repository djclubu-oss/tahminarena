// ===== Main Application =====

class App {
  constructor() {
    this.currentSection = 'live';
    this.analyses = [];
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

    // Load initial data
    await this.loadMatches();

    // Start live updates
    liveService.start();
    liveService.addListener(this.handleLiveUpdate.bind(this));

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
      window.location.href = './dashboard.html';
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
        window.location.href = './dashboard.html';
      }, 1500);
    } else {
      if (errorEl) errorEl.textContent = result.error;
    }
  }

  // Load matches and analyze
  async loadMatches() {
    try {
      // Show loading
      const container = document.getElementById('liveMatches');
      if (container) {
        container.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Maçlar yükleniyor...</div>';
      }

      // Get today's fixtures
      const data = await apiService.getTodayFixtures();
      const fixtures = data.response || [];

      // Update counts
      const liveCount = fixtures.filter(f => ['1H', '2H', 'HT', 'ET'].includes(f.fixture?.status?.short)).length;
      document.getElementById('liveCount').textContent = liveCount;
      document.getElementById('todayCount').textContent = fixtures.length;

      if (fixtures.length === 0) {
        if (container) {
          container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar"></i><p>Bugün maç yok.</p></div>';
        }
        return;
      }

      // Analyze fixtures
      this.analyses = await aiEngine.analyzeFixtures(fixtures);

      // Render matches
      this.renderMatches(fixtures);

      // Generate coupons
      this.generateCoupons();

    } catch (error) {
      console.error('Load matches error:', error);
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

  // Render matches list
  renderMatches(fixtures) {
    const container = document.getElementById('liveMatches');
    if (!container) return;

    container.innerHTML = fixtures.map(fixture => {
      const analysis = this.analyses.find(a => a.fixtureId === fixture.fixture.id);
      const isLive = ['1H', '2H', 'HT', 'ET'].includes(fixture.fixture?.status?.short);
      const status = fixture.fixture?.status;

      return `
        <div class="match-card ${isLive ? 'live' : ''}" data-fixture="${fixture.fixture.id}">
          <div class="match-header">
            <span class="league">${fixture.league?.name || 'Lig'}</span>
            <span class="time ${isLive ? 'live-indicator' : ''}">
              ${isLive ? `${status.elapsed}'` : new Date(fixture.fixture.date).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
          
          <div class="match-teams">
            <div class="team home">
              <img src="${fixture.teams.home.logo}" alt="" onerror="this.style.display='none'">
              <span>${fixture.teams.home.name}</span>
            </div>
            
            <div class="score">
              ${isLive || status.short === 'FT' ? 
                `<span class="home-goals">${fixture.goals.home}</span>
                 <span class="separator">-</span>
                 <span class="away-goals">${fixture.goals.away}</span>` : 
                'vs'
              }
            </div>
            
            <div class="team away">
              <span>${fixture.teams.away.name}</span>
              <img src="${fixture.teams.away.logo}" alt="" onerror="this.style.display='none'">
            </div>
          </div>
          
          ${analysis ? `
            <div class="match-prediction">
              <span class="prediction-label">YZ Tahmini:</span>
              <span class="prediction-value">${analysis.bestMarket.label}</span>
              <span class="prediction-odds">@${analysis.bestMarket.odds}</span>
              <div class="prediction-status" id="pred-${fixture.fixture.id}"></div>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  // Generate coupons
  generateCoupons() {
    if (this.analyses.length === 0) return;

    // Daily coupon
    const dailyCoupon = couponService.generateDailyCoupon(this.analyses);
    if (dailyCoupon) {
      // Set predictions for live tracking
      dailyCoupon.picks.forEach(pick => {
        liveService.setPrediction(pick.fixtureId, pick.prediction);
      });
    }

    // Premium coupons
    if (authService.isPremium()) {
      couponService.generatePremiumCoupons(this.analyses);
    }
  }

  // Handle live updates
  handleLiveUpdate(data) {
    if (data.type === 'prediction_status') {
      const { fixtureId, status } = data;
      couponService.updatePredictionStatus(fixtureId, status);
      
      // Also update in match list
      const predEl = document.getElementById(`pred-${fixtureId}`);
      if (predEl) {
        if (status === 'winning') {
          predEl.innerHTML = '<div class="status-light winning pulse">✓ Tutuyor</div>';
        } else if (status === 'losing') {
          predEl.innerHTML = '<div class="status-light losing pulse">✗ Tutmuyor</div>';
        }
      }
    }
  }

  // Setup navigation
  setupNavigation() {
    const sections = ['live', 'ai', 'coupon', 'successful', 'premium'];
    
    window.showSection = (section) => {
      // Hide all sections
      sections.forEach(s => {
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
        successful: 'Tutan Analizler',
        premium: 'Premium Kupon'
      };
      const titleEl = document.getElementById('sectionTitle');
      if (titleEl) titleEl.textContent = titles[section] || '';

      // Render section content
      this.renderSection(section);
    };
  }

  // Render section content
  renderSection(section) {
    switch (section) {
      case 'ai':
        this.renderAIPredictions();
        break;
      case 'coupon':
        this.renderCoupons();
        break;
      case 'successful':
        this.renderSuccessful();
        break;
      case 'premium':
        this.renderPremium();
        break;
    }
  }

  // Render AI predictions (with blur for non-premium)
  renderAIPredictions() {
    const container = document.getElementById('aiCards');
    if (!container) return;

    const isPremium = authService.isPremium();
    const visibleCount = isPremium ? this.analyses.length : 2;

    container.innerHTML = this.analyses.map((analysis, index) => {
      const isBlurred = index >= visibleCount;
      const confidenceClass = analysis.confidenceScore >= 75 ? 'high' : 
                             analysis.confidenceScore >= 60 ? 'medium' : 'low';

      if (isBlurred) {
        return `
          <div class="ai-card blurred">
            <div class="blur-overlay">
              <i class="fas fa-lock"></i>
              <p>Premium üyelere özel içerik</p>
              <button onclick="showSection('premium')">Premium Ol</button>
            </div>
            <div class="ai-card-content">
              <div class="match-teams">${analysis.homeTeam} vs ${analysis.awayTeam}</div>
            </div>
          </div>
        `;
      }

      return `
        <div class="ai-card ${confidenceClass}">
          <div class="ai-header">
            <span class="league">${analysis.league}</span>
            <span class="confidence-badge ${confidenceClass}">
              %${analysis.confidenceScore} Güven
            </span>
          </div>
          
          <div class="ai-teams">
            <div class="team">${analysis.homeTeam}</div>
            <div class="vs">vs</div>
            <div class="team">${analysis.awayTeam}</div>
          </div>
          
          <div class="ai-meta">
            <span><i class="fas fa-clock"></i> ${new Date(analysis.matchTime).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</span>
            <span class="odds">1: ${analysis.matchOdds?.h || '-'} | X: ${analysis.matchOdds?.d || '-'} | 2: ${analysis.matchOdds?.a || '-'}</span>
          </div>
          
          <div class="ai-prediction">
            <div class="prediction-header"><i class="fas fa-robot"></i> YZ En İyi Seçim</div>
            <div class="prediction-main">
              <span class="label">${analysis.bestMarket.label}</span>
              <span class="odds">@${analysis.bestMarket.odds}</span>
              <span class="probability">%${analysis.bestMarket.prob}</span>
            </div>
            <div class="prediction-bar">
              <div class="fill" style="width: ${analysis.bestMarket.prob}%"></div>
            </div>
          </div>
          
          <div class="ai-reason"><i class="fas fa-info-circle"></i> ${analysis.reason}</div>
          
          <div class="ai-all-markets">
            ${Object.entries(analysis.markets).map(([market, picks]) => `
              <div class="market-group">
                <div class="market-title">${this.getMarketTitle(market)}</div>
                ${Object.entries(picks).map(([pick, data]) => `
                  <div class="market-pick ${pick === analysis.bestMarket.pick && market === analysis.bestMarket.market ? 'best' : ''}">
                    <span>${data.label}</span>
                    <span>@${data.odds}</span>
                    <span>%${data.prob}</span>
                  </div>
                `).join('')}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  // Get market title
  getMarketTitle(market) {
    const titles = {
      result: 'Maç Sonucu',
      ou: 'Alt/Üst 2.5',
      btts: 'KG Var/Yok'
    };
    return titles[market] || market;
  }

  // Render coupons
  renderCoupons() {
    const container = document.getElementById('couponMatches');
    const heroEl = document.getElementById('couponHero');
    
    const coupon = couponService.getDailyCoupon();
    
    if (!coupon) {
      if (heroEl) heroEl.innerHTML = '<div class="empty-state"><p>Kupon oluşturuluyor...</p></div>';
      return;
    }

    if (heroEl) {
      heroEl.innerHTML = couponService.renderCouponCard(coupon, false);
    }
  }

  // Render successful predictions
  renderSuccessful() {
    const container = document.getElementById('successfulCards');
    if (!container) return;

    const finished = JSON.parse(localStorage.getItem(STORAGE_KEYS.FINISHED_MATCHES) || '[]');
    const successful = finished.filter(f => f.isSuccess);

    if (successful.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-check-circle"></i>
          <p>Henüz tutan analiz yok.</p>
          <small>Maçlar bittiğinde tutan analizler burada görünecek.</small>
        </div>
      `;
      return;
    }

    container.innerHTML = successful.map(s => `
      <div class="success-card">
        <div class="success-header">
          <span class="league">${s.league}</span>
          <span class="badge success">✓ Tuttu</span>
        </div>
        <div class="success-teams">${s.homeTeam} <span>vs</span> ${s.awayTeam}</div>
        <div class="success-prediction">
          <span>YZ Tahmini: ${s.prediction?.label || '-'}</span>
          <span>@${s.prediction?.odds || '-'}</span>
        </div>
        <div class="success-result">Sonuç: ${s.actualResult}</div>
      </div>
    `).join('');
  }

  // Render premium section
  renderPremium() {
    const lockedEl = document.getElementById('premiumLocked');
    const contentEl = document.getElementById('premiumContent');

    if (!authService.isPremium()) {
      if (lockedEl) lockedEl.classList.remove('hidden');
      if (contentEl) contentEl.classList.add('hidden');
      return;
    }

    if (lockedEl) lockedEl.classList.add('hidden');
    if (contentEl) {
      contentEl.classList.remove('hidden');
      
      const coupons = couponService.getPremiumCoupons();
      if (coupons) {
        contentEl.innerHTML = coupons.coupons.map(c => 
          couponService.renderCouponCard(c, true)
        ).join('');
      }
    }
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
