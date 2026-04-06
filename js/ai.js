// ===== AI Analysis Engine =====

class AIAnalysisEngine {
  constructor() {
    this.weights = {
      xG: 0.25,
      form: 0.20,
      homeAdvantage: 0.15,
      injuries: 0.10,
      h2h: 0.10,
      standings: 0.10,
      motivation: 0.10
    };
  }

  // Main analysis function
  async analyzeMatch(fixture) {
    const {
      teams,
      league,
      fixture: fixtureData
    } = fixture;

    const homeTeam = teams.home;
    const awayTeam = teams.away;

    // Fetch all necessary data
    const [
      homeStats,
      awayStats,
      predictions,
      h2h,
      injuries
    ] = await Promise.all([
      this.fetchTeamStats(homeTeam.id, league.id),
      this.fetchTeamStats(awayTeam.id, league.id),
      this.fetchPredictions(fixtureData.id),
      this.fetchH2H(homeTeam.id, awayTeam.id),
      this.fetchInjuries(fixtureData.id)
    ]);

    // Calculate various metrics
    const xGAnalysis = this.calculateXG(homeStats, awayStats);
    const formAnalysis = this.calculateForm(homeStats, awayStats);
    const homeAdvantage = this.calculateHomeAdvantage(homeStats, awayStats);
    const injuryImpact = this.calculateInjuryImpact(injuries, homeTeam.id, awayTeam.id);
    const h2hAnalysis = this.calculateH2H(h2h, homeTeam.id, awayTeam.id);
    const standingsImpact = this.calculateStandingsImpact(homeStats, awayStats);

    // Calculate market probabilities
    const markets = this.calculateMarkets({
      xG: xGAnalysis,
      form: formAnalysis,
      homeAdvantage,
      injuries: injuryImpact,
      h2h: h2hAnalysis,
      standings: standingsImpact
    });

    // Find best prediction
    const bestMarket = this.findBestMarket(markets);

    // Calculate confidence score
    const confidenceScore = this.calculateConfidenceScore({
      xG: xGAnalysis,
      form: formAnalysis,
      homeAdvantage,
      injuries: injuryImpact,
      h2h: h2hAnalysis
    });

    return {
      fixtureId: fixtureData.id,
      homeTeam: homeTeam.name,
      awayTeam: awayTeam.name,
      league: league.name,
      matchTime: fixtureData.date,
      markets,
      bestMarket,
      confidenceScore,
      analysis: {
        xG: xGAnalysis,
        form: formAnalysis,
        homeAdvantage,
        injuries: injuryImpact,
        h2h: h2hAnalysis
      },
      reason: this.generateReason(bestMarket, homeTeam.name, awayTeam.name)
    };
  }

  // Fetch team statistics
  async fetchTeamStats(teamId, leagueId) {
    try {
      const data = await apiService.getTeamStatistics(teamId, leagueId);
      return data.response || null;
    } catch (error) {
      console.error('Team stats error:', error);
      return null;
    }
  }

  // Fetch predictions
  async fetchPredictions(fixtureId) {
    try {
      const data = await apiService.getPredictions(fixtureId);
      return data.response?.[0] || null;
    } catch (error) {
      console.error('Predictions error:', error);
      return null;
    }
  }

  // Fetch head to head
  async fetchH2H(team1Id, team2Id) {
    try {
      const data = await apiService.getHeadToHead(team1Id, team2Id);
      return data.response || [];
    } catch (error) {
      console.error('H2H error:', error);
      return [];
    }
  }

  // Fetch injuries
  async fetchInjuries(fixtureId) {
    try {
      const data = await apiService.getInjuries(fixtureId);
      return data.response || [];
    } catch (error) {
      console.error('Injuries error:', error);
      return [];
    }
  }

  // Calculate xG (Expected Goals)
  calculateXG(homeStats, awayStats) {
    if (!homeStats || !awayStats) return { home: 1.2, away: 1.0, total: 2.2 };

    const homeXG = homeStats.goals?.for?.average?.home || 1.5;
    const awayXG = awayStats.goals?.for?.average?.away || 1.0;
    const homeXGA = homeStats.goals?.against?.average?.home || 1.0;
    const awayXGA = awayStats.goals?.against?.average?.away || 1.5;

    // Calculate expected goals for this match
    const homeExpected = (parseFloat(homeXG) + parseFloat(awayXGA)) / 2;
    const awayExpected = (parseFloat(awayXG) + parseFloat(homeXGA)) / 2;
    const totalExpected = homeExpected + awayExpected;

    return {
      home: homeExpected.toFixed(2),
      away: awayExpected.toFixed(2),
      total: totalExpected.toFixed(2),
      over25: totalExpected > 2.5 ? 65 : 45,
      under25: totalExpected <= 2.5 ? 65 : 45,
      btts: (homeExpected > 0.8 && awayExpected > 0.8) ? 60 : 40
    };
  }

