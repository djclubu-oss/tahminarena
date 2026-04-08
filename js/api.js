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

  // SADECE GERÇEK CANLI MAÇLAR - Canlı Maçlar sekmesi için
  async getLiveMatches() {
    const liveData = await this.getAllLiveMatches();
    const allMatches = liveData.response || [];
    
    // API "live=all" ile yaklaşan maçları da döndürüyor
    // Sadece gerçekten canlı oynanan maçları filtrele
    const activeMatches = allMatches.filter(match => {
      const status = match.fixture?.status?.short;
      // Sadece şu anda oynanan: İlk Yarı, İkinci Yarı, Devre Arası, Uzatmalar
      return ['1H', '2H', 'HT', 'ET'].includes(status);
    });
    
    return {
      matches: activeMatches,
      isLive: activeMatches.length > 0,
      count: activeMatches.length
    };
  }

  // BUGÜNÜN MAÇLARI - YZ Tahminleri için (sadece önemli liglerden)
  async getMatches() {
    const today = new Date().toISOString().split('T')[0];
    
    // Bugünkü maçları getir
    const todayData = await this.getTodayMatches();
    const todayMatches = todayData.response || [];
    
    // Önemli ligler (analiz edilecek)
    const majorLeagues = [
      39, 40, // Premier League, Championship
      140, 141, // La Liga, Segunda
      78, 79, // Bundesliga, 2. Bundesliga
      135, 136, // Serie A, B
      61, 62, // Ligue 1, 2
      203, 204, // Süper Lig, 1. Lig
      88, 89, // Eredivisie
      94, 95, // Primeira Liga
      144, 145, // Pro League
      2, 3, 848, // Şampiyonlar Ligi, Avrupa Ligi, Konferans
      71, 72, // Serie A Brazil
      128, 129, // Arjantin
      253, // MLS
      262, // Liga MX
    ];
    
    // Sadece önemli liglerden ve bugün oynanacak maçları filtrele
    const filteredMatches = todayMatches.filter(match => {
      const status = match.fixture?.status?.short;
      const leagueId = match.league?.id;
      const matchDate = new Date(match.fixture?.date).toISOString().split('T')[0];
      
      // Bitmiş maçları atla
      if (['FT', 'AET', 'PEN', 'SUSP', 'INT', 'PST', 'CANC', 'ABD'].includes(status)) {
        return false;
      }
      
      // Sadece bugünkü maçlar ve önemli ligler
      return matchDate === today && majorLeagues.includes(leagueId);
    });
    
    // En fazla 50 maç analiz et (performans için)
    const limitedMatches = filteredMatches.slice(0, 50);
    
    return {
      matches: limitedMatches,
      isLive: limitedMatches.some(m => ['1H', '2H', 'HT', 'ET'].includes(m.fixture?.status?.short)),
      count: limitedMatches.length
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
