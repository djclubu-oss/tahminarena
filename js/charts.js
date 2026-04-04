// ===== CHARTS (Chart.js) =====

let chartsInitialized = false;

function initCharts() {
  if (chartsInitialized) return;
  chartsInitialized = true;

  const defaults = {
    plugins: { legend: { labels: { color: '#e2e8f0', font: { size: 12 } } } },
    scales: {}
  };

  // PIE - Lig Dağılımı
  new Chart(document.getElementById('pieChart'), {
    type: 'doughnut',
    data: {
      labels: ['Süper Lig', 'Premier Lig', 'La Liga', 'Bundesliga', 'Serie A'],
      datasets: [{
        data: [14, 10, 8, 6, 9],
        backgroundColor: ['#f59e0b', '#3b82f6', '#22c55e', '#ef4444', '#a855f7'],
        borderWidth: 0,
      }]
    },
    options: { ...defaults, cutout: '65%' }
  });

  // BAR - Haftalık Gol Ortalaması
  new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: {
      labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
      datasets: [{
        label: 'Gol Ortalaması',
        data: [2.3, 2.8, 1.9, 3.1, 2.6, 3.4, 2.9],
        backgroundColor: 'rgba(245,158,11,0.7)',
        borderRadius: 6,
      }]
    },
    options: {
      ...defaults,
      scales: {
        x: { ticks: { color: '#8b949e' }, grid: { color: '#30363d' } },
        y: { ticks: { color: '#8b949e' }, grid: { color: '#30363d' } }
      }
    }
  });

  // LINE - Oran Değişimi
  new Chart(document.getElementById('lineChart'), {
    type: 'line',
    data: {
      labels: ['28 Mar', '29 Mar', '30 Mar', '31 Mar', '01 Nis', '02 Nis', '03 Nis'],
      datasets: [
        {
          label: 'Ev Sahibi (Ort.)',
          data: [2.1, 2.0, 1.95, 1.98, 2.05, 2.10, 2.08],
          borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)',
          tension: 0.4, fill: true, pointRadius: 4,
        },
        {
          label: 'Beraberlik (Ort.)',
          data: [3.3, 3.4, 3.35, 3.3, 3.25, 3.40, 3.38],
          borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)',
          tension: 0.4, fill: true, pointRadius: 4,
        },
        {
          label: 'Deplasman (Ort.)',
          data: [3.8, 3.9, 4.0, 3.95, 3.85, 3.70, 3.75],
          borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)',
          tension: 0.4, fill: true, pointRadius: 4,
        }
      ]
    },
    options: {
      ...defaults,
      scales: {
        x: { ticks: { color: '#8b949e' }, grid: { color: '#30363d' } },
        y: { ticks: { color: '#8b949e' }, grid: { color: '#30363d' } }
      }
    }
  });
}
