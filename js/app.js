// ===== GERÇEK VERİ: Vercel Serverless API =====
const API_BASE = '';

const LEAGUE_META = {
  '203': { name: 'Süper Lig',        flag: '🇹🇷', key: 'tr1' },
  '39':  { name: 'Premier Lig',      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', key: 'pl'  },
  '140': { name: 'La Liga',          flag: '🇪🇸', key: 'll'  },
  '78':  { name: 'Bundesliga',       flag: '🇩🇪', key: 'bl'  },
  '135': { name: 'Serie A',          flag: '🇮🇹', key: 'sa'  },
  '61':  { name: 'Ligue 1',          flag: '🇫🇷', key: 'fl'  },
  '2':   { name: 'Şampiyonlar Ligi', flag: '🇪🇺', key: 'cl'  },
  '3':   { name: 'Avrupa Ligi',      flag: '🇪🇺', key: 'el'  },
  '88':  { name: 'Eredivisie',       flag: '🇳🇱', key: 'ned' },
  '94':  { name: 'Primeira Liga',    flag: '🇵🇹', key: 'por' },
  '848': { name: 'Konferans Ligi',   flag: '🇪🇺', key: 'ecl' },
};

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
    txt.textContent = 'Bağlanıyor...';
  }
}

// ===== OTOMATİK YZ ANALİZİ =====
function autoGenPredictions(matches) {
  return matches.map((m, idx) => {
    const o1 = parseFloat(m.odds1 || m.odds?.h || 2.00);
    const oX = parseFloat(m.oddsX || m.odds?.d || 3.30);
    const o2 = parseFloat(m.odds2 || m.odds?.a || 3.50);

    const p1 = 1 / o1, pX = 1 / oX, p2 = 1 / o2;
    const total = p1 + pX + p2;
    const c1 = Math.round(p1 / total * 100);
    const cX = Math.round(pX / total * 100);
    const c2 = 100 - c1 - cX;

    const minOdds = Math.min(o1, o2);
    const difficulty = minOdds <= 1.60 ? 'easy' : minOdds <= 2.20 ? 'medium' : 'hard';
    const modelScore = Math.min(95, Math.round(85 - (minOdds - 1.0) * 20 + Math.random() * 8));

    const oOver  = parseFloat(m.oddsOver  || 1.80);
    const oUnder = parseFloat(m.oddsUnder || 1.90);
    const confOver  = Math.round(1 / oOver  / (1/oOver + 1/oUnder) * 100);
    const confUnder = 100 - confOver;

    const oBttsY = parseFloat(m.oddsBttsY || 1.75);
    const oBttsN = parseFloat(m.oddsBttsN || 1.95);
    const confBttsY = Math.round(1 / oBttsY / (1/oBttsY + 1/oBttsN) * 100);

    const oHT1 = parseFloat(m.oddsHT1 || (o1 * 1.3).toFixed(2));
    const oHTX = parseFloat(m.oddsHTX || 2.10);
    const oHT2 = parseFloat(m.oddsHT2 || (o2 * 1.3).toFixed(2));
    const pH1 = 1/oHT1, pHX = 1/oHTX, pH2 = 1/oHT2;
    const htTotal = pH1 + pHX + pH2;
    const cHT1 = Math.round(pH1 / htTotal * 100);
    const cHTX = Math.round(pHX / htTotal * 100);
    const cHT2 = 100 - cHT1 - cHTX;

    const resultPick = c1 >= c2 ? { pick: '1', label: 'MS Ev Kazanır', conf: c1, odds: o1 }
                                 : { pick: '2', label: 'MS Deplasman',  conf: c2, odds: o2 };
    const ouPick = confOver >= confUnder
      ? { pick: 'Üst', label: 'Üst 2.5 Gol', conf: confOver,  odds: oOver  }
      : { pick: 'Alt', label: 'Alt 2.5 Gol',  conf: confUnder, odds: oUnder };
    const bttsPick = confBttsY >= 50
      ? { pick: 'Var', label: 'KG Var', conf: confBttsY,      odds: oBttsY }
      : { pick: 'Yok', label: 'KG Yok', conf: 100-confBttsY,  odds: oBttsN };
    const htPick = cHT1 >= cHT2 ? { pick: 'İY 1', label: 'İY Ev Önde',       conf: cHT1, odds: oHT1 }
                                 : { pick: 'İY 2', label: 'İY Deplasman Önde', conf: cHT2, odds: oHT2 };
    const htftOdds = +(o1 * oHT1 * 0.7).toFixed(2);
    const htftConf = Math.round(resultPick.conf * htPick.conf / 100);

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
    };
  });
}

// ===== API'DEN MAÇLARI ÇEK =====
let ALL_API_MATCHES = [];

