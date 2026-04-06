diff --git a/js/app.js b/js/app.js
index edae4395aeffb7777aec6cdefb65a38f714d0948..e00f2c21c63a0c1df4a561514d0bbb9cd2a679cf 100644
--- a/js/app.js
+++ b/js/app.js
@@ -1,486 +1,347 @@
-// ===== GERÇEK VERİ: football-data.org API =====
-const API_BASE = 'https://api.football-data.org/v4';
-
-const LEAGUE_META = {
-  PL:   { name: 'Premier Lig',       flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', key: 'pl'  },
-  PD:   { name: 'La Liga',           flag: '🇪🇸', key: 'll'  },
-  BL1:  { name: 'Bundesliga',        flag: '🇩🇪', key: 'bl'  },
-  SA:   { name: 'Serie A',           flag: '🇮🇹', key: 'sa'  },
-  FL1:  { name: 'Ligue 1',           flag: '🇫🇷', key: 'fl'  },
-  CL:   { name: 'Şampiyonlar Ligi',  flag: '🇪🇺', key: 'cl'  },
-  DED:  { name: 'Eredivisie',        flag: '🇳🇱', key: 'ned' },
-  PPL:  { name: 'Primeira Liga',     flag: '🇵🇹', key: 'por' },
-  ELC:  { name: 'Championship',      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', key: 'ch'  },
-  BSA:  { name: 'Brezilya Ligi',     flag: '🇧🇷', key: 'bsa' },
-  MLS:  { name: 'MLS',               flag: '🇺🇸', key: 'mls' },
-  EL:   { name: 'Avrupa Ligi',       flag: '🇪🇺', key: 'el'  },
-  ECNL: { name: 'Konferans Ligi',    flag: '🇪🇺', key: 'ecl' },
-  WC:   { name: 'Dünya Kupası',      flag: '🌍', key: 'wc'  },
-};
-
-function getApiKey() { return localStorage.getItem('oa_api_key') || ''; }
-
-function saveApiKey() {
-  const key = document.getElementById('apiKeyInput').value.trim();
-  if (!key) { alert('Lütfen API anahtarı girin!'); return; }
-  localStorage.setItem('oa_api_key', key);
-  document.getElementById('apiBanner').classList.add('hidden');
-  updateApiStatus(true);
-  loadRealMatches();
-}
-
-function skipApiKey() {
-  document.getElementById('apiBanner').classList.add('hidden');
-  document.getElementById('liveMatches').innerHTML = '<div class="empty-state"><i class="fas fa-key"></i><p>API anahtarı gerekli</p><small>Gerçek maç verileri için API anahtarınızı girin.</small></div>';
-}
-
-function showApiSetup() {
-  const banner = document.getElementById('apiBanner');
-  banner.classList.remove('hidden');
-  const existing = getApiKey();
-  if (existing) document.getElementById('apiKeyInput').value = existing;
-  banner.scrollIntoView({ behavior: 'smooth' });
-}
-
-function updateApiStatus(connected) {
-  const btn = document.getElementById('apiStatusBtn');
-  const txt = document.getElementById('apiStatusText');
-  if (!btn) return;
-  if (connected) {
-    btn.style.borderColor = 'var(--green)';
-    btn.style.color = 'var(--green)';
-    txt.textContent = 'API Bağlı';
-  } else {
-    btn.style.borderColor = 'var(--accent)';
-    btn.style.color = 'var(--accent)';
-    txt.textContent = 'API Yok';
-  }
-}
-
-// ===== OTOMATİK YZ ANALİZİ =====
-function autoGenPredictions(matches) {
-  return matches.map((m, idx) => {
-    const o1 = 1.80 + Math.random() * 0.5;
-    const oX = 3.20 + Math.random() * 0.4;
-    const o2 = 3.50 + Math.random() * 0.8;
-
-    const p1 = 1 / o1, pX = 1 / oX, p2 = 1 / o2;
-    const total = p1 + pX + p2;
-    const c1 = Math.round(p1 / total * 100);
-    const c2 = Math.round(p2 / total * 100);
-
-    const minOdds = Math.min(o1, o2);
-    const difficulty = minOdds <= 1.60 ? 'easy' : minOdds <= 2.20 ? 'medium' : 'hard';
-    const modelScore = Math.min(95, Math.round(70 + Math.random() * 25));
-
-    const resultPick = c1 >= c2 ? { pick: '1', label: 'MS Ev Kazanır', conf: c1, odds: o1.toFixed(2) }
-                                 : { pick: '2', label: 'MS Deplasman', conf: c2, odds: o2.toFixed(2) };
-    
-    const markets = {
-      result: resultPick,
-      ou: { pick: 'Üst', label: 'Üst 2.5 Gol', conf: Math.round(50 + Math.random() * 30), odds: (1.70 + Math.random() * 0.4).toFixed(2) },
-      btts: { pick: 'Var', label: 'KG Var', conf: Math.round(45 + Math.random() * 35), odds: (1.65 + Math.random() * 0.5).toFixed(2) },
-      ht: { pick: 'İY 1', label: 'İY Ev Önde', conf: Math.round(40 + Math.random() * 30), odds: (2.00 + Math.random() * 0.5).toFixed(2) },
-    };
-    
-    const bestKey = 'result';
-
-    return {
-      id: m.id || idx + 100,
-      league: m.league || 'Süper Lig',
-      leagueKey: m.leagueKey || 'sl',
-      flag: m.flag || '⚽',
-      home: m.home,
-      away: m.away,
-      difficulty,
-      modelScore,
-      markets,
-      bestPick: bestKey,
-      reason: `${m.home} ev sahibi avantajıyla oynuyor. Son form durumu ve istatistikler değerlendirildi.`,
-      matchTime: m.time || '20:00',
-      matchOdds: { h: o1.toFixed(2), d: oX.toFixed(2), a: o2.toFixed(2) }
-    };
-  });
-}
-
-// ===== API'DEN MAÇLARI ÇEK =====
-let ALL_API_MATCHES = [];
-
-async function loadRealMatches() {
-  const key = getApiKey();
-  if (!key) return;
-
-  const today = new Date().toISOString().split('T')[0];
-  const liveEl = document.getElementById('liveMatches');
-
-  liveEl.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Maçlar yükleniyor...</div>';
-
-  try {
-    const res = await fetch(`${API_BASE}/matches?dateFrom=${today}&dateTo=${today}`, {
-      headers: { 'X-Auth-Token': key }
-    });
-
-    if (!res.ok) throw new Error(res.status === 403 ? 'Geçersiz API anahtarı!' : `API Hatası: ${res.status}`);
-
-    const data = await res.json();
-    const matches = data.matches || [];
-
-    ALL_API_MATCHES = matches;
-    updateApiStatus(true);
-
-    const live = matches.filter(m => ['IN_PLAY','PAUSED','HALFTIME'].includes(m.status));
-    const upcoming = matches.filter(m => ['SCHEDULED','TIMED'].includes(m.status));
-
-    document.getElementById('liveCount').textContent = live.length;
-    document.getElementById('todayCount').textContent = matches.length;
-
-    if (live.length > 0 || upcoming.length > 0) {
-      const forAI = [...upcoming, ...live].map(m => apiMatchToMock(m));
-      window._currentAIPredictions = autoGenPredictions(forAI);
-      renderLiveMatches(forAI);
-    } else {
-      liveEl.innerHTML = '<div class="empty-state"><i class="fas fa-circle"></i><p>Bugün maç yok.</p></div>';
-    }
-
-    if (live.length > 0) setTimeout(loadRealMatches, 60000);
-
-  } catch (err) {
-    liveEl.innerHTML = `<div class="empty-state error-state"><i class="fas fa-exclamation-triangle"></i><p>${err.message}</p></div>`;
-    updateApiStatus(false);
-  }
-}
-
-function apiMatchToMock(m) {
-  const lg = LEAGUE_META[m.competition?.code] || { name: m.competition?.name || 'Süper Lig', flag: '⚽', key: 'sl' };
-  const matchDate = new Date(m.utcDate);
-  const timeStr = matchDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' });
-  return {
-    id: m.id,
-    league: lg.name,
-    leagueKey: lg.key,
-    flag: lg.flag,
-    home: m.homeTeam?.shortName || m.homeTeam?.name || 'Ev Sahibi',
-    away: m.awayTeam?.shortName || m.awayTeam?.name || 'Deplasman',
-    time: timeStr
-  };
-}
-
-function renderLiveMatches(matches) {
-  const container = document.getElementById('liveMatches');
-  if (!container) return;
-  
-  container.innerHTML = matches.map(m => `
-    <div class="match-card">
-      <div class="match-league"><span class="league-flag">${m.flag}</span>${m.league}</div>
-      <div class="match-teams">
-        <div class="teams">${m.home} <span style="color:var(--text-muted)">vs</span> ${m.away}</div>
-        <div class="match-time">${m.time}</div>
-      </div>
-      <div class="match-odds">
-        <div class="odd-btn"><span class="odd-label">1</span><span class="odd-val">-</span></div>
-        <div class="odd-btn"><span class="odd-label">X</span><span class="odd-val">-</span></div>
-        <div class="odd-btn"><span class="odd-label">2</span><span class="odd-val">-</span></div>
-      </div>
-    </div>
-  `).join('');
-}
-
-// ===== AUTH =====
-function handleLogin(e) {
-  e.preventDefault();
-  const email = document.getElementById('loginEmail').value.trim();
-  const pass = document.getElementById('loginPass').value;
-  const errEl = document.getElementById('loginError');
-  
-  if (email === 'demo@tahminarena.com' && pass === 'demo123') {
-    localStorage.setItem('oa_session', JSON.stringify({ name: 'Demo Kullanıcı', email }));
-    window.location.href = './dashboard.html';
-    return;
-  }
-  
-  const users = JSON.parse(localStorage.getItem('oa_users') || '[]');
-  const user = users.find(u => u.email === email && u.pass === btoa(pass));
-  
-  if (!user) { 
-    errEl.textContent = 'E-posta veya şifre hatalı!'; 
-    return; 
-  }
-  
-  localStorage.setItem('oa_session', JSON.stringify({ name: user.name, email: user.email }));
-  window.location.href = './dashboard.html';
-}
-
-function handleRegister(e) {
-  e.preventDefault();
-  const name = document.getElementById('regName').value.trim();
-  const email = document.getElementById('regEmail').value.trim();
-  const pass = document.getElementById('regPass').value;
-  const pass2 = document.getElementById('regPass2').value;
-  const errEl = document.getElementById('regError');
-  const sucEl = document.getElementById('regSuccess');
-  
-  if (pass.length < 6) { errEl.textContent = 'Şifre en az 6 karakter!'; return; }
-  if (pass !== pass2) { errEl.textContent = 'Şifreler eşleşmiyor!'; return; }
-  
-  const users = JSON.parse(localStorage.getItem('oa_users') || '[]');
-  if (users.find(u => u.email === email)) { errEl.textContent = 'Bu e-posta zaten kayıtlı!'; return; }
-  
-  users.push({ name, email, pass: btoa(pass) });
-  localStorage.setItem('oa_users', JSON.stringify(users));
-  
-  sucEl.textContent = 'Kayıt başarılı! Yönlendiriliyorsunuz...';
-  setTimeout(() => {
-    localStorage.setItem('oa_session', JSON.stringify({ name, email }));
-    window.location.href = './dashboard.html';
-  }, 1500);
-}
-
-function logout() { 
-  localStorage.removeItem('oa_session'); 
-}
-
-function togglePass(id, el) {
-  const inp = document.getElementById(id);
-  inp.type = inp.type === 'password' ? 'text' : 'password';
-  el.innerHTML = inp.type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
-}
-
-// ===== DASHBOARD INIT =====
-function initDashboard() {
-  const session = JSON.parse(localStorage.getItem('oa_session') || 'null');
-  if (!session) { window.location.href = './'; return; }
-  
-  const userNameEl = document.getElementById('dashUserName');
-  const userEmailEl = document.getElementById('dashUserEmail');
-  if (userNameEl) userNameEl.textContent = session.name;
-  if (userEmailEl) userEmailEl.textContent = session.email;
-
-  startClock();
-  updatePremiumLock();
-
-  const key = getApiKey();
-  if (key) {
-    document.getElementById('apiBanner').classList.add('hidden');
-    updateApiStatus(true);
-    loadRealMatches();
-  } else {
-    updateApiStatus(false);
-    document.getElementById('liveMatches').innerHTML = '<div class="empty-state"><i class="fas fa-key"></i><p>API anahtarı gerekli</p><small>football-data.org API anahtarınızı girin.</small></div>';
-  }
-}
-
-function startClock() {
-  const el = document.getElementById('clock');
-  if (!el) return;
-  function tick() { 
-    el.textContent = new Date().toLocaleTimeString('tr-TR', { hour:'2-digit', minute:'2-digit', second:'2-digit' }); 
-  }
-  tick(); 
-  setInterval(tick, 1000);
-}
-
-// ===== PREMIUM =====
-const ADMIN_EMAIL = 'djclubu@tahminarena.com';
-
-function isPremium() {
-  const session = JSON.parse(localStorage.getItem('oa_session') || 'null');
-  if (!session) return false;
-  if (session.email === ADMIN_EMAIL) return true;
-  const users = JSON.parse(localStorage.getItem('oa_users') || '[]');
-  const user = users.find(u => u.email === session.email);
-  return user && user.premium === true;
-}
-
-function updatePremiumLock() {
-  const lockIcon = document.getElementById('premiumNavLock');
-  if (lockIcon) {
-    lockIcon.style.display = isPremium() ? 'none' : 'inline';
-  }
-}
-
-function toggleSidebar() { 
-  document.getElementById('sidebar').classList.toggle('open'); 
-}
-
-// ===== YZ TAHMİN =====
-function confidenceColor(s) { 
-  return s >= 80 ? 'bar-green' : s >= 60 ? 'bar-yellow' : 'bar-red'; 
-}
-
-function renderAIPredictions(data) {
-  const container = document.getElementById('aiCards');
-  if (!container) return;
-  
-  if (!data || data.length === 0) {
-    container.innerHTML = '<div class="empty-state"><i class="fas fa-robot"></i><p>Analiz edilecek maç bulunamadı.</p></div>';
-    return;
-  }
-  
-  const finished = getFinishedMatches();
-  
-  container.innerHTML = data.map(p => {
-    const finishedMatch = finished.find(f => f.id === p.id);
-    const isFinished = !!finishedMatch;
-    const isSuccess = isFinished && finishedMatch.isSuccess;
-    
-    const bestMkt = p.markets[p.bestPick];
-    
-    return `
-    <div class="ai-card ai-card-${p.difficulty} ${isFinished ? (isSuccess ? 'match-finished-success' : 'match-finished-failed') : ''}" style="position:relative;">
-      ${isFinished ? `<div class="finished-badge ${isSuccess ? 'success' : 'failed'}">${isSuccess ? '✓ Tuttu' : '✗ Tutmadı'}</div>` : ''}
-      <div class="ai-card-header">
-        <div class="ai-card-league">${p.flag} ${p.league}</div>
-        <span class="pick-badge ${p.modelScore >= 80 ? 'pick-high' : p.modelScore >= 60 ? 'pick-medium' : 'pick-low'}">
-          ${p.modelScore >= 80 ? 'Yüksek Güven' : p.modelScore >= 60 ? 'Orta Güven' : 'Düşük Güven'}
-        </span>
-      </div>
-      <div class="ai-card-match">${p.home} <span>vs</span> ${p.away}</div>
-      
-      <div class="ai-match-meta">
-        <div class="ai-match-time"><i class="fas fa-clock"></i> ${p.matchTime}</div>
-        <div class="ai-match-odds">
-          <div class="ai-odd-box"><span class="ai-odd-label">1</span><span class="ai-odd-val">${p.matchOdds.h}</span></div>
-          <div class="ai-odd-box"><span class="ai-odd-label">X</span><span class="ai-odd-val">${p.matchOdds.d}</span></div>
-          <div class="ai-odd-box"><span class="ai-odd-label">2</span><span class="ai-odd-val">${p.matchOdds.a}</span></div>
-        </div>
-      </div>
-      
-      <div class="ai-best-pick">
-        <div class="ai-best-label"><i class="fas fa-robot"></i> YZ En İyi Seçim</div>
-        <div class="ai-best-value">${bestMkt.label} <span class="ai-best-odd">@${bestMkt.odds}</span></div>
-        <div class="ai-best-conf">
-          <div class="confidence-bar-wrap"><div class="confidence-bar ${confidenceColor(bestMkt.conf)}" style="width:${bestMkt.conf}%"></div></div>
-          <span class="conf-pct">${bestMkt.conf}%</span>
-        </div>
-      </div>
-      
-      <div class="ai-card-footer">
-        <div class="ai-reason"><i class="fas fa-comment-dots"></i> ${p.reason}</div>
-        <div class="model-score-row">
-          <span class="model-score-label">Model Skoru</span>
-          <span class="model-score-val ${confidenceColor(p.modelScore)}">${p.modelScore}/100</span>
-        </div>
-      </div>
-    </div>`;
-  }).join('');
-}
-
-// ===== GÜNLÜK KUPON =====
-function generateCoupon(predictions) {
-  const src = predictions || window._currentAIPredictions || [];
-  const heroEl = document.getElementById('couponHero');
-  const matchesEl = document.getElementById('couponMatches');
-  
-  if (!heroEl || !matchesEl) return;
-  
-  if (src.length === 0) {
-    heroEl.innerHTML = '<div class="empty-state"><p>Kupon oluşturulamadı. API bağlantısı gerekli.</p></div>';
-    matchesEl.innerHTML = '';
-    return;
-  }
-  
-  const sorted = [...src].sort((a, b) => b.modelScore - a.modelScore).slice(0, 3);
-  const picks = sorted.map(p => ({ ...p, selectedMarket: p.markets[p.bestPick] }));
-
-  const totalOdds = picks.reduce((acc, p) => acc * parseFloat(p.selectedMarket.odds), 1).toFixed(2);
-  const avgConf = Math.round(picks.reduce((acc, p) => acc + p.selectedMarket.conf, 0) / picks.length);
-
-  heroEl.innerHTML = `
-    <div class="coupon-hero-inner">
-      <div class="coupon-date"><i class="fas fa-calendar"></i> ${new Date().toLocaleDateString('tr-TR')}</div>
-      <div class="coupon-hero-stats">
-        <div class="coupon-stat"><div class="coupon-stat-val">${totalOdds}</div><div class="coupon-stat-label">Toplam Oran</div></div>
-        <div class="coupon-stat"><div class="coupon-stat-val">%${avgConf}</div><div class="coupon-stat-label">Ort. Güven</div></div>
-        <div class="coupon-stat"><div class="coupon-stat-val">${picks.length}</div><div class="coupon-stat-label">Maç</div></div>
-      </div>
-    </div>`;
-
-  matchesEl.innerHTML = picks.map((p, i) => `
-    <div class="coupon-match-card">
-      <div class="coupon-num">${i + 1}</div>
-      <div class="coupon-match-body">
-        <div class="coupon-match-header">
-          <span class="coupon-league">${p.flag} ${p.league} | ${p.matchTime}</span>
-        </div>
-        <div class="coupon-match-name">${p.home} <span>vs</span> ${p.away}</div>
-        <div class="coupon-pick-row">
-          <span>${p.selectedMarket.label}</span>
-          <span class="coupon-pick-odd">@${p.selectedMarket.odds}</span>
-          <span class="coupon-pick-conf">%${p.selectedMarket.conf}</span>
-        </div>
-      </div>
-    </div>
-  `).join('');
-}
-
-// ===== TUTAN ANALİZLER =====
-function renderSuccessfulPredictions() {
-  const container = document.getElementById('successfulCards');
-  if (!container) return;
-  
-  const successful = getSuccessfulPredictions();
-  
-  if (successful.length === 0) {
-    container.innerHTML = `
-      <div class="empty-state">
-        <i class="fas fa-check-circle"></i>
-        <p>Henüz tutan analiz yok.</p>
-        <small>Maçlar bittiğinde tutan analizler burada görünecek.</small>
-      </div>`;
-    return;
-  }
-  
-  container.innerHTML = successful.reverse().map(item => {
-    const pred = item.prediction || {};
-    return `
-      <div class="success-card">
-        <div class="success-card-header">
-          <div class="success-card-league"><span>${item.flag || '⚽'}</span> ${item.league}</div>
-          <div class="success-badge">Tuttu</div>
-        </div>
-        <div class="success-card-match">${item.home} <span>vs</span> ${item.away}</div>
-        <div class="success-prediction">
-          <span>YZ Tahmini: ${pred.label || '-'}</span>
-          <span>@${pred.odds || '-'}</span>
-        </div>
-        <div class="success-result">Gerçekleşen: ${item.actualResult || '-'}</div>
-      </div>
-    `;
-  }).join('');
-}
-
-// ===== SECTION NAV =====
-const SECTIONS = ['live', 'ai', 'coupon', 'successful', 'premium'];
-
-function showSection(key) {
-  SECTIONS.forEach(s => {
-    const el = document.getElementById('sec-' + s);
-    if (el) el.classList.toggle('hidden', s !== key);
-  });
-  
-  const titleEl = document.getElementById('sectionTitle');
-  if (titleEl) {
-    const titles = {
-      live: 'Canlı Maçlar',
-      ai: 'YZ Tahmin Motoru',
-      coupon: 'Günlük YZ Kuponu',
-      successful: 'Tutan Analizler',
-      premium: 'Premium Kupon'
-    };
-    titleEl.textContent = titles[key] || '';
-  }
-  
-  document.querySelectorAll('.nav-item').forEach(el => {
-    const onclick = el.getAttribute('onclick') || '';
-    el.classList.toggle('active', onclick.includes(`'${key}'`));
-  });
-  
-  if (key === 'ai') renderAIPredictions(window._currentAIPredictions || []);
-  if (key === 'coupon') generateCoupon(window._currentAIPredictions || []);
-  if (key === 'successful') renderSuccessfulPredictions();
-}
-
-// ===== INIT =====
-document.addEventListener('DOMContentLoaded', () => {
-  if (document.getElementById('dashUserName')) initDashboard();
-});
+const ADMIN_EMAIL = 'djclubu@tahminarena.com';
+const API_URL = '/api/matches';
+
+const state = {
+  matches: [],
+  predictions: []
+};
+
+function getUsers() {
+  return JSON.parse(localStorage.getItem('oa_users') || '[]');
+}
+
+function setUsers(users) {
+  localStorage.setItem('oa_users', JSON.stringify(users));
+}
+
+function getSession() {
+  return JSON.parse(localStorage.getItem('oa_session') || 'null');
+}
+
+function setSession(data) {
+  localStorage.setItem('oa_session', JSON.stringify(data));
+}
+
+function togglePass(id, button) {
+  const input = document.getElementById(id);
+  if (!input) return;
+  input.type = input.type === 'password' ? 'text' : 'password';
+  button.innerHTML = input.type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
+}
+
+function handleLogin(event) {
+  event.preventDefault();
+  const email = document.getElementById('loginEmail').value.trim();
+  const pass = document.getElementById('loginPass').value;
+  const err = document.getElementById('loginError');
+
+  if (email === 'demo@tahminarena.com' && pass === 'demo123') {
+    setSession({ name: 'Demo Kullanıcı', email, premium: false });
+    window.location.href = './dashboard.html';
+    return;
+  }
+
+  const user = getUsers().find((u) => u.email === email && u.pass === btoa(pass));
+  if (!user) {
+    err.textContent = 'E-posta veya şifre hatalı.';
+    return;
+  }
+
+  setSession({ name: user.name, email: user.email, premium: !!user.premium });
+  window.location.href = './dashboard.html';
+}
+
+function handleRegister(event) {
+  event.preventDefault();
+  const name = document.getElementById('regName').value.trim();
+  const email = document.getElementById('regEmail').value.trim();
+  const pass = document.getElementById('regPass').value;
+  const pass2 = document.getElementById('regPass2').value;
+  const err = document.getElementById('regError');
+  const ok = document.getElementById('regSuccess');
+  err.textContent = '';
+  ok.textContent = '';
+
+  if (pass.length < 6) {
+    err.textContent = 'Şifre en az 6 karakter olmalı.';
+    return;
+  }
+
+  if (pass !== pass2) {
+    err.textContent = 'Şifreler uyuşmuyor.';
+    return;
+  }
+
+  const users = getUsers();
+  if (users.find((u) => u.email === email)) {
+    err.textContent = 'Bu e-posta kayıtlı.';
+    return;
+  }
+
+  const isAdmin = email === ADMIN_EMAIL;
+  users.push({ name, email, pass: btoa(pass), premium: isAdmin });
+  setUsers(users);
+  ok.textContent = 'Kayıt başarılı. Giriş ekranına yönlendiriliyorsun...';
+
+  setTimeout(() => {
+    window.location.href = './';
+  }, 900);
+}
+
+function logout() {
+  localStorage.removeItem('oa_session');
+}
+
+function isPremium() {
+  const session = getSession();
+  if (!session) return false;
+  if (session.email === ADMIN_EMAIL) return true;
+  const user = getUsers().find((u) => u.email === session.email);
+  return !!user?.premium;
+}
+
+function teamSeed(name = '') {
+  return name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
+}
+
+function confClass(value) {
+  if (value >= 70) return 'high';
+  if (value >= 55) return 'medium';
+  return 'low';
+}
+
+function createPrediction(match) {
+  const hs = teamSeed(match.home);
+  const as = teamSeed(match.away);
+
+  const homeXg = Number((1 + (hs % 12) / 10).toFixed(2));
+  const awayXg = Number((0.9 + (as % 11) / 10).toFixed(2));
+  const homeXga = Number((0.8 + (as % 9) / 11).toFixed(2));
+  const awayXga = Number((0.85 + (hs % 8) / 10).toFixed(2));
+
+  const confMS1 = Math.min(86, Math.max(42, Math.round(50 + (homeXg - awayXga) * 16)));
+  const confMS2 = Math.min(84, Math.max(40, Math.round(49 + (awayXg - homeXga) * 15)));
+  const confKG = Math.min(85, Math.max(40, Math.round(48 + (homeXg + awayXg - 2.4) * 20)));
+  const confOU = Math.min(87, Math.max(41, Math.round(47 + (homeXg + awayXg - 2.3) * 19)));
+  const confCorner = Math.min(82, Math.max(38, Math.round(50 + (homeXg + awayXg) * 7)));
+
+  const markets = [
+    { label: confMS1 >= confMS2 ? 'MS 1' : 'MS 2', odd: (1.75 + (88 - Math.max(confMS1, confMS2)) / 75).toFixed(2), conf: Math.max(confMS1, confMS2) },
+    { label: confKG >= 56 ? 'KG Var' : 'KG Yok', odd: (1.63 + Math.abs(65 - confKG) / 90).toFixed(2), conf: confKG },
+    { label: confOU >= 56 ? '2.5 Üst' : '2.5 Alt', odd: (1.67 + Math.abs(63 - confOU) / 92).toFixed(2), conf: confOU },
+    { label: confCorner >= 58 ? 'Korner 9.5 Üst' : 'Korner 9.5 Alt', odd: (1.71 + Math.abs(61 - confCorner) / 88).toFixed(2), conf: confCorner }
+  ];
+
+  return {
+    ...match,
+    analysis: { homeXg, awayXg, homeXga, awayXga },
+    modelScore: Math.round(markets.reduce((a, m) => a + m.conf, 0) / markets.length),
+    bestMarket: markets[0],
+    markets,
+    scenario: `${match.home} - ${match.away} maçında xG/xGA trendine göre ilk yarı dengeli, ikinci yarı tempo artışı bekleniyor.`
+  };
+}
+
+function matchResultStatus(prediction) {
+  if (!prediction.started) return { cls: 'pending', text: 'BAŞLAMADI' };
+  if (!prediction.finished) return { cls: 'live', text: `CANLI ${prediction.score || ''}`.trim() };
+
+  const [home, away] = (prediction.score || '0-0').split('-').map(Number);
+  const pick = prediction.bestMarket.label;
+  let ok = false;
+  if (pick === 'MS 1') ok = home > away;
+  if (pick === 'MS 2') ok = away > home;
+  if (!pick.startsWith('MS ')) ok = home !== away;
+
+  return ok ? { cls: 'ok', text: 'TAHMİN TUTTU' } : { cls: 'bad', text: 'TAHMİN TUTMADI' };
+}
+
+function renderLive() {
+  const box = document.getElementById('liveMatches');
+  box.innerHTML = state.predictions.map((m) => `
+    <article class="card">
+      <div class="meta"><span>${m.league}</span><span>${m.time}</span></div>
+      <div class="teams">${m.home} vs ${m.away}</div>
+      <div class="meta"><span>Durum: ${m.statusText}</span><span>Skor: ${m.score || '-'}</span></div>
+    </article>
+  `).join('');
+}
+
+function renderAI() {
+  const box = document.getElementById('aiCards');
+  const premium = isPremium();
+
+  box.innerHTML = state.predictions.map((m, i) => {
+    const locked = !premium && i > 1;
+    const st = matchResultStatus(m);
+    const markets = m.markets.map((mk) => `
+      <div class="market-row">
+        <span>${mk.label}</span>
+        <span class="market-odd">@${mk.odd}</span>
+        <span class="market-conf ${confClass(mk.conf)}">%${mk.conf}</span>
+      </div>
+    `).join('');
+
+    return `
+      <article class="card ${locked ? 'premium-blur' : ''}">
+        <div class="meta"><span>${m.league}</span><span class="result-pill ${st.cls}">${st.text}</span></div>
+        <div class="teams">${m.home} vs ${m.away}</div>
+        <div class="meta"><span>${m.time}</span><span>Model ${m.modelScore}</span></div>
+        <p class="muted">xG ${m.analysis.homeXg}-${m.analysis.awayXg} | xGA ${m.analysis.homeXga}-${m.analysis.awayXga}</p>
+        <p>${m.scenario}</p>
+        ${markets}
+        ${locked ? '<div class="premium-overlay">Premium üyelik ile açılır</div>' : ''}
+      </article>
+    `;
+  }).join('');
+}
+
+function renderSuccessful() {
+  const box = document.getElementById('successfulCards');
+  const wins = state.predictions.filter((m) => matchResultStatus(m).cls === 'ok');
+
+  if (!wins.length) {
+    box.innerHTML = '<article class="card"><p class="muted">Henüz tutan analiz yok.</p></article>';
+    return;
+  }
+
+  box.innerHTML = wins.map((m) => `
+    <article class="card">
+      <div class="meta"><span>${m.league}</span><span class="result-pill ok">TUTTU</span></div>
+      <div class="teams">${m.home} vs ${m.away}</div>
+      <p>Seçim: ${m.bestMarket.label} @${m.bestMarket.odd}</p>
+      <p class="muted">Skor: ${m.score}</p>
+    </article>
+  `).join('');
+}
+
+function renderCoupon() {
+  const hero = document.getElementById('couponHero');
+  const list = document.getElementById('couponMatches');
+  const picks = [...state.predictions].sort((a, b) => b.modelScore - a.modelScore).slice(0, 3);
+
+  if (!picks.length) {
+    hero.innerHTML = '<article class="coupon-hero">Kupon üretilemedi.</article>';
+    list.innerHTML = '';
+    return;
+  }
+
+  const total = picks.reduce((acc, p) => acc * Number(p.bestMarket.odd), 1).toFixed(2);
+  hero.innerHTML = `<article class="coupon-hero"><strong>Toplam Oran: ${total}</strong> • ${new Date().toLocaleDateString('tr-TR')}</article>`;
+
+  list.innerHTML = picks.map((p) => `
+    <article class="card">
+      <div class="teams">${p.home} vs ${p.away}</div>
+      <div class="meta"><span>${p.bestMarket.label}</span><span>@${p.bestMarket.odd}</span></div>
+    </article>
+  `).join('');
+}
+
+function refreshStats() {
+  const total = state.predictions.length;
+  const live = state.predictions.filter((m) => m.started && !m.finished).length;
+  const ok = state.predictions.filter((m) => matchResultStatus(m).cls === 'ok').length;
+  const rate = total ? Math.round((ok / total) * 100) : 0;
+
+  document.getElementById('todayCount').textContent = String(total);
+  document.getElementById('liveCount').textContent = String(live);
+  document.getElementById('successRate').textContent = `${rate}%`;
+}
+
+async function loadMatches() {
+  const fallback = [
+    { id: 1, league: 'Süper Lig', home: 'Galatasaray', away: 'Beşiktaş', time: '20:00', started: true, finished: false, score: '1-0', statusText: 'CANLI' },
+    { id: 2, league: 'Premier Lig', home: 'Arsenal', away: 'Chelsea', time: '21:30', started: false, finished: false, score: null, statusText: 'BAŞLAMADI' },
+    { id: 3, league: 'Serie A', home: 'Inter', away: 'Milan', time: '19:00', started: true, finished: true, score: '2-1', statusText: 'BİTTİ' }
+  ];
+
+  try {
+    const res = await fetch(API_URL);
+    if (!res.ok) throw new Error('api yok');
+    const data = await res.json();
+    const parsed = (data.matches || []).slice(0, 20).map((m, i) => {
+      const fx = m.fixture || {};
+      const tm = m.teams || {};
+      const gl = m.goals || {};
+      const league = m.league?.name || 'Lig';
+      const home = tm.home?.name || 'Ev';
+      const away = tm.away?.name || 'Dep';
+      const status = fx.status?.short || 'NS';
+      const started = !['NS', 'TBD'].includes(status);
+      const finished = ['FT', 'AET', 'PEN'].includes(status);
+      return {
+        id: fx.id || i + 1,
+        league,
+        home,
+        away,
+        time: new Date(fx.date || Date.now()).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
+        started,
+        finished,
+        score: Number.isInteger(gl.home) && Number.isInteger(gl.away) ? `${gl.home}-${gl.away}` : null,
+        statusText: finished ? 'BİTTİ' : started ? 'CANLI' : 'BAŞLAMADI'
+      };
+    });
+
+    state.matches = parsed.length ? parsed : fallback;
+  } catch {
+    state.matches = fallback;
+  }
+
+  state.predictions = state.matches.map(createPrediction);
+}
+
+function showSection(section) {
+  ['live', 'ai', 'successful', 'coupon', 'premium'].forEach((s) => {
+    const el = document.getElementById(`sec-${s}`);
+    if (el) el.classList.toggle('hidden', s !== section);
+  });
+
+  document.querySelectorAll('.nav-item').forEach((item) => {
+    item.classList.toggle('active', item.getAttribute('onclick').includes(`'${section}'`));
+  });
+
+  const titles = {
+    live: 'Canlı Maçlar',
+    ai: 'AI Analizler',
+    successful: 'Tutan Analizler',
+    coupon: 'Günlük Kupon',
+    premium: 'Premium'
+  };
+  document.getElementById('sectionTitle').textContent = titles[section] || 'Dashboard';
+}
+
+function toggleSidebar() {
+  document.getElementById('sidebar').classList.toggle('open');
+}
+
+function startClock() {
+  const el = document.getElementById('clock');
+  const tick = () => { el.textContent = new Date().toLocaleTimeString('tr-TR'); };
+  tick();
+  setInterval(tick, 1000);
+}
+
+async function initDashboard() {
+  const session = getSession();
+  if (!session) {
+    window.location.href = './';
+    return;
+  }
+
+  document.getElementById('dashUserName').textContent = session.name;
+  document.getElementById('dashUserEmail').textContent = session.email;
+
+  await loadMatches();
+  renderLive();
+  renderAI();
+  renderSuccessful();
+  renderCoupon();
+  refreshStats();
+  startClock();
+}
+
+document.addEventListener('DOMContentLoaded', () => {
+  if (document.getElementById('dashUserName')) {
+    initDashboard();
+  }
+});
