// ===== API CONFIG =====
const API_BASE = 'https://v3.football.api-sports.io';
const API_KEY = 'e8287b49fa0bb657f2b4582bb13a496e';
const ADMIN_EMAIL = 'djclubu@tahminarena.com';

// ===== PREMIUM KONTROL =====
function isPremium() {
  const session = JSON.parse(localStorage.getItem('oa_session') || 'null');
  if (!session) return false;
  if (session.email === 'djclubu@tahminarena.com') return true;
  if (session.isAdmin === true) return true;
  return session.isPremium === true;
}

// ===== SEED-BASED RANDOM =====
function seededRandom(seed) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// ===== SEÇİMLER (PICKS) =====
let userPicks = JSON.parse(localStorage.getItem('oa_picks') || '[]');

function savePicks() {
  localStorage.setItem('oa_picks', JSON.stringify(userPicks));
}

function selectPick(matchId, pickType, odds, matchData) {
  userPicks = userPicks.filter(p => p.id !== matchId);
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
  document.querySelectorAll(`.odds-select-btn[data-match-id="${matchId}"]`).forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.pick === pickType);
  });
  updatePicksBadge();
}

function removePick(matchId) {
  userPicks = userPicks.filter(p => p.id !== matchId);
  savePicks();
  updatePickButtons();
  updatePicksBadge();
  renderPicks();
}

function getPickForMatch(matchId) {
  return userPicks.find(p => p.id === matchId);
}

function updatePickButtons() {
  document.querySelectorAll('.odds-select-btn').forEach(btn => {
    const matchId = parseInt(btn.dataset.matchId);
    const pickType = btn.dataset.pick;
    const savedPick = getPickForMatch(matchId);
    btn.classList.toggle('selected', savedPick && savedPick.selected === pickType);
  });
}

function updatePicksBadge() {
  const badge = document.getElementById('picks-count-badge');
  if (badge) badge.textContent = userPicks.length > 0 ? userPicks.length : '';
}

// ===== CANLI MAÇLARI ÇEK =====
async function loadMatches() {
  const liveEl = document.getElementById('liveMatches');
  const upcomingEl = document.getElementById('upcomingMatches');
  
  if (!liveEl || !upcomingEl) return;
  
  liveEl.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Yükleniyor...</div>';
  upcomingEl.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Yükleniyor...</div>';
  
  try {
    // Canlı maçları çek
    const liveResponse = await fetch(`${API_BASE}/fixtures?live=all`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });
    
    if (!liveResponse.ok) throw new Error('API Hatası');
    
    const liveData = await liveResponse.json();
    const liveMatches = liveData.response || [];
    
    // Bugünkü maçları çek
    const today = new Date().toISOString().split('T')[0];
    const todayResponse = await fetch(`${API_BASE}/fixtures?date=${today}&timezone=Europe/Istanbul`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });
    
    const todayData = await todayResponse.json();
    const todayMatches = todayData.response || [];
    
    window.currentMatches = [...liveMatches, ...todayMatches];
    window.aiMatches = todayMatches;
    
    // Canlı maçları göster
    if (liveMatches.length > 0) {
      liveEl.innerHTML = `<div class="api-section-label"><i class="fas fa-circle live-dot"></i> Canlı Maçlar (${liveMatches.length})</div>`
        + liveMatches.map(m => matchCard(m, true)).join('');
    } else {
      liveEl.innerHTML = '<div class="empty-state"><i class="fas fa-circle"></i><p>Şu an canlı maç yok.</p></div>';
    }
    
    // Yaklaşan maçları göster
    const upcoming = todayMatches.filter(m => ['NS','TBD'].includes(m.fixture.status.short));
    if (upcoming.length > 0) {
      upcomingEl.innerHTML = `<div class="match-count-bar"><i class="fas fa-calendar-alt"></i> Bugün ${upcoming.length} maç</div>`
        + upcoming.map(m => matchCard(m, false)).join('');
    } else {
      upcomingEl.innerHTML = '<div class="empty-state"><i class="fas fa-calendar"></i><p>Yaklaşan maç yok.</p></div>';
    }
    
    updatePickButtons();
    updatePicksBadge();
    renderAIPredictions();
    renderPremiumCoupon();
    
  } catch (err) {
    liveEl.innerHTML = `<div class="empty-state error-state"><i class="fas fa-exclamation-triangle"></i><p>${err.message}</p></div>`;
    upcomingEl.innerHTML = '';
  }
}

