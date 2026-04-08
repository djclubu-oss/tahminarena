// ===== Enhanced Coupon Service =====

if (typeof STORAGE_KEYS === 'undefined') {
  var STORAGE_KEYS = {
    SESSION: 'ta_session',
    USERS: 'ta_users',
    USER_COUPON: 'ta_user_coupon',
    AI_ANALYSES: 'ta_ai_analyses',
    PREMIUM_COUPONS: 'ta_premium_coupons',
    DAILY_COUPON: 'ta_daily_coupon',
    SUCCESSFUL_PREDICTIONS: 'ta_successful',
    API_REQUESTS: 'ta_api_requests'
  };
}

class CouponService {
  constructor() {
    this.couponKey = STORAGE_KEYS.USER_COUPON;
    this.analysesKey = STORAGE_KEYS.AI_ANALYSES;
    this.successfulKey = STORAGE_KEYS.SUCCESSFUL_PREDICTIONS;
  }

  getUserCoupon() {
    const saved = localStorage.getItem(this.couponKey);
    return saved ? JSON.parse(saved) : [];
  }

  saveUserCoupon(coupon) {
    localStorage.setItem(this.couponKey, JSON.stringify(coupon));
  }

  addToCoupon(matchData) {
    const coupon = this.getUserCoupon();
    if (coupon.some(c => c.fixtureId === matchData.fixtureId)) {
      return { success: false, error: 'Bu maç zaten kuponunuzda!' };
    }
    coupon.push({ ...matchData, addedAt: new Date().toISOString() });
    this.saveUserCoupon(coupon);
    return { success: true, message: 'Maç kuponunuza eklendi.' };
  }

  removeFromCoupon(fixtureId) {
    let coupon = this.getUserCoupon();
    coupon = coupon.filter(c => c.fixtureId !== fixtureId);
    this.saveUserCoupon(coupon);
    return { success: true };
  }

  clearCoupon() {
    localStorage.removeItem(this.couponKey);
  }

  isInCoupon(fixtureId) {
    const coupon = this.getUserCoupon();
    return coupon.some(c => c.fixtureId === fixtureId);
  }

  getCouponStats() {
    const coupon = this.getUserCoupon();
    const totalOdds = coupon.reduce((acc, c) => acc * (c.odds || 1.5), 1);
    return {
      count: coupon.length,
      totalOdds: totalOdds.toFixed(2),
      potentialWin: (totalOdds * 100).toFixed(2)
    };
  }

  saveAnalyses(analyses) {
    const data = {
      date: new Date().toISOString().split('T')[0],
      analyses: analyses
    };
    localStorage.setItem(this.analysesKey, JSON.stringify(data));
  }

  getAnalyses() {
    const saved = localStorage.getItem(this.analysesKey);
    if (!saved) return null;
    const data = JSON.parse(saved);
    const today = new Date().toISOString().split('T')[0];
    if (data.date !== today) {
      localStorage.removeItem(this.analysesKey);
      return null;
    }
    return data.analyses;
  }

  addSuccessfulPrediction(analysis, result) {
    const saved = localStorage.getItem(this.successfulKey);
    const successful = saved ? JSON.parse(saved) : [];
    successful.push({ ...analysis, actualResult: result, verifiedAt: new Date().toISOString() });
    if (successful.length > 50) successful.shift();
    localStorage.setItem(this.successfulKey, JSON.stringify(successful));
  }

  getSuccessfulPredictions() {
    const saved = localStorage.getItem(this.successfulKey);
    return saved ? JSON.parse(saved) : [];
  }

  savePremiumCoupons(coupons) {
    localStorage.setItem(STORAGE_KEYS.PREMIUM_COUPONS, JSON.stringify(coupons));
  }

