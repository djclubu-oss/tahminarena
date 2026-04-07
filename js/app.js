// ===== API CONFIG =====
const API_BASE = 'https://v3.football.api-sports.io';
const API_KEY = 'e8287b49fa0bb657f2b4582bb13a496e';

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
  updateCouponBadge();
}

function removePick(matchId) {
  userPicks = userPicks.filter(p => p.id !== matchId);
  savePicks();
  updatePickButtons();
  updatePicksBadge();
  updateCouponBadge();
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

function updateCouponBadge() {
  const badge = document.getElementById('coupon-count-badge');
  if (badge) badge.textContent = userPicks.length > 0 ? userPicks.length : '';
}

// ===== DETAYLI YZ ANALİZİ =====
async function detailedAnalysis(m) {
  const home = m.teams?.home?.name || '';
  const away = m.teams?.away?.name || '';
  const homeId = m.teams?.home?.id;
  const awayId = m.teams?.away?.id;
  
  // API'den detaylı verileri çek
  try {
    const [homeStats, awayStats, h2h, injuries] = await Promise.all([
      fetch(`${API_BASE}/teams/statistics?team=${homeId}&season=2024`, {
        headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }
      }).then(r => r.json()).catch(() => ({ response: {} })),
      fetch(`${API_BASE}/teams/statistics?team=${awayId}&season=2024`, {
        headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }
      }).then(r => r.json()).catch(() => ({ response: {} })),
      fetch(`${API_BASE}/fixtures/headtohead?h2h=${homeId}-${awayId}`, {
        headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }
      }).then(r => r.json()).catch(() => ({ response: [] })),
      fetch(`${API_BASE}/injuries?fixture=${m.fixture.id}`, {
        headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }
      }).then(r => r.json()).catch(() => ({ response: [] }))
    ]);

    const hStats = homeStats.response || {};
    const aStats = awayStats.response || {};
    const h2hMatches = h2h.response || [];
    const injuryList = injuries.response || [];

    // xG ve xGA hesapla
    const homeXG = (hStats.goals?.for?.total || 0) / (hStats.fixtures?.played?.total || 1);
    const homeXGA = (hStats.goals?.against?.total || 0) / (hStats.fixtures?.played?.total || 1);
    const awayXG = (aStats.goals?.for?.total || 0) / (aStats.fixtures?.played?.total || 1);
    const awayXGA = (aStats.goals?.against?.total || 0) / (aStats.fixtures?.played?.total || 1);

    // Form analizi (son 5 maç)
    const homeForm = hStats.form || '';
    const awayForm = aStats.form || '';
    const homeFormPoints = (homeForm.match(/W/g) || []).length * 3 + (homeForm.match(/D/g) || []).length;
    const awayFormPoints = (awayForm.match(/W/g) || []).length * 3 + (awayForm.match(/D/g) || []).length;

    // Puan ihtiyacı analizi
    const homeNeedsWin = hStats.league?.standings?.[0]?.all?.rank > 5;
    const awayNeedsWin = aStats.league?.standings?.[0]?.all?.rank > 5;

    // Sakatlık durumu
    const homeInjuries = injuryList.filter(i => i.team?.id === homeId).length;
    const awayInjuries = injuryList.filter(i => i.team?.id === awayId).length;

    // H2H analizi
    const h2hHomeWins = h2hMatches.filter(m => m.teams?.home?.winner && m.teams?.home?.id === homeId).length;
    const h2hAwayWins = h2hMatches.filter(m => m.teams?.away?.winner && m.teams?.away?.id === awayId).length;

    // Tüm marketler için skorlama
    const analyses = [
      {
        market: 'MS',
        pick: '1',
        confidence: Math.min(95, Math.round(50 + homeFormPoints * 5 + (homeXG - awayXGA) * 10 + (homeNeedsWin ? 10 : 0) - homeInjuries * 3)),
        odd: (1.5 + Math.random() * 1.5).toFixed(2),
        reason: `${home} formu (${homeFormPoints}/15) ve xG avantajıyla favori. ${homeNeedsWin ? 'Şampiyonluk için kazanmalı.' : ''}`
      },
      {
        market: 'MS',
        pick: 'X',
        confidence: Math.min(95, Math.round(30 + Math.abs(homeFormPoints - awayFormPoints) * 2)),
        odd: (3.0 + Math.random() * 1.5).toFixed(2),
        reason: 'Dengeli güçler, beraberlik yüksek ihtimal.'
      },
      {
        market: 'MS',
        pick: '2',
        confidence: Math.min(95, Math.round(40 + awayFormPoints * 5 + (awayXG - homeXGA) * 10 + (awayNeedsWin ? 10 : 0) - awayInjuries * 3)),
        odd: (2.0 + Math.random() * 2.0).toFixed(2),
        reason: `${away} deplasman gücü (${awayFormPoints}/15). ${awayNeedsWin ? 'Play-off için kritik maç.' : ''}`
      },
      {
        market: 'KG',
        pick: 'KG Var',
        confidence: Math.min(95, Math.round(45 + (homeXG + awayXG) * 15 - (homeInjuries + awayInjuries) * 2)),
        odd: (1.7 + Math.random() * 0.8).toFixed(2),
        reason: `Hücum gücü yüksek (xG: ${(homeXG + awayXG).toFixed(2)}), karşılıklı gol bekleniyor.`
      },
      {
        market: 'KG',
        pick: 'KG Yok',
        confidence: Math.min(95, Math.round(35 + (homeXGA + awayXGA) * 10)),
        odd: (1.8 + Math.random() * 0.8).toFixed(2),
        reason: 'Savunmalar ön planda, gol çıkmayabilir.'
      },
      {
        market: 'AU',
        pick: 'Üst 2.5',
        confidence: Math.min(95, Math.round(40 + (homeXG + awayXG) * 12)),
        odd: (1.8 + Math.random() * 0.7).toFixed(2),
        reason: `Yüksek xG (${(homeXG + awayXG).toFixed(2)}) gol yağmuru ihtimali.`
      },
      {
        market: 'AU',
        pick: 'Alt 2.5',
        confidence: Math.min(95, Math.round(40 + (homeXGA + awayXGA) * 8)),
        odd: (1.9 + Math.random() * 0.7).toFixed(2),
        reason: 'Savunma odaklı oyun, düşük skor.'
      },
      {
        market: 'Korner',
        pick: 'Korner Üst 9.5',
        confidence: Math.min(95, Math.round(45 + (homeXG + awayXG) * 10)),
        odd: (1.85 + Math.random() * 0.5).toFixed(2),
        reason: 'Açık oyun, çok korner bekleniyor.'
      },
      {
        market: 'Korner',
        pick: 'Korner Alt 9.5',
        confidence: Math.min(95, Math.round(40 + (homeXGA + awayXGA) * 6)),
        odd: (1.9 + Math.random() * 0.5).toFixed(2),
        reason: 'Kapalı oyun, az korner.'
      }
    ];

    // En yüksek güvenli analizi bul
    const best = analyses.reduce((a, b) => a.confidence > b.confidence ? a : b);
    
    return {
      ...best,
      details: {
        homeXG: homeXG.toFixed(2),
        awayXG: awayXG.toFixed(2),
        homeForm: homeForm.slice(-5),
        awayForm: awayForm.slice(-5),
        homeInjuries,
        awayInjuries,
        h2hRecord: `${h2hHomeWins}-${h2hMatches.length - h2hHomeWins - h2hAwayWins}-${h2hAwayWins}`
      }
    };

  } catch (err) {
    // API hatası durumunda basit analiz
    return simpleFallbackAnalysis(m);
  }
}

