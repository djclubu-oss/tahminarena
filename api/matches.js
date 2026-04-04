export default async function handler(req, res) {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) {
    return res.status(500).json({ error: 'RAPIDAPI_KEY env variable eksik' });
  }

  const now = new Date();
  const istanbul = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const today = istanbul.toISOString().split('T')[0];
  const season = 2024;

  const leagues = [
    { id: 203, name: 'Süper Lig',        flag: '🇹🇷' },
    { id: 39,  name: 'Premier Lig',      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: 140, name: 'La Liga',          flag: '🇪🇸' },
    { id: 78,  name: 'Bundesliga',       flag: '🇩🇪' },
    { id: 135, name: 'Serie A',          flag: '🇮🇹' },
    { id: 61,  name: 'Ligue 1',          flag: '🇫🇷' },
    { id: 2,   name: 'Şampiyonlar Ligi', flag: '🇪🇺' },
    { id: 3,   name: 'Avrupa Ligi',      flag: '🇪🇺' },
    { id: 88,  name: 'Eredivisie',       flag: '🇳🇱' },
    { id: 94,  name: 'Primeira Liga',    flag: '🇵🇹' },
  ];

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  async function fetchLeague(lg) {
    const r = await fetch(
      `https://v3.football.api-sports.io/fixtures?league=${lg.id}&season=${season}&date=${today}`,
      { headers: { 'x-apisports-key': key } }
    );
    return { lg, data: await r.json() };
  }

  try {
    let live = [], upcoming = [], finished = [];

    for (let i = 0; i < leagues.length; i++) {
      if (i > 0) await sleep(7000);
      const { lg, data } = await fetchLeague(leagues[i]);
      const fixtures = data?.response || [];
      fixtures.forEach(f => {
        const match = {
          id: f.fixture.id,
          status: f.fixture.status.short,
          utcDate: f.fixture.date,
          homeTeam: { name: f.teams.home.name, shortName: f.teams.home.name },
          awayTeam: { name: f.teams.away.name, shortName: f.teams.away.name },
          score: { fullTime: { home: f.goals.home, away: f.goals.away } },
          minute: f.fixture.status.elapsed,
          competition: { code: String(lg.id), name: lg.name, flag: lg.flag },
        };
        const s = f.fixture.status.short;
        if (['1H','2H','HT','ET','BT','P'].includes(s)) live.push(match);
        else if (['FT','AET','PEN'].includes(s)) finished.push(match);
        else upcoming.push(match);
      });
    }

    res.setHeader('Cache-Control', 's-maxage=900');
    return res.json({ live, upcoming, finished, date: today });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
