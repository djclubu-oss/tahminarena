// ===== Coupon Management =====

class CouponService {
  constructor() {
    this.dailyCouponKey = STORAGE_KEYS.DAILY_COUPON;
    this.premiumCouponKey = STORAGE_KEYS.PREMIUM_COUPON;
  }

  // Get today's date string
  getTodayString() {
    return new Date().toISOString().split('T')[0];
  }

  // ===== DAILY COUPON (Free Users) =====
  
  // Generate daily coupon (2-3 matches with highest probability)
  generateDailyCoupon(analyses) {
    if (!analyses || analyses.length === 0) return null;

    // Filter matches with high confidence (60+)
    const eligible = analyses.filter(a => a.confidenceScore >= 60);
    
    // Sort by confidence and pick top 2-3
    const sorted = eligible.sort((a, b) => b.bestMarket.prob - a.bestMarket.prob);
    const count = Math.min(3, Math.max(2, sorted.length));
    const picks = sorted.slice(0, count);

    if (picks.length === 0) return null;

    const coupon = {
      date: this.getTodayString(),
      type: 'daily',
      picks: picks.map(p => ({
        fixtureId: p.fixtureId,
        homeTeam: p.homeTeam,
        awayTeam: p.awayTeam,
        league: p.league,
        matchTime: p.matchTime,
        prediction: p.bestMarket,
        confidence: p.confidenceScore,
        reason: p.reason,
        odds: p.bestMarket.odds
      })),
      totalOdds: picks.reduce((acc, p) => acc * parseFloat(p.bestMarket.odds), 1).toFixed(2),
      avgConfidence: Math.round(picks.reduce((acc, p) => acc + p.confidenceScore, 0) / picks.length)
    };

    // Save to storage
    localStorage.setItem(this.dailyCouponKey, JSON.stringify(coupon));
    
    return coupon;
  }

  // Get daily coupon
  getDailyCoupon() {
    const saved = localStorage.getItem(this.dailyCouponKey);
    if (!saved) return null;

    const coupon = JSON.parse(saved);
    
    // Check if it's from today
    if (coupon.date !== this.getTodayString()) {
      localStorage.removeItem(this.dailyCouponKey);
      return null;
    }

    return coupon;
  }

  // ===== PREMIUM COUPON =====
  
  // Generate premium coupon (3 different coupons with different strategies)
  generatePremiumCoupons(analyses) {
    if (!analyses || analyses.length === 0) return null;

    const coupons = [];

    // Coupon 1: High Confidence (En yüksek güvenli)
    const highConf = analyses
      .filter(a => a.confidenceScore >= 75)
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, 3);

    if (highConf.length >= 2) {
      coupons.push({
        name: 'Yüksek Güvenli Kupon',
        strategy: 'high_confidence',
        picks: highConf.map(p => this.formatPick(p)),
        totalOdds: highConf.reduce((acc, p) => acc * parseFloat(p.bestMarket.odds), 1).toFixed(2),
        avgConfidence: Math.round(highConf.reduce((acc, p) => acc + p.confidenceScore, 0) / highConf.length),
        description: 'En yüksek güven skoruna sahip maçlar'
      });
    }

    // Coupon 2: Value Bets (Yüksek oranlı)
    const valueBets = analyses
      .filter(a => parseFloat(a.bestMarket.odds) >= 1.70 && a.confidenceScore >= 55)
      .sort((a, b) => parseFloat(b.bestMarket.odds) - parseFloat(a.bestMarket.odds))
      .slice(0, 3);

    if (valueBets.length >= 2) {
      coupons.push({
        name: 'Değerli Oranlar Kuponu',
        strategy: 'value',
        picks: valueBets.map(p => this.formatPick(p)),
        totalOdds: valueBets.reduce((acc, p) => acc * parseFloat(p.bestMarket.odds), 1).toFixed(2),
        avgConfidence: Math.round(valueBets.reduce((acc, p) => acc + p.confidenceScore, 0) / valueBets.length),
        description: 'Yüksek oranlı ve kazanç potansiyeli yüksek maçlar'
      });
    }

    // Coupon 3: Mixed Strategy (Karışık)
    const mixed = this.selectMixedPicks(analyses);
    if (mixed.length >= 2) {
      coupons.push({
        name: 'Kombine Strateji Kuponu',
        strategy: 'mixed',
        picks: mixed.map(p => this.formatPick(p)),
        totalOdds: mixed.reduce((acc, p) => acc * parseFloat(p.bestMarket.odds), 1).toFixed(2),
        avgConfidence: Math.round(mixed.reduce((acc, p) => acc + p.confidenceScore, 0) / mixed.length),
        description: 'Farklı stratejilerin birleşimi'
      });
    }

