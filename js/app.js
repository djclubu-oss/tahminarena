async function loadRealMatches() {
  const liveEl = document.getElementById('liveMatches');
  const upcomingEl = document.getElementById('upcomingMatches');
  if (liveEl) liveEl.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Maçlar yükleniyor...</div>';

  try {
    const res = await fetch('/api/matches');
    if (!res.ok) throw new Error('Sunucu hatası: ' + res.status);
    const data = await res.json();

    const live = data.live || [];
    const upcoming = data.upcoming || [];
    const finished = data.finished || [];

    const liveCount = document.getElementById('liveCount');
    if (liveCount) liveCount.textContent = live.length;
    const totalEl = document.querySelector('.stat-cards .stat-card:nth-child(2) .stat-num');
    if (totalEl) totalEl.textContent = data.total || 0;

    if (liveEl) {
      if (live.length > 0) {
        liveEl.innerHTML = groupByLeagueSimple(live, true);
      } else if (finished.length > 0) {
        liveEl.innerHTML = '<div class="api-section-label"><i class="fas fa-flag-checkered"></i> Tamamlanan Maçlar</div>' + groupByLeagueSimple(finished, false, true);
      } else {
        liveEl.innerHTML = '<div class="empty-state"><i class="fas fa-circle"></i><p>Şu an canlı maç yok.</p></div>';
      }
    }

    if (upcomingEl) {
      if (upcoming.length > 0) {
        upcomingEl.innerHTML = '<div class="match-count-bar"><i class="fas fa-calendar-alt"></i> Bugün ' + upcoming.length + ' maç planlandı</div>' + groupByLeagueSimple(upcoming);
      } else {
        upcomingEl.innerHTML = '<div class="empty-state"><i class="fas fa-calendar"></i><p>Yaklaşan maç yok.</p></div>';
      }
    }

    const forAI = [...upcoming, ...live];
    window._currentAIPredictions = autoGenPredictions(forAI);
    renderAIPredictions(window._currentAIPredictions);
    generateCoupon();

    if (live.length > 0) setTimeout(loadRealMatches, 60000);

  } catch (err) {
    if (liveEl) liveEl.innerHTML = '<div class="empty-state error-state"><i class="fas fa-exclamation-triangle"></i><p>' + err.message + '</p></div>';
  }
}

function groupByLeagueSimple(matches, isLive, isFinished) {
  const groups = {};
  matches.forEach(m => {
    const k = m.league;
    if (!groups[k]) groups[k] = { flag: m.flag, matches: [] };
    groups[k].matches.push(m);
  });
  return Object.entries(groups).map(([name, g]) => {
    const cards = g.matches.map(m => simpleMatchCard(m, isLive, isFinished)).join('');
    return '<div class="league-group"><div class="league-group-header">' + g.flag + ' ' + name + ' <span class="league-match-count">' + g.matches.length + ' maç</span></div>' + cards + '</div>';
  }).join('');
}

function simpleMatchCard(m, isLive, isFinished) {
  const timeStr = new Date(m.utcDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' });
  const score = (m.homeGoals !== null && m.homeGoals !== undefined) ? m.homeGoals + ' - ' + m.awayGoals : '';
  const statusBadge = isLive ? '<span class="match-minute live-dot">Canlı ' + (m.minute ? m.minute + "'" : '') + '</span>' : isFinished ? '<span class="match-finished">Bitti</span>' : '<span class="match-time-label">' + timeStr + '</span>';
  return '<div class="match-card real-match"><div class="match-teams"><div class="teams">' + m.home + ' <span style="color:var(--text-muted)">vs</span> ' + m.away + '</div>' + statusBadge + '</div><div class="match-live-score">' + (isLive || isFinished ? score : timeStr) + '</div><div class="match-odds"><div class="odd-btn"><span class="odd-label">1</span><span class="odd-val">-</span></div><div class="odd-btn"><span class="odd-label">X</span><span class="odd-val">-</span></div><div class="odd-btn"><span class="odd-label">2</span><span class="odd-val">-</span></div></div></div>';
}