// ===== ÇOKLU MARKET YZ ANALİZİ =====
function simpleAnalysis(m) {
  const home = m.teams?.home?.name || '';
  const away = m.teams?.away?.name || '';
  
  const seed = m.fixture.id;
  const rand = seededRandom(seed);
  
  const markets = [
    { type: 'MS', pick: '1', odd: (1.5 + rand() * 1.5).toFixed(2), confidence: Math.floor(50 + rand() * 40) },
    { type: 'MS', pick: 'X', odd: (3.0 + rand() * 1.5).toFixed(2), confidence: Math.floor(30 + rand() * 40) },
    { type: 'MS', pick: '2', odd: (2.0 + rand() * 2.0).toFixed(2), confidence: Math.floor(40 + rand() * 40) },
    { type: 'KG', pick: 'KG Var', odd: (1.7 + rand() * 0.8).toFixed(2), confidence: Math.floor(45 + rand() * 35) },
    { type: 'KG', pick: 'KG Yok', odd: (1.8 + rand() * 0.8).toFixed(2), confidence: Math.floor(35 + rand() * 35) },
    { type: 'AU', pick: 'Üst 2.5', odd: (1.8 + rand() * 0.7).toFixed(2), confidence: Math.floor(40 + rand() * 40) },
    { type: 'AU', pick: 'Alt 2.5', odd: (1.9 + rand() * 0.7).toFixed(2), confidence: Math.floor(40 + rand() * 40) },
    { type: 'IY', pick: 'İY 1', odd: (2.0 + rand() * 1.0).toFixed(2), confidence: Math.floor(35 + rand() * 35) },
    { type: 'IY', pick: 'İY X', odd: (2.2 + rand() * 0.8).toFixed(2), confidence: Math.floor(30 + rand() * 30) },
    { type: 'IY', pick: 'İY 2', odd: (2.5 + rand() * 1.5).toFixed(2), confidence: Math.floor(30 + rand() * 30) }
  ];
  
  const best = markets.reduce((a, b) => a.confidence > b.confidence ? a : b);
  
  const reasons = {
    'MS': {
      '1': `${home} ev sahibi avantajıyla favori görünüyor.`,
      'X': 'İki takım da dengeli görünüyor, beraberlik ihtimali yüksek.',
      '2': `${away} deplasmanda etkili olabilir.`
    },
    'KG': {
      'KG Var': 'İki takımın da hücum gücü yüksek, karşılıklı gol bekleniyor.',
      'KG Yok': 'Savunmalar ön planda, gol çıkmayabilir.'
    },
    'AU': {
      'Üst 2.5': 'Açık oyun bekleniyor, gol yağmuru olabilir.',
      'Alt 2.5': 'Kapalı oyun, düşük skorlu maç olabilir.'
    },
    'IY': {
      'İY 1': `${home} ilk yarıda öne geçebilir.`,
      'İY X': 'İlk yarı dengeli geçebilir.',
      'İY 2': `${away} ilk yarıda sürpriz yapabilir.`
    }
  };
  
  return {
    pick: best.pick,
    odd: best.odd,
    confidence: best.confidence,
    confidenceClass: best.confidence >= 70 ? 'high' : best.confidence >= 50 ? 'medium' : 'low',
    reason: reasons[best.type][best.pick],
    market: best.type
  };
}

// ===== YZ TAHMİN =====
function renderAIPredictions() {
  const container = document.getElementById('aiContent');
  if (!container) return;
  
  const matches = window.aiMatches || [];
  if (matches.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-robot"></i><p>Henüz analiz edilecek maç yok.</p></div>';
    return;
  }
  
  const isUserPremium = isPremium();
  const displayCount = isUserPremium ? matches.length : 2;
  const displayMatches = matches.slice(0, displayCount);
  
  let html = `<div class="ai-matches-grid">`;
  
  displayMatches.forEach((m, i) => {
    const analysis = simpleAnalysis(m);
    html += `
      <div class="ai-card">
        <div class="ai-card-header">
          <span class="ai-league">${m.league?.name || 'Lig'}</span>
          <span class="ai-confidence ${analysis.confidenceClass}">${analysis.confidence}%</span>
        </div>
        <div class="ai-teams">${m.teams?.home?.name} vs ${m.teams?.away?.name}</div>
        <div class="ai-market-tag">${analysis.market}</div>
        <div class="ai-prediction">
          <span class="ai-pick">${analysis.pick}</span>
          <span class="ai-odd">@${analysis.odd}</span>
        </div>
        <div class="ai-reason">${analysis.reason}</div>
      </div>
    `;
  });
  
  html += `</div>`;
  
  if (!isUserPremium && matches.length > 2) {
    html += `
      <div class="premium-lock-overlay">
        <i class="fas fa-lock"></i>
        <h3>Premium Üyelik Gerekli</h3>
        <p>Tüm maç analizlerini görmek için premium üye olun.</p>
        <p class="premium-contact">İletişim: <strong>djclubu@tahminarena.com</strong></p>
      </div>
    `;
  }
  
  container.innerHTML = html;
}

