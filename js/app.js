// ===== TOGGLE PASSWORD =====
function togglePass(id, el) {
  const inp = document.getElementById(id);
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
  el.innerHTML = inp.type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
}

// ===== API CONFIG =====
const API_BASE = 'https://v3.football.api-sports.io';
const API_KEY = 'e8287b49fa0bb657f2b4582bb13a496e';
const ADMIN_EMAIL = 'djclubu@tahminarena.com';

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

// ===== ZAMAN DİLİMİNE GÖRE LİGLER =====
function getActiveLeaguesByTime() {
  const hour = new Date().getHours();
  
  // 14:00 - 00:00: Avrupa + Türkiye
  if (hour >= 14 || hour < 0) {
    return [203, 135, 39, 140, 78]; // Süper Lig, Serie A, Premier, La Liga, Bundesliga
  }
  
  // 00:00 - 14:00: Güney Amerika + Asya
  return [71, 128, 262, 255, 98, 292]; // Brezilya, Arjantin, Meksika, MLS, J-League, K-League
}

// ===== API'DEN MAÇ ÇEK =====
async function loadMatches() {
  const liveEl = document.getElementById('liveMatches');
  const upcomingEl = document.getElementById('upcomingMatches');
  
  if (!liveEl || !upcomingEl) return;
  
  liveEl.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Maçlar yükleniyor...</div>';
  upcomingEl.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Yükleniyor...</div>';
  
  try {
    const today = new Date().toISOString().split('T')[0];
    const activeLeagues = getActiveLeaguesByTime();
    
    // Tüm istekleri paralel yap
    const requests = activeLeagues.map(leagueId => 
      fetch(`${API_BASE}/fixtures?date=${today}&league=${leagueId}&timezone=Europe/Istanbul`, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': API_KEY,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      }).then(r => r.json()).catch(() => ({ response: [] }))
    );
    
    const results = await Promise.all(requests);
    let allMatches = [];
    results.forEach(data => {
      if (data.response) allMatches = allMatches.concat(data.response);
    });
    
    window.currentMatches = allMatches;
    
    // Canlı ve yaklaşan maçları ayır
    const live = allMatches.filter(m => ['1H','HT','2H','ET','P','LIVE'].includes(m.fixture.status.short));
    const upcoming = allMatches.filter(m => ['NS','TBD'].includes(m.fixture.status.short));
    const finished = allMatches.filter(m => ['FT','AET','PEN'].includes(m.fixture.status.short));
    
    if (document.getElementById('liveCount')) {
      document.getElementById('liveCount').textContent = live.length;
    }
    
    if (live.length > 0) {
      liveEl.innerHTML = live.map(m => matchCard(m, true)).join('');
    } else if (finished.length > 0) {
      liveEl.innerHTML = `<div class="api-section-label"><i class="fas fa-flag-checkered"></i> Tamamlanan Maçlar (${finished.length})</div>` 
        + finished.map(m => matchCard(m, false, true)).join('');
    } else {
      liveEl.innerHTML = '<div class="empty-state"><i class="fas fa-circle"></i><p>Şu an canlı maç yok.</p></div>';
    }
    
    if (upcoming.length > 0) {
      upcomingEl.innerHTML = `<div class="match-count-bar"><i class="fas fa-calendar-alt"></i> Bugün ${upcoming.length} maç</div>`
        + upcoming.map(m => matchCard(m, false)).join('');
    } else {
      upcomingEl.innerHTML = '<div class="empty-state"><i class="fas fa-calendar"></i><p>Yaklaşan maç yok.</p></div>';
    }
    
    updatePickButtons();
    updatePicksBadge();
    
  } catch (err) {
    liveEl.innerHTML = `<div class="empty-state error-state"><i class="fas fa-exclamation-triangle"></i><p>${err.message}</p></div>`;
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
  
  let scoreStr = '-';
  if (isLive || isFinished) {
    scoreStr = `${goals.home ?? 0} - ${goals.away ?? 0}`;
  }
  
  const matchDate = new Date(fixture.date);
  const timeStr = matchDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  
  const statusLabel = isFinished ? '<span class="match-finished">Bitti</span>'
    : isLive ? `<span class="match-minute live-dot">${fixture.status.elapsed}'</span>` : '';
  
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
      <div class="match-time">${statusLabel} ${isLive || isFinished ? '' : timeStr}</div>
    </div>
    ${isLive || isFinished ? `<div class="match-live-score">${scoreStr}</div>` : ''}
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
    'Japan': '🇯🇵', 'South Korea': '🇰🇷'
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

// ===== GİRİŞ (DEMO + ADMIN) =====
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
  
  const users = JSON.parse(localStorage.getItem('oa_users') || '[]');
  const user = users.find(u => u.email === email && u.pass === btoa(pass));
  
  if (!user) { 
    errEl.textContent = 'E-posta veya şifre hatalı!'; 
    return; 
  }
  
  errEl.textContent = '';
  localStorage.setItem('oa_session', JSON.stringify({ name: user.name, email: user.email, isAdmin: false }));
  window.location.href = 'dashboard.html';
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass = document.getElementById('regPass').value;
  const pass2 = document.getElementById('regPass2').value;
  const errEl = document.getElementById('regError');
  const sucEl = document.getElementById('regSuccess');
  
  if (pass.length < 6) { errEl.textContent = 'Şifre en az 6 karakter!'; return; }
  if (pass !== pass2) { errEl.textContent = 'Şifreler eşleşmiyor!'; return; }
  
  const users = JSON.parse(localStorage.getItem('oa_users') || '[]');
  if (users.find(u => u.email === email)) { errEl.textContent = 'Bu e-posta zaten kayıtlı!'; return; }
  
  errEl.textContent = '';
  users.push({ name, email, pass: btoa(pass) });
  localStorage.setItem('oa_users', JSON.stringify(users));
  
  sucEl.textContent = 'Kayıt başarılı! Yönlendiriliyorsunuz...';
  setTimeout(() => {
    localStorage.setItem('oa_session', JSON.stringify({ name, email, isAdmin: false }));
    window.location.href = 'dashboard.html';
  }, 1500);
}

function logout() {
  localStorage.removeItem('oa_session');
}

function initDashboard() {
  const session = JSON.parse(localStorage.getItem('oa_session') || 'null');
  if (!session) { window.location.href = 'index.html'; return; }
  
  const nameEl = document.getElementById('dashUserName');
  const emailEl = document.getElementById('dashUserEmail');
  
  if (nameEl) {
    nameEl.textContent = session.isAdmin ? '👑 ' + session.name : session.name;
  }
  if (emailEl) emailEl.textContent = session.email;
  
  if (session.isAdmin) {
    showAdminFeatures();
  }
  
  startClock();
  loadMatches();
}

function showAdminFeatures() {
  console.log('Admin girişi yapıldı');
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
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('dashUserName')) initDashboard();
});
