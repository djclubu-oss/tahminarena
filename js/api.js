// ===== API Functions =====

class ApiService {
  constructor() {
    this.baseUrl = 'https://v3.football.api-sports.io';
    this.headers = {
      'x-rapidapi-host': 'v3.football.api-sports.io',
      'x-rapidapi-key': 'e8287b49fa0bb657f2b4582bb13a496e'
    };
    this.requestCount = 0;
  }

  async getLiveMatches() {
    try {
      console.log('Fetching live matches...');
      
      const response = await fetch(`${this.baseUrl}/fixtures?live=all`, {
        method: 'GET',
        headers: this.headers
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Matches found:', data.response?.length || 0);
      
      this.requestCount++;
      
      // If no live matches, get today's matches
      if (!data.response || data.response.length === 0) {
        return this.getTodayMatches();
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      return this.getTodayMatches();
    }
  }

  async getTodayMatches() {
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('Fetching today matches:', today);
      
      const response = await fetch(`${this.baseUrl}/fixtures?date=${today}`, {
        method: 'GET',
        headers: this.headers
      });

      const data = await response.json();
      console.log('Today matches:', data.response?.length || 0);
      
      this.requestCount++;
      return data;
    } catch (error) {
      console.error('Today fetch error:', error);
      return { response: [] };
    }
  }

  getRequestCount() {
    return this.requestCount;
  }
}

const apiService = new ApiService();
