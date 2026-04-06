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
  }

  async getAllLiveMatches() {
    return this.fetch('/fixtures', { 
      live: 'all',
      league: ALL_LEAGUE_IDS
    });
  }

  async getLiveOdds(fixtureId) {
    return this.fetch('/odds/live', { fixture: fixtureId });
  }

  async getLiveMatchesWithOdds() {
    try {
      const matchesData = await this.getAllLiveMatches();
      const matches = matchesData.response || [];

      const matchesWithOdds = await Promise.all(
        matches.slice(0, 50).map(async (match) => {
          try {
            const oddsData = await this.getLiveOdds(match.fixture.id);
            return {
              ...match,
              odds: this.parseOdds(oddsData.response)
            };
          } catch (e) {
            return { ...match, odds: null };
          }
        })
      );

      return { response: matchesWithOdds };
    } catch (error) {
      console.error('Live matches with odds error:', error);
      throw error;
    }
  }

  parseOdds(oddsResponse) {
    if (!oddsResponse || !oddsResponse[0]) return null;
    
    const odds = oddsResponse[0];
    const bookmaker = odds.bookmakers?.[0];
    if (!bookmaker) return null;

    const bets = bookmaker.bets || [];
    
    const matchWinner = bets.find(b => b.id === 1)?.values || [];
    const homeOdd = matchWinner.find(v => v.value === 'Home')?.odd;
    const drawOdd = matchWinner.find(v => v.value === 'Draw')?.odd;
    const awayOdd = matchWinner.find(v => v.value === 'Away')?.odd;

    const ouBets = bets.find(b => b.id === 5)?.values || [];
    const over25 = ouBets.find(v => v.value === 'Over 2.5')?.odd;
    const under25 = ouBets.find(v => v.value === 'Under 2.5')?.odd;

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

  getRequestCount() {
    return this.requestCount;
  }
}

const apiService = new ApiService();