  // Calculate form (last 5 matches)
  calculateForm(homeStats, awayStats) {
    const homeForm = this.parseForm(homeStats?.form);
    const awayForm = this.parseForm(awayStats?.form);

    const homePoints = this.formToPoints(homeForm);
    const awayPoints = this.formToPoints(awayForm);

    return {
      homeForm,
      awayForm,
      homePoints,
      awayPoints,
      advantage: homePoints - awayPoints
    };
  }

  // Parse form string (e.g., "WWDLW")
  parseForm(formString) {
    if (!formString) return ['D', 'D', 'D', 'D', 'D'];
    return formString.slice(-5).split('');
  }

  // Convert form to points
  formToPoints(form) {
    return form.reduce((acc, result) => {
      if (result === 'W') return acc + 3;
      if (result === 'D') return acc + 1;
      return acc;
    }, 0);
  }

  // Calculate home advantage
  calculateHomeAdvantage(homeStats, awayStats) {
    const homeWinRate = homeStats?.fixtures?.wins?.home || 0.5;
    const awayWinRate = awayStats?.fixtures?.wins?.away || 0.3;
    
    return {
      homeAdvantage: (homeWinRate - awayWinRate) * 100,
      homeWinRate: (homeWinRate * 100).toFixed(1),
      awayWinRate: (awayWinRate * 100).toFixed(1)
    };
  }

  // Calculate injury impact
  calculateInjuryImpact(injuries, homeTeamId, awayTeamId) {
    const homeInjuries = injuries.filter(i => i.team?.id === homeTeamId).length;
    const awayInjuries = injuries.filter(i => i.team?.id === awayTeamId).length;

    return {
      homeInjuries,
      awayInjuries,
      impact: (awayInjuries - homeInjuries) * 5 // Each injury = 5% impact
    };
  }

  // Calculate H2H record
  calculateH2H(h2hMatches, homeTeamId, awayTeamId) {
    const recentH2H = h2hMatches.slice(0, 5);
    
    let homeWins = 0;
    let draws = 0;
    let awayWins = 0;

    recentH2H.forEach(match => {
      const homeWinner = match.teams?.home?.winner;
      const awayWinner = match.teams?.away?.winner;
      
      if (homeWinner) homeWins++;
      else if (awayWinner) awayWins++;
      else draws++;
    });

    const total = recentH2H.length || 1;
    
    return {
      homeWins,
      draws,
      awayWins,
      homeWinRate: ((homeWins / total) * 100).toFixed(1),
      drawRate: ((draws / total) * 100).toFixed(1),
      awayWinRate: ((awayWins / total) * 100).toFixed(1)
    };
  }

  // Calculate standings impact
  calculateStandingsImpact(homeStats, awayStats) {
    const homeRank = homeStats?.league?.standings?.[0]?.[0]?.rank || 10;
    const awayRank = awayStats?.league?.standings?.[0]?.[0]?.rank || 10;

    return {
      homeRank,
      awayRank,
      rankDifference: awayRank - homeRank
    };
  }