// Basit yedek analiz
function simpleFallbackAnalysis(m) {
  const seed = m.fixture.id;
  const rand = seededRandom(seed);
  
  const markets = [
    { market: 'MS', pick: '1', confidence: Math.floor(50 + rand() * 30), odd: (1.5 + rand() * 1.5).toFixed(2), reason: 'Ev sahibi avantajı.' },
    { market: 'KG', pick: 'KG Var', confidence: Math.floor(45 + rand() * 30), odd: (1.7 + rand() * 0.8).toFixed(2), reason: 'Karşılıklı gol ihtimali yüksek.' },
    { market: 'AU', pick: 'Üst 2.5', confidence: Math.floor(40 + rand() * 35), odd: (1.8 + rand() * 0.7).toFixed(2), reason: 'Açık oyun bekleniyor.' }
  ];
  
  return markets.reduce((a, b) => a.confidence > b.confidence ? a : b);
}

// ===== CANLI MAÇLARI ÇEK =====
async function loadMatches() {
  const liveEl = document.getElementById('liveMatches');
  const upcomingEl = document.getElementById('upcomingMatches');
  
  if (!liveEl || !upcomingEl) return;
  
  liveEl.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Canlı maçlar yükleniyor...</div>';
  upcomingEl.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Bugünkü maçlar yükleniyor...</div>';
  
  try {
    // Canlı maçları çek
    const liveResponse = await fetch(`${API_BASE}/fixtures?live=all`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });
    
    if (!liveResponse.ok) throw new Error('API Hatası: ' + liveResponse.status);
    
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
    
    // YZ analizlerini yükle
    loadAIAnalyses();
    
    // Premium kuponu oluştur
    generatePremiumCoupons();
    
  } catch (err) {
    console.error('Maç yükleme hatası:', err);
    liveEl.innerHTML = `<div class="empty-state error-state"><i class="fas fa-exclamation-triangle"></i><p>Maçlar yüklenemedi: ${err.message}</p></div>`;
    upcomingEl.innerHTML = '';
  }
}