  getPremiumCoupons() {
    const saved = localStorage.getItem(STORAGE_KEYS.PREMIUM_COUPONS);
    if (!saved) return null;
    const data = JSON.parse(saved);
    const today = new Date().toISOString().split('T')[0];
    if (data.date !== today) {
      localStorage.removeItem(STORAGE_KEYS.PREMIUM_COUPONS);
      return null;
    }
    return data;
  }

  renderUserCoupon() {
    const coupon = this.getUserCoupon();
    const container = document.getElementById('myCouponMatches');
    const stats = this.getCouponStats();
    document.getElementById('myCouponCount').textContent = stats.count;
    document.getElementById('myCouponOdds').textContent = stats.totalOdds;
    document.getElementById('my-coupon-count').textContent = stats.count;
    if (coupon.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-ticket-alt"></i>
          <p>Henüz maç eklemediniz.</p>
          <small>Canlı maçlardan seçim yaparak kupon oluşturun.</small>
        </div>
      `;
      return;
    }
    container.innerHTML = coupon.map((match) => `
      <div class="match-card coupon-item" style="position: relative;">
        <button class="remove-from-coupon" onclick="couponService.removeFromCoupon(${match.fixtureId}); app.renderUserCoupon();">
          <i class="fas fa-times"></i>
        </button>
        <div class="match-header">
          <span class="league">${match.league}</span>
          <span class="match-status">${new Date(match.matchTime).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
        <div class="match-teams">
          <div class="team home"><span>${match.homeTeam}</span></div>
          <div class="vs">vs</div>
          <div class="team away"><span>${match.awayTeam}</span></div>
        </div>
        <div class="coupon-selection">
          <div class="selected-prediction">
            <span class="prediction-label">${match.selectedPrediction?.label || 'Seçim yapılmadı'}</span>
            <span class="prediction-odds">@${match.selectedPrediction?.odds || '-'}</span>
          </div>
        </div>
      </div>
    `).join('');
    updateCouponWin();
  }

  renderAICards(analyses, isPremium = false) {
    const container = document.getElementById('aiCards');
    if (!container) return;
    if (!analyses || analyses.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-robot"></i>
          <p>Henüz analiz yapılmamış.</p>
        </div>
      `;
      return;
    }
    container.innerHTML = analyses.map((analysis, index) => {
      const isBlurred = !isPremium && index >= 2;
      const confidenceClass = analysis.confidenceScore >= 80 ? 'high' : analysis.confidenceScore >= 60 ? 'medium' : 'low';
      const matchTime = new Date(analysis.matchTime).toLocaleTimeString('tr-TR', {
        hour: '2-digit', 
        minute: '2-digit',
        day: 'numeric',
        month: 'short'
      });
      return `
        <div class="ai-card ${isBlurred ? 'blurred' : ''}" data-fixture="${analysis.fixtureId}">
          ${isBlurred ? `
            <div class="blur-overlay">
              <i class="fas fa-crown"></i>
              <p>Premium üyelik gereklidir</p>
              <button onclick="showPremiumModal()">Premium Ol</button>
            </div>
          ` : ''}
          <div class="ai-header">
            <span class="league">${analysis.league}</span>
            <span class="confidence-badge ${confidenceClass}">%${analysis.confidenceScore} Güven</span>
          </div>
          <div class="ai-teams">
            <span>${analysis.homeTeam}</span>
            <span style="color: var(--text-muted);">vs</span>
            <span>${analysis.awayTeam}</span>
          </div>
          <div class="ai-meta">
            <span>⏰ ${matchTime}</span>
            <span>📊 ${analysis.analysis?.xG?.total || '-'} xG</span>
          </div>
          <div class="ai-prediction">
            <div class="prediction-header">Yapay Zeka Tahmini</div>
            <div class="prediction-main">
              <span class="label">${analysis.bestMarket.label}</span>
              <span class="odds">@${analysis.bestMarket.odds}</span>
              <span class="probability">%${analysis.bestMarket.prob}</span>
            </div>
            <div class="prediction-bar">
              <div class="fill" style="width: ${analysis.bestMarket.prob}%"></div>
            </div>
          </div>
          <div class="ai-reason">
            <i class="fas fa-info-circle"></i>
            ${analysis.reason}
          </div>
          <div class="ai-markets">
            ${this.renderMiniMarkets(analysis.markets)}
          </div>
          <button class="add-to-coupon ${this.isInCoupon(analysis.fixtureId) ? 'added' : ''}" 
                  onclick="app.addToCouponWithPrediction(${analysis.fixtureId})"
                  id="ai-btn-${analysis.fixtureId}"
                  ${isBlurred ? 'disabled' : ''}>
            <i class="fas ${this.isInCoupon(analysis.fixtureId) ? 'fa-check' : 'fa-plus'}"></i>
            ${this.isInCoupon(analysis.fixtureId) ? 'Kuponda' : 'Kupona Ekle'}
          </button>
        </div>
      `;
    }).join('');
    this.checkSuccessfulPredictions(analyses);
  }

  renderMiniMarkets(markets) {
    if (!markets) return '';
    let html = '<div class="mini-markets">';
    if (markets.result) {
      Object.entries(markets.result).forEach(([key, val]) => {
        const prob = isNaN(val.prob) ? 0 : (val.prob || 0);
        html += `
          <div class="mini-market" title="${val.description || ''}">
            <span class="mini-label">${val.label || key}</span>
            <span class="mini-prob ${prob >= 60 ? 'high' : prob >= 45 ? 'medium' : 'low'}">%${prob}</span>
          </div>
        `;
      });
    }
    if (markets.ou) {
      Object.entries(markets.ou).slice(0, 2).forEach(([key, val]) => {
        const prob = isNaN(val.prob) ? 0 : (val.prob || 0);
        html += `
          <div class="mini-market" title="${val.description || ''}">
            <span class="mini-label">${val.label || key}</span>
            <span class="mini-prob ${prob >= 60 ? 'high' : prob >= 45 ? 'medium' : 'low'}">%${prob}</span>
          </div>
        `;
      });
    }
    if (markets.btts) {
      Object.entries(markets.btts).forEach(([key, val]) => {
        const prob = isNaN(val.prob) ? 0 : (val.prob || 0);
        html += `
          <div class="mini-market" title="${val.description || ''}">
            <span class="mini-label">${val.label || key}</span>
            <span class="mini-prob ${prob >= 60 ? 'high' : prob >= 45 ? 'medium' : 'low'}">%${prob}</span>
          </div>
        `;
      });
    }
    html += '</div>';
    return html;
  }

  renderPremiumCoupons(coupons) {
    const container = document.getElementById('premiumContent');
    if (!container) return;
    if (!coupons || !coupons.coupons || coupons.coupons.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-crown"></i>
          <p>Bugün için premium kupon bulunamadı.</p>
          <small>Yeterli sayıda yüksek güvenilirlikli maç yok.</small>
        </div>
      `;
      return;
    }
    container.innerHTML = `
      <div class="premium-header">
        <i class="fas fa-crown"></i>
        <h3>Günlük Premium Kuponlar</h3>
        <p>Yapay zeka tarafından seçilen en güvenilir maçlar</p>
      </div>
      <div class="premium-coupons-grid">
        ${coupons.coupons.map((coupon, idx) => this.renderPremiumCouponCard(coupon, idx)).join('')}
      </div>
    `;
  }

  renderPremiumCouponCard(coupon, index) {
    const confidenceClass = coupon.avgConfidence >= 85 ? 'ultra' : coupon.avgConfidence >= 75 ? 'high' : 'medium';
    return `
      <div class="premium-coupon-card ${confidenceClass}">
        <div class="premium-coupon-header">
          <div class="coupon-number">#${index + 1}</div>
          <div class="coupon-info">
            <h4>${coupon.name}</h4>
            <p>${coupon.description}</p>
          </div>
          <div class="coupon-stats">
            <span class="premium-odds">${coupon.totalOdds}x</span>
            <span class="premium-confidence">%${coupon.avgConfidence}</span>
          </div>
        </div>
        <div class="premium-picks">
          ${coupon.picks.map((pick, idx) => `
            <div class="premium-pick">
              <div class="pick-num">${idx + 1}</div>
              <div class="pick-teams">
                <span>${pick.homeTeam} vs ${pick.awayTeam}</span>
                <small>${pick.league}</small>
              </div>
              <div class="pick-prediction">
                <span class="pred-label">${pick.prediction.label}</span>
                <span class="pred-odds">@${pick.odds}</span>
              </div>
              <div class="pick-prob">
                <div class="prob-bar">
                  <div class="prob-fill" style="width: ${pick.prob}%"></div>
                </div>
                <span>%${pick.prob}</span>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="premium-coupon-footer">
          <div class="strategy-badge">
            <i class="fas fa-robot"></i>
            ${coupon.strategy === 'ultra_safe' ? 'Ultra Güvenli' : coupon.strategy === 'mixed' ? 'Strateji' : 'Değer'}
          </div>
          <button class="btn-add-all" onclick="app.addPremiumToCoupon(${index})">
            <i class="fas fa-plus"></i> Tümünü Ekle
          </button>
        </div>
      </div>
    `;
  }

  async checkSuccessfulPredictions(analyses) {
    for (const analysis of analyses) {
      if (analysis.status === 'FT') {
        const fixture = await apiService.getFixtureById(analysis.fixtureId);
        if (fixture.response?.[0]) {
          const match = fixture.response[0];
          const homeGoals = match.goals.home;
          const awayGoals = match.goals.away;
          let isWin = false;
          if (analysis.bestMarket.market === 'result') {
            if (analysis.bestMarket.pick === '1' && homeGoals > awayGoals) isWin = true;
            if (analysis.bestMarket.pick === 'X' && homeGoals === awayGoals) isWin = true;
            if (analysis.bestMarket.pick === '2' && homeGoals < awayGoals) isWin = true;
          }
          if (analysis.bestMarket.market === 'ou') {
            const total = homeGoals + awayGoals;
            if (analysis.bestMarket.pick === 'over25' && total > 2.5) isWin = true;
            if (analysis.bestMarket.pick === 'under25' && total < 2.5) isWin = true;
          }
          if (analysis.bestMarket.market === 'btts') {
            if (analysis.bestMarket.pick === 'yes' && homeGoals > 0 && awayGoals > 0) isWin = true;
            if (analysis.bestMarket.pick === 'no' && (homeGoals === 0 || awayGoals === 0)) isWin = true;
          }
          if (isWin) {
            const card = document.querySelector(`.ai-card[data-fixture="${analysis.fixtureId}"]`);
            if (card) {
              card.classList.add('winning-prediction');
            }
          }
        }
      }
    }
  }

  renderSuccessfulPredictions() {
    const container = document.getElementById('successfulCards');
    if (!container) return;
    const successful = this.getSuccessfulPredictions();
    if (successful.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-check-circle"></i>
          <p>Henüz tutan tahmin bulunmuyor.</p>
        </div>
      `;
      return;
    }
    container.innerHTML = successful.slice(-10).reverse().map(pred => `
      <div class="ai-card success-card">
        <div class="success-badge">
          <i class="fas fa-check-circle"></i> Tutan Tahmin
        </div>
        <div class="ai-teams">
          <span>${pred.homeTeam}</span>
          <span style="color: var(--green);">${pred.actualResult?.homeGoals || '-'} - ${pred.actualResult?.awayGoals || '-'}</span>
          <span>${pred.awayTeam}</span>
        </div>
        <div class="ai-prediction">
          <div class="prediction-main">
            <span class="label">${pred.bestMarket.label}</span>
            <span class="probability" style="background: var(--green);">TUTTU</span>
          </div>
        </div>
      </div>
    `).join('');
  }
}

const couponService = new CouponService();
