export default async function handler(req, res) {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) {
    return res.status(500).json({ error: 'RAPIDAPI_KEY env variable eksik' });
  }

  const today = new Date().toISOString().split('T')[0];
  
  try {
    const response = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': key,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });

    if (!response.ok) {
      throw new Error(`API Hatası: ${response.status}`);
    }

    const data = await response.json();
    
    const live = data.response?.filter(m => ['1H','HT','2H','ET','P','LIVE'].includes(m.fixture.status.short)) || [];
    const upcoming = data.response?.filter(m => ['NS','TBD'].includes(m.fixture.status.short)) || [];
    const finished = data.response?.filter(m => ['FT','AET','PEN'].includes(m.fixture.status.short)) || [];

    res.status(200).json({ live, upcoming, finished, date: today });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
