export default async function handler(req, res) {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) {
    return res.status(500).json({ error: 'RAPIDAPI_KEY env variable eksik' });
  }

  const today = new Date().toISOString().split('T')[0];
  const season = new Date().getFullYear();
  const leagueIds = [203, 39, 140, 78, 135, 61, 2, 3, 88, 94, 848];

  const LEAGUE_META = {
    203: { name: 'Süper Lig',        flag: '🇹🇷' },
    39:  { name: 'Premier Lig',      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    140: { name: 'La Liga',          flag: '🇪🇸' },
    78:  { name: 'Bundesliga',       flag: '🇩🇪' },
    135: { name: 'Serie A',          flag: '🇮🇹' },
    61:  { name: 'Ligue 1',          flag: '🇫🇷' },
    2:   { name: 'Şampiyonlar Ligi', flag: '🇪🇺' },
    3:   { name: 'Avrupa Ligi',      flag: '🇪🇺' },
    88:  { name: 'Eredivisie',       flag: '🇳🇱' },
    94:  { name: 'Primeira Liga',    flag: '🇵🇹' },
    848: { name: 'Konferans Ligi',   flag: '🇪🇺' },
  };

  try {
    const results = await Promise.allSettled(
      leagueIds.map(lid =>
        fetch(`https://v3.football.api-sports.io/fixtures?league=${lid}&season=${season}&date=${today}`, {
          headers: {
            'x-apisports-key': key,
          },
        }).then(r => r.json())
      )
    );

    let live = [], upcoming = [], finished = [];

    results.forEach((result, i) => {
      if (result.status !== 'fulfilled') return;
      const fixtures = result.value?.response || [];
      const lid = leagueIds[i];
      const meta = LEAGUE_META[lid] || { name: 'Diğer', flag: '⚽' };

      fixtures.forEach(f => {
        const match = {
          id: f.fixture.id,
          status: f.fixture.status.short,
          utcDate: f.fixture.date,
          homeTeam: { name: f.teams.home.name, shortName: f.teams.home.name },
          awayTeam: { name: f.teams.away.name, shortName: f.teams.away.name },
          score: {
            fullTime: { home: f.goals.home, away: f.goals.away },
          },
          minute: f.fixture.status.elapsed,
          competition: { code: String(lid), name: meta.name, flag: meta.flag },
        };

        const s = f.fixture.status.short;
        if (['1H','2H','HT','ET','BT','P'].includes(s)) {
          live.push(match);
        } else if (['FT','AET','PEN'].includes(s)) {
          finished.push(match);
        } else {
          upcoming.push(match);
        }
      });
    });

    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=60');
    return res.json({ live, upcoming, finished, date: today });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
