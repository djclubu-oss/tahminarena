// ===== API CONFIG =====
const API_BASE = 'https://v3.football.api-sports.io';
const API_KEY = 'e8287b49fa0bb657f2b4582bb13a496e';
// ===== AUTH =====
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;
  const errEl = document.getElementById('loginError');
  
  if (!errEl) {
    console.error('loginError elementi bulunamadı');
    return;
  }
  
  const users = JSON.parse(localStorage.getItem('oa_users') || '[]');
  const user = users.find(u => u.email === email && u.pass === btoa(pass));
  
  if (email === 'demo@tahminarena.com' && pass === 'demo123') {
    localStorage.setItem('oa_session', JSON.stringify({ name: 'Demo Kullanıcı', email }));
    window.location.href = 'dashboard.html';
    return;
  }
  
  if (!user) { 
    errEl.textContent = 'E-posta veya şifre hatalı!'; 
    return; 
  }
  
  errEl.textContent = '';
  localStorage.setItem('oa_session', JSON.stringify({ name: user.name, email: user.email }));
  window.location.href = 'dashboard.html';
}

// ===== SEÇİMLER (PICKS) =====
let userPicks = JSON.parse(localStorage.getItem('oa_picks') || '[]');

function savePicks() {
  localStorage.setItem('oa_picks', JSON.stringify(userPicks));
}

function togglePick(matchId, pickType, odds, matchData) {
  // Aynı maç varsa kaldır
  userPicks = userPicks.filter(p => p.id !== matchId);
  
  // Yeni seçim ekle
  userPicks.push({
    id: matchId,
    home: matchData.home,
    away: matchData.away,
    league: matchData.league,
    flag: matchData.flag,
    time: matchData.time,
    selected: pickType,
    odds: parseFloat(odds)
  });
  
  savePicks();
  updatePickButtons();
  updatePicksBadge();
}

function removePick(matchId) {
  userPicks = userPicks.filter(p => p.id !== matchId);
  savePicks();
  updatePickButtons();
  updatePicksBadge();
  renderPicks();
}

function isPickSelected(matchId, pickType) {
  const pick = userPicks.find(p => p.id === matchId);
  return pick && pick.selected === pickType;
}

function getPickForMatch(matchId) {
  return userPicks.find(p => p.id === matchId);
}

function updatePickButtons() {
  document.querySelectorAll('.odds-select-btn').forEach(btn => {
    const matchId = parseInt(btn.dataset.matchId);
    const pickType = btn.dataset.pick;
    const selected = isPickSelected(matchId, pickType);
    btn.classList.toggle('selected', selected);
  });
}

function updatePicksBadge() {
  const badge = document.getElementById('picks-count-badge');
  if (badge) {
    badge.textContent = userPicks.length > 0 ? userPicks.length : '';
  }
}

// ===== API'DEN MAÇ ÇEK =====
async function loadMatches() {
  const liveEl = document.getElementById('liveMatches');
  const upcomingEl = document.getElementById('upcomingMatches');
  
  liveEl.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Maçlar yükleniyor...</div>';
  upcomingEl.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Yükleniyor...</div>';
  
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(`${API_BASE}/fixtures?date=${today}&timezone=Europe/Istanbul`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });
    
    if (!response.ok) throw new Error('API Hatası');
    
    const data = await response.json();
    const matches = data.response || [];
    
    // Canlı maçlar
    const live = matches.filter(m => ['1H','HT','2H','ET','P','LIVE'].includes(m.fixture.status.short));
    // Yaklaşan maçlar
    const upcoming = matches.filter(m => ['NS','TBD'].includes(m.fixture.status.short));
    // Biten maçlar
    const finished = matches.filter(m => ['FT','AET','PEN'].includes(m.fixture.status.short));
    
    // Sayıları güncelle
    document.getElementById('liveCount').textContent = live.length;
    
    // Canlı maçları göster
    if (live.length > 0) {
      liveEl.innerHTML = live.map(m => matchCard(m, true)).join('');
    } else if (finished.length > 0) {
      liveEl.innerHTML = `<div class="api-section-label"><i class="fas fa-flag-checkered"></i> Tamamlanan Maçlar (${finished.length})</div>` 
        + finished.map(m => matchCard(m, false, true)).join('');
    } else {
      liveEl.innerHTML = '<div class="empty-state"><i class="fas fa-circle"></i><p>Şu an canlı maç yok.</p></div>';
    }
    
    // Yaklaşan maçları göster
    if (upcoming.length > 0) {
      upcomingEl.innerHTML = `<div class="match-count-bar"><i class="fas fa-calendar-alt"></i> Bugün ${upcoming.length} maç</div>`
        + upcoming.map(m => matchCard(m, false)).join('');
    } else {
      upcomingEl.innerHTML = '<div class="empty-state"><i class="fas fa-calendar"></i><p>Yaklaşan maç yok.</p></div>';
    }
    
    // Butonları güncelle
    updatePickButtons();
    updatePicksBadge();
    
  } catch (err) {
    liveEl.innerHTML = `<div class="empty-state error-state"><i class="fas fa-exclamation-triangle"></i><p>${err.message}</p><small>API bağlantısı kurulamadı.</small></div>`;
    upcomingEl.innerHTML = '';
  }
}