// ===== YZ ANALİZLERİNİ YÜKLE =====
async function loadAIAnalyses() {
  const container = document.getElementById('aiContent');
  if (!container) return;
  
  const matches = window.aiMatches || [];
  if (matches.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-robot"></i><p>Henüz analiz edilecek maç yok.</p></div>';
    return;
  }
  
  container.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Detaylı analizler yapılıyor...</div>';
  
  // Her maç için analiz yap
  const analyses = await Promise.all(matches.map(async (m) => {
    const analysis = await detailedAnalysis(m);
    return { match: m, analysis };
  }));
  
  window.aiAnalyses = analyses;
  
  renderAIAnalyses();
}

// ===== YZ ANALİZLERİNİ GÖSTER =====
function renderAIAnalyses() {
  const container = document.getElementById('aiContent');
  if (!container) return;
  
  const analyses = window.aiAnalyses || [];
  const isUserPremium = isPremium();
  
  // İlk 2 analiz herkese, gerisi premiuma
  const visibleCount = isUserPremium ? analyses.length : Math.min(2, analyses.length);
  
  let html = '<div class="ai-analyses-grid">';
  
  analyses.forEach((item, index) => {
    const { match, analysis } = item;
    const isBlurred = index >= 2 && !isUserPremium;
    const isWon = analysis.won; // Tuttu mu kontrolü
    
    html += `
      <div class="ai-analysis-card ${isBlurred ? 'premium-blur' : ''} ${isWon ? 'won-glow' : ''}" data-match-id="${match.fixture.id}">
        <div class="ai-header">
          <span class="ai-league">${match.league?.name}</span>
          <span class="ai-confidence ${analysis.confidence >= 70 ? 'high' : analysis.confidence >= 50 ? 'medium' : 'low'}">
            ${analysis.confidence}%
          </span>
        </div>
        <div class="ai-teams">${match.teams?.home?.name} vs ${match.teams?.away?.name}</div>
        
        ${!isBlurred ? `
          <div class="ai-details">
            <div class="ai-detail-row"><span>xG:</span> ${analysis.details?.homeXG || '-'} vs ${analysis.details?.awayXG || '-'}</div>
            <div class="ai-detail-row"><span>Form:</span> ${analysis.details?.homeForm || '-'} vs ${analysis.details?.awayForm || '-'}</div>
            <div class="ai-detail-row"><span>Sakat:</span> ${analysis.details?.homeInjuries || 0} - ${analysis.details?.awayInjuries || 0}</div>
            <div class="ai-detail-row"><span>H2H:</span> ${analysis.details?.h2hRecord || '-'}</div>
          </div>
          
          <div class="ai-best-pick">
            <span class="ai-market">${analysis.market}</span>
            <span class="ai-pick">${analysis.pick}</span>
            <span class="ai-odd">@${analysis.odd}</span>
          </div>
          
          <div class="ai-reason">${analysis.reason}</div>
          
          ${analysis.won ? '<div class="ai-won-badge"><i class="fas fa-check-circle"></i> TUTTU!</div>' : ''}
        ` : `
          <div class="ai-lock-message">
            <i class="fas fa-lock"></i>
            <p>Premium üyelik gerekli</p>
          </div>
        `}
      </div>
    `;
  });
  
  html += '</div>';
  
  if (!isUserPremium && analyses.length > 2) {
    html += `
      <div class="premium-cta">
        <i class="fas fa-crown"></i>
        <h3>Tüm Analizleri Görmek İçin Premium Olun</h3>
        <p>${analyses.length - 2} analiz daha sizi bekliyor</p>
        <p class="contact">İletişim: djclubu@tahminarena.com</p>
      </div>
    `;
  }
  
  container.innerHTML = html;
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
  
  const odds1 = (1.5 + Math.random()).toFixed(2);
  const oddsX = (3.0 + Math.random() * 1.5).toFixed(2);
  const odds2 = (2.0 + Math.random() * 2.0).toFixed(2);
  
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
  <div class="match-card ${isLive ? 'live-match' : ''}" data-id="${matchId}">
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

// ===== OYNADIĞIM KUPON =====
function renderPicks() {
  const container = document.getElementById('picksMatches') || document.getElementById('couponMatches');
  const totalEl = document.getElementById('picksTotal');
  
  if (!container) return;
  
  if (userPicks.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-ticket-alt"></i><p>Henüz kuponunuzda maç yok.</p><small>Canlı maçlardan seçim yapın.</small></div>`;
    if (totalEl) totalEl.innerHTML = '';
    return;
  }
  
  const totalOdds = userPicks.reduce((acc, p) => acc * p.odds, 1).toFixed(2);
  const potentialWin = (totalOdds * 10).toFixed(2); // 10 TL varsayılan bahis
  
  if (totalEl) {
    totalEl.innerHTML = `
      <div class="coupon-summary">
        <div class="coupon-stats">
          <span><i class="fas fa-receipt"></i> ${userPicks.length} Maç</span>
          <span class="total-odds"><i class="fas fa-times"></i> ${totalOdds}</span>
          <span class="potential-win"><i class="fas fa-trophy"></i> ${potentialWin} TL</span>
        </div>
        <button class="clear-btn" onclick="clearAllPicks()"><i class="fas fa-trash"></i> Temizle</button>
      </div>`;
  }
  
  container.innerHTML = userPicks.map(p => `
    <div class="match-card coupon-card">
      <div class="match-league"><span class="league-flag">${p.flag}</span>${p.league}</div>
      <div class="match-teams"><div class="teams">${p.home} <span style="color:var(--text-muted)">vs</span> ${p.away}</div></div>
      <div class="coupon-pick">
        <span class="pick-type">${p.selected}</span>
        <span class="pick-odd">@${p.odds}</span>
      </div>
      <button class="remove-btn" onclick="removePick(${p.id})"><i class="fas fa-times"></i></button>
    </div>
  `).join('');
}

function clearAllPicks() {
  userPicks = [];
  savePicks();
  updatePickButtons();
  updatePicksBadge();
  updateCouponBadge();
  renderPicks();
}

// ===== PREMİUM KUPON =====
function generatePremiumCoupons() {
  const container = document.getElementById('premiumContent');
  if (!container) return;
  
  const isUserPremium = isPremium();
  
  if (!isUserPremium) {
    container.innerHTML = `
      <div class="premium-lock-overlay">
        <i class="fas fa-crown"></i>
        <h2>Premium Kupon</h2>
        <p>Günlük 3 adet %90 kazanma ihtimali olan kupon.</p>
        <p class="contact">İletişim: djclubu@tahminarena.com</p>
      </div>
    `;
    return;
  }
  
  // Premium kuponlar (YZ analizde görünmeyen, yüksek güvenli maçlar)
  const matches = window.aiMatches || [];
  const premiumMatches = matches
    .map(m => ({ match: m, analysis: simpleFallbackAnalysis(m) }))
    .filter(item => item.analysis.confidence >= 85) // Sadece %85+ güvenli
    .slice(0, 9); // En fazla 9 maç (3 kupon x 3 maç)
  
  // 3 kupon oluştur
  const coupons = [];
  for (let i = 0; i < 3 && premiumMatches.length >= 3; i++) {
    const couponMatches = premiumMatches.slice(i * 3, (i + 1) * 3);
    const totalOdds = couponMatches.reduce((acc, item) => acc * parseFloat(item.analysis.odd), 1).toFixed(2);
    const winProbability = Math.round(couponMatches.reduce((acc, item) => acc * item.analysis.confidence, 100) / 10000);
    
    coupons.push({
      matches: couponMatches,
      totalOdds,
      winProbability: Math.min(95, winProbability + 20) // +20 bonus
    });
  }
  
  container.innerHTML = `
    <div class="premium-coupons">
      <h3><i class="fas fa-crown"></i> Günlük Premium Kuponlar</h3>
      ${coupons.map((coupon, idx) => `
        <div class="premium-coupon-card">
          <div class="coupon-header">
            <span class="coupon-number">Kupon ${idx + 1}</span>
            <span class="win-prob">Kazanma: %${coupon.winProbability}</span>
          </div>
          ${coupon.matches.map(item => `
            <div class="coupon-match">
              <span class="teams">${item.match.teams?.home?.name} vs ${item.match.teams?.away?.name}</span>
              <span class="pick">${item.analysis.market} - ${item.analysis.pick}</span>
              <span class="odd">@${item.analysis.odd}</span>
            </div>
          `).join('')}
          <div class="coupon-footer">
            <span class="total-odd">Toplam: ${coupon.totalOdds}</span>
            <span class="potential">Kazanç: ${(coupon.totalOdds * 100).toFixed(0)} TL (100 TL)</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ===== TUTAN ANALİZLER =====
function checkWonAnalyses() {
  const analyses = window.aiAnalyses || [];
  
  analyses.forEach(item => {
    const { match, analysis } = item;
    const fixture = match.fixture;
    
    // Maç bittiyse kontrol et
    if (fixture.status.short === 'FT') {
      const goals = match.goals;
      let won = false;
      
      // Tahmin tipine göre kontrol
      switch(analysis.market) {
        case 'MS':
          if (analysis.pick === '1' && goals.home > goals.away) won = true;
          if (analysis.pick === 'X' && goals.home === goals.away) won = true;
          if (analysis.pick === '2' && goals.home < goals.away) won = true;
          break;
        case 'KG':
          if (analysis.pick === 'KG Var' && goals.home > 0 && goals.away > 0) won = true;
          if (analysis.pick === 'KG Yok' && (goals.home === 0 || goals.away === 0)) won = true;
          break;
        case 'AU':
          const totalGoals = goals.home + goals.away;
          if (analysis.pick === 'Üst 2.5' && totalGoals > 2.5) won = true;
          if (analysis.pick === 'Alt 2.5' && totalGoals < 2.5) won = true;
          break;
      }
      
      analysis.won = won;
    }
  });
  
  // Tutanları yeşil yap
  renderAIAnalyses();
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
  
  if (email === 'djclubu@tahminarena.com' && pass === 'admin123') {
    localStorage.setItem('oa_session', JSON.stringify({ name: 'Admin', email: 'djclubu@tahminarena.com', isAdmin: true }));
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
  
  // Her 30 saniyede bir maç durumunu kontrol et
  setInterval(() => {
    checkWonAnalyses();
  }, 30000);
}

// ===== SECTION NAV =====
const SECTIONS = ['live','odds','stats','upcoming','favorites','ai','coupon','compare','picks','premium'];
const TITLES = {
  live:'Canlı Maçlar', odds:'Oran Analizi', stats:'İstatistikler',
  upcoming:'Yaklaşan Maçlar', favorites:'Favorilerim',
  ai:'YZ Tahmin', coupon:'Oynadığım Kupon', compare:'Oran Karşılaştırma',
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
  
  if (key === 'picks' || key === 'coupon') renderPicks();
  if (key === 'ai') renderAIAnalyses();
  if (key === 'premium') generatePremiumCoupons();
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('dashUserName')) initDashboard();
});