// ===== PREMİUM KUPON =====
function renderPremiumCoupon() {
  const container = document.getElementById('premiumContent');
  if (!container) return;
  
  const isUserPremium = isPremium();
  
  if (!isUserPremium) {
    container.innerHTML = `
      <div class="premium-lock-overlay">
        <i class="fas fa-lock"></i>
        <h2>Premium Üyelik Gerekli</h2>
        <p>Bu bölüm sadece premium üyelere özeldir.</p>
        <p class="premium-contact">İletişim: <strong>djclubu@tahminarena.com</strong></p>
      </div>
    `;
    return;
  }
  
  const matches = window.aiMatches || [];
  const topMatches = matches.slice(0, 5);
  
  container.innerHTML = `
    <div class="premium-coupon">
      <h3><i class="fas fa-crown"></i> Premium Kupon</h3>
      ${topMatches.map((m, i) => {
        const analysis = simpleAnalysis(m);
        return `
          <div class="coupon-match">
            <span class="match-num">${i+1}</span>
            <span class="match-teams">${m.teams?.home?.name} vs ${m.teams?.away?.name}</span>
            <span class="match-pick">${analysis.pick}</span>
            <span class="match-odd">@${analysis.odd}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ===== MAÇ KARTI =====
function matchCard(m, isLive) {
  const fixture = m.fixture;
  const teams = m.teams;
  const league = m.league;
  const goals = m.goals;
  
  const matchId = fixture.id;
  const homeTeam = teams.home.name;
  const awayTeam = teams.away.name;
  const leagueName = league.name;
  const leagueFlag = getLeagueFlag(league.country);
  
  const scoreStr = isLive ? `${goals.home ?? 0} - ${goals.away ?? 0}` : '';
  const timeStr = new Date(fixture.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const statusLabel = isLive ? `<span class="match-minute live-dot">${fixture.status.elapsed}'</span>` : '';
  
  const odds1 = '1.80';
  const oddsX = '3.40';
  const odds2 = '4.20';
  
  const matchData = {
    id: matchId,
    home: homeTeam,
    away: awayTeam,
    league: leagueName,
    flag: leagueFlag,
    time: timeStr
  };
  
  const savedPick = getPickForMatch(matchId);
  
  return `
  <div class="match-card" data-id="${matchId}">
    <div class="match-league"><span class="league-flag">${leagueFlag}</span>${leagueName}</div>
    <div class="match-teams">
      <div class="teams">${homeTeam} <span style="color:var(--text-muted)">vs</span> ${awayTeam}</div>
      <div class="match-time">${statusLabel} ${isLive ? scoreStr : timeStr}</div>
    </div>
    ${isLive ? `<div class="match-live-score">${scoreStr}</div>` : ''}
    <div class="match-odds-with-select">
      <button class="odds-select-btn ${savedPick?.selected === '1' ? 'selected' : ''}" 
        data-match-id="${matchId}" data-pick="1"
        onclick='selectPick(${matchId}, "1", "${odds1}", ${JSON.stringify(matchData).replace(/"/g, '&quot;')})'>
        <span class="pick-label">1</span><span class="pick-odd">${odds1}</span>
      </button>
      <button class="odds-select-btn ${savedPick?.selected === 'X' ? 'selected' : ''}" 
        data-match-id="${matchId}" data-pick="X"
        onclick='selectPick(${matchId}, "X", "${oddsX}", ${JSON.stringify(matchData).replace(/"/g, '&quot;')})'>
        <span class="pick-label">X</span><span class="pick-odd">${oddsX}</span>
      </button>
      <button class="odds-select-btn ${savedPick?.selected === '2' ? 'selected' : ''}" 
        data-match-id="${matchId}" data-pick="2"
        onclick='selectPick(${matchId}, "2", "${odds2}", ${JSON.stringify(matchData).replace(/"/g, '&quot;')})'>
        <span class="pick-label">2</span><span class="pick-odd">${odds2}</span>
      </button>
    </div>
    <button class="fav-btn" onclick="toggleFav(${matchId}, this)"><i class="fas fa-star"></i></button>
  </div>`;
}

function getLeagueFlag(country) {
  const flags = {
    'Turkey': '🇹🇷', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Spain': '🇪🇸', 'Germany': '🇩🇪',
    'Italy': '🇮🇹', 'France': '🇫🇷', 'Netherlands': '🇳🇱', 'Portugal': '🇵🇹',
    'Brazil': '🇧🇷', 'USA': '🇺🇸', 'Argentina': '🇦🇷', 'Mexico': '🇲🇽',
    'Japan': '🇯🇵', 'South Korea': '🇰🇷', 'Chile': '🇨🇱', 'Colombia': '🇨🇴'
  };
  return flags[country] || '⚽';
}

// ===== SEÇİMLERİM =====
function renderPicks() {
  const container = document.getElementById('picksMatches');
  const totalEl = document.getElementById('picksTotal');
  
  if (!container) return;
  
  if (userPicks.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-crosshairs"></i><p>Henüz maç seçmediniz.</p></div>`;
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
      <div class="match-teams"><div class="teams">${p.home} <span style="color:var(--text-muted)">vs</span> ${p.away}</div></div>
      <div class="picks-pick-badge"><i class="fas fa-check-circle"></i> ${p.selected} @ ${p.odds}</div>
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

function togglePass(id, el) {
  const inp = document.getElementById(id);
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
  el.innerHTML = inp.type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
}

// ===== GİRİŞ =====
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;
  const errEl = document.getElementById('loginError');
  
  if (!errEl) return;
  
  if (email === ADMIN_EMAIL && pass === 'admin123') {
    localStorage.setItem('oa_session', JSON.stringify({ name: 'Admin', email: ADMIN_EMAIL, isAdmin: true }));
    window.location.href = 'dashboard.html';
    return;
  }
  
  if (email === 'demo@tahminarena.com' && pass === 'demo123') {
    localStorage.setItem('oa_session', JSON.stringify({ name: 'Demo Kullanıcı', email: 'demo@tahminarena.com', isAdmin: false }));
    window.location.href = 'dashboard.html';
    return;
  }
  
  errEl.textContent = 'E-posta veya şifre hatalı!';
}

function logout() {
  localStorage.removeItem('oa_session');
}

// ===== INIT =====
function initDashboard() {
  const session = JSON.parse(localStorage.getItem('oa_session') || 'null');
  if (!session) { window.location.href = 'index.html'; return; }
  
  const nameEl = document.getElementById('dashUserName');
  if (nameEl) nameEl.textContent = session.isAdmin ? '👑 ' + session.name : session.name;
  
  const emailEl = document.getElementById('dashUserEmail');
  if (emailEl) emailEl.textContent = session.email;
  
  loadMatches();
}

// ===== SECTION NAV =====
const SECTIONS = ['live','odds','stats','upcoming','favorites','ai','coupon','compare','picks','premium'];
const TITLES = {
  live:'Canlı Maçlar', odds:'Oran Analizi', stats:'İstatistikler',
  upcoming:'Yaklaşan Maçlar', favorites:'Favorilerim',
  ai:'YZ Tahmin', coupon:'Günlük Kupon', compare:'Oran Karşılaştırma',
  picks:'Seçimlerim', premium:'Premium Kupon'
};

function showSection(key) {
  SECTIONS.forEach(s => {
    const el = document.getElementById('sec-'+s);
    if (el) el.classList.toggle('hidden', s !== key);
  });
  const titleEl = document.getElementById('sectionTitle');
  if (titleEl) titleEl.textContent = TITLES[key] || '';
  document.querySelectorAll('.nav-item').forEach(el => {
    const onclick = el.getAttribute('onclick') || '';
    el.classList.toggle('active', onclick.includes(`'${key}'`));
  });
  if (key === 'picks') renderPicks();
  if (key === 'ai') renderAIPredictions();
  if (key === 'premium') renderPremiumCoupon();
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('dashUserName')) initDashboard();
});