  // Calculate all market probabilities
  calculateMarkets(analysis) {
    const { xG, form, homeAdvantage, injuries, h2h, standings } = analysis;

    // 1X2 Market
    const homeWinProb = Math.min(85, Math.max(25, 
      40 + 
      (form.advantage * 3) +
      (homeAdvantage.homeAdvantage * 0.3) +
      (injuries.impact * 0.5) +
      (h2h.homeWinRate * 0.2) +
      (standings.rankDifference * 2)
    ));

    const drawProb = Math.max(15, 30 - Math.abs(form.advantage * 2));
    const awayWinProb = 100 - homeWinProb - drawProb;

    // Over/Under 2.5
    const over25Prob = xG.over25;
    const under25Prob = xG.under25;

    // BTTS
    const bttsYesProb = xG.btts;
    const bttsNoProb = 100 - bttsYesProb;

    return {
      result: {
        '1': { label: 'MS Ev Kazanır', prob: Math.round(homeWinProb), odds: this.probToOdds(homeWinProb) },
        'X': { label: 'MS Beraberlik', prob: Math.round(drawProb), odds: this.probToOdds(drawProb) },
        '2': { label: 'MS Deplasman', prob: Math.round(awayWinProb), odds: this.probToOdds(awayWinProb) }
      },
      ou: {
        'over': { label: 'Üst 2.5 Gol', prob: over25Prob, odds: this.probToOdds(over25Prob) },
        'under': { label: 'Alt 2.5 Gol', prob: under25Prob, odds: this.probToOdds(under25Prob) }
      },
      btts: {
        'yes': { label: 'KG Var', prob: bttsYesProb, odds: this.probToOdds(bttsYesProb) },
        'no': { label: 'KG Yok', prob: bttsNoProb, odds: this.probToOdds(bttsNoProb) }
      }
    };
  }

  // Convert probability to odds
  probToOdds(prob) {
    if (prob <= 0) return 10.0;
    return (100 / prob).toFixed(2);
  }

  // Find best market prediction
  findBestMarket(markets) {
    let bestProb = 0;
    let bestPick = null;
    let bestMarket = '';

    // Check result market
    Object.entries(markets.result).forEach(([key, value]) => {
      if (value.prob > bestProb) {
        bestProb = value.prob;
        bestPick = { ...value, pick: key };
        bestMarket = 'result';
      }
    });

    // Check O/U market
    Object.entries(markets.ou).forEach(([key, value]) => {
      if (value.prob > bestProb) {
        bestProb = value.prob;
        bestPick = { ...value, pick: key };
        bestMarket = 'ou';
      }
    });

    // Check BTTS market
    Object.entries(markets.btts).forEach(([key, value]) => {
      if (value.prob > bestProb) {
        bestProb = value.prob;
        bestPick = { ...value, pick: key };
        bestMarket = 'btts';
      }
    });

    return { ...bestPick, market: bestMarket };
  }

  // Calculate overall confidence score
  calculateConfidenceScore(analysis) {
    const { xG, form, homeAdvantage, h2h } = analysis;
    
    let score = 50; // Base score
    
    // Add points based on data quality
    if (xG.total > 0) score += 10;
    if (form.homePoints > 0 || form.awayPoints > 0) score += 10;
    if (homeAdvantage.homeWinRate > 0) score += 10;
    if (h2h.homeWins + h2h.awayWins + h2h.draws > 0) score += 10;
    
    // Add points based on consistency
    const formConsistency = Math.abs(form.advantage);
    score += Math.min(20, formConsistency * 2);
    
    return Math.min(95, Math.max(40, score));
  }

  // Generate analysis reason
  generateReason(bestMarket, homeTeam, awayTeam) {
    const reasons = {
      result: {
        '1': `${homeTeam} ev sahibi avantajı ve formuyla favori görünüyor.`,
        'X': `İki takımın güçleri birbirine yakın, beraberlik olasılığı yüksek.`,
        '2': `${awayTeam} deplasman performansıyla favori durumda.`
      },
      ou: {
        'over': `İki takımın hücum istatistikleri yüksek skoru işaret ediyor.`,
        'under': `Takımların savunma odaklı oyun tarzı düşük skoru işaret ediyor.`
      },
      btts: {
        'yes': `Her iki takım da gol atma kapasitesine sahip.`,
        'no': `En az bir takımın gol yememesi muhtemel.`
      }
    };

    return reasons[bestMarket.market]?.[bestMarket.pick] || 'İstatistiksel analiz sonucu oluşturuldu.';
  }

  // Batch analyze multiple fixtures
  async analyzeFixtures(fixtures) {
    const analyses = [];
    
    for (const fixture of fixtures) {
      try {
        const analysis = await this.analyzeMatch(fixture);
        analyses.push(analysis);
      } catch (error) {
        console.error('Analysis error for fixture:', fixture.fixture?.id, error);
      }
    }

    // Sort by confidence score
    return analyses.sort((a, b) => b.confidenceScore - a.confidenceScore);
  }
}

// Create global instance
const aiEngine = new AIAnalysisEngine();
