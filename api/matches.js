const LEAGUE_MAP = {
  203: { flag: '🇹🇷', key: 'sl',  name: 'Süper Lig' },
  39:  { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', key: 'pl',  name: 'Premier Lig' },
  140: { flag: '🇪🇸', key: 'll',  name: 'La Liga' },
  78:  { flag: '🇩🇪', key: 'bl',  name: 'Bundesliga' },
  135: { flag: '🇮🇹', key: 'sa',  name: 'Serie A' },
  61:  { flag: '🇫🇷', key: 'fl',  name: 'Ligue 1' },
  88:  { flag: '🇳🇱', key: 'ned', name: 'Eredivisie' },
  94:  { flag: '🇵🇹', key: 'por', name: 'Primeira Liga' },
  2:   { flag: '🇪🇺', key: 'cl',  name: 'Şampiyonlar Ligi' },
  3:   { flag: '🇪🇺', key: 'el',  name: 'Avrupa Ligi' },
  848: { flag: '🇪🇺', key: 'ecl', name: 'Konferans Ligi' },
  4:   { flag: '🌍',  key: 'wc',  name: 'Dünya Kupası' },
};

let cache = { data: null, ts: 0, date: '' };

function mapStatus(s) {
  if (['1H', '2H', 'ET', 'P', 'LIVE'].includes(s)) return 'IN_PLAY';
  if (s === 'HT') return 'HALFTIME';
  if (['FT', 'AET', 'PEN'].includes(s)) return 'FINISHED';
  if (['PST', 'CANC', 'ABD', 'AWD', 'WO'].includes(s)) return 'POSTPONED';
  return 'SCHEDULED';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const today = new Date().toISOString().split('T')[0];
  const now = Date.now();
  const CACHE_MS = 15 * 60 * 1000;

  if (cache.data && cache.date === today && now - cache.ts < CACHE_MS) {
    return res.status(200).json(cache.data);
  }

  try {
    const response = await fetch(
      `https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${today}`,
      {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
        }
      }
    );

    const data = await response.json();
    const fixtures = data.response || [];

    const matches = fixtures
      .filter(f => LEAGUE_MAP[f.league.id])
      .map(f => {
        const lg = LEAGUE_MAP[f.league.id];
        const status = mapStatus(f.fixture.status.short);
        return {
          id: f.fixture.id,
          status,
          minute: f.fixture.status.elapsed,
          utcDate: f.fixture.date,
          league: lg.name,
          leagueKey: lg.key,
          flag: lg.flag,
          home: f.teams.home.name,
          away: f.teams.away.name,
          homeGoals: f.goals.home,
          awayGoals: f.goals.away,
        };
      });

    const result = {
      date: today,
      total: matches.length,
      live:     matches.filter(m => m.status === 'IN_PLAY' || m.status === 'HALFTIME'),
      upcoming: matches.filter(m => m.status === 'SCHEDULED'),
      finished: matches.filter(m => m.status === 'FINISHED'),
    };

    cache = { data: result, ts: now, date: today };
    res.status(200).json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