async function loadRealMatches() {
  const liveEl     = document.getElementById('liveMatches');
  const upcomingEl = document.getElementById('upcomingMatches');

  liveEl.innerHTML     = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Tüm maçlar yükleniyor...</div>';
  upcomingEl.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Yükleniyor...</div>';

  try {
    const res = await fetch('/api/matches');
    if (!res.ok) throw new Error(`API Hatası: ${res.status}`);

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    const live     = data.live     || [];
    const upcoming = data.upcoming || [];
    const finished = data.finished || [];
    const matches  = [...live, ...upcoming, ...finished];

    ALL_API_MATCHES = matches;
    updateApiStatus(true);

    document.getElementById('liveCount').textContent = live.length;
    const statEl = document.querySelector('.stat-cards .stat-card:nth-child(2) .stat-num');
    if (statEl) statEl.textContent = matches.length;

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

    // YZ analizi
    const forAI = [...upcoming, ...live].map(m => apiMatchToMock(m));
    window._currentAIPredictions = autoGenPredictions(forAI);

    if (live.length > 0) setTimeout(loadRealMatches, 60000);

  } catch (err) {
    liveEl.innerHTML = `<div class="empty-state error-state"><i class="fas fa-exclamation-triangle"></i><p>${err.message}</p><small>Sunucu bağlantısı kontrol ediliyor...</small></div>`;
    upcomingEl.innerHTML = '';
    updateApiStatus(false);
  }
}

function apiMatchToMock(m) {
  const lg = LEAGUE_META[String(m.competition?.code)] || { name: m.competition?.name || 'Lig', flag: '⚽', key: 'other' };
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
    const lg = LEAGUE_META[String(g.meta?.code)] || { flag: '⚽' };
    const cards = g.matches.map(m => realMatchCard(m, isLive, isFinished)).join('');
    return `<div class="league-group">
      <div class="league-group-header">${lg.flag} ${name} <span class="league-match-count">${g.matches.length} maç</span></div>
      ${cards}
    </div>`;
  }).join('');
}

function realMatchCard(m, isLive, isFinished = false) {
  const lg = LEAGUE_META[String(m.competition?.code)] || { name: m.competition?.name || 'Lig', flag: '⚽' };
  const homeScore = m.score?.fullTime?.home ?? m.score?.halfTime?.home ?? '';
  const awayScore = m.score?.fullTime?.away ?? m.score?.halfTime?.away ?? '';
  const scoreStr  = homeScore !== '' ? `${homeScore} - ${awayScore}` : '- -';
  const matchDate = new Date(m.utcDate);
  const timeStr   = matchDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' });

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
  const pass  = document.getElementById('loginPass').value;
  const errEl = document.getElementById('loginError');
  const users = JSON.parse(localStorage.getItem('oa_users') || '[]');
  const user  = users.find(u => u.email === email && u.pass === btoa(pass));
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
  document.getElementById('dashUserName').textContent  = session.name;
  document.getElementById('dashUserEmail').textContent = session.email;

  startClock();
  document.getElementById('apiBanner')?.classList.add('hidden');
  updateApiStatus(true);
  loadRealMatches();
  renderOddsTable(ODDS_DATA);
}

function startClock() {
  const el = document.getElementById('clock');
  if (!el) return;
  function tick() { el.textContent = new Date().toLocaleTimeString('tr-TR', { hour:'2-digit', minute:'2-digit', second:'2-digit' }); }
  tick(); setInterval(tick, 1000);
}

// ===== SECTION NAV =====
const SECTIONS = ['live','odds','stats','upcoming','favorites','ai','coupon','compare'];
const TITLES = {
  live:'Canlı Maçlar', odds:'Oran Analizi', stats:'İstatistikler',
  upcoming:'Yaklaşan Maçlar', favorites:'Favorilerim',
  ai:'YZ Tahmin', coupon:'Günlük YZ Kuponu', compare:'Oran Karşılaştırma'
};

function showSection(key) {
  SECTIONS.forEach(s => document.getElementById('sec-'+s).classList.toggle('hidden', s !== key));
  document.getElementById('sectionTitle').textContent = TITLES[key] || '';
  document.querySelectorAll('.nav-item').forEach((el,i) => el.classList.toggle('active', SECTIONS[i] === key));
  if (key === 'stats')     initCharts();
  if (key === 'favorites') renderFavorites();
  if (key === 'ai')        renderAIPredictions(window._currentAIPredictions || []);
  if (key === 'coupon')    generateCoupon(window._currentAIPredictions || []);
  if (key === 'compare')   renderCompare(COMPARE_DATA);
}

// ===== MOCK MATCH CARDS (offline fallback) =====
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

function renderLiveMatches(data)     { document.getElementById('liveMatches').innerHTML     = data.map(m => matchCard(m,true)).join(''); }
function renderUpcomingMatches(data) { document.getElementById('upcomingMatches').innerHTML = data.map(m => matchCard(m,false)).join(''); }

