// ===== Enhanced API Service - 75,000 Daily Requests =====

class ApiService {
  constructor() {
    this.baseUrl = 'https://v3.football.api-sports.io';
    this.headers = {
      'x-rapidapi-host': 'v3.football.api-sports.io',
      'x-rapidapi-key': 'e8287b49fa0bb657f2b4582bb13a496e'
    };
    this.requestCount = this.loadRequestCount();
    this.cache = new Map();
    this.cacheExpiry = 60000;
  }

  loadRequestCount() {
    const saved = localStorage.getItem(STORAGE_KEYS.API_REQUESTS);
    if (saved) {
      const data = JSON.parse(saved);
      const today = new Date().toISOString().split('T')[0];
      if (data.date === today) return data.count;
    }
    return 0;
  }

  saveRequestCount() {
    const data = {
      date: new Date().toISOString().split('T')[0],
      count: this.requestCount
    };
    localStorage.setItem(STORAGE_KEYS.API_REQUESTS, JSON.stringify(data));
  }

  async makeRequest(endpoint, params = {}) {
    const cacheKey = `${endpoint}?${new URLSearchParams(params).toString()}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.time < this.cacheExpiry) return cached.data;
    }
    try {
      const url = `${this.baseUrl}${endpoint}?${new URLSearchParams(params).toString()}`;
      const response = await fetch(url, { method: 'GET', headers: this.headers });
      const data = await response.json();
      this.requestCount++;
      this.saveRequestCount();
      this.cache.set(cacheKey, { data, time: Date.now() });
      return data;
    } catch (error) {
      console.error('API Error:', error);
      return { response: [], errors: [error.message] };
    }
  }

  async getAllLiveMatches() {
    return this.makeRequest('/fixtures', { live: 'all' });
  }

  async getTodayMatches() {
    const today = new Date().toISOString().split('T')[0];
    return this.makeRequest('/fixtures', { date: today });
  }

  async getFixtureById(fixtureId) {
    return this.makeRequest('/fixtures', { id: fixtureId });
  }

  async getTeamStatistics(teamId, leagueId, season = CURRENT_SEASON) {
    return this.makeRequest('/teams/statistics', { team: teamId, league: leagueId, season: season });
  }

  async getTeamLastMatches(teamId, limit = 10) {
    return this.makeRequest('/fixtures', { team: teamId, last: limit });
  }

  async getStandings(leagueId, season = CURRENT_SEASON) {
    return this.makeRequest('/standings', { league: leagueId, season: season });
  }

  async getPredictions(fixtureId) {
    return this.makeRequest('/predictions', { fixture: fixtureId });
  }

  async getHeadToHead(team1Id, team2Id, limit = 10) {
    return this.makeRequest('/fixtures/headtohead', { h2h: `${team1Id}-${team2Id}`, last: limit });
  }

  async getInjuries(teamId, leagueId) {
    return this.makeRequest('/injuries', { team: teamId, league: leagueId });
  }

  // CANLI MAÇLAR - Sadece şu anda oynanan
  async getLiveMatches() {
    const liveData = await this.getAllLiveMatches();
    const allMatches = liveData.response || [];
    
    // Sadece gerçekten canlı oynanan maçlar
    const activeMatches = allMatches.filter(match => {
      const status = match.fixture?.status?.short;
      return ['1H', '2H', 'HT', 'ET'].includes(status);
    });
    
    return {
      matches: activeMatches,
      isLive: activeMatches.length > 0,
      count: activeMatches.length
    };
  }

  // BUGÜNÜN MAÇLARI - YZ Tahminleri için
  async getMatches() {
    const today = new Date().toISOString().split('T')[0];
    
    // Bugünkü maçları getir
    const todayData = await this.getTodayMatches();
    const todayMatches = todayData.response || [];
    
    // Bitmemiş maçları filtrele
    const filteredMatches = todayMatches.filter(match => {
      const status = match.fixture?.status?.short;
      // Bitmiş maçları atla
      return !['FT', 'AET', 'PEN', 'SUSP', 'INT', 'PST', 'CANC', 'ABD'].includes(status);
    });
    
    return {
      matches: filteredMatches,
      isLive: filteredMatches.some(m => ['1H', '2H', 'HT', 'ET'].includes(m.fixture?.status?.short)),
      count: filteredMatches.length
    };
  }

  getRequestCount() {
    return this.requestCount;
  }

  getRemainingRequests() {
    return 75000 - this.requestCount;
  }
}

const apiService = new ApiService();