    const result = {
      date: this.getTodayString(),
      type: 'premium',
      coupons: coupons
    };

    localStorage.setItem(this.premiumCouponKey, JSON.stringify(result));
    return result;
  }

  // Select mixed picks from different markets
  selectMixedPicks(analyses) {
    const picks = [];
    
    // Get best from each market type
    const resultPicks = analyses.filter(a => a.bestMarket.market === 'result').slice(0, 1);
    const ouPicks = analyses.filter(a => a.bestMarket.market === 'ou').slice(0, 1);
    const bttsPicks = analyses.filter(a => a.bestMarket.market === 'btts').slice(0, 1);

    picks.push(...resultPicks, ...ouPicks, ...bttsPicks);
    
    // Sort by confidence and take top 3
    return picks
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, 3);
  }

  // Format pick for coupon
  formatPick(analysis) {
    return {
      fixtureId: analysis.fixtureId,
      homeTeam: analysis.homeTeam,
      awayTeam: analysis.awayTeam,
      league: analysis.league,
      matchTime: analysis.matchTime,
      prediction: analysis.bestMarket,
      confidence: analysis.confidenceScore,
      reason: analysis.reason,
      odds: analysis.bestMarket.odds,
      allMarkets: analysis.markets
    };
  }

  // Get premium coupons
  getPremiumCoupons() {
    const saved = localStorage.getItem(this.premiumCouponKey);
    if (!saved) return null;

    const coupons = JSON.parse(saved);
    
    if (coupons.date !== this.getTodayString()) {
      localStorage.removeItem(this.premiumCouponKey);
      return null;
    }

    return coupons;
  }

  // ===== COUPON DISPLAY =====

  // Render coupon card
  renderCouponCard(coupon, isPremium = false) {
    const confidenceClass = coupon.avgConfidence >= 75 ? 'high' : 
                           coupon.avgConfidence >= 60 ? 'medium' : 'low';

    return `
      <div class="coupon-card ${isPremium ? 'premium' : 'daily'}">
        <div class="coupon-header">
          <div class="coupon-title">
            ${isPremium ? '<i class="fas fa-crown"></i>' : '<i class="fas fa-ticket-alt"></i>'}
            ${coupon.name || 'Günlük Kupon'}
          </div>
          <div class="coupon-stats">
            <span class="odds">Oran: ${coupon.totalOdds}</span>
            <span class="confidence ${confidenceClass}">Güven: %${coupon.avgConfidence}</span>
          </div>
        </div>
        
        ${coupon.description ? `<div class="coupon-description">${coupon.description}</div>` : ''}
        
        <div class="coupon-matches">
          ${coupon.picks.map((pick, idx) => this.renderPickRow(pick, idx + 1)).join('')}
        </div>
      </div>
    `;
  }

  // Render individual pick row
  renderPickRow(pick, number) {
    return `
      <div class="pick-row" data-fixture="${pick.fixtureId}">
        <div class="pick-number">${number}</div>
        <div class="pick-info">
          <div class="pick-teams">${pick.homeTeam} vs ${pick.awayTeam}</div>
          <div class="pick-league">${pick.league} | ${new Date(pick.matchTime).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
        <div class="pick-prediction">
          <div class="pick-label">${pick.prediction.label}</div>
          <div class="pick-odds">@${pick.odds}</div>
        </div>
        
        <div class="pick-confidence">
          <div class="confidence-bar">
            <div class="confidence-fill" style="width: ${pick.confidence}%"></div>
          </div>
          <span>%${pick.confidence}</span>
        </div>
        
        <div class="prediction-status" id="status-${pick.fixtureId}"></div>
      </div>
    `;
  }

  // Update prediction status in UI
  updatePredictionStatus(fixtureId, status) {
    const statusEl = document.getElementById(`status-${fixtureId}`);
    if (!statusEl) return;

    if (status === 'winning') {
      statusEl.innerHTML = '<div class="status-light winning">✓</div>';
      statusEl.classList.add('active');
    } else if (status === 'losing') {
      statusEl.innerHTML = '<div class="status-light losing">✗</div>';
      statusEl.classList.add('active');
    } else {
      statusEl.innerHTML = '<div class="status-light pending">○</div>';
    }
  }
}

// Create global instance
const couponService = new CouponService();