// ===== MAÇ KARTI =====
function matchCard(m, isLive, isFinished = false) {
  const fixture = m.fixture;
  const teams = m.teams;
  const league = m.league;
  const goals = m.goals;
  
  const matchId = fixture.id;
  const homeTeam = teams.home.name;
  const awayTeam = teams.away.name;
  const leagueName = league.name;
  const leagueFlag = getLeagueFlag(league.country);
  
  // Skor
  let scoreStr = '-';
  if (isLive || isFinished) {
    scoreStr = `${goals.home ?? 0} - ${goals.away ?? 0}`;
  }
  
  // Zaman
  const matchDate = new Date(fixture.date);
  const timeStr = matchDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  
  // Durum
  const statusLabel = isFinished ? '<span class="match-finished">Bitti</span>'
    : isLive ? `<span class="match-minute live-dot">${fixture.status.elapsed}'</span>` : '';
  
  // Oranlar (API'den geliyorsa kullan, yoksa varsayılan)
  const odds1 = m.odds?.bookmakers?.[0]?.bets?.[0]?.values?.find(v => v.value === 'Home')?.odd || '1.80';
  const oddsX = m.odds?.bookmakers?.[0]?.bets?.[0]?.values?.find(v => v.value === 'Draw')?.odd || '3.40';
  const odds2 = m.odds?.bookmakers?.[0]?.bets?.[0]?.values?.find(v => v.value === 'Away')?.odd || '4.20';
  
  const matchData = {
    id: matchId,
    home: homeTeam,
    away: awayTeam,
    league: leagueName,
    flag: leagueFlag,
    time: timeStr
  };
  
  return `
  <div class="match-card" data-id="${matchId}">
    <div class="match-league"><span class="league-flag">${leagueFlag}</span>${leagueName}</div>
    <div class="match-teams">
      <div class="teams">${homeTeam} <span style="color:var(--text-muted)">vs</span> ${awayTeam}</div>
      <div class="match-time">${statusLabel} ${isLive || isFinished ? '' : timeStr}</div>
    </div>
    ${isLive || isFinished ? `<div class="match-live-score">${scoreStr}</div>` : ''}
    <div class="match-odds-with-select">
      <button class="odds-select-btn ${isPickSelected(matchId, '1') ? 'selected' : ''}" 
        data-match-id="${matchId}" data-pick="1" data-odds="${odds1}"
        onclick='togglePick(${matchId}, "1", "${odds1}", ${JSON.stringify(matchData).replace(/"/g, '&quot;')})'>
        <span class="pick-label">1</span><span class="pick-odd">${odds1}</span>
      </button>
      <button class="odds-select-btn ${isPickSelected(matchId, 'X') ? 'selected' : ''}" 
        data-match-id="${matchId}" data-pick="X" data-odds="${oddsX}"
        onclick='togglePick(${matchId}, "X", "${oddsX}", ${JSON.stringify(matchData).replace(/"/g, '&quot;')})'>
        <span class="pick-label">X</span><span class="pick-odd">${oddsX}</span>
      </button>
      <button class="odds-select-btn ${isPickSelected(matchId, '2') ? 'selected' : ''}" 
        data-match-id="${matchId}" data-pick="2" data-odds="${odds2}"
        onclick='togglePick(${matchId}, "2", "${odds2}", ${JSON.stringify(matchData).replace(/"/g, '&quot;')})'>
        <span class="pick-label">2</span><span class="pick-odd">${odds2}</span>
      </button>
    </div>
    <button class="fav-btn" onclick="toggleFav(${matchId}, this)"><i class="fas fa-star"></i></button>
  </div>`;
}

