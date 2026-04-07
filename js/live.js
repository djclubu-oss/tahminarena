// ===== Live Match Updates =====
// Handles real-time match updates and notifications

class LiveUpdates {
  constructor() {
    this.updateInterval = null;
    this.matchCache = new Map();
  }

  start() {
    // Update every 60 seconds
    this.updateInterval = setInterval(() => {
      this.checkLiveMatches();
    }, 60000);
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  async checkLiveMatches() {
    try {
      const data = await apiService.getAllLiveMatches();
      
      if (data.response) {
        data.response.forEach(match => {
          const fixtureId = match.fixture.id;
          const cached = this.matchCache.get(fixtureId);
          
          if (cached) {
            // Check for goal
            if (cached.goals.home !== match.goals.home || 
                cached.goals.away !== match.goals.away) {
              this.onGoal(match);
            }
            
            // Check for status change
            if (cached.fixture.status.short !== match.fixture.status.short) {
              this.onStatusChange(match);
            }
          }
          
          this.matchCache.set(fixtureId, match);
        });
      }
    } catch (error) {
      console.error('Live update error:', error);
    }
  }

  onGoal(match) {
    // Visual feedback for goal
    const card = document.querySelector(`[data-fixture="${match.fixture.id}"]`);
    if (card) {
      card.classList.add('goal-scored');
      setTimeout(() => card.classList.remove('goal-scored'), 3000);
    }
  }

  onStatusChange(match) {
    const status = match.fixture.status.short;
    
    if (status === 'FT') {
      // Match finished - check predictions
      this.checkPredictionResult(match);
    }
  }

  async checkPredictionResult(match) {
    const analyses = couponService.getAnalyses();
    if (!analyses) return;

    const analysis = analyses.find(a => a.fixtureId === match.fixture.id);
    if (!analysis) return;

    const homeGoals = match.goals.home;
    const awayGoals = match.goals.away;
    let isWin = false;

    // Check result
    if (analysis.bestMarket.market === 'result') {
      if (analysis.bestMarket.pick === '1' && homeGoals > awayGoals) isWin = true;
      if (analysis.bestMarket.pick === 'X' && homeGoals === awayGoals) isWin = true;
      if (analysis.bestMarket.pick === '2' && homeGoals < awayGoals) isWin = true;
    }

    // Check O/U
    if (analysis.bestMarket.market === 'ou') {
      const total = homeGoals + awayGoals;
      if (analysis.bestMarket.pick === 'over25' && total > 2.5) isWin = true;
      if (analysis.bestMarket.pick === 'under25' && total < 2.5) isWin = true;
    }

    // Check BTTS
    if (analysis.bestMarket.market === 'btts') {
      if (analysis.bestMarket.pick === 'yes' && homeGoals > 0 && awayGoals > 0) isWin = true;
      if (analysis.bestMarket.pick === 'no' && (homeGoals === 0 || awayGoals === 0)) isWin = true;
    }

    if (isWin) {
      couponService.addSuccessfulPrediction(analysis, {
        homeGoals,
        awayGoals
      });
    }
  }
}

// Create global instance
const liveUpdates = new LiveUpdates();