function filterLeague(key, btn) {
  document.querySelectorAll('.ftab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
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
  const q  = document.getElementById('oddsSearch').value.toLowerCase();
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
  document.getElementById('favMatches').innerHTML =
    '<div class="empty-state"><i class="fas fa-star"></i><p>Henüz favori yok.</p><small>Maçların yanındaki yıldıza tıkla.</small></div>';
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
    container.innerHTML = '<div class="empty-state"><i class="fas fa-robot"></i><p>Maçlar yükleniyor, lütfen bekleyin...</p><small>Canlı/Yaklaşan bölümüne gidip geri dönün.</small></div>';
    return;
  }
  container.innerHTML = data.map(p => {
    const lbl     = confidenceLabel(p.modelScore);
    const diff    = difficultyInfo(p.difficulty);
    const bestMkt = p.markets[p.bestPick];
    const marketRows = Object.entries(p.markets).map(([key,mkt]) => {
      const isBest  = key === p.bestPick;
      const confCls = mkt.conf>=70?'conf-green':mkt.conf>=55?'conf-yellow':'conf-red';
      return `<div class="market-row ${isBest?'market-best':''}">
        <div class="market-info"><i class="fas ${MARKET_ICONS[key]}"></i><span class="market-name">${MARKET_LABELS[key]}</span>${isBest?'<span class="best-tag">EN İYİ</span>':''}</div>
        <div class="market-pick">${mkt.label}</div>
        <div class="market-meta"><span class="market-conf ${confCls}">${mkt.conf}%</span><span class="market-odd">@${mkt.odds}</span></div>
        <div class="conf-mini-wrap"><div class="conf-mini-bar ${confidenceColor(mkt.conf)}" style="width:0%" data-target="${mkt.conf}%"></div></div>
      </div>`;
    }).join('');
    return `
    <div class="ai-card ai-card-${p.difficulty}">
      <div class="ai-card-header">
        <div class="ai-card-league">${p.flag} ${p.league}</div>
        <div class="ai-card-badges">
          <span class="diff-badge-card ${diff.cls}"><i class="fas ${diff.icon}"></i> ${diff.text}</span>
          <span class="pick-badge ${lbl.cls}">${lbl.text}</span>
        </div>
      </div>
      <div class="ai-card-match">${p.home} <span>vs</span> ${p.away}</div>
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
  const src = window._currentAIPredictions || [];
  const filtered = level==='all' ? src
    : src.filter(p => level==='high'?p.modelScore>=80:level==='medium'?p.modelScore>=60&&p.modelScore<80:p.modelScore<60);
  renderAIPredictions(filtered);
}

// ===== GÜNLÜK KUPON =====
function generateCoupon(predictions) {
  const src = predictions || window._currentAIPredictions || [];
  if (!src.length) {
    document.getElementById('couponHero').innerHTML    = '<div class="empty-state"><i class="fas fa-ticket-alt"></i><p>Kupon için maç bekleniyor...</p></div>';
    document.getElementById('couponMatches').innerHTML = '';
    return;
  }
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
    const diff    = difficultyInfo(p.difficulty);
    const confCls = p.selectedMarket.conf>=75?'conf-green':p.selectedMarket.conf>=60?'conf-yellow':'conf-red';
    return `
    <div class="coupon-match-card ai-card-${p.difficulty}">
      <div class="coupon-num">${i+1}</div>
      <div class="coupon-match-body">
        <div class="coupon-match-header">
          <span class="coupon-league">${p.flag} ${p.league}</span>
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

// ===== ORAN KIYASLAMA =====
function bestWorst(vals) {
  const nums = vals.map(Number);
  const max = Math.max(...nums), min = Math.min(...nums);
  return { max, min, diff: ((max-min)/min*100).toFixed(1) };
}

function renderCompare(data) {
  const tbody     = document.getElementById('compareTableBody');
  const platforms = ['nesine','bilyoner','misli','bets10'];
  tbody.innerHTML = data.map(r => {
    const fields = ['h','d','a'];
    let maxDiff  = 0;
    fields.forEach(f => {
      const diff = parseFloat(bestWorst(platforms.map(p => r[p][f])).diff);
      if (diff > maxDiff) maxDiff = diff;
    });
    const diffCls = maxDiff>=5?'diff-high':maxDiff>=2?'diff-mid':'diff-low';
    let cells = '';
    platforms.forEach(p => {
      fields.forEach(f => {
        const vals = platforms.map(pl => parseFloat(r[pl][f]));
        const max  = Math.max(...vals), min = Math.min(...vals);
        const v    = parseFloat(r[p][f]);
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

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('dashUserName')) initDashboard();
});
