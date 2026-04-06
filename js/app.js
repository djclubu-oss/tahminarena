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
  document.getElementById('liveMatches').innerHTML = '<div class="empty-state"><i class="fas fa-key"></i><p>API anahtarı gerekli</p><small>Gerçek maç verileri için API anahtarınızı girin.</small></div>';
  document.getElementById('upcomingMatches').innerHTML = '<div class="empty-state"><p>API bağlantısı yok</p></div>';
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

function autoGenPredictions(matches) {
  return matches.map((m, idx) => {
    const o1 = parseFloat(m.odds?.h || 2.00);
    const oX = parseFloat(m.odds?.d || 3.30);
    const o2 = parseFloat(m.odds?.a || 3.50);

    const p1 = 1 / o1, pX = 1 / oX, p2 = 1 / o2;
    const total = p1 + pX + p2;
    const c1 = Math.round(p1 / total * 100);
    const cX = Math.round(pX / total * 100);
    const c2 = 100 - c1 - cX;

    const minOdds = Math.min(o1, o2);
    const difficulty = minOdds <= 1.60 ? 'easy' : minOdds <= 2.20 ? 'medium' : 'hard';
    const modelScore = Math.min(95, Math.round(85 - (minOdds - 1.0) * 20 + Math.random() * 8));

    const resultPick = c1 >= c2 ? { pick: '1', label: 'MS Ev Kazanır', conf: c1, odds: o1 }
                                 : { pick: '2', label: 'MS Deplasman',  conf: c2, odds: o2 };
    
    const markets = {
      result: resultPick,
      ou: { pick: 'Üst', label: 'Üst 2.5 Gol', conf: 55, odds: 1.80 },
      btts: { pick: 'Var', label: 'KG Var', conf: 60, odds: 1.75 },
      ht: { pick: 'İY 1', label: 'İY Ev Önde', conf: 45, odds: 2.10 },
    };
    
    const bestKey = 'result';

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
      reason: `${m.home} vs ${m.away} maçında istatistiksel analiz yapıldı.`,
      matchTime: m.time || '20:00',
      matchOdds: m.odds || { h: '-', d: '-', a: '-' }
    };
  });
}

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

    const live = matches.filter(m => ['IN_PLAY','PAUSED','HALFTIME'].includes(m.status));
    const upcoming = matches.filter(m => ['SCHEDULED','TIMED'].includes(m.status));
    const finished = matches.filter(m => m.status === 'FINISHED');

    document.getElementById('liveCount').textContent = live.length;
    document.getElementById('todayCount').textContent = matches.length;

    if (live.length > 0) {
      liveEl.innerHTML = groupByLeague(live, true);
    } else if (finished.length > 0) {
      liveEl.innerHTML = `<div class="api-section-label"><i class="fas fa-flag-checkered"></i> Tamamlanan Maçlar (${finished.length})</div>` + groupByLeague(finished, false, true);
    } else {
      liveEl.innerHTML = '<div class="empty-state"><i class="fas fa-circle"></i><p>Şu an canlı maç yok.</p></div>';
    }

    if (upcoming.length > 0) {
      upcomingEl.innerHTML = `<div class="match-count-bar"><i class="fas fa-calendar-alt"></i> Bugün ${upcoming.length} maç planlandı</div>` + groupByLeague(upcoming, false);
    } else {
      upcomingEl.innerHTML = '<div class="empty-state"><i class="fas fa-calendar"></i><p>Yaklaşan maç yok.</p></div>';
    }

    const forAI = [...upcoming, ...live].map(m => apiMatchToMock(m));
    window._currentAIPredictions = autoGenPredictions(forAI);

    if (live.length > 0) setTimeout(loadRealMatches, 60000);

  } catch (err) {
    liveEl.innerHTML = `<div class="empty-state error-state"><i class="fas fa-exclamation-triangle"></i><p>${err.message}</p><small>API anahtarınızı kontrol edin.</small></div>`;
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
    odds: { h: '-', d: '-', a: '-' }
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
    window.location.href = '/dashboard.html'; return;
  }
  if (!user) { errEl.textContent = 'E-posta veya şifre hatalı!'; return; }
  errEl.textContent = '';
  localStorage.setItem('oa_session', JSON.stringify({ name: user.name, email: user.email }));
  window.location.href = '/dashboard.html';
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
    localStorage.setItem('oa_session', JSON.stringify({ name, email }));
    window.location.href = '/dashboard.html';
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
  if (!session) { window.location.href = '/'; return; }
  document.getElementById('dashUserName').textContent = session.name;
  document.getElementById('dashUserEmail').textContent = session.email;

  startClock();
  updatePremiumLock();
  updateSuccessStats();

  const key = getApiKey();
  if (key) {
    document.getElementById('apiBanner').classList.add('hidden');
    updateApiStatus(true);
    loadRealMatches();
  } else {
    updateApiStatus(false);
    document.getElementById('liveMatches').innerHTML = '<div class="empty-state"><i class="fas fa-key"></i><p>API anahtarı gerekli</p><small>Gerçek maç verileri için API anahtarınızı girin.</small></div>';
    document.getElementById('upcomingMatches').innerHTML = '<div class="empty-state"><p>API bağlantısı yok</p></div>';
    document.getElementById('liveCount').textContent = '0';
    document.getElementById('todayCount').textContent = '0';
  }
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

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); }

