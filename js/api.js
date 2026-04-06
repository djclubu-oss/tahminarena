// ===== API Functions =====

class ApiService {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.headers = API_CONFIG.HEADERS;
    this.cache = new Map();
    this.cacheTimeout = 2 * 60 * 1000;
    this.requestCount = 0;
    this.maxRequests = 75000;
  }

  async fetch(endpoint, params = {}) {
    if (this.requestCount >= this.maxRequests) {
      throw new Error('Günlük API limitine ulaşıldı (75,000)');
    }

    const url = new URL(this.baseUrl + endpoint);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const cacheKey = url.toString();
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      this.requestCount++;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('API Fetch Error:', error);
      throw error;
    }
  }

  getCache(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
n  }

  // Get live matches from selected leagues only
  async getLiveMatches() {
    return this.fetch('/fixtures', { 
      live: 'all',
      league: ALL_LEAGUE_IDS
    });
  }

  // Get live odds for a fixture
  async getLiveOdds(fixtureId) {
    return this.fetch('/odds/live', { fixture: fixtureId });
  }

  // Get live matches with odds
  async getLiveMatchesWithOdds() {
    try {
      const matchesData = await this.getLiveMatches();
      const matches = matchesData.response || [];

      // Get odds for first 30 matches (rate limiting)
      const matchesWithOdds = await Promise.all(
        matches.slice(0, 30).map(async (match) => {
          try {
            const oddsData = await this.getLiveOdds(match.fixture.id);
            return {
              ...match,
              odds: this.parseOdds(oddsData.response),
              category: this.getLeagueCategory(match.league.id)
            };
          } catch (e) {
            return { 
              ...match, 
              odds: null,
              category: this.getLeagueCategory(match.league.id)
            };
          }
        })
      );

      return { response: matchesWithOdds };
    } catch (error) {
      console.error('Live matches error:', error);
      throw error;
    }
  }

  // Get league category
  getLeagueCategory(leagueId) {
    const league = Object.values(LEAGUES).find(l => l.id === leagueId);
    return league?.category || 'Diğer';
  }

  // Parse odds
  parseOdds(oddsResponse) {
    if (!oddsResponse || !oddsResponse[0]) return null;
    
    const odds = oddsResponse[0];
    const bookmaker = odds.bookmakers?.[0];
    if (!bookmaker) return null;

    const bets = bookmaker.bets || [];
    
    // Match winner (1X2)
    const matchWinner = bets.find(b => b.id === 1)?.values || [];
    const homeOdd = matchWinner.find(v => v.value === 'Home')?.odd;
    const drawOdd = matchWinner.find(v => v.value === 'Draw')?.odd;
    const awayOdd = matchWinner.find(v => v.value === 'Away')?.odd;

    // Over/Under 2.5
    const ouBets = bets.find(b => b.id === 5)?.values || [];
    const over25 = ouBets.find(v => v.value === 'Over 2.5')?.odd;
    const under25 = ouBets.find(v => v.value === 'Under 2.5')?.odd;

    // BTTS
    const bttsBets = bets.find(b => b.id === 10)?.values || [];
    const bttsYes = bttsBets.find(v => v.value === 'Yes')?.odd;
    const bttsNo = bttsBets.find(v => v.value === 'No')?.odd;

    return {
      matchWinner: { home: homeOdd, draw: drawOdd, away: awayOdd },
      overUnder: { over: over25, under: under25 },
      btts: { yes: bttsYes, no: bttsNo },
      updated: new Date().toLocaleTimeString('tr-TR')
    };
  }

  // Get today's fixtures
  async getTodayFixtures() {
    const today = new Date().toISOString().split('T')[0];
    return this.fetch('/fixtures', { 
      date: today, 
      league: ALL_LEAGUE_IDS 
    });
  }

  // Get team statistics
  async getTeamStatistics(teamId, leagueId) {
    return this.fetch('/teams/statistics', {
      team: teamId,
      league: leagueId,
      season: CURRENT_SEASON
    });
  }

  // Get predictions
  async getPredictions(fixtureId) {
    return this.fetch('/predictions', { fixture: fixtureId });
  }

  // Get injuries
  async getInjuries(fixtureId) {
    return this.fetch('/injuries', { fixture: fixtureId });
  }

  // Get head to head
  async getHeadToHead(team1Id, team2Id) {
    return this.fetch('/fixtures/headtohead', { h2h: `${team1Id}-${team2Id}` });
  }

  // Get standings
  async getStandings(leagueId) {
    return this.fetch('/standings', { league: leagueId, season: CURRENT_SEASON });
  }

  getRequestCount() {
    return this.requestCount;
  }
}

const apiService = new ApiService();
