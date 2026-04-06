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

  // TÜM canlı maçları getir (lig filtresiz)
  async getAllLiveMatches() {
    try {
      console.log('Fetching ALL live matches...');
      
      const response = await fetch(`${this.baseUrl}/fixtures?live=all`, {
        method: 'GET',
        headers: this.headers
      });

      const data = await response.json();
      console.log('All live matches:', data.response?.length || 0);
      
      this.requestCount++;
      return data;
    } catch (error) {
      console.error('Live fetch error:', error);
      return { response: [] };
    }
  }

  // Bugünkü maçları getir
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

  // Ana fonksiyon: Önce canlı, yoksa bugünkü
  async getMatches() {
    // 1. Canlı maçları dene
    const liveData = await this.getAllLiveMatches();
    
    if (liveData.response && liveData.response.length > 0) {
      console.log('Returning live matches');
      return { 
        ...liveData, 
        isLive: true,
        count: liveData.response.length 
      };
    }
    
    // 2. Canlı yoksa bugünkü maçları getir
    console.log('No live matches, fetching today...');
    const todayData = await this.getTodayMatches();
    
    return { 
      ...todayData, 
      isLive: false,
      count: todayData.response?.length || 0 
    };
  }

  getRequestCount() {
    return this.requestCount;
  }
}

const apiService = new ApiService();
