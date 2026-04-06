// ===== API Functions =====

class ApiService {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.headers = API_CONFIG.HEADERS;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 dakika
  }

  // Generic API call
  async fetch(endpoint, params = {}) {
    const url = new URL(this.baseUrl + endpoint);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const cacheKey = url.toString();
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
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

  // Cache management
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

  // Get live matches
  async getLiveMatches() {
    return this.fetch('/fixtures', { live: 'all' });
  }

  // Get fixtures by date
  async getFixturesByDate(date) {
    return this.fetch('/fixtures', { date, season: CURRENT_SEASON });
  }

  // Get fixture details
  async getFixtureDetails(fixtureId) {
    return this.fetch('/fixtures', { id: fixtureId });
  }

  // Get team statistics
  async getTeamStatistics(teamId, leagueId) {
    return this.fetch('/teams/statistics', {
      team: teamId,
      league: leagueId,
      season: CURRENT_SEASON
    });
  }

  // Get predictions for a fixture
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

  // Get all leagues fixtures for today
  async getTodayFixtures() {
    const today = new Date().toISOString().split('T')[0];
    const leagueIds = Object.values(LEAGUES).map(l => l.id).join('-');
    return this.fetch('/fixtures', { date: today, league: leagueIds });
  }
}

// Create global instance
const apiService = new ApiService();
