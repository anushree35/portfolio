// Vercel serverless function (Node.js) - proxy to OpenWeather
// Save your OpenWeather API key as an environment variable named OPENWEATHER_KEY in Vercel

export default async function handler(req, res) {
  const key = process.env.OPENWEATHER_KEY;
  if (!key) return res.status(500).json({ error: 'Server misconfigured: missing OPENWEATHER_KEY' });

  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'Missing lat/lon' });

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=imperial`;
  try {
    const r = await fetch(url);
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Upstream fetch failed', detail: err.message });
  }
}
