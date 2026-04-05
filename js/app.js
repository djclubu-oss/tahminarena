// ===== SEÇİM (PICKS) — DÜZELTİLMİŞ =====
let userPicks = JSON.parse(localStorage.getItem('oa_picks') || '[]');

function savePicks() {
  localStorage.setItem('oa_picks', JSON.stringify(userPicks));
}

// DÜZELTME: Her maç bağımsız seçilecek
function selectPick(matchId, pickType, odds, matchData) {
  // Önce bu maçın eski seçimini kaldır
  userPicks = userPicks.filter(p => p.id !== matchId);
  
  // Yeni seçimi ekle
  userPicks.push({
    id: matchId,
    home: matchData.home,
    away: matchData.away,
    league: matchData.league,
    flag: matchData.flag,
    time: matchData.time,
    selected: pickType, // '1', 'X', veya '2'
    odds: parseFloat(odds)
  });
  
  savePicks();
  updatePickButtons(); // Sadece bu maçın butonlarını güncelle
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
  // Tüm butonları temizle
  document.querySelectorAll('.odds-select-btn').forEach(btn => {
    const matchId = parseInt(btn.dataset.matchId);
    const pickType = btn.dataset.pick;
    const savedPick = getPickForMatch(matchId);
    
    // Sadece bu maçın kaydedilmiş seçimi varsa ve eşleşiyorsa yeşil yap
    const isSelected = savedPick && savedPick.selected === pickType;
    btn.classList.toggle('selected', isSelected);
  });
}

function updatePicksBadge() {
  const badge = document.getElementById('picks-count-badge');
  if (badge) {
    badge.textContent = userPicks.length > 0 ? userPicks.length : '';
  }
}
