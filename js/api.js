// ===== API Functions =====

class ApiService {
  constructor() {
    // Vercel proxy üzerinden çağrı
    this.baseUrl = '/api';
    this.requestCount = 0;
  }

  async getLiveMatches() {
    try {
      console.log('Fetching live matches...');
      
      const response = await fetch(`${this.baseUrl}/fixtures?live=all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Matches found:', data.response?.length || 0);
      
      this.requestCount++;
      return data;
    } catch (error) {
      console.error('API Fetch Error:', error);
      throw error;
    }
  }

  async getLiveOdds(fixtureId) {
    try {
      const response = await fetch(`${this.baseUrl}/odds/live?fixture=${fixtureId}`);
      return await response.json();
    } catch (error) {
      console.error('Odds error:', error);
      return { response: [] };
    }
  }

  getRequestCount() {
    return this.requestCount;
  }
}

const apiService = new ApiService();
