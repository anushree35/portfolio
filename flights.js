// Vercel serverless function to proxy flight schedules (AviationStack) or fallback to OpenSky
// Save AVIATIONSTACK_KEY as env var if you want to call AviationStack

export default async function handler(req, res) {
  const aviationKey = process.env.AVIATIONSTACK_KEY;
  const { airport, provider = 'opensky', type = 'arrival' } = req.query;
  if (!airport) return res.status(400).json({ error: 'Missing airport' });

  try {
    if (provider === 'aviationstack') {
      if (!aviationKey) return res.status(500).json({ error: 'Server misconfigured: missing AVIATIONSTACK_KEY' });
      const qparam = type === 'departure' ? 'dep_iata' : 'arr_iata';
      const url = `https://api.aviationstack.com/v1/flights?${qparam}=${airport}&limit=12&access_key=${aviationKey}`;
      const r = await fetch(url);
      const data = await r.json();
      return res.status(r.status).json(data);
    } else {
      const endpoint = type === 'departure' ? 'departure' : 'arrival';
      const url = `https://opensky-network.org/api/flights/${endpoint}?airport=${airport}&begin=${Math.floor(Date.now()/1000)-12*3600}&end=${Math.floor(Date.now()/1000)}`;
      const r = await fetch(url);
      if (!r.ok) {
        const text = await r.text();
        return res.status(r.status).json({ error: `OpenSky error: ${r.status} ${text}` });
      }
      const data = await r.json();
      return res.status(200).json({ data });
    }
  } catch (err) {
    return res.status(502).json({ error: 'Upstream fetch failed', detail: err.message });
  }
}
