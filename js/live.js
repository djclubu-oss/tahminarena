// ===== Live Score Service =====

class LiveScoreService {
  constructor() {
    this.fixtures = new Map();
    this.predictions = new Map();
    this.updateInterval = null;
    this.listeners = [];
  }

  // Start live updates
  start() {
    this.updateLiveMatches();
    this.updateInterval = setInterval(() => {
      this.updateLiveMatches();
    }, 30000); // 30 saniyede bir güncelle
  }

  // Stop live updates
  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Add listener for updates
  addListener(callback) {
    this.listeners.push(callback);
  }

  // Remove listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  // Notify all listeners
  notifyListeners(data) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }

  // Fetch and update live matches
  async updateLiveMatches() {
    try {
      const data = await apiService.getLiveMatches();
      const liveFixtures = data.response || [];

      const updates = [];

      liveFixtures.forEach(fixture => {
        const fixtureId = fixture.fixture.id;
        const existing = this.fixtures.get(fixtureId);
        
        // Check if score changed
        if (existing) {
          const oldHome = existing.goals?.home;
          const oldAway = existing.goals?.away;
          const newHome = fixture.goals?.home;
          const newAway = fixture.goals?.away;

          if (oldHome !== newHome || oldAway !== newAway) {
            updates.push({
              type: 'score_change',
              fixtureId,
              oldScore: { home: oldHome, away: oldAway },
              newScore: { home: newHome, away: newAway },
              fixture
            });

            // Check prediction status
            this.checkPredictionStatus(fixtureId, newHome, newAway);
          }
        }

        this.fixtures.set(fixtureId, fixture);
      });

      if (updates.length > 0) {
        this.notifyListeners({ type: 'updates', updates });
      }

      this.notifyListeners({ 
        type: 'live_matches', 
        fixtures: Array.from(this.fixtures.values()) 
      });

    } catch (error) {
      console.error('Live update error:', error);
    }
  }

  // Check if prediction is winning/losing
  checkPredictionStatus(fixtureId, homeGoals, awayGoals) {
    const prediction = this.predictions.get(fixtureId);
    if (!prediction) return;

    const { market, pick } = prediction;
    let isWinning = false;

    switch (market) {
      case 'result':
        if (pick === '1' && homeGoals > awayGoals) isWinning = true;
        if (pick === 'X' && homeGoals === awayGoals) isWinning = true;
        if (pick === '2' && homeGoals < awayGoals) isWinning = true;
        break;
      case 'ou':
        const totalGoals = homeGoals + awayGoals;
        if (pick === 'over' && totalGoals > 2.5) isWinning = true;
        if (pick === 'under' && totalGoals <= 2.5) isWinning = true;
        break;
      case 'btts':
        if (pick === 'yes' && homeGoals > 0 && awayGoals > 0) isWinning = true;
        if (pick === 'no' && (homeGoals === 0 || awayGoals === 0)) isWinning = true;
        break;
    }

    prediction.isWinning = isWinning;
    prediction.status = isWinning ? 'winning' : 'losing';

    this.notifyListeners({
      type: 'prediction_status',
      fixtureId,
      status: isWinning ? 'winning' : 'losing',
      prediction
    });
  }

  // Set prediction for a fixture
  setPrediction(fixtureId, prediction) {
    this.predictions.set(fixtureId, {
      ...prediction,
      status: 'pending',
      isWinning: null
    });

    // Check immediately if match is live
    const fixture = this.fixtures.get(fixtureId);
    if (fixture && fixture.goals) {
      this.checkPredictionStatus(fixtureId, fixture.goals.home, fixture.goals.away);
    }
  }

  // Get fixture status
  getFixtureStatus(fixtureId) {
    const fixture = this.fixtures.get(fixtureId);
    if (!fixture) return null;

    const status = fixture.fixture?.status?.short;
    const elapsed = fixture.fixture?.status?.elapsed;
    const goals = fixture.goals;

    return {
      status,
      elapsed,
      goals,
      isLive: ['1H', '2H', 'HT', 'ET', 'P'].includes(status),
      isFinished: ['FT', 'AET', 'PEN'].includes(status)
    };
  }

  // Render live indicator
  renderLiveIndicator(fixtureId) {
    const prediction = this.predictions.get(fixtureId);
    if (!prediction) return '';

    const status = prediction.status;
    if (status === 'winning') {
      return '<div class="prediction-indicator winning">✓</div>';
    } else if (status === 'losing') {
      return '<div class="prediction-indicator losing">✗</div>';
    }
    return '<div class="prediction-indicator pending">○</div>';
  }

  // Format match time
  formatMatchTime(fixture) {
    const status = fixture.fixture?.status?.short;
    const elapsed = fixture.fixture?.status?.elapsed;

    if (['1H', '2H'].includes(status) && elapsed) {
      return `${elapsed}'`;
    }
    if (status === 'HT') return 'HT';
    if (status === 'FT') return 'Bitti';
    
    // Not started - show scheduled time
    const date = new Date(fixture.fixture?.date);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  }

  // Get score display
  getScoreDisplay(fixture) {
    const status = this.getFixtureStatus(fixture.fixture?.id);
    if (!status || !status.goals) return '- : -';
    
    return `${status.goals.home} - ${status.goals.away}`;
  }
}

// Create global instance
const liveService = new LiveScoreService();
