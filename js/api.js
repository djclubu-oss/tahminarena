// api.js BAŞINA EKLE
const STORAGE_KEYS = {
    REQUEST_COUNT: 'api_request_count',
    LAST_RESET: 'api_last_reset'
};
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
    this.cacheExpiry = 60000; // 1 minute cache
  }

  loadRequestCount() {
    const saved = localStorage.getItem(STORAGE_KEYS.API_REQUESTS);
    if (saved) {
      const data = JSON.parse(saved);
      const today = new Date().toISOString().split('T')[0];
      if (data.date === today) {
        return data.count;
      }
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
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.time < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const url = `${this.baseUrl}${endpoint}?${new URLSearchParams(params).toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers
      });

      const data = await response.json();
      this.requestCount++;
      this.saveRequestCount();

      // Cache the response
      this.cache.set(cacheKey, { data, time: Date.now() });

      return data;
    } catch (error) {
      console.error('API Error:', error);
      return { response: [], errors: [error.message] };
    }
  }

  // ===== FIXTURES =====
  
  // Get ALL live matches from all leagues
  async getAllLiveMatches() {
    // Canlı tüm maçları getir (tüm liglerden)
    return this.makeRequest('/fixtures', { live: 'all' });
  }

  // Get live matches by league
  async getLiveMatchesByLeague(leagueId) {
    return this.makeRequest('/fixtures', { live: 'all', league: leagueId });
  }

  // Get today's matches
  async getTodayMatches() {
    const today = new Date().toISOString().split('T')[0];
    return this.makeRequest('/fixtures', { date: today });
  }

  // Get today's matches by league
  async getTodayMatchesByLeague(leagueId) {
    const today = new Date().toISOString().split('T')[0];
    return this.makeRequest('/fixtures', { date: today, league: leagueId });
  }

  // Get upcoming matches (next 3 days)
  async getUpcomingMatches() {
    const today = new Date();
    const dates = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    const allMatches = [];
    for (const date of dates) {
      const data = await this.makeRequest('/fixtures', { date });
      if (data.response) {
        allMatches.push(...data.response);
      }
    }
    return { response: allMatches };
  }

  // Get fixture by ID
  async getFixtureById(fixtureId) {
    return this.makeRequest('/fixtures', { id: fixtureId });
  }

  // Get fixture statistics
  async getFixtureStatistics(fixtureId) {
    return this.makeRequest('/fixtures/statistics', { fixture: fixtureId });
  }

  // Get fixture events (goals, cards, etc.)
  async getFixtureEvents(fixtureId) {
    return this.makeRequest('/fixtures/events', { fixture: fixtureId });
  }

  // ===== TEAMS =====

  // Get team statistics
  async getTeamStatistics(teamId, leagueId, season = CURRENT_SEASON) {
    return this.makeRequest('/teams/statistics', {
      team: teamId,
      league: leagueId,
      season: season
    });
  }

  // Get team information
  async getTeamInfo(teamId) {
    return this.makeRequest('/teams', { id: teamId });
  }

  // Get last 10 matches for a team
  async getTeamLastMatches(teamId, limit = 10) {
    return this.makeRequest('/fixtures', {
      team: teamId,
      last: limit
    });
  }

  // Get team form (last 5 matches)
  async getTeamForm(teamId) {
    const data = await this.makeRequest('/fixtures', {
      team: teamId,
      last: 5
    });
    return data.response || [];
  }

  // ===== STANDINGS =====

  // Get league standings
  async getStandings(leagueId, season = CURRENT_SEASON) {
    return this.makeRequest('/standings', {
      league: leagueId,
      season: season
    });
  }

  // ===== PREDICTIONS =====

  // Get match predictions
  async getPredictions(fixtureId) {
    return this.makeRequest('/predictions', { fixture: fixtureId });
  }

  // ===== HEAD TO HEAD =====

  // Get H2H matches
  async getHeadToHead(team1Id, team2Id, limit = 10) {
    return this.makeRequest('/fixtures/headtohead', {
      h2h: `${team1Id}-${team2Id}`,
      last: limit
    });
  }

  // ===== INJURIES =====

  // Get team injuries
  async getInjuries(teamId, leagueId) {
    return this.makeRequest('/injuries', {
      team: teamId,
      league: leagueId
    });
  }

  // ===== ODDS =====

  // Get match odds
  async getOdds(fixtureId) {
    return this.makeRequest('/odds', { fixture: fixtureId });
  }

  // ===== PLAYERS =====

  // Get top scorers
  async getTopScorers(leagueId, season = CURRENT_SEASON) {
    return this.makeRequest('/players/topscorers', {
      league: leagueId,
      season: season
    });
  }

  // ===== MAIN FUNCTION: Get matches with priority =====
  async getMatches() {
    // 1. Try live matches first
    const liveData = await this.getAllLiveMatches();
    
    if (liveData.response && liveData.response.length > 0) {
      return {
        matches: liveData.response,
        isLive: true,
        count: liveData.response.length
      };
    }
    
    // 2. No live matches, get today's matches
    const todayData = await this.getTodayMatches();
    
    if (todayData.response && todayData.response.length > 0) {
      return {
        matches: todayData.response,
        isLive: false,
        count: todayData.response.length
      };
    }
    
    // 3. No matches today, get upcoming
    const upcomingData = await this.getUpcomingMatches();
    
    return {
      matches: upcomingData.response || [],
      isLive: false,
      count: upcomingData.response?.length || 0,
      isUpcoming: true
    };
  }

  // Get request count
  getRequestCount() {
    return this.requestCount;
  }

  // Get remaining requests
  getRemainingRequests() {
    return 75000 - this.requestCount;
  }
}

// Create global instance
const apiService = new ApiService();