function getLeagueFlag(country) {
  const flags = {
    'Turkey': '🇹🇷',
    'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'Spain': '🇪🇸',
    'Germany': '🇩🇪',
    'Italy': '🇮🇹',
    'France': '🇫🇷',
    'Netherlands': '🇳🇱',
    'Portugal': '🇵🇹',
    'Brazil': '🇧🇷',
    'USA': '🇺🇸'
  };
  return flags[country] || '⚽';
}

// ===== SEÇİMLERİM BÖLÜMÜ =====
function renderPicks() {
  const container = document.getElementById('picksMatches');
  const totalEl = document.getElementById('picksTotal');
  
  if (!container) return;
  
  if (userPicks.length === 0) {
    container.innerHTML = `<div class="empty-state">
      <i class="fas fa-crosshairs"></i>
      <p>Henüz maç seçmediniz.</p>
      <small>Maçlardan 1, X veya 2 seçerek kuponunuzu oluşturun.</small>
    </div>`;
    if (totalEl) totalEl.innerHTML = '';
    return;
  }
  
  const totalOdds = userPicks.reduce((acc, p) => acc * p.odds, 1).toFixed(2);
  
  if (totalEl) {
    totalEl.innerHTML = `
      <div class="picks-total-bar">
        <div class="picks-total-info">
          <span><i class="fas fa-receipt"></i> ${userPicks.length} Maç</span>
          <span class="picks-total-odds"><i class="fas fa-times"></i> Toplam Oran: <strong>${totalOdds}</strong></span>
        </div>
        <button class="picks-clear-btn" onclick="clearAllPicks()"><i class="fas fa-trash"></i> Temizle</button>
      </div>`;
  }
  
  container.innerHTML = userPicks.map(p => `
    <div class="match-card picks-selected-card">
      <div class="match-league"><span class="league-flag">${p.flag}</span>${p.league}</div>
      <div class="match-teams">
        <div class="teams">${p.home} <span style="color:var(--text-muted)">vs</span> ${p.away}</div>
        <div class="match-time">${p.time}</div>
      </div>
      <div class="picks-pick-badge">
        <i class="fas fa-check-circle"></i> ${p.selected} @ ${p.odds}
      </div>
      <button class="pick-remove-btn" onclick="removePick(${p.id})"><i class="fas fa-times"></i></button>
    </div>
  `).join('');
}

function clearAllPicks() {
  userPicks = [];
  savePicks();
  updatePickButtons();
  updatePicksBadge();
  renderPicks();
}

// ===== DİĞER FONKSİYONLAR =====
function toggleFav(id, btn) {
  btn.classList.toggle('active');
}

function initDashboard() {
  const session = JSON.parse(localStorage.getItem('oa_session') || 'null');
  if (!session) { window.location.href = 'index.html'; return; }
  
  document.getElementById('dashUserName').textContent = session.name;
  document.getElementById('dashUserEmail').textContent = session.email;
  
  startClock();
  loadMatches();
}

function startClock() {
  const el = document.getElementById('clock');
  if (!el) return;
  function tick() { 
    el.textContent = new Date().toLocaleTimeString('tr-TR', { hour:'2-digit', minute:'2-digit', second:'2-digit' }); 
  }
  tick(); 
  setInterval(tick, 1000);
}

// ===== SECTION NAV =====
const SECTIONS = ['live','odds','stats','upcoming','favorites','ai','coupon','compare','picks','premium'];
const TITLES = {
  live:'Canlı Maçlar', odds:'Oran Analizi', stats:'İstatistikler',
  upcoming:'Yaklaşan Maçlar', favorites:'Favorilerim',
  ai:'YZ Tahmin', coupon:'Günlük YZ Kuponu', compare:'Oran Karşılaştırma',
  picks:'Seçimlerim', premium:'Premium Kupon'
};

function showSection(key) {
  SECTIONS.forEach(s => {
    const el = document.getElementById('sec-'+s);
    if (el) el.classList.toggle('hidden', s !== key);
  });
  document.getElementById('sectionTitle').textContent = TITLES[key] || '';
  document.querySelectorAll('.nav-item').forEach(el => {
    const onclick = el.getAttribute('onclick') || '';
    el.classList.toggle('active', onclick.includes(`'${key}'`));
  });
  if (key === 'picks') renderPicks();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('dashUserName')) initDashboard();
});
