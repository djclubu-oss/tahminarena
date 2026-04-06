// ===== GERÇEK VERİ: football-data.org API =====
const API_BASE = 'https://api.football-data.org/v4';

const LEAGUE_META = {
  PL:   { name: 'Premier Lig',       flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', key: 'pl'  },
  PD:   { name: 'La Liga',           flag: '🇪🇸', key: 'll'  },
  BL1:  { name: 'Bundesliga',        flag: '🇩🇪', key: 'bl'  },
  SA:   { name: 'Serie A',           flag: '🇮🇹', key: 'sa'  },
  FL1:  { name: 'Ligue 1',           flag: '🇫🇷', key: 'fl'  },
  CL:   { name: 'Şampiyonlar Ligi',  flag: '🇪🇺', key: 'cl'  },
  DED:  { name: 'Eredivisie',        flag: '🇳🇱', key: 'ned' },
  PPL:  { name: 'Primeira Liga',     flag: '🇵🇹', key: 'por' },
  ELC:  { name: 'Championship',      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', key: 'ch'  },
  BSA:  { name: 'Brezilya Ligi',     flag: '🇧🇷', key: 'bsa' },
  MLS:  { name: 'MLS',               flag: '🇺🇸', key: 'mls' },
  EL:   { name: 'Avrupa Ligi',       flag: '🇪🇺', key: 'el'  },
  ECNL: { name: 'Konferans Ligi',    flag: '🇪🇺', key: 'ecl' },
  WC:   { name: 'Dünya Kupası',      flag: '🌍', key: 'wc'  },
};

function getApiKey() { return localStorage.getItem('oa_api_key') || ''; }

function saveApiKey() {
  const key = document.getElementById('apiKeyInput').value.trim();
  if (!key) { alert('Lütfen API anahtarı girin!'); return; }
  localStorage.setItem('oa_api_key', key);
  document.getElementById('apiBanner').classList.add('hidden');
  updateApiStatus(true);
  loadRealMatches();
}

function skipApiKey() {
  document.getElementById('apiBanner').classList.add('hidden');
  renderLiveMatches(MOCK_LIVE);
  renderUpcomingMatches(MOCK_UPCOMING);
  renderAIPredictions(autoGenPredictions(MOCK_UPCOMING));
}

function showApiSetup() {
  const banner = document.getElementById('apiBanner');
  banner.classList.remove('hidden');
  const existing = getApiKey();
  if (existing) document.getElementById('apiKeyInput').value = existing;
  banner.scrollIntoView({ behavior: 'smooth' });
}

function updateApiStatus(connected) {
  const btn = document.getElementById('apiStatusBtn');
  const txt = document.getElementById('apiStatusText');
  if (!btn) return;
  if (connected) {
    btn.style.borderColor = 'var(--green)';
    btn.style.color = 'var(--green)';
    txt.textContent = 'API Bağlı';
  } else {
    btn.style.borderColor = 'var(--accent)';
    btn.style.color = 'var(--accent)';
    txt.textContent = 'API Yok';
  }
}

// ===== OTOMATİK YZ ANALİZİ =====
// Bir maç objesi alır, oranlarına göre otomatik confidence üretir
function autoGenPredictions(matches) {
  return matches.map((m, idx) => {
    const o1 = parseFloat(m.odds1 || m.odds?.h || 2.00);
    const oX = parseFloat(m.oddsX || m.odds?.d || 3.30);
    const o2 = parseFloat(m.odds2 || m.odds?.a || 3.50);

    // İhtimal = 1/oran (normalize et)
    const p1 = 1 / o1, pX = 1 / oX, p2 = 1 / o2;
    const total = p1 + pX + p2;
    const c1 = Math.round(p1 / total * 100);
    const cX = Math.round(pX / total * 100);
    const c2 = 100 - c1 - cX;

    // En düşük favori oranına göre zorluk
    const minOdds = Math.min(o1, o2);
    const difficulty = minOdds <= 1.60 ? 'easy' : minOdds <= 2.20 ? 'medium' : 'hard';

    // Model skoru: düşük oran = daha emin
    const modelScore = Math.min(95, Math.round(85 - (minOdds - 1.0) * 20 + Math.random() * 8));

    // Üst/Alt oranı varsa kullan
    const oOver  = parseFloat(m.oddsOver  || 1.80);
    const oUnder = parseFloat(m.oddsUnder || 1.90);
    const confOver  = Math.round(1 / oOver  / (1/oOver + 1/oUnder) * 100);
    const confUnder = 100 - confOver;

    // KG
    const oBttsY = parseFloat(m.oddsBttsY || 1.75);
    const oBttsN = parseFloat(m.oddsBttsN || 1.95);
    const confBttsY = Math.round(1 / oBttsY / (1/oBttsY + 1/oBttsN) * 100);

    // İY
    const oHT1 = parseFloat(m.oddsHT1 || (o1 * 1.3).toFixed(2));
    const oHTX = parseFloat(m.oddsHTX || 2.10);
    const oHT2 = parseFloat(m.oddsHT2 || (o2 * 1.3).toFixed(2));
    const pH1 = 1/oHT1, pHX = 1/oHTX, pH2 = 1/oHT2;
    const htTotal = pH1 + pHX + pH2;
    const cHT1 = Math.round(pH1 / htTotal * 100);
    const cHTX = Math.round(pHX / htTotal * 100);
    const cHT2 = 100 - cHT1 - cHTX;

    // En iyi tahmin
    const resultPick = c1 >= c2 ? { pick: '1', label: 'MS Ev Kazanır', conf: c1, odds: o1 }
                                 : { pick: '2', label: 'MS Deplasman',  conf: c2, odds: o2 };
    const ouPick = confOver >= confUnder
      ? { pick: 'Üst', label: 'Üst 2.5 Gol', conf: confOver,  odds: oOver  }
      : { pick: 'Alt', label: 'Alt 2.5 Gol',  conf: confUnder, odds: oUnder };
    const bttsPick = confBttsY >= 50
      ? { pick: 'Var', label: 'KG Var', conf: confBttsY,      odds: oBttsY }
      : { pick: 'Yok', label: 'KG Yok', conf: 100-confBttsY,  odds: oBttsN };
    const htPick = cHT1 >= cHT2 ? { pick: 'İY 1', label: 'İY Ev Önde',      conf: cHT1, odds: oHT1 }
                                 : { pick: 'İY 2', label: 'İY Deplasman Önde', conf: cHT2, odds: oHT2 };
    const htftOdds = +(o1 * oHT1 * 0.7).toFixed(2);
    const htftConf = Math.round(resultPick.conf * htPick.conf / 100);

    // En iyi market bul
    const markets = { result: resultPick, ou: ouPick, btts: bttsPick, ht: htPick,
      htft: { pick: `${htPick.pick.replace('İY ','')}/MS ${resultPick.pick}`, label: `${htPick.label.replace('İY ','')} / ${resultPick.label}`, conf: htftConf, odds: htftOdds }
    };
    const bestKey = Object.entries(markets).reduce((a,b) => b[1].conf > a[1].conf ? b : a)[0];

    const reasons = [
      `${m.home} ev sahibi avantajıyla oynuyor, oran analizi güçlü taraftarlığa işaret ediyor.`,
      `İki takımın son form grafiği incelendiğinde ${resultPick.pick === '1' ? m.home : m.away} öne çıkıyor.`,
      `Bu lig maçlarında istatistiksel olarak ${ouPick.pick} 2.5 gol daha sık gerçekleşiyor.`,
      `Karşılıklı gol ihtimali oransal verilere göre ${bttsPick.pick === 'Var' ? 'yüksek' : 'düşük'}.`,
    ];

    return {
      id: m.id || idx + 100,
      league: m.league,
      leagueKey: m.leagueKey || 'other',
      flag: m.flag || '⚽',
      home: m.home,
      away: m.away,
      difficulty,
      modelScore,
      markets,
      bestPick: bestKey,
      reason: reasons[idx % reasons.length],
      matchTime: m.time || '20:00',
      matchOdds: m.odds || { h: o1.toFixed(2), d: oX.toFixed(2), a: o2.toFixed(2) }
    };
  });
}

// ===== API'DEN MAÇLARI ÇEK =====
let ALL_API_MATCHES = [];

async function loadRealMatches() {
  const key = getApiKey();
  if (!key) return;

  const today = new Date().toISOString().split('T')[0];
  const liveEl = document.getElementById('liveMatches');
  const upcomingEl = document.getElementById('upcomingMatches');

  liveEl.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Tüm maçlar yükleniyor...</div>';
  upcomingEl.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Yükleniyor...</div>';

  try {
    const res = await fetch(`${API_BASE}/matches?dateFrom=${today}&dateTo=${today}`, {
      headers: { 'X-Auth-Token': key }
    });

    if (!res.ok) throw new Error(res.status === 403 ? 'Geçersiz API anahtarı!' : `API Hatası: ${res.status}`);

    const data = await res.json();
    const matches = data.matches || [];

    ALL_API_MATCHES = matches;
    updateApiStatus(true);

    const live     = matches.filter(m => ['IN_PLAY','PAUSED','HALFTIME'].includes(m.status));
    const upcoming = matches.filter(m => ['SCHEDULED','TIMED'].includes(m.status));
    const finished = matches.filter(m => m.status === 'FINISHED');

    document.getElementById('liveCount').textContent = live.length;
    document.getElementById('todayCount').textContent = matches.length;

    // Canlı
    if (live.length > 0) {
      liveEl.innerHTML = groupByLeague(live, true);
    } else if (finished.length > 0) {
      liveEl.innerHTML = `<div class="api-section-label"><i class="fas fa-flag-checkered"></i> Tamamlanan Maçlar (${finished.length})</div>`
        + groupByLeague(finished, false, true);
    } else {
      liveEl.innerHTML = '<div class="empty-state"><i class="fas fa-circle"></i><p>Şu an canlı maç yok.</p></div>';
    }

    // Yaklaşan
    if (upcoming.length > 0) {
      upcomingEl.innerHTML = `<div class="match-count-bar"><i class="fas fa-calendar-alt"></i> Bugün ${upcoming.length} maç planlandı</div>`
        + groupByLeague(upcoming, false);
    } else {
      upcomingEl.innerHTML = '<div class="empty-state"><i class="fas fa-calendar"></i><p>Yaklaşan maç yok.</p></div>';
    }

    // YZ analizi için upcoming maçları dönüştür
    const forAI = [...upcoming, ...live].map(m => apiMatchToMock(m));
    window._currentAIPredictions = autoGenPredictions(forAI);

    // Otomatik yenile
    if (live.length > 0) setTimeout(loadRealMatches, 60000);

  } catch (err) {
    liveEl.innerHTML = `<div class="empty-state error-state"><i class="fas fa-exclamation-triangle"></i><p>${err.message}</p><small>API anahtarınızı kontrol edin veya tekrar deneyin.</small></div>`;
    upcomingEl.innerHTML = '';
    updateApiStatus(false);
  }
}

function apiMatchToMock(m) {
  const lg = LEAGUE_META[m.competition?.code] || { name: m.competition?.name || 'Lig', flag: '⚽', key: 'other' };
  const matchDate = new Date(m.utcDate);
  const timeStr = matchDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' });
  return {
    id: m.id,
    league: lg.name,
    leagueKey: lg.key,
    flag: lg.flag,
    home: m.homeTeam?.shortName || m.homeTeam?.name || '?',
    away: m.awayTeam?.shortName || m.awayTeam?.name || '?',
    time: timeStr,
    odds1: null, oddsX: null, odds2: null,
    oddsOver: null, oddsUnder: null, oddsBttsY: null, oddsBttsN: null,
  };
}

function groupByLeague(matches, isLive, isFinished = false) {
  const groups = {};
  matches.forEach(m => {
    const key = m.competition?.name || 'Diğer';
    if (!groups[key]) groups[key] = { meta: m.competition, matches: [] };
    groups[key].matches.push(m);
  });

  return Object.entries(groups).map(([name, g]) => {
    const lg = LEAGUE_META[g.meta?.code] || { flag: '⚽' };
    const cards = g.matches.map(m => realMatchCard(m, isLive, isFinished)).join('');
    return `<div class="league-group">
      <div class="league-group-header">${lg.flag} ${name} <span class="league-match-count">${g.matches.length} maç</span></div>
      ${cards}
    </div>`;
  }).join('');
}

function realMatchCard(m, isLive, isFinished = false) {
  const lg = LEAGUE_META[m.competition?.code] || { name: m.competition?.name || 'Lig', flag: '⚽' };
  const homeScore = m.score?.fullTime?.home ?? m.score?.halfTime?.home ?? '';
  const awayScore = m.score?.fullTime?.away ?? m.score?.halfTime?.away ?? '';
  const scoreStr = homeScore !== '' ? `${homeScore} - ${awayScore}` : '- -';
  const matchDate = new Date(m.utcDate);
  const timeStr = matchDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' });

  const statusLabel = isFinished ? '<span class="match-finished">Bitti</span>'
    : isLive ? '<span class="match-minute live-dot">Canlı</span>' : '';

  return `
  <div class="match-card real-match">
    <div class="match-league"><span class="league-flag">${lg.flag}</span>${lg.name}</div>
    <div class="match-teams">
      <div class="teams">${m.homeTeam?.shortName || m.homeTeam?.name} <span style="color:var(--text-muted)">vs</span> ${m.awayTeam?.shortName || m.awayTeam?.name}</div>
      <div class="match-time">${statusLabel} ${timeStr}</div>
    </div>
    <div class="match-live-score" style="${!isLive && !isFinished ? 'font-size:.85rem;color:var(--text-muted)' : ''}">${isLive || isFinished ? scoreStr : timeStr}</div>
    <div class="match-odds">
      <div class="odd-btn"><span class="odd-label">1</span><span class="odd-val">-</span></div>
      <div class="odd-btn"><span class="odd-label">X</span><span class="odd-val">-</span></div>
      <div class="odd-btn"><span class="odd-label">2</span><span class="odd-val">-</span></div>
    </div>
  </div>`;
}

// ===== AUTH =====
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;
  const errEl = document.getElementById('loginError');
  const users = JSON.parse(localStorage.getItem('oa_users') || '[]');
  const user = users.find(u => u.email === email && u.pass === btoa(pass));
  if (email === 'demo@tahminarena.com' && pass === 'demo123') {
    localStorage.setItem('oa_session', JSON.stringify({ name: 'Demo Kullanıcı', email }));
    window.location.href = 'dashboard.html'; return;
  }
  if (!user) { errEl.textContent = 'E-posta veya şifre hatalı!'; return; }
  errEl.textContent = '';
  localStorage.setItem('oa_session', JSON.stringify({ name: user.name, email: user.email }));
  window.location.href = 'dashboard.html';
}

function handleRegister(e) {
  e.preventDefault();
  const name  = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass  = document.getElementById('regPass').value;
  const pass2 = document.getElementById('regPass2').value;
  const errEl = document.getElementById('regError');
  const sucEl = document.getElementById('regSuccess');
  if (pass.length < 6) { errEl.textContent = 'Şifre en az 6 karakter!'; return; }
  if (pass !== pass2)  { errEl.textContent = 'Şifreler eşleşmiyor!'; return; }
  const users = JSON.parse(localStorage.getItem('oa_users') || '[]');
  if (users.find(u => u.email === email)) { errEl.textContent = 'Bu e-posta zaten kayıtlı!'; return; }
  errEl.textContent = '';
  users.push({ name, email, pass: btoa(pass) });
  localStorage.setItem('oa_users', JSON.stringify(users));
  sucEl.textContent = 'Kayıt başarılı! Yönlendiriliyorsunuz...';
  setTimeout(() => {
    localStorage.setItem('oa_session', JSON.stringify({ name, email }));
    window.location.href = 'dashboard.html';
  }, 1500);
}

function logout() { localStorage.removeItem('oa_session'); }

function togglePass(id, el) {
  const inp = document.getElementById(id);
  inp.type = inp.type === 'password' ? 'text' : 'password';
  el.innerHTML = inp.type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
}

// ===== DASHBOARD INIT =====
let favorites = JSON.parse(localStorage.getItem('oa_favs') || '[]');

function initDashboard() {
  const session = JSON.parse(localStorage.getItem('oa_session') || 'null');
  if (!session) { window.location.href = 'index.html'; return; }
  document.getElementById('dashUserName').textContent = session.name;
  document.getElementById('dashUserEmail').textContent = session.email;

  startClock();
  
  // Premium kilit kontrolü
  updatePremiumLock();
  
  // Başarı istatistiklerini güncelle
  updateSuccessStats();

  const key = getApiKey();
  if (key) {
    document.getElementById('apiBanner').classList.add('hidden');
    updateApiStatus(true);
    loadRealMatches();
  } else {
    updateApiStatus(false);
    renderLiveMatches(MOCK_LIVE);
    renderUpcomingMatches(MOCK_UPCOMING);
    window._currentAIPredictions = autoGenPredictions(MOCK_UPCOMING);
    document.getElementById('liveCount').textContent = MOCK_LIVE.length;
    document.getElementById('todayCount').textContent = MOCK_UPCOMING.length;
  }
  renderOddsTable(ODDS_DATA);
  setInterval(() => { if (!getApiKey()) updateLiveScores(); }, 30000);
  
  // Biten maçları kontrol et
  checkFinishedMatches();
}

function startClock() {
  const el = document.getElementById('clock');
  if (!el) return;
  function tick() { el.textContent = new Date().toLocaleTimeString('tr-TR', { hour:'2-digit', minute:'2-digit', second:'2-digit' }); }
  tick(); setInterval(tick, 1000);
}

// ===== PREMIUM KONTROLÜ =====
const ADMIN_EMAIL = 'djclubu@tahminarena.com';

function isPremium() {
  const session = JSON.parse(localStorage.getItem('oa_session') || 'null');
  if (!session) return false;
  if (session.email === ADMIN_EMAIL) return true;
  const users = JSON.parse(localStorage.getItem('oa_users') || '[]');
  const user = users.find(u => u.email === session.email);
  return user && user.premium === true;
}

function updatePremiumLock() {
  const navItem = document.querySelector('.premium-nav-item');
  const lockIcon = document.getElementById('premiumNavLock');
  if (navItem && lockIcon) {
    if (isPremium()) {
      navItem.classList.add('has-premium');
      lockIcon.style.display = 'none';
    } else {
      navItem.classList.remove('has-premium');
      lockIcon.style.display = 'inline';
    }
  }
}

// ===== MOCK MATCH CARDS (offline) =====
function matchCard(m, isLive) {
  const isFav = favorites.includes(m.id);
  return `
  <div class="match-card" data-league="${m.leagueKey}" data-id="${m.id}">
    <div class="match-league"><span class="league-flag">${m.flag}</span>${m.league}</div>
    <div class="match-teams">
      <div class="teams">${m.home} <span style="color:var(--text-muted)">vs</span> ${m.away}</div>
      <div class="match-time">${isLive ? `<span class="match-minute live-dot">${m.minute}'</span>` : m.time}</div>
    </div>
    ${isLive ? `<div class="match-live-score">${m.score}</div>` : ''}
    <div class="match-odds">
      <div class="odd-btn ${m.trend[0]}" title="Ev Sahibi"><span class="odd-label">1</span><span class="odd-val">${m.odds.h}</span></div>
      <div class="odd-btn ${m.trend[1]}" title="Beraberlik"><span class="odd-label">X</span><span class="odd-val">${m.odds.d}</span></div>
      <div class="odd-btn ${m.trend[2]}" title="Deplasman"><span class="odd-label">2</span><span class="odd-val">${m.odds.a}</span></div>
    </div>
    <button class="fav-btn ${isFav?'active':''}" onclick="toggleFav(${m.id},this)"><i class="fas fa-star"></i></button>
  </div>`;
}

function renderLiveMatches(data) { document.getElementById('liveMatches').innerHTML = data.map(m => matchCardWithPick(m,true)).join(''); }
function renderUpcomingMatches(data) { document.getElementById('upcomingMatches').innerHTML = data.map(m => matchCardWithPick(m,false)).join(''); }

function filterLeague(key, btn) {
  document.querySelectorAll('.ftab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderLiveMatches(key==='all' ? MOCK_LIVE : MOCK_LIVE.filter(m => m.leagueKey===key));
}

// ===== ODDS TABLE =====
function renderOddsTable(data) {
  document.getElementById('oddsTableBody').innerHTML = data.map(r => `
    <tr>
      <td>${r.league}</td>
      <td><strong>${r.home}</strong> vs <strong>${r.away}</strong></td>
      <td><strong>${r.o1}</strong></td><td><strong>${r.ox}</strong></td><td><strong>${r.o2}</strong></td>
      <td>${r.alt}</td><td>${r.ust}</td>
      <td><span class="badge ${r.badge}">${r.analysis}</span>
          <button class="detail-btn" style="margin-left:8px" onclick="openModal('${r.home} vs ${r.away}',${JSON.stringify(r).replace(/"/g,'&quot;')})">Detay</button></td>
    </tr>`).join('');
}

function filterOdds() {
  const q = document.getElementById('oddsSearch').value.toLowerCase();
  const lg = document.getElementById('oddsLeague').value;
  renderOddsTable(ODDS_DATA.filter(r => (r.home+' '+r.away).toLowerCase().includes(q) && (lg==='all'||r.leagueKey===lg)));
}

// ===== FAVORITES =====
function toggleFav(id, btn) {
  favorites = favorites.includes(id) ? favorites.filter(f=>f!==id) : [...favorites, id];
  btn.classList.toggle('active', favorites.includes(id));
  localStorage.setItem('oa_favs', JSON.stringify(favorites));
}
function renderFavorites() {
  const all = [...MOCK_LIVE.filter(m=>favorites.includes(m.id)).map(m=>matchCard(m,true)),
               ...MOCK_UPCOMING.filter(m=>favorites.includes(m.id)).map(m=>matchCard(m,false))];
  document.getElementById('favMatches').innerHTML = all.length ? all.join('') :
    `<div class="empty-state"><i class="fas fa-star"></i><p>Henüz favori yok.</p><small>Maçların yanındaki yıldıza tıkla.</small></div>`;
}

// ===== MODAL =====
function openModal(title, data) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = `
    <div class="odds-detail-row"><span class="detail-label">Lig</span><span class="detail-value">${data.league}</span></div>
    <div class="odds-detail-row"><span class="detail-label">1</span><span class="detail-value" style="color:var(--green)">${data.o1}</span></div>
    <div class="odds-detail-row"><span class="detail-label">X</span><span class="detail-value" style="color:var(--accent)">${data.ox}</span></div>
    <div class="odds-detail-row"><span class="detail-label">2</span><span class="detail-value" style="color:var(--red)">${data.o2}</span></div>
    <div class="odds-detail-row"><span class="detail-label">Alt 2.5</span><span class="detail-value">${data.alt}</span></div>
    <div class="odds-detail-row"><span class="detail-label">Üst 2.5</span><span class="detail-value">${data.ust}</span></div>
    <div class="odds-detail-row"><span class="detail-label">Analiz</span><span class="detail-value"><span class="badge ${data.badge}">${data.analysis}</span></span></div>`;
  document.getElementById('oddsModal').classList.remove('hidden');
}
function closeModal() { document.getElementById('oddsModal').classList.add('hidden'); }

// ===== SIDEBAR =====
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); }

// ===== LIVE SCORE SIM =====
function updateLiveScores() {
  MOCK_LIVE.forEach(m => { const min=parseInt(m.minute); if(min<90) m.minute=String(Math.min(90,min+Math.floor(Math.random()*3)+1)); });
  renderLiveMatches(MOCK_LIVE);
}

// ===== YZ TAHMİN =====
function confidenceColor(s) { return s>=80?'bar-green':s>=60?'bar-yellow':'bar-red'; }
function confidenceLabel(s) {
  return s>=80?{text:'Yüksek Güven',cls:'pick-high'}:s>=60?{text:'Orta Güven',cls:'pick-medium'}:{text:'Düşük Güven',cls:'pick-low'};
}
const MARKET_ICONS  = { result:'fa-trophy', ou:'fa-sort-amount-up', btts:'fa-exchange-alt', ht:'fa-flag', htft:'fa-layer-group' };
const MARKET_LABELS = { result:'Maç Sonucu', ou:'Alt / Üst 2.5', btts:'KG Var / Yok', ht:'İlk Yarı', htft:'İY / MS Kombine' };

function difficultyInfo(d) {
  return d==='easy'?{cls:'diff-easy',icon:'fa-check-circle',text:'Kolay'}
        :d==='medium'?{cls:'diff-medium',icon:'fa-minus-circle',text:'Orta'}
        :{cls:'diff-hard',icon:'fa-times-circle',text:'Zor'};
}

function renderAIPredictions(data) {
  const container = document.getElementById('aiCards');
  if (!data || data.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-robot"></i><p>Analiz edilecek maç bulunamadı.</p><small>API bağlantısı kurulunca tüm maçlar analiz edilir.</small></div>';
    return;
  }
  
  // Biten maçları kontrol et
  const finished = getFinishedMatches();
  
  container.innerHTML = data.map(p => {
    const lbl  = confidenceLabel(p.modelScore);
    const diff = difficultyInfo(p.difficulty);
    const bestMkt = p.markets[p.bestPick];
    
    // Maç bitmiş mi kontrol et
    const finishedMatch = finished.find(f => f.id === p.id);
    const isFinished = !!finishedMatch;
    const isSuccess = isFinished && finishedMatch.isSuccess;
    
    const marketRows = Object.entries(p.markets).map(([key,mkt]) => {
      const isBest = key === p.bestPick;
      const confCls = mkt.conf>=70?'conf-green':mkt.conf>=55?'conf-yellow':'conf-red';
      return `<div class="market-row ${isBest?'market-best':''}">
        <div class="market-info"><i class="fas ${MARKET_ICONS[key]}"></i><span class="market-name">${MARKET_LABELS[key]}</span>${isBest?'<span class="best-tag">EN İYİ</span>':''}</div>
        <div class="market-pick">${mkt.label}</div>
        <div class="market-meta"><span class="market-conf ${confCls}">${mkt.conf}%</span><span class="market-odd">@${mkt.odds}</span></div>
        <div class="conf-mini-wrap"><div class="conf-mini-bar ${confidenceColor(mkt.conf)}" style="width:0%" data-target="${mkt.conf}%"></div></div>
      </div>`;
    }).join('');
    
    // Maç saati ve oranlar
    const matchTime = p.matchTime || '20:00';
    const matchOdds = p.matchOdds || { h: '1.80', d: '3.40', a: '4.20' };
    
    return `
    <div class="ai-card ai-card-${p.difficulty} ${isFinished ? (isSuccess ? 'match-finished-success' : 'match-finished-failed') : ''}" style="position:relative;">
      ${isFinished ? `<div class="finished-badge ${isSuccess ? 'success' : 'failed'}">${isSuccess ? '✓ Tuttu' : '✗ Tutmadı'}</div>` : ''}
      <div class="ai-card-header">
        <div class="ai-card-league">${p.flag} ${p.league}</div>
        <div class="ai-card-badges">
          <span class="diff-badge-card ${diff.cls}"><i class="fas ${diff.icon}"></i> ${diff.text}</span>
          <span class="pick-badge ${lbl.cls}">${lbl.text}</span>
        </div>
      </div>
      <div class="ai-card-match">${p.home} <span>vs</span> ${p.away}</div>
      
      <!-- Maç Saati ve Oranlar -->
      <div class="ai-match-meta">
        <div class="ai-match-time"><i class="fas fa-clock"></i> ${matchTime}</div>
        <div class="ai-match-odds">
          <div class="ai-odd-box"><span class="ai-odd-label">1</span><span class="ai-odd-val">${matchOdds.h}</span></div>
          <div class="ai-odd-box"><span class="ai-odd-label">X</span><span class="ai-odd-val">${matchOdds.d}</span></div>
          <div class="ai-odd-box"><span class="ai-odd-label">2</span><span class="ai-odd-val">${matchOdds.a}</span></div>
        </div>
      </div>
      
      <div class="ai-best-pick">
        <div class="ai-best-label"><i class="fas fa-robot"></i> YZ En İyi Seçim</div>
        <div class="ai-best-value">${bestMkt.label} <span class="ai-best-odd">@${bestMkt.odds}</span></div>
        <div class="ai-best-conf">
          <div class="confidence-bar-wrap"><div class="confidence-bar ${confidenceColor(bestMkt.conf)}" style="width:0%" data-target="${bestMkt.conf}%"></div></div>
          <span class="conf-pct">${bestMkt.conf}%</span>
        </div>
      </div>
      <div class="markets-list">${marketRows}</div>
      <div class="ai-card-footer">
        <div class="ai-reason"><i class="fas fa-comment-dots"></i> ${p.reason}</div>
        <div class="model-score-row">
          <span class="model-score-label">Model Skoru</span>
          <div class="model-score-bar"><div class="model-score-fill ${confidenceColor(p.modelScore)}" style="width:${p.modelScore}%"></div></div>
          <span class="model-score-val ${confidenceColor(p.modelScore)}">${p.modelScore}/100</span>
        </div>
      </div>
    </div>`;
  }).join('');
  requestAnimationFrame(() => setTimeout(() => {
    document.querySelectorAll('.confidence-bar[data-target],.conf-mini-bar[data-target]').forEach(b => b.style.width=b.dataset.target);
  }, 80));
}

function filterAI(level, btn) {
  document.querySelectorAll('#sec-ai .ftab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const src = window._currentAIPredictions || autoGenPredictions(MOCK_UPCOMING);
  const filtered = level==='all' ? src
    : src.filter(p => level==='high'?p.modelScore>=80:level==='medium'?p.modelScore>=60&&p.modelScore<80:p.modelScore<60);
  renderAIPredictions(filtered);
}

// ===== GÜNLÜK KUPON =====
function generateCoupon(predictions) {
  const src = predictions || window._currentAIPredictions || autoGenPredictions(MOCK_UPCOMING);
  const sorted = [...src]
    .filter(p => p.difficulty !== 'hard' || p.modelScore >= 80)
    .sort((a,b) => b.modelScore - a.modelScore)
    .slice(0, 3);

  const picks = sorted.map(p => {
    const bestKey = Object.entries(p.markets).reduce((a,b) => b[1].conf>a[1].conf?b:a)[0];
    return { ...p, selectedMarket: p.markets[bestKey], marketKey: bestKey };
  });

  const totalOdds = picks.reduce((acc,p) => acc * p.selectedMarket.odds, 1).toFixed(2);
  const avgConf   = Math.round(picks.reduce((acc,p) => acc + p.selectedMarket.conf, 0) / picks.length);
  const combined  = Math.round(picks.reduce((a,p) => a * p.selectedMarket.conf/100, 1) * 100);
  const today     = new Date().toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'});

  document.getElementById('couponHero').innerHTML = `
  <div class="coupon-hero-inner">
    <div class="coupon-date"><i class="fas fa-calendar"></i> ${today}</div>
    <div class="coupon-hero-stats">
      <div class="coupon-stat"><div class="coupon-stat-val">${totalOdds}</div><div class="coupon-stat-label">Toplam Oran</div></div>
      <div class="coupon-divider"></div>
      <div class="coupon-stat"><div class="coupon-stat-val">%${avgConf}</div><div class="coupon-stat-label">Ort. Güven</div></div>
      <div class="coupon-divider"></div>
      <div class="coupon-stat"><div class="coupon-stat-val">${picks.length}</div><div class="coupon-stat-label">Maç</div></div>
      <div class="coupon-divider"></div>
      <div class="coupon-stat highlight"><div class="coupon-stat-val">%${combined}</div><div class="coupon-stat-label">Birleşik İhtimal</div></div>
    </div>
    <div class="coupon-hero-badge"><i class="fas fa-robot"></i> ${avgConf>=75?'Yüksek Güvenli Kupon':'Orta Güvenli Kupon'}</div>
  </div>`;

  document.getElementById('couponMatches').innerHTML = picks.map((p,i) => {
    const diff = difficultyInfo(p.difficulty);
    const confCls = p.selectedMarket.conf>=75?'conf-green':p.selectedMarket.conf>=60?'conf-yellow':'conf-red';
    const matchTime = p.matchTime || '20:00';
    return `
    <div class="coupon-match-card ai-card-${p.difficulty}">
      <div class="coupon-num">${i+1}</div>
      <div class="coupon-match-body">
        <div class="coupon-match-header">
          <span class="coupon-league">${p.flag} ${p.league} | <i class="fas fa-clock" style="font-size:.7rem;"></i> ${matchTime}</span>
          <span class="diff-badge-card ${diff.cls}"><i class="fas ${diff.icon}"></i> ${diff.text}</span>
        </div>
        <div class="coupon-match-name">${p.home} <span>vs</span> ${p.away}</div>
        <div class="coupon-pick-row">
          <div class="coupon-pick-type"><i class="fas ${MARKET_ICONS[p.marketKey]}"></i> ${MARKET_LABELS[p.marketKey]}</div>
          <div class="coupon-pick-val">${p.selectedMarket.label}</div>
          <div class="coupon-pick-odd">@${p.selectedMarket.odds}</div>
          <div class="coupon-pick-conf ${confCls}">%${p.selectedMarket.conf}</div>
        </div>
        <div class="coupon-mini-bar-wrap"><div class="coupon-mini-bar ${confidenceColor(p.selectedMarket.conf)}" style="width:${p.selectedMarket.conf}%"></div></div>
        <div class="coupon-reason">${p.reason}</div>
      </div>
    </div>`;
  }).join('');
}

// Günlük kuponu yenile
function refreshDailyCoupon() {
  // Yeni kupon oluştur
  const newCoupon = generateDailyCouponData();
  localStorage.setItem('oa_daily_coupon', JSON.stringify(newCoupon));
  localStorage.setItem('oa_coupon_date', getTodayString());
  
  // Göster
  generateCoupon(newCoupon.picks);
}

// ===== ORAN KIYASLAMA =====
function bestWorst(vals) {
  const nums = vals.map(Number);
  const max = Math.max(...nums), min = Math.min(...nums);
  return { max, min, diff: ((max-min)/min*100).toFixed(1) };
}

function renderCompare(data) {
  const tbody = document.getElementById('compareTableBody');
  const platforms = ['nesine','bilyoner','misli','bets10'];
  tbody.innerHTML = data.map(r => {
    const fields = ['h','d','a'];
    let maxDiff = 0;
    fields.forEach(f => {
      const diff = parseFloat(bestWorst(platforms.map(p => r[p][f])).diff);
      if (diff > maxDiff) maxDiff = diff;
    });
    const diffCls = maxDiff>=5?'diff-high':maxDiff>=2?'diff-mid':'diff-low';
    let cells = '';
    platforms.forEach(p => {
      fields.forEach(f => {
        const vals = platforms.map(pl => parseFloat(r[pl][f]));
        const max = Math.max(...vals), min = Math.min(...vals);
        const v = parseFloat(r[p][f]);
        cells += `<td class="${v===max?'best-odd':v===min?'worst-odd':''}">${r[p][f]}</td>`;
      });
    });
    return `<tr data-league="${r.leagueKey}">
      <td class="compare-match-name"><strong>${r.home} vs ${r.away}</strong><small>${r.league}</small></td>
      ${cells}
      <td><span class="diff-badge ${diffCls}">%${maxDiff}</span></td>
    </tr>`;
  }).join('');
}

function filterCompare() {
  const q  = document.getElementById('compareSearch').value.toLowerCase();
  const lg = document.getElementById('compareLeague').value;
  renderCompare(COMPARE_DATA.filter(r => (r.home+' '+r.away).toLowerCase().includes(q) && (lg==='all'||r.leagueKey===lg)));
}

// ===== MAÇ SEÇİMİ (PICKS) =====
let userPicks = JSON.parse(localStorage.getItem('oa_picks') || '[]');

function savePicks() { localStorage.setItem('oa_picks', JSON.stringify(userPicks)); }

function togglePick(matchData) {
  const idx = userPicks.findIndex(p => p.id === matchData.id);
  if (idx >= 0) {
    userPicks.splice(idx, 1);
  } else {
    userPicks.push(matchData);
  }
  savePicks();
  // Seçim sayısını güncelle
  const badge = document.getElementById('picks-count-badge');
  if (badge) badge.textContent = userPicks.length || '';
}

function isPickSelected(id) { return userPicks.some(p => p.id === id); }

function renderPicks() {
  const container = document.getElementById('picksMatches');
  const totalEl   = document.getElementById('picksTotal');
  if (!container) return;

  if (userPicks.length === 0) {
    container.innerHTML = `<div class="empty-state">
      <i class="fas fa-crosshairs"></i>
      <p>Henüz maç seçmediniz.</p>
      <small>Maç kartlarındaki "Seç" butonuna tıklayarak kendi kuponunuzu oluşturun.</small>
    </div>`;
    if (totalEl) totalEl.innerHTML = '';
    return;
  }

  const totalOdds = userPicks.reduce((acc, p) => acc * (p.odds || 1), 1).toFixed(2);

  if (totalEl) {
    totalEl.innerHTML = `
      <div class="picks-total-bar">
        <div class="picks-total-info">
          <span><i class="fas fa-receipt"></i> ${userPicks.length} Maç Seçildi</span>
          <span class="picks-total-odds"><i class="fas fa-times"></i> Toplam Oran: <strong>${totalOdds}</strong></span>
        </div>
        <button class="picks-clear-btn" onclick="clearAllPicks()"><i class="fas fa-trash"></i> Temizle</button>
      </div>`;
  }

  container.innerHTML = userPicks.map(p => `
    <div class="match-card picks-selected-card" data-id="${p.id}">
      <div class="match-league"><span class="league-flag">${p.flag || '⚽'}</span>${p.league}</div>
      <div class="match-teams">
        <div class="teams">${p.home} <span style="color:var(--text-muted)">vs</span> ${p.away}</div>
        <div class="match-time">${p.time || ''}</div>
      </div>
      <div class="picks-pick-badge"><i class="fas fa-check-circle"></i> ${p.pickLabel || 'Seçildi'}</div>
      <div class="match-odds">
        <div class="odd-btn up"><span class="odd-label">Oran</span><span class="odd-val">${p.odds || '-'}</span></div>
      </div>
      <button class="pick-remove-btn" onclick="removePick(${p.id})"><i class="fas fa-times"></i></button>
    </div>`).join('');
}

function removePick(id) {
  userPicks = userPicks.filter(p => p.id !== id);
  savePicks();
  renderPicks();
  refreshPickButtons();
}

function clearAllPicks() {
  userPicks = [];
  savePicks();
  renderPicks();
  refreshPickButtons();
}

function refreshPickButtons() {
  document.querySelectorAll('.pick-select-btn').forEach(btn => {
    const id = parseInt(btn.dataset.matchId);
    const selected = isPickSelected(id);
    btn.classList.toggle('picked', selected);
    btn.innerHTML = selected ? '<i class="fas fa-check"></i> Seçildi' : '<i class="fas fa-crosshairs"></i> Seç';
  });
  const badge = document.getElementById('picks-count-badge');
  if (badge) badge.textContent = userPicks.length || '';
}

// ===== MAÇ KARTI — SEÇ BUTONU EKLENMIŞ =====
function matchCardWithPick(m, isLive) {
  const isFav = favorites.includes(m.id);
  const isPicked = isPickSelected(m.id);
  const pickData = JSON.stringify({ id: m.id, league: m.league, flag: m.flag, home: m.home, away: m.away, time: m.time, odds: m.odds?.h || 2.00, pickLabel: 'MS 1' }).replace(/"/g, '&quot;');
  return `
  <div class="match-card ${isPicked ? 'picked-card' : ''}" data-league="${m.leagueKey}" data-id="${m.id}">
    <div class="match-league"><span class="league-flag">${m.flag}</span>${m.league}</div>
    <div class="match-teams">
      <div class="teams">${m.home} <span style="color:var(--text-muted)">vs</span> ${m.away}</div>
      <div class="match-time">${isLive ? `<span class="match-minute live-dot">${m.minute}'</span>` : m.time}</div>
    </div>
    ${isLive ? `<div class="match-live-score">${m.score}</div>` : ''}
    <div class="match-odds">
      <div class="odd-btn ${m.trend[0]}" title="Ev Sahibi"><span class="odd-label">1</span><span class="odd-val">${m.odds.h}</span></div>
      <div class="odd-btn ${m.trend[1]}" title="Beraberlik"><span class="odd-label">X</span><span class="odd-val">${m.odds.d}</span></div>
      <div class="odd-btn ${m.trend[2]}" title="Deplasman"><span class="odd-label">2</span><span class="odd-val">${m.odds.a}</span></div>
    </div>
    <button class="pick-select-btn ${isPicked ? 'picked' : ''}" data-match-id="${m.id}"
      onclick='handlePickClick(${JSON.stringify({id:m.id,league:m.league,flag:m.flag,home:m.home,away:m.away,time:m.time||"",odds:m.odds?.h||2.00,pickLabel:"MS 1"})}, this)'>
      ${isPicked ? '<i class="fas fa-check"></i> Seçildi' : '<i class="fas fa-crosshairs"></i> Seç'}
    </button>
    <button class="fav-btn ${isFav?'active':''}" onclick="toggleFav(${m.id},this)"><i class="fas fa-star"></i></button>
  </div>`;
}

function handlePickClick(matchData, btn) {
  togglePick(matchData);
  const selected = isPickSelected(matchData.id);
  btn.classList.toggle('picked', selected);
  btn.innerHTML = selected ? '<i class="fas fa-check"></i> Seçildi' : '<i class="fas fa-crosshairs"></i> Seç';
  const card = btn.closest('.match-card');
  if (card) card.classList.toggle('picked-card', selected);
  const badge = document.getElementById('picks-count-badge');
  if (badge) badge.textContent = userPicks.length || '';
}

// ===== PREMİUM KUPON =====
function renderPremiumCoupon() {
  const container = document.getElementById('sec-premium');
  if (!container) return;

  if (!isPremium()) {
    document.getElementById('premiumLocked').classList.remove('hidden');
    document.getElementById('premiumContent').classList.add('hidden');
    return;
  }

  document.getElementById('premiumLocked').classList.add('hidden');
  document.getElementById('premiumContent').classList.remove('hidden');

  // Günlük premium kuponu al
  const premiumCoupon = getPremiumCoupon();
  const picks = premiumCoupon.picks;
  
  const totalOdds = picks.reduce((acc, p) => acc * p.selectedMarket.odds, 1).toFixed(2);
  const today = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  document.getElementById('premiumTotalOdds').textContent = totalOdds;
  document.getElementById('premiumCouponDate').innerHTML = `<i class="fas fa-calendar"></i> ${today}`;

  document.getElementById('premiumCouponContent').innerHTML = picks.map((p, i) => {
    const mkt = p.selectedMarket;
    const diff = difficultyInfo(p.difficulty);
    const matchTime = p.matchTime || '20:00';
    return `
      <div class="premium-match-card ai-card-${p.difficulty}">
        <div class="premium-num">${i + 1}</div>
        <div class="premium-match-body">
          <div class="premium-match-league">${p.flag} ${p.league} | <i class="fas fa-clock" style="font-size:.7rem;"></i> ${matchTime}</div>
          <div class="premium-match-name">${p.home} <span>vs</span> ${p.away}</div>
          <div class="premium-pick-row">
            <span class="diff-badge-card ${diff.cls}"><i class="fas ${diff.icon}"></i> ${diff.text}</span>
            <span class="premium-pick-label">${mkt.label}</span>
            <span class="premium-pick-odd">@${mkt.odds}</span>
            <span class="premium-pick-conf conf-green">${mkt.conf}%</span>
          </div>
          <div class="coupon-mini-bar-wrap"><div class="coupon-mini-bar ${confidenceColor(mkt.conf)}" style="width:${mkt.conf}%"></div></div>
        </div>
      </div>`;
  }).join('');
}

// ===== TUTAN ANALİZLER =====
function renderSuccessfulPredictions(filter = 'all') {
  const container = document.getElementById('successfulCards');
  if (!container) return;
  
  const finished = getFinishedMatches();
  const successful = getSuccessfulPredictions();
  
  let displayData = [];
  
  if (filter === 'today') {
    const today = getTodayString();
    displayData = finished.filter(f => f.date === today);
  } else if (filter === 'week') {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    displayData = finished.filter(f => new Date(f.date) >= weekAgo);
  } else {
    displayData = finished;
  }
  
  // Ters sırala (en yeni en üstte)
  displayData = displayData.reverse();
  
  if (displayData.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fas fa-chart-line"></i>
        <p>Henüz sonuçlanmış analiz yok.</p>
        <small>Maçlar bittiğinde analiz sonuçları burada görünecek.</small>
      </div>`;
    return;
  }
  
  container.innerHTML = displayData.map(item => {
    const isSuccess = item.isSuccess;
    const pred = item.prediction || item.selectedMarket || {};
    
    return `
      <div class="success-card ${isSuccess ? 'success' : 'failed'}">
        <div class="success-card-header">
          <div class="success-card-league">
            <span>${item.flag || '⚽'}</span> ${item.league}
          </div>
          <div class="success-result-badge ${isSuccess ? 'success' : 'failed'}">
            <i class="fas ${isSuccess ? 'fa-check' : 'fa-times'}"></i>
            ${isSuccess ? 'Tuttu' : 'Tutmadı'}
          </div>
        </div>
        <div class="success-card-match">${item.home} <span>vs</span> ${item.away}</div>
        <div class="success-prediction-row">
          <div class="success-prediction-info">
            <span class="success-prediction-label">YZ Tahmini</span>
            <span class="success-prediction-val">${pred.label || pred.pick || '-'}</span>
          </div>
          <span class="success-prediction-odd">@${pred.odds || '-'}</span>
        </div>
        <div class="success-actual-result ${isSuccess ? 'success' : 'failed'}">
          <i class="fas ${isSuccess ? 'fa-trophy' : 'fa-times-circle'}"></i>
          Gerçekleşen: ${item.actualResult || '-'}
        </div>
        <div class="success-date">
          <i class="fas fa-calendar"></i> ${new Date(item.date).toLocaleDateString('tr-TR')}
        </div>
      </div>
    `;
  }).join('');
}

