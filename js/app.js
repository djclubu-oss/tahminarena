// ===== MAÇ KARTI — DÜZELTİLMİŞ SEÇİM =====
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
  
  // Kaydedilmiş seçimi kontrol et
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
  if (key === 'premium') renderPremiumCoupon();
}