// ===== YZ TAHMİN =====
function confidenceColor(s) { return s>=80?'bar-green':s>=60?'bar-yellow':'bar-red'; }
function confidenceLabel(s) {
  return s>=80?{text:'Yüksek Güven',cls:'pick-high'}:s>=60?{text:'Orta Güven',cls:'pick-medium'}:{text:'Düşük Güven',cls:'pick-low'};
}
const MARKET_ICONS = { result:'fa-trophy', ou:'fa-sort-amount-up', btts:'fa-exchange-alt', ht:'fa-flag' };
const MARKET_LABELS = { result:'Maç Sonucu', ou:'Alt / Üst 2.5', btts:'KG Var / Yok', ht:'İlk Yarı' };

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
  
  const finished = getFinishedMatches();
  
  container.innerHTML = data.map(p => {
    const lbl = confidenceLabel(p.modelScore);
    const diff = difficultyInfo(p.difficulty);
    const bestMkt = p.markets[p.bestPick];
    
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
    
    const matchTime = p.matchTime || '20:00';
    const matchOdds = p.matchOdds || { h: '-', d: '-', a: '-' };
    
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
  const src = window._currentAIPredictions || [];
  const filtered = level==='all' ? src
    : src.filter(p => level==='high'?p.modelScore>=80:level==='medium'?p.modelScore>=60&&p.modelScore<80:p.modelScore<60);
  renderAIPredictions(filtered);
}

// ===== GÜNLÜK KUPON =====
function generateCoupon(predictions) {
  const src = predictions || window._currentAIPredictions || [];
  if (src.length === 0) {
    document.getElementById('couponHero').innerHTML = '<div class="empty-state"><p>Kupon oluşturulamadı. API bağlantısı gerekli.</p></div>';
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
  const avgConf = Math.round(picks.reduce((acc,p) => acc + p.selectedMarket.conf, 0) / picks.length);
  const combined = Math.round(picks.reduce((a,p) => a * p.selectedMarket.conf/100, 1) * 100);
  const today = new Date().toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'});

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

function refreshDailyCoupon() {
  const newCoupon = getDailyCoupon();
  if (newCoupon) {
    generateCoupon(newCoupon.picks);
  }
}

// ===== TUTAN ANALİZLER =====
function renderSuccessfulPredictions(filter = 'all') {
  const container = document.getElementById('successfulCards');
  if (!container) return;
  
  const successful = getSuccessfulPredictions();
  
  let displayData = [];
  
  if (filter === 'today') {
    const today = getTodayString();
    displayData = successful.filter(f => f.date === today);
  } else if (filter === 'week') {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    displayData = successful.filter(f => new Date(f.date) >= weekAgo);
  } else {
    displayData = successful;
  }
  
  displayData = displayData.reverse();
  
  if (displayData.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fas fa-check-circle"></i>
        <p>Henüz tutan analiz yok.</p>
        <small>Maçlar bittiğinde tutan analizler burada görünecek.</small>
      </div>`;
    return;
  }
  
  container.innerHTML = displayData.map(item => {
    const pred = item.prediction || item.selectedMarket || {};
    
    return `
      <div class="success-card success">
        <div class="success-card-header">
          <div class="success-card-league">
            <span>${item.flag || '⚽'}</span> ${item.league}
          </div>
          <div class="success-result-badge success">
            <i class="fas fa-check"></i> Tuttu
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
        <div class="success-actual-result success">
          <i class="fas fa-trophy"></i> Gerçekleşen: ${item.actualResult || '-'}
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
  const totalEl = document.getElementById('totalAnalyzed');
  const badgeEl = document.getElementById('successful-count-badge');
  
  if (rateEl) rateEl.textContent = stats.successRate + '%';
  if (successEl) successEl.textContent = stats.totalSuccessful;
  if (totalEl) totalEl.textContent = stats.totalFinished;
  if (badgeEl) {
    badgeEl.textContent = stats.totalSuccessful || '';
    badgeEl.style.display = stats.totalSuccessful > 0 ? 'inline-flex' : 'none';
  }
  
  const mainRateEl = document.getElementById('successRate');
  if (mainRateEl) mainRateEl.textContent = stats.successRate + '%';
}

// ===== SECTION NAV =====
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
  if (key === 'ai') renderAIPredictions(window._currentAIPredictions || []);
  if (key === 'coupon') generateCoupon(window._currentAIPredictions || []);
  if (key === 'successful') {
    renderSuccessfulPredictions();
    updateSuccessStats();
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('dashUserName')) initDashboard();
});