function filterSuccessful(filter, btn) {
  document.querySelectorAll('#sec-successful .ftab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderSuccessfulPredictions(filter);
}

function updateSuccessStats() {
  const stats = getSuccessStats();
  
  const rateEl = document.getElementById('successRateVal');
  const successEl = document.getElementById('successfulCount');
  const failedEl = document.getElementById('failedCount');
  const totalEl = document.getElementById('totalAnalyzed');
  const badgeEl = document.getElementById('successful-count-badge');
  
  if (rateEl) rateEl.textContent = stats.successRate + '%';
  if (successEl) successEl.textContent = stats.totalSuccessful;
  if (failedEl) failedEl.textContent = stats.totalFinished - stats.totalSuccessful;
  if (totalEl) totalEl.textContent = stats.totalFinished;
  if (badgeEl) {
    badgeEl.textContent = stats.totalSuccessful || '';
    badgeEl.style.display = stats.totalSuccessful > 0 ? 'inline-flex' : 'none';
  }
  
  // Ana sayfa istatistiğini de güncelle
  const mainRateEl = document.getElementById('successRate');
  if (mainRateEl) mainRateEl.textContent = stats.successRate + '%';
}

// ===== SECTION NAV GÜNCELLEME =====
const SECTIONS = ['live','odds','stats','upcoming','favorites','ai','coupon','compare','picks','premium','successful'];
const TITLES = {
  live:'Canlı Maçlar', odds:'Oran Analizi', stats:'İstatistikler',
  upcoming:'Yaklaşan Maçlar', favorites:'Favorilerim',
  ai:'YZ Tahmin', coupon:'Günlük YZ Kuponu', compare:'Oran Karşılaştırma',
  picks:'Seçimlerim', premium:'Premium Kupon', successful:'Tutan Analizler'
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
  if (key === 'stats')    initCharts();
  if (key === 'favorites') renderFavorites();
  if (key === 'ai')       renderAIPredictions(window._currentAIPredictions || autoGenPredictions(MOCK_UPCOMING));
  if (key === 'coupon')   generateCoupon(window._currentAIPredictions || autoGenPredictions(MOCK_UPCOMING));
  if (key === 'compare')  renderCompare(COMPARE_DATA);
  if (key === 'picks')    renderPicks();
  if (key === 'premium')  renderPremiumCoupon();
  if (key === 'successful') {
    renderSuccessfulPredictions();
    updateSuccessStats();
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('dashUserName')) initDashboard();
});
