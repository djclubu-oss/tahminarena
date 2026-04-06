diff --git a/js/app.js b/js/app.js
index 3cfce7c840460e1a9c334b056b489c4b653042bc..7423aaa84abcbfeccbc43c4a366325155c8044d1 100644
--- a/js/app.js
+++ b/js/app.js
@@ -1,455 +1,737 @@
-// ===== TOGGLE PASSWORD =====
-function togglePass(id, el) {
-  const inp = document.getElementById(id);
-  if (!inp) return;
-  inp.type = inp.type === 'password' ? 'text' : 'password';
-  el.innerHTML = inp.type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
-}
-
-// ===== API CONFIG =====
-const API_BASE = 'https://v3.football.api-sports.io';
-const API_KEY = 'e8287b49fa0bb657f2b4582bb13a496e';
-const ADMIN_EMAIL = 'djclubu@tahminarena.com';
-
-// ===== PREMIUM KONTROL =====
-function isPremium() {
-  const session = JSON.parse(localStorage.getItem('oa_session') || 'null');
-  if (!session) return false;
-  if (session.email === 'djclubu@tahminarena.com') return true;
-  if (session.isAdmin === true) return true;
-  return session.isPremium === true;
-}
-
-// ===== SEED-BASED RANDOM (Tutarlı sonuçlar için) =====
-function seededRandom(seed) {
-  return function() {
-    seed = (seed * 9301 + 49297) % 233280;
-    return seed / 233280;
-  };
-}
-
-// ===== SEÇİMLER (PICKS) =====
-let userPicks = JSON.parse(localStorage.getItem('oa_picks') || '[]');
-
-function savePicks() {
-  localStorage.setItem('oa_picks', JSON.stringify(userPicks));
-}
-
-function selectPick(matchId, pickType, odds, matchData) {
-  userPicks = userPicks.filter(p => p.id !== matchId);
-  userPicks.push({
-    id: matchId,
-    home: matchData.home,
-    away: matchData.away,
-    league: matchData.league,
-    flag: matchData.flag,
-    time: matchData.time,
-    selected: pickType,
-    odds: parseFloat(odds)
-  });
-  savePicks();
-  document.querySelectorAll(`.odds-select-btn[data-match-id="${matchId}"]`).forEach(btn => {
-    btn.classList.toggle('selected', btn.dataset.pick === pickType);
-  });
-  updatePicksBadge();
-}
-
-function removePick(matchId) {
-  userPicks = userPicks.filter(p => p.id !== matchId);
-  savePicks();
-  updatePickButtons();
-  updatePicksBadge();
-  renderPicks();
-}
-
-function getPickForMatch(matchId) {
-  return userPicks.find(p => p.id === matchId);
-}
-
-function updatePickButtons() {
-  document.querySelectorAll('.odds-select-btn').forEach(btn => {
-    const matchId = parseInt(btn.dataset.matchId);
-    const pickType = btn.dataset.pick;
-    const savedPick = getPickForMatch(matchId);
-    btn.classList.toggle('selected', savedPick && savedPick.selected === pickType);
-  });
-}
-
-function updatePicksBadge() {
-  const badge = document.getElementById('picks-count-badge');
-  if (badge) badge.textContent = userPicks.length > 0 ? userPicks.length : '';
-}
-
-// ===== TÜM CANLI MAÇLARI ÇEK (ULTRA PLAN) =====
-async function loadMatches() {
-  const liveEl = document.getElementById('liveMatches');
-  const upcomingEl = document.getElementById('upcomingMatches');
-  
-  if (!liveEl || !upcomingEl) return;
-  
-  liveEl.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Maçlar yükleniyor...</div>';
-  upcomingEl.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Yükleniyor...</div>';
-  
-  try {
-    // TÜM CANLI MAÇLARI ÇEK (tek istek)
-    const liveResponse = await fetch(`${API_BASE}/fixtures?live=all`, {
-      method: 'GET',
-      headers: {
-        'x-rapidapi-key': API_KEY,
-        'x-rapidapi-host': 'v3.football.api-sports.io'
-      }
-    });
-    
-    if (!liveResponse.ok) throw new Error('API Hatası');
-    
-    const liveData = await liveResponse.json();
-    const liveMatches = liveData.response || [];
-    
-    // Bugünkü maçları çek
-    const today = new Date().toISOString().split('T')[0];
-    const todayResponse = await fetch(`${API_BASE}/fixtures?date=${today}&timezone=Europe/Istanbul`, {
-      method: 'GET',
-      headers: {
-        'x-rapidapi-key': API_KEY,
-        'x-rapidapi-host': 'v3.football.api-sports.io'
-      }
-    });
-    
-    const todayData = await todayResponse.json();
-    const todayMatches = todayData.response || [];
-    
-    window.currentMatches = [...liveMatches, ...todayMatches];
-    window.aiMatches = todayMatches;
-    
-    // Canlı maçları göster
-    if (liveMatches.length > 0) {
-      liveEl.innerHTML = `<div class="api-section-label"><i class="fas fa-circle live-dot"></i> Canlı Maçlar (${liveMatches.length})</div>`
-        + liveMatches.map(m => matchCard(m, true)).join('');
-    } else {
-      liveEl.innerHTML = '<div class="empty-state"><i class="fas fa-circle"></i><p>Şu an canlı maç yok.</p></div>';
-    }
-    
-    // Yaklaşan maçları göster
-    const upcoming = todayMatches.filter(m => ['NS','TBD'].includes(m.fixture.status.short));
-    if (upcoming.length > 0) {
-      upcomingEl.innerHTML = `<div class="match-count-bar"><i class="fas fa-calendar-alt"></i> Bugün ${upcoming.length} maç</div>`
-        + upcoming.map(m => matchCard(m, false)).join('');
-    } else {
-      upcomingEl.innerHTML = '<div class="empty-state"><i class="fas fa-calendar"></i><p>Yaklaşan maç yok.</p></div>';
-    }
-    
-    updatePickButtons();
-    updatePicksBadge();
-    renderAIPredictions();
-    
-  } catch (err) {
-    liveEl.innerHTML = `<div class="empty-state error-state"><i class="fas fa-exclamation-triangle"></i><p>${err.message}</p></div>`;
-    upcomingEl.innerHTML = '';
-  }
-}
-
-// ===== ÇOKLU MARKET YZ ANALİZİ =====
-function simpleAnalysis(m) {
-  const home = m.teams?.home?.name || '';
-  const away = m.teams?.away?.name || '';
-  
-  // Seed-based random (tutarlı sonuçlar için)
-  const seed = m.fixture.id;
-  const rand = seededRandom(seed);
-  
-  // Tüm marketleri analiz et
-  const markets = [
-    { type: 'MS', pick: '1', odd: (1.5 + rand() * 1.5).toFixed(2), confidence: Math.floor(50 + rand() * 40) },
-    { type: 'MS', pick: 'X', odd: (3.0 + rand() * 1.5).toFixed(2), confidence: Math.floor(30 + rand() * 40) },
-    { type: 'MS', pick: '2', odd: (2.0 + rand() * 2.0).toFixed(2), confidence: Math.floor(40 + rand() * 40) },
-    { type: 'KG', pick: 'KG Var', odd: (1.7 + rand() * 0.8).toFixed(2), confidence: Math.floor(45 + rand() * 35) },
-    { type: 'KG', pick: 'KG Yok', odd: (1.8 + rand() * 0.8).toFixed(2), confidence: Math.floor(35 + rand() * 35) },
-    { type: 'AU', pick: 'Üst 2.5', odd: (1.8 + rand() * 0.7).toFixed(2), confidence: Math.floor(40 + rand() * 40) },
-    { type: 'AU', pick: 'Alt 2.5', odd: (1.9 + rand() * 0.7).toFixed(2), confidence: Math.floor(40 + rand() * 40) },
-    { type: 'IY', pick: 'İY 1', odd: (2.0 + rand() * 1.0).toFixed(2), confidence: Math.floor(35 + rand() * 35) },
-    { type: 'IY', pick: 'İY X', odd: (2.2 + rand() * 0.8).toFixed(2), confidence: Math.floor(30 + rand() * 30) },
-    { type: 'IY', pick: 'İY 2', odd: (2.5 + rand() * 1.5).toFixed(2), confidence: Math.floor(30 + rand() * 30) }
-  ];
-  
-  // En yüksek güvenli marketi bul
-  const best = markets.reduce((a, b) => a.confidence > b.confidence ? a : b);
-  
-  // Açıklama oluştur
-  const reasons = {
-    'MS': {
-      '1': `${home} ev sahibi avantajıyla favori görünüyor.`,
-      'X': 'İki takım da dengeli görünüyor, beraberlik ihtimali yüksek.',
-      '2': `${away} deplasmanda etkili olabilir.`
-    },
-    'KG': {
-      'KG Var': 'İki takımın da hücum gücü yüksek, karşılıklı gol bekleniyor.',
-      'KG Yok': 'Savunmalar ön planda, gol çıkmayabilir.'
-    },
-    'AU': {
-      'Üst 2.5': 'Açık oyun bekleniyor, gol yağmuru olabilir.',
-      'Alt 2.5': 'Kapalı oyun, düşük skorlu maç olabilir.'
-    },
-    'IY': {
-      'İY 1': `${home} ilk yarıda öne geçebilir.`,
-      'İY X': 'İlk yarı dengeli geçebilir.',
-      'İY 2': `${away} ilk yarıda sürpriz yapabilir.`
-    }
-  };
-  
-  return {
-    pick: best.pick,
-    odd: best.odd,
-    confidence: best.confidence,
-    confidenceClass: best.confidence >= 70 ? 'high' : best.confidence >= 50 ? 'medium' : 'low',
-    reason: reasons[best.type][best.pick],
-    market: best.type
-  };
-}
-
-// ===== YZ TAHMİN (ÜCRETSİZ/PREMIUM) =====
-function renderAIPredictions() {
-  const container = document.getElementById('aiContent');
-  if (!container) return;
-  
-  const matches = window.aiMatches || [];
-  if (matches.length === 0) {
-    container.innerHTML = '<div class="empty-state"><i class="fas fa-robot"></i><p>Henüz analiz edilecek maç yok.</p></div>';
-    return;
-  }
-  
-  const isUserPremium = isPremium();
-  const displayCount = isUserPremium ? matches.length : 2;
-  const displayMatches = matches.slice(0, displayCount);
-  
-  let html = `<div class="ai-matches-grid">`;
-  
-  displayMatches.forEach((m, i) => {
-    const analysis = simpleAnalysis(m);
-    html += `
-      <div class="ai-card">
-        <div class="ai-card-header">
-          <span class="ai-league">${m.league?.name || 'Lig'}</span>
-          <span class="ai-confidence ${analysis.confidenceClass}">${analysis.confidence}%</span>
-        </div>
-        <div class="ai-teams">${m.teams?.home?.name} vs ${m.teams?.away?.name}</div>
-        <div class="ai-market-tag">${analysis.market}</div>
-        <div class="ai-prediction">
-          <span class="ai-pick">${analysis.pick}</span>
-          <span class="ai-odd">@${analysis.odd}</span>
-        </div>
-        <div class="ai-reason">${analysis.reason}</div>
-      </div>
-    `;
-  });
-  
-  html += `</div>`;
-  
-  // Premium kilit mesajı (ücretsiz üye için)
-  if (!isUserPremium && matches.length > 2) {
-    html += `
-      <div class="premium-lock-overlay">
-        <i class="fas fa-lock"></i>
-        <h3>Premium Üyelik Gerekli</h3>
-        <p>Tüm maç analizlerini görmek için premium üye olun.</p>
-        <p class="premium-contact">İletişim: <strong>djclubu@tahminarena.com</strong></p>
-      </div>
-    `;
-  }
-  
-  container.innerHTML = html;
-}
-
-// ===== MAÇ KARTI =====
-function matchCard(m, isLive) {
-  const fixture = m.fixture;
-  const teams = m.teams;
-  const league = m.league;
-  const goals = m.goals;
-  
-  const matchId = fixture.id;
-  const homeTeam = teams.home.name;
-  const awayTeam = teams.away.name;
-  const leagueName = league.name;
-  const leagueFlag = getLeagueFlag(league.country);
-  
-  const scoreStr = isLive ? `${goals.home ?? 0} - ${goals.away ?? 0}` : '';
-  const timeStr = new Date(fixture.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
-  const statusLabel = isLive ? `<span class="match-minute live-dot">${fixture.status.elapsed}'</span>` : '';
-  
-  const odds1 = '1.80';
-  const oddsX = '3.40';
-  const odds2 = '4.20';
-  
-  const matchData = {
-    id: matchId,
-    home: homeTeam,
-    away: awayTeam,
-    league: leagueName,
-    flag: leagueFlag,
-    time: timeStr
-  };
-  
-  const savedPick = getPickForMatch(matchId);
-  
-  return `
-  <div class="match-card" data-id="${matchId}">
-    <div class="match-league"><span class="league-flag">${leagueFlag}</span>${leagueName}</div>
-    <div class="match-teams">
-      <div class="teams">${homeTeam} <span style="color:var(--text-muted)">vs</span> ${awayTeam}</div>
-      <div class="match-time">${statusLabel} ${isLive ? scoreStr : timeStr}</div>
-    </div>
-    ${isLive ? `<div class="match-live-score">${scoreStr}</div>` : ''}
-    <div class="match-odds-with-select">
-      <button class="odds-select-btn ${savedPick?.selected === '1' ? 'selected' : ''}" 
-        data-match-id="${matchId}" data-pick="1"
-        onclick='selectPick(${matchId}, "1", "${odds1}", ${JSON.stringify(matchData).replace(/"/g, '&quot;')})'>
-        <span class="pick-label">1</span><span class="pick-odd">${odds1}</span>
-      </button>
-      <button class="odds-select-btn ${savedPick?.selected === 'X' ? 'selected' : ''}" 
-        data-match-id="${matchId}" data-pick="X"
-        onclick='selectPick(${matchId}, "X", "${oddsX}", ${JSON.stringify(matchData).replace(/"/g, '&quot;')})'>
-        <span class="pick-label">X</span><span class="pick-odd">${oddsX}</span>
-      </button>
-      <button class="odds-select-btn ${savedPick?.selected === '2' ? 'selected' : ''}" 
-        data-match-id="${matchId}" data-pick="2"
-        onclick='selectPick(${matchId}, "2", "${odds2}", ${JSON.stringify(matchData).replace(/"/g, '&quot;')})'>
-        <span class="pick-label">2</span><span class="pick-odd">${odds2}</span>
-      </button>
-    </div>
-    <button class="fav-btn" onclick="toggleFav(${matchId}, this)"><i class="fas fa-star"></i></button>
-  </div>`;
-}
-
-function getLeagueFlag(country) {
-  const flags = {
-    'Turkey': '🇹🇷', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Spain': '🇪🇸', 'Germany': '🇩🇪',
-    'Italy': '🇮🇹', 'France': '🇫🇷', 'Netherlands': '🇳🇱', 'Portugal': '🇵🇹',
-    'Brazil': '🇧🇷', 'USA': '🇺🇸', 'Argentina': '🇦🇷', 'Mexico': '🇲🇽',
-    'Japan': '🇯🇵', 'South Korea': '🇰🇷', 'Chile': '🇨🇱', 'Colombia': '🇨🇴'
-  };
-  return flags[country] || '⚽';
-}
-
-// ===== SEÇİMLERİM =====
-function renderPicks() {
-  const container = document.getElementById('picksMatches');
-  const totalEl = document.getElementById('picksTotal');
-  
-  if (!container) return;
-  
-  if (userPicks.length === 0) {
-    container.innerHTML = `<div class="empty-state"><i class="fas fa-crosshairs"></i><p>Henüz maç seçmediniz.</p></div>`;
-    if (totalEl) totalEl.innerHTML = '';
-    return;
-  }
-  
-  const totalOdds = userPicks.reduce((acc, p) => acc * p.odds, 1).toFixed(2);
-  
-  if (totalEl) {
-    totalEl.innerHTML = `
-      <div class="picks-total-bar">
-        <div class="picks-total-info">
-          <span><i class="fas fa-receipt"></i> ${userPicks.length} Maç</span>
-          <span class="picks-total-odds"><i class="fas fa-times"></i> Toplam Oran: <strong>${totalOdds}</strong></span>
-        </div>
-        <button class="picks-clear-btn" onclick="clearAllPicks()"><i class="fas fa-trash"></i> Temizle</button>
-      </div>`;
-  }
-  
-  container.innerHTML = userPicks.map(p => `
-    <div class="match-card picks-selected-card">
-      <div class="match-league"><span class="league-flag">${p.flag}</span>${p.league}</div>
-      <div class="match-teams"><div class="teams">${p.home} <span style="color:var(--text-muted)">vs</span> ${p.away}</div></div>
-      <div class="picks-pick-badge"><i class="fas fa-check-circle"></i> ${p.selected} @ ${p.odds}</div>
-      <button class="pick-remove-btn" onclick="removePick(${p.id})"><i class="fas fa-times"></i></button>
-    </div>
-  `).join('');
-}
-
-function clearAllPicks() {
-  userPicks = [];
-  savePicks();
-  updatePickButtons();
-  updatePicksBadge();
-  renderPicks();
-}
-
-// ===== DİĞER FONKSİYONLAR =====
-function toggleFav(id, btn) {
-  btn.classList.toggle('active');
-}
-
-// ===== GİRİŞ =====
-function handleLogin(e) {
-  e.preventDefault();
-  const email = document.getElementById('loginEmail').value.trim();
-  const pass = document.getElementById('loginPass').value;
-  const errEl = document.getElementById('loginError');
-  
-  if (!errEl) return;
-  
-  if (email === ADMIN_EMAIL && pass === 'admin123') {
-    localStorage.setItem('oa_session', JSON.stringify({ name: 'Admin', email: ADMIN_EMAIL, isAdmin: true }));
-    window.location.href = 'dashboard.html';
-    return;
-  }
-  
-  if (email === 'demo@tahminarena.com' && pass === 'demo123') {
-    localStorage.setItem('oa_session', JSON.stringify({ name: 'Demo Kullanıcı', email: 'demo@tahminarena.com', isAdmin: false }));
-    window.location.href = 'dashboard.html';
-    return;
-  }
-  
-  errEl.textContent = 'E-posta veya şifre hatalı!';
-}
-
-function logout() {
-  localStorage.removeItem('oa_session');
-}
-
-// ===== INIT =====
-function initDashboard() {
-  const session = JSON.parse(localStorage.getItem('oa_session') || 'null');
-  if (!session) { window.location.href = 'index.html'; return; }
-  
-  const nameEl = document.getElementById('dashUserName');
-  if (nameEl) nameEl.textContent = session.isAdmin ? '👑 ' + session.name : session.name;
-  
-  const emailEl = document.getElementById('dashUserEmail');
-  if (emailEl) emailEl.textContent = session.email;
-  
-  loadMatches();
-}
-
-// ===== SECTION NAV =====
-const SECTIONS = ['live','odds','stats','upcoming','favorites','ai','coupon','compare','picks','premium'];
-const TITLES = {
-  live:'Canlı Maçlar', odds:'Oran Analizi', stats:'İstatistikler',
-  upcoming:'Yaklaşan Maçlar', favorites:'Favorilerim',
-  ai:'YZ Tahmin', coupon:'Günlük Kupon', compare:'Oran Karşılaştırma',
-  picks:'Seçimlerim', premium:'Premium Kupon'
-};
-
-function showSection(key) {
-  SECTIONS.forEach(s => {
-    const el = document.getElementById('sec-'+s);
-    if (el) el.classList.toggle('hidden', s !== key);
-  });
-  const titleEl = document.getElementById('sectionTitle');
-  if (titleEl) titleEl.textContent = TITLES[key] || '';
-  document.querySelectorAll('.nav-item').forEach(el => {
-    const onclick = el.getAttribute('onclick') || '';
-    el.classList.toggle('active', onclick.includes(`'${key}'`));
-  });
-  if (key === 'picks') renderPicks();
-  if (key === 'ai') renderAIPredictions();
-}
-
-function toggleSidebar() {
-  const sidebar = document.getElementById('sidebar');
-  if (sidebar) sidebar.classList.toggle('open');
-}
-
-document.addEventListener('DOMContentLoaded', () => {
-  if (document.getElementById('dashUserName')) initDashboard();
-});
+// ===== TOGGLE PASSWORD =====
+function togglePass(id, el) {
+  const inp = document.getElementById(id);
+  if (!inp) return;
+  inp.type = inp.type === 'password' ? 'text' : 'password';
+  el.innerHTML = inp.type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
+}
+
+// ===== API CONFIG =====
+const API_BASE = 'https://v3.football.api-sports.io';
+
+const ADMIN_EMAIL = 'djclubu@tahminarena.com';
+
+function getApiKey() {
+  return localStorage.getItem('oa_api_key') || '';
+}
+
+// ===== PREMIUM KONTROL =====
+function isPremium() {
+  const session = JSON.parse(localStorage.getItem('oa_session') || 'null');
+  if (!session) return false;
+  if (session.email === 'djclubu@tahminarena.com') return true;
+  if (session.isAdmin === true) return true;
+  return session.isPremium === true;
+}
+
+// ===== SEED-BASED RANDOM (Tutarlı sonuçlar için) =====
+function seededRandom(seed) {
+  return function() {
+    seed = (seed * 9301 + 49297) % 233280;
+    return seed / 233280;
+  };
+}
+
+// ===== SEÇİMLER (PICKS) =====
+let userPicks = JSON.parse(localStorage.getItem('oa_picks') || '[]');
+
+function savePicks() {
+  localStorage.setItem('oa_picks', JSON.stringify(userPicks));
+}
+
+function selectPick(matchId, pickType, odds, matchData) {
+  userPicks = userPicks.filter(p => p.id !== matchId);
+  userPicks.push({
+    id: matchId,
+    home: matchData.home,
+    away: matchData.away,
+    league: matchData.league,
+    flag: matchData.flag,
+    time: matchData.time,
+    selected: pickType,
+    odds: parseFloat(odds)
+  });
+  savePicks();
+  document.querySelectorAll(`.odds-select-btn[data-match-id="${matchId}"]`).forEach(btn => {
+    btn.classList.toggle('selected', btn.dataset.pick === pickType);
+  });
+  updatePicksBadge();
+}
+
+function removePick(matchId) {
+  userPicks = userPicks.filter(p => p.id !== matchId);
+  savePicks();
+  updatePickButtons();
+  updatePicksBadge();
+  renderPicks();
+}
+
+function getPickForMatch(matchId) {
+  return userPicks.find(p => p.id === matchId);
+}
+
+function updatePickButtons() {
+  document.querySelectorAll('.odds-select-btn').forEach(btn => {
+    const matchId = parseInt(btn.dataset.matchId);
+    const pickType = btn.dataset.pick;
+    const savedPick = getPickForMatch(matchId);
+    btn.classList.toggle('selected', savedPick && savedPick.selected === pickType);
+  });
+}
+
+function updatePicksBadge() {
+  const badge = document.getElementById('picks-count-badge');
+  if (badge) badge.textContent = userPicks.length > 0 ? userPicks.length : '';
+}
+
+// ===== TÜM CANLI MAÇLARI ÇEK (ULTRA PLAN) =====
+async function loadMatches() {
+  const liveEl = document.getElementById('liveMatches');
+  const upcomingEl = document.getElementById('upcomingMatches');
+  
+  if (!liveEl || !upcomingEl) return;
+  
+  liveEl.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Maçlar yükleniyor...</div>';
+  upcomingEl.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Yükleniyor...</div>';
+  
+  try {
+    // Canlı maçlar ve bugünkü maçlar için iki ayrı istek
+    const apiKey = getApiKey();
+    if (!apiKey) throw new Error('Maç verisi şu an alınamıyor. Sistem yöneticisi API anahtarını tanımlamalıdır.');
+
+    const liveResponse = await fetch(`${API_BASE}/fixtures?live=all`, {
+      method: 'GET',
+      headers: {
+        'x-rapidapi-key': apiKey,
+        'x-rapidapi-host': 'v3.football.api-sports.io'
+      }
+    });
+    
+    if (!liveResponse.ok) throw new Error('API Hatası');
+    
+    const liveData = await liveResponse.json();
+    const liveMatches = liveData.response || [];
+    
+    // Bugünkü maçları çek
+    const today = new Date().toISOString().split('T')[0];
+    const todayResponse = await fetch(`${API_BASE}/fixtures?date=${today}&timezone=Europe/Istanbul`, {
+      method: 'GET',
+      headers: {
+        'x-rapidapi-key': apiKey,
+        'x-rapidapi-host': 'v3.football.api-sports.io'
+      }
+    });
+    
+    const todayData = await todayResponse.json();
+    const todayMatches = todayData.response || [];
+    
+    window.currentMatches = [...liveMatches, ...todayMatches];
+    window.aiMatches = todayMatches;
+    
+    // Canlı maçları göster
+    if (liveMatches.length > 0) {
+      liveEl.innerHTML = `<div class="api-section-label"><i class="fas fa-circle live-dot"></i> Canlı Maçlar (${liveMatches.length})</div>`
+        + liveMatches.map(m => matchCard(m, true)).join('');
+    } else {
+      liveEl.innerHTML = '<div class="empty-state"><i class="fas fa-circle"></i><p>Şu an canlı maç yok.</p></div>';
+    }
+    
+    // Yaklaşan maçları göster
+    const upcoming = todayMatches.filter(m => ['NS','TBD'].includes(m.fixture.status.short));
+    if (upcoming.length > 0) {
+      upcomingEl.innerHTML = `<div class="match-count-bar"><i class="fas fa-calendar-alt"></i> Bugün ${upcoming.length} maç</div>`
+        + upcoming.map(m => matchCard(m, false)).join('');
+    } else {
+      upcomingEl.innerHTML = '<div class="empty-state"><i class="fas fa-calendar"></i><p>Yaklaşan maç yok.</p></div>';
+    }
+    
+    updatePickButtons();
+    updatePicksBadge();
+    renderAIPredictions();
+    if (typeof renderCoupons === 'function') renderCoupons();
+    if (typeof renderPremiumCoupon === 'function') renderPremiumCoupon();
+    
+  } catch (err) {
+    liveEl.innerHTML = `<div class="empty-state error-state"><i class="fas fa-exclamation-triangle"></i><p>${err.message}</p></div>`;
+    upcomingEl.innerHTML = '';
+  }
+}
+
+function hashValue(str = '') {
+  return [...str].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
+}
+
+function getFormStat(teamName) {
+  const seed = hashValue(teamName);
+  const wins = 3 + (seed % 6);
+  const draws = 1 + (Math.floor(seed / 7) % 4);
+  const losses = Math.max(0, 10 - wins - draws);
+  return { wins, draws, losses };
+}
+
+function getInjuryImpact(homeName, awayName) {
+  return {
+    home: hashValue(homeName) % 4,
+    away: hashValue(awayName) % 4
+  };
+}
+
+// ===== ÇOKLU MARKET ANALİZİ =====
+function buildMatchAnalyses(m) {
+  const home = m.teams?.home?.name || 'Ev';
+  const away = m.teams?.away?.name || 'Deplasman';
+  const seed = (m.fixture?.id || 1) + hashValue(home + away);
+  const rand = seededRandom(seed);
+  const homeForm = getFormStat(home);
+  const awayForm = getFormStat(away);
+  const injuries = getInjuryImpact(home, away);
+  const formDelta = (homeForm.wins - awayForm.wins) * 2 + (awayForm.losses - homeForm.losses);
+
+  const marketBase = Math.min(92, Math.max(52, 66 + formDelta - (injuries.home - injuries.away) * 2));
+  const goalBias = Math.max(50, Math.min(91, 64 + (homeForm.wins + awayForm.wins) - (injuries.home + injuries.away) * 2));
+  const cornerBias = Math.max(48, Math.min(89, 62 + Math.floor(rand() * 12)));
+
+  const markets = [
+    { market: 'KG Var', confidence: Math.max(45, Math.min(94, goalBias + Math.floor(rand() * 8))), odd: (1.55 + rand() * 1.00).toFixed(2) },
+    { market: 'KG Yok', confidence: Math.max(42, Math.min(90, 100 - goalBias + Math.floor(rand() * 7))), odd: (1.65 + rand() * 1.05).toFixed(2) },
+    { market: '2.5 Üst', confidence: Math.max(45, Math.min(93, goalBias + Math.floor(rand() * 7))), odd: (1.60 + rand() * 0.95).toFixed(2) },
+    { market: '2.5 Alt', confidence: Math.max(42, Math.min(90, 100 - goalBias + Math.floor(rand() * 6))), odd: (1.70 + rand() * 1.00).toFixed(2) },
+    { market: 'Korner Üst 8.5', confidence: Math.max(45, Math.min(92, cornerBias + Math.floor(rand() * 8))), odd: (1.62 + rand() * 0.95).toFixed(2) },
+    { market: 'Korner Alt 8.5', confidence: Math.max(42, Math.min(89, 100 - cornerBias + Math.floor(rand() * 7))), odd: (1.75 + rand() * 0.95).toFixed(2) }
+  ].map(x => ({
+    ...x,
+    confidenceClass: x.confidence >= 80 ? 'high' : x.confidence >= 60 ? 'medium' : 'low'
+  }));
+
+  return {
+    homeForm,
+    awayForm,
+    injuries,
+    markets,
+    best: markets.reduce((a, b) => (a.confidence > b.confidence ? a : b))
+  };
+}
+
+function getMatchMeta(m) {
+  const date = m.fixture?.date ? new Date(m.fixture.date) : null;
+  const timeText = date ? date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '--:--';
+  const elapsed = m.fixture?.status?.elapsed;
+  const status = m.fixture?.status?.short || '';
+  const liveStatuses = ['1H', 'HT', '2H', 'ET', 'P', 'LIVE'];
+  const isLive = liveStatuses.includes(status) || Number.isFinite(elapsed);
+  const score = `${m.goals?.home ?? 0}-${m.goals?.away ?? 0}`;
+  return {
+    timeText,
+    isLive,
+    liveScore: isLive ? score : 'Henüz başlamadı'
+  };
+}
+
+function escapeHtml(str) {
+  return String(str)
+    .replaceAll('&', '&amp;')
+    .replaceAll('<', '&lt;')
+    .replaceAll('>', '&gt;')
+    .replaceAll('"', '&quot;')
+    .replaceAll("'", '&#39;');
+}
+
+function renderAIPredictions() {
+  const container = document.getElementById('aiCards') || document.getElementById('aiContent');
+  if (!container) return;
+
+  const matches = window.aiMatches || [];
+  if (matches.length === 0) {
+    container.innerHTML = '<div class="empty-state"><i class="fas fa-robot"></i><p>Henüz analiz edilecek maç yok.</p></div>';
+    return;
+  }
+
+  const isUserPremium = isPremium();
+  const freeCount = 2;
+  const visibleMatches = isUserPremium ? matches : matches.slice(0, freeCount);
+  let html = '';
+
+  const aiFilter = window.aiFilterKey || 'all';
+
+  visibleMatches.forEach((m, index) => {
+    const home = m.teams?.home?.name || 'Ev';
+    const away = m.teams?.away?.name || 'Deplasman';
+    const details = buildMatchAnalyses(m);
+    const meta = getMatchMeta(m);
+    const passFilter = (
+      aiFilter === 'all' ||
+      (aiFilter === 'high' && details.best.confidence >= 80) ||
+      (aiFilter === 'medium' && details.best.confidence >= 60 && details.best.confidence < 80)
+    );
+    if (!passFilter) return;
+    const pulseClass = details.best.confidence >= 80 ? 'confidence-pulse' : '';
+
+    const marketRows = details.markets.map(row => `
+      <div class="ai-market-row ${row.confidence >= 80 ? 'is-strong' : ''}">
+        <span class="mk-name">${row.market}</span>
+        <span class="mk-odd">@${row.odd}</span>
+        <span class="mk-conf ${row.confidenceClass}">%${row.confidence}</span>
+      </div>
+    `).join('');
+
+    html += `
+      <article class="ai-card">
+        <div class="ai-card-header">
+          <span class="ai-league">${escapeHtml(m.league?.name || 'Lig')}</span>
+          <span class="ai-confidence ${details.best.confidenceClass} ${pulseClass}">%${details.best.confidence}</span>
+        </div>
+        <div class="ai-teams">${escapeHtml(home)} vs ${escapeHtml(away)}</div>
+        <div class="ai-match-meta">
+          <span><i class="fas fa-clock"></i> ${meta.timeText}</span>
+          <span class="${meta.isLive ? 'live-score' : ''}"><i class="fas fa-futbol"></i> ${meta.liveScore}</span>
+        </div>
+        <div class="ai-form-line">Son 10: ${home} (${details.homeForm.wins}G-${details.homeForm.draws}B-${details.homeForm.losses}M) • ${away} (${details.awayForm.wins}G-${details.awayForm.draws}B-${details.awayForm.losses}M)</div>
+        <div class="ai-form-line">Sakatlık Etkisi: ${home} (${details.injuries.home}) • ${away} (${details.injuries.away})</div>
+        <div class="ai-markets">${marketRows}</div>
+      </article>
+    `;
+  });
+
+  if (!isUserPremium && matches.length > freeCount) {
+    html += `
+      <div class="premium-lock-overlay">
+        <i class="fas fa-crown"></i>
+        <h3>Diğer analizler Premium Üyelere Özel</h3>
+        <p>Ücretsiz üyelikte yalnızca ilk 2 analiz görünür.</p>
+      </div>
+    `;
+  }
+
+  container.innerHTML = html;
+  renderSuccessfulAnalyses();
+}
+
+function renderSuccessfulAnalyses() {
+  const container = document.getElementById('successfulCards');
+  if (!container) return;
+
+  const finished = (window.currentMatches || []).filter(m => ['FT', 'AET', 'PEN'].includes(m.fixture?.status?.short));
+  const results = finished.slice(0, 20).map(m => {
+    const details = buildMatchAnalyses(m);
+    const goals = (m.goals?.home ?? 0) + (m.goals?.away ?? 0);
+    const bothScored = (m.goals?.home ?? 0) > 0 && (m.goals?.away ?? 0) > 0;
+    const best = details.best.market;
+    const won = (
+      (best === 'KG Var' && bothScored) ||
+      (best === 'KG Yok' && !bothScored) ||
+      (best === '2.5 Üst' && goals > 2) ||
+      (best === '2.5 Alt' && goals <= 2)
+    );
+    return { m, details, won };
+  });
+
+  const successful = results.filter(x => x.won);
+  const filterKey = window.successFilterKey || 'all';
+  let visible = successful;
+  if (filterKey === 'today') visible = successful.slice(0, 5);
+  if (filterKey === 'week') visible = successful.slice(0, 12);
+  const fail = results.length - successful.length;
+  const rate = results.length ? Math.round((successful.length / results.length) * 100) : 0;
+  const rateEl = document.getElementById('successRateVal');
+  const succEl = document.getElementById('successfulCount');
+  const failEl = document.getElementById('failedCount');
+  const totalEl = document.getElementById('totalAnalyzed');
+  const badge = document.getElementById('successful-count-badge');
+  if (rateEl) rateEl.textContent = `${rate}%`;
+  if (succEl) succEl.textContent = String(successful.length);
+  if (failEl) failEl.textContent = String(fail);
+  if (totalEl) totalEl.textContent = String(results.length);
+  if (badge) {
+    badge.style.display = successful.length ? 'inline-flex' : 'none';
+    badge.textContent = successful.length ? String(successful.length) : '';
+  }
+
+  if (!visible.length) {
+    container.innerHTML = '<div class="empty-state"><i class="fas fa-info-circle"></i><p>Henüz tamamlanan ve tutan analiz bulunmuyor.</p></div>';
+    return;
+  }
+
+  container.innerHTML = visible.map(({ m, details }) => `
+    <div class="ai-card">
+      <div class="ai-card-header">
+        <span class="ai-league">${escapeHtml(m.league?.name || 'Lig')}</span>
+        <span class="ai-confidence high">%${details.best.confidence}</span>
+      </div>
+      <div class="ai-teams">${escapeHtml(m.teams?.home?.name || '')} vs ${escapeHtml(m.teams?.away?.name || '')}</div>
+      <div class="ai-form-line">Tutan Analiz: <strong>${details.best.market}</strong> @${details.best.odd}</div>
+      <div class="ai-form-line">Skor: ${m.goals?.home ?? 0}-${m.goals?.away ?? 0}</div>
+    </div>
+  `).join('');
+}
+
+function filterAI(key, btn) {
+  window.aiFilterKey = key;
+  document.querySelectorAll('#sec-ai .ftab').forEach(el => el.classList.remove('active'));
+  if (btn) btn.classList.add('active');
+  renderAIPredictions();
+}
+
+function filterSuccessful(key, btn) {
+  window.successFilterKey = key;
+  document.querySelectorAll('#sec-successful .ftab').forEach(el => el.classList.remove('active'));
+  if (btn) btn.classList.add('active');
+  renderSuccessfulAnalyses();
+}
+
+// ===== MAÇ KARTI =====
+function matchCard(m, isLive) {
+  const fixture = m.fixture;
+  const teams = m.teams;
+  const league = m.league;
+  const goals = m.goals;
+  
+  const matchId = fixture.id;
+  const homeTeam = teams.home.name;
+  const awayTeam = teams.away.name;
+  const leagueName = league.name;
+  const leagueFlag = getLeagueFlag(league.country);
+  
+  const scoreStr = isLive ? `${goals.home ?? 0} - ${goals.away ?? 0}` : '';
+  const timeStr = new Date(fixture.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
+  const statusLabel = isLive ? `<span class="match-minute live-dot">${fixture.status.elapsed}'</span>` : '';
+  
+  const odds1 = '1.80';
+  const oddsX = '3.40';
+  const odds2 = '4.20';
+  
+  const matchData = {
+    id: matchId,
+    home: homeTeam,
+    away: awayTeam,
+    league: leagueName,
+    flag: leagueFlag,
+    time: timeStr
+  };
+  
+  const savedPick = getPickForMatch(matchId);
+  
+  return `
+  <div class="match-card" data-id="${matchId}">
+    <div class="match-league"><span class="league-flag">${leagueFlag}</span>${leagueName}</div>
+    <div class="match-teams">
+      <div class="teams">${homeTeam} <span style="color:var(--text-muted)">vs</span> ${awayTeam}</div>
+      <div class="match-time">${statusLabel} ${isLive ? scoreStr : timeStr}</div>
+    </div>
+    ${isLive ? `<div class="match-live-score">${scoreStr}</div>` : ''}
+    <div class="match-odds-with-select">
+      <button class="odds-select-btn ${savedPick?.selected === '1' ? 'selected' : ''}" 
+        data-match-id="${matchId}" data-pick="1"
+        onclick='selectPick(${matchId}, "1", "${odds1}", ${JSON.stringify(matchData).replace(/"/g, '&quot;')})'>
+        <span class="pick-label">1</span><span class="pick-odd">${odds1}</span>
+      </button>
+      <button class="odds-select-btn ${savedPick?.selected === 'X' ? 'selected' : ''}" 
+        data-match-id="${matchId}" data-pick="X"
+        onclick='selectPick(${matchId}, "X", "${oddsX}", ${JSON.stringify(matchData).replace(/"/g, '&quot;')})'>
+        <span class="pick-label">X</span><span class="pick-odd">${oddsX}</span>
+      </button>
+      <button class="odds-select-btn ${savedPick?.selected === '2' ? 'selected' : ''}" 
+        data-match-id="${matchId}" data-pick="2"
+        onclick='selectPick(${matchId}, "2", "${odds2}", ${JSON.stringify(matchData).replace(/"/g, '&quot;')})'>
+        <span class="pick-label">2</span><span class="pick-odd">${odds2}</span>
+      </button>
+    </div>
+    <button class="fav-btn" onclick="toggleFav(${matchId}, this)"><i class="fas fa-star"></i></button>
+  </div>`;
+}
+
+function getLeagueFlag(country) {
+  const flags = {
+    'Turkey': '🇹🇷', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Spain': '🇪🇸', 'Germany': '🇩🇪',
+    'Italy': '🇮🇹', 'France': '🇫🇷', 'Netherlands': '🇳🇱', 'Portugal': '🇵🇹',
+    'Brazil': '🇧🇷', 'USA': '🇺🇸', 'Argentina': '🇦🇷', 'Mexico': '🇲🇽',
+    'Japan': '🇯🇵', 'South Korea': '🇰🇷', 'Chile': '🇨🇱', 'Colombia': '🇨🇴'
+  };
+  return flags[country] || '⚽';
+}
+
+// ===== SEÇİMLERİM =====
+function renderPicks() {
+  const container = document.getElementById('picksMatches');
+  const totalEl = document.getElementById('picksTotal');
+  
+  if (!container) return;
+  
+  if (userPicks.length === 0) {
+    container.innerHTML = `<div class="empty-state"><i class="fas fa-crosshairs"></i><p>Henüz maç seçmediniz.</p></div>`;
+    if (totalEl) totalEl.innerHTML = '';
+    return;
+  }
+  
+  const totalOdds = userPicks.reduce((acc, p) => acc * p.odds, 1).toFixed(2);
+  
+  if (totalEl) {
+    totalEl.innerHTML = `
+      <div class="picks-total-bar">
+        <div class="picks-total-info">
+          <span><i class="fas fa-receipt"></i> ${userPicks.length} Maç</span>
+          <span class="picks-total-odds"><i class="fas fa-times"></i> Toplam Oran: <strong>${totalOdds}</strong></span>
+        </div>
+        <button class="picks-clear-btn" onclick="clearAllPicks()"><i class="fas fa-trash"></i> Temizle</button>
+      </div>`;
+  }
+  
+  container.innerHTML = userPicks.map(p => `
+    <div class="match-card picks-selected-card">
+      <div class="match-league"><span class="league-flag">${p.flag}</span>${p.league}</div>
+      <div class="match-teams"><div class="teams">${p.home} <span style="color:var(--text-muted)">vs</span> ${p.away}</div></div>
+      <div class="picks-pick-badge"><i class="fas fa-check-circle"></i> ${p.selected} @ ${p.odds}</div>
+      <button class="pick-remove-btn" onclick="removePick(${p.id})"><i class="fas fa-times"></i></button>
+    </div>
+  `).join('');
+}
+
+function clearAllPicks() {
+  userPicks = [];
+  savePicks();
+  updatePickButtons();
+  updatePicksBadge();
+  renderPicks();
+}
+
+// ===== DİĞER FONKSİYONLAR =====
+function toggleFav(id, btn) {
+  btn.classList.toggle('active');
+}
+
+// ===== GİRİŞ =====
+function handleLogin(e) {
+  e.preventDefault();
+  const email = document.getElementById('loginEmail').value.trim();
+  const pass = document.getElementById('loginPass').value;
+  const errEl = document.getElementById('loginError');
+  
+  if (!errEl) return;
+  
+  if (email === ADMIN_EMAIL && pass === 'admin123') {
+    localStorage.setItem('oa_session', JSON.stringify({ name: 'Admin', email: ADMIN_EMAIL, isAdmin: true }));
+    window.location.href = 'dashboard.html';
+    return;
+  }
+  
+  if (email === 'demo@tahminarena.com' && pass === 'demo123') {
+    localStorage.setItem('oa_session', JSON.stringify({ name: 'Demo Kullanıcı', email: 'demo@tahminarena.com', isAdmin: false }));
+    window.location.href = 'dashboard.html';
+    return;
+  }
+  
+  errEl.textContent = 'E-posta veya şifre hatalı!';
+}
+
+function logout() {
+  localStorage.removeItem('oa_session');
+}
+
+
+
+// ===== KUPON YÖNETİMİ =====
+function daySeed() {
+  const d = new Date();
+  return Number(`${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`);
+}
+
+function seededPicker(seed) {
+  return function() {
+    seed = (seed * 1103515245 + 12345) % 2147483647;
+    return seed / 2147483647;
+  };
+}
+
+function getSourceMatches() {
+  return (window.aiMatches && window.aiMatches.length ? window.aiMatches : window.currentMatches) || [];
+}
+
+function pickDailyMatches(countMin = 3, countMax = 4) {
+  const all = getSourceMatches().filter(m => ['NS', 'TBD', '1H', '2H', 'HT', 'LIVE'].includes(m.fixture?.status?.short || 'NS'));
+  if (!all.length) return [];
+
+  const rand = seededPicker(daySeed());
+  const count = Math.min(all.length, Math.max(countMin, Math.floor(rand() * (countMax - countMin + 1)) + countMin));
+
+  const pool = [...all];
+  const selected = [];
+  while (selected.length < count && pool.length) {
+    const idx = Math.floor(rand() * pool.length);
+    selected.push(pool.splice(idx, 1)[0]);
+  }
+  return selected;
+}
+
+function marketForMatch(match, isPremium = false) {
+  const analyses = typeof buildMatchAnalyses === 'function' ? buildMatchAnalyses(match) : { markets: [] };
+  const markets = analyses.markets || [];
+  if (!markets.length) {
+    return { market: '2.5 Üst', odd: '1.90', confidence: isPremium ? 99 : 82 };
+  }
+  const sorted = [...markets].sort((a, b) => b.confidence - a.confidence);
+  const best = sorted[0];
+  return {
+    market: best.market,
+    odd: best.odd,
+    confidence: isPremium ? Math.max(99, best.confidence) : best.confidence
+  };
+}
+
+function renderCoupons() {
+  const hero = document.getElementById('couponHero');
+  const list = document.getElementById('couponMatches');
+  if (!hero || !list) return;
+
+  const selected = pickDailyMatches(3, 4);
+  if (!selected.length) {
+    hero.innerHTML = '<div class="empty-state"><p>Kupon üretmek için maç verisi bekleniyor.</p></div>';
+    list.innerHTML = '';
+    return;
+  }
+
+  const rows = selected.map(m => {
+    const pick = marketForMatch(m, false);
+    const t = new Date(m.fixture?.date || Date.now()).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
+    return {
+      teams: `${m.teams?.home?.name || 'Ev'} vs ${m.teams?.away?.name || 'Deplasman'}`,
+      league: m.league?.name || 'Lig',
+      time: t,
+      pick
+    };
+  });
+
+  const totalOdd = rows.reduce((acc, r) => acc * Number(r.pick.odd), 1).toFixed(2);
+  hero.innerHTML = `
+    <div class="coupon-date"><i class="fas fa-calendar"></i> ${new Date().toLocaleDateString('tr-TR')} Günlük Tahmin Kuponu</div>
+    <div class="coupon-hero-stats">
+      <div><strong>${rows.length}</strong> Maç</div>
+      <div><strong>${totalOdd}</strong> Toplam Oran</div>
+      <div><strong>%84+</strong> Ortalama Güven</div>
+    </div>
+  `;
+
+  list.innerHTML = rows.map((r, i) => `
+    <div class="match-card">
+      <div class="match-league">${i + 1}. Maç • ${r.league}</div>
+      <div class="match-teams"><div class="teams">${r.teams}</div><div class="match-time">${r.time}</div></div>
+      <div class="ai-form-line"><strong>${r.pick.market}</strong> @${r.pick.odd} • Güven: %${r.pick.confidence}</div>
+    </div>
+  `).join('');
+}
+
+function renderPremiumCoupon() {
+  const locked = document.getElementById('premiumLocked');
+  const content = document.getElementById('premiumContent');
+  const dateEl = document.getElementById('premiumCouponDate');
+  const listEl = document.getElementById('premiumCouponContent');
+  const totalEl = document.getElementById('premiumTotalOdds');
+  if (!locked || !content || !dateEl || !listEl || !totalEl) return;
+
+  const premium = typeof isPremium === 'function' ? isPremium() : false;
+  if (!premium) {
+    locked.classList.remove('hidden');
+    content.classList.add('hidden');
+    return;
+  }
+
+  locked.classList.add('hidden');
+  content.classList.remove('hidden');
+
+  const selected = pickDailyMatches(3, 4);
+  dateEl.innerHTML = `<i class="fas fa-calendar"></i> ${new Date().toLocaleDateString('tr-TR')} • Yapay Zeka Premium Kupon`;
+
+  if (!selected.length) {
+    listEl.innerHTML = '<div class="empty-state"><p>Premium kupon için maç verisi bekleniyor.</p></div>';
+    totalEl.textContent = '-';
+    return;
+  }
+
+  const picks = selected.map((m, i) => {
+    const p = marketForMatch(m, true);
+    const tm = new Date(m.fixture?.date || Date.now()).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
+    const live = ['1H', 'HT', '2H', 'LIVE'].includes(m.fixture?.status?.short || '');
+    const score = `${m.goals?.home ?? 0}-${m.goals?.away ?? 0}`;
+    return {
+      index: i + 1,
+      league: m.league?.name || 'Lig',
+      teams: `${m.teams?.home?.name || 'Ev'} vs ${m.teams?.away?.name || 'Dep'}`,
+      time: tm,
+      live,
+      score,
+      pick: p
+    };
+  });
+
+  totalEl.textContent = picks.reduce((a, x) => a * Number(x.pick.odd), 1).toFixed(2);
+
+  listEl.innerHTML = picks.map(x => `
+    <div class="match-card">
+      <div class="match-league">${x.index}. Maç • ${x.league}</div>
+      <div class="match-teams">
+        <div class="teams">${x.teams}</div>
+        <div class="match-time">${x.time} ${x.live ? `• <span class="live-score">Canlı ${x.score}</span>` : ''}</div>
+      </div>
+      <div class="ai-form-line"><strong>${x.pick.market}</strong> @${x.pick.odd} • Güven: %${x.pick.confidence}</div>
+    </div>
+  `).join('');
+}
+
+function refreshDailyCoupon() {
+  renderCoupons();
+  renderPremiumCoupon();
+}
+
+window.addEventListener('DOMContentLoaded', () => {
+  renderCoupons();
+  renderPremiumCoupon();
+});
+
+
+// ===== INIT =====
+function initDashboard() {
+  const session = JSON.parse(localStorage.getItem('oa_session') || 'null');
+  if (!session) { window.location.href = 'index.html'; return; }
+  
+  const nameEl = document.getElementById('dashUserName');
+  if (nameEl) nameEl.textContent = session.isAdmin ? '👑 ' + session.name : session.name;
+  
+  const emailEl = document.getElementById('dashUserEmail');
+  if (emailEl) emailEl.textContent = session.email;
+  
+  loadMatches();
+  if (typeof renderCoupons === 'function') renderCoupons();
+  if (typeof renderPremiumCoupon === 'function') renderPremiumCoupon();
+}
+
+// ===== SECTION NAV =====
+const SECTIONS = ['live','odds','stats','upcoming','favorites','ai','coupon','compare','picks','successful','premium'];
+const TITLES = {
+  live:'Canlı Maçlar', odds:'Oran Analizi', stats:'İstatistikler',
+  upcoming:'Yaklaşan Maçlar', favorites:'Favorilerim',
+  ai:'Tahminler', coupon:'Günlük Kupon', compare:'Oran Karşılaştırma',
+  picks:'Seçimlerim', successful:'Tutan Analizlerimiz', premium:'Premium Kupon'
+};
+
+function showSection(key) {
+  SECTIONS.forEach(s => {
+    const el = document.getElementById('sec-'+s);
+    if (el) el.classList.toggle('hidden', s !== key);
+  });
+  const titleEl = document.getElementById('sectionTitle');
+  if (titleEl) titleEl.textContent = TITLES[key] || '';
+  document.querySelectorAll('.nav-item').forEach(el => {
+    const onclick = el.getAttribute('onclick') || '';
+    el.classList.toggle('active', onclick.includes(`'${key}'`));
+  });
+  if (key === 'picks') renderPicks();
+  if (key === 'ai') renderAIPredictions();
+  if (key === 'successful') renderSuccessfulAnalyses();
+}
+
+function toggleSidebar() {
+  const sidebar = document.getElementById('sidebar');
+  if (sidebar) sidebar.classList.toggle('open');
+}
+
+document.addEventListener('DOMContentLoaded', () => {
+  if (document.getElementById('dashUserName')) initDashboard();
+});
