export default async function handler(req, res) {
  const key = process.env.RAPIDAPI_KEY;
  
  if (!key) {
    return res.status(500).json({ error: 'API key eksik' });
  }

  const today = new Date().toISOString().split('T')[0];
  
  try {
    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${today}&timezone=Europe/Istanbul`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-key': key,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API Hatası: ${response.status}`);
    }

    const data = await response.json();
    
    res.status(200).json({
      matches: data.response || [],
      date: today
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
