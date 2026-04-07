// ===== Charts Service =====
// For future chart implementations

class ChartsService {
  constructor() {
    this.initialized = false;
  }

  // Initialize charts if Chart.js is available
  init() {
    if (typeof Chart === 'undefined') {
      console.log('Chart.js not loaded');
      return;
    }
    
    this.initialized = true;
  }

  // Create confidence distribution chart
  createConfidenceChart(canvasId, analyses) {
    if (!this.initialized || typeof Chart === 'undefined') return;

    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const distribution = {
      high: analyses.filter(a => a.confidenceScore >= 80).length,
      medium: analyses.filter(a => a.confidenceScore >= 60 && a.confidenceScore < 80).length,
      low: analyses.filter(a => a.confidenceScore < 60).length
    };

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Yüksek Güven (80%+)', 'Orta Güven (60-79%)', 'Düşük Güven (<60%)'],
        datasets: [{
          data: [distribution.high, distribution.medium, distribution.low],
          backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#e6edf3' }
          }
        }
      }
    });
  }

  // Create market distribution chart
  createMarketChart(canvasId, analyses) {
    if (!this.initialized || typeof Chart === 'undefined') return;

    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const markets = { result: 0, ou: 0, btts: 0, corners: 0 };
    analyses.forEach(a => {
      if (markets[a.bestMarket.market] !== undefined) {
        markets[a.bestMarket.market]++;
      }
    });

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Maç Sonucu', 'Alt/Üst', 'KG Var/Yok', 'Korner'],
        datasets: [{
          label: 'Tahmin Sayısı',
          data: [markets.result, markets.ou, markets.btts, markets.corners],
          backgroundColor: 'rgba(245, 158, 11, 0.7)',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { ticks: { color: '#8b949e' }, grid: { color: '#30363d' } },
          y: { ticks: { color: '#8b949e' }, grid: { color: '#30363d' } }
        }
      }
    });
  }
}

// Create global instance
const chartsService = new ChartsService();
