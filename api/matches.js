let cache = null;
let cacheTime = 0;
const CACHE_DURATION = 15 * 60 * 1000;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const apiKey = process.env.FOOTBALL_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key sunucuda tanımlı değil.' });
  }

  const now = Date.now();
  if (cache && (now - cacheTime) < CACHE_DURATION) {
    return res.status(200).json(cache);
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(
      `https://api.football-data.org/v4/matches?dateFrom=${today}&dateTo=${today}`,
      { headers: { 'X-Auth-Token': apiKey } }
    );
    if (!response.ok) throw new Error(`API Hatası: ${response.status}`);
    const data = await response.json();
    cache = data;
    cacheTime = now;
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
