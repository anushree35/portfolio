Flight Delay Predictor — Demo script

Goal: show a short, reliable demo (3–5 minutes) that highlights the user-friendly UI, explainable delay score, and flight schedules integration.

Local setup
- Start a local server: python3 -m http.server 5500
- Open http://localhost:5500/

Key talking points / flow
1. Landing: point to the hero and explain the problem: "Quick checks for whether weather might delay flights."
2. Select an airport (e.g., Boston - BOS) and click "Check Delay Risk".
   - Explain the rule-based scoring (temperature, wind, rain/snow, visibility).
   - Show the circular gauge animating and explain the reasons list.
3. Show Schedules: choose OpenSky + Arrivals (or AviationStack if key configured).
   - If OpenSky data is empty, switch to AviationStack (if key provided) or use Demo mode.
4. Demo mode: if you hit network limits, append ?demo=1 to the URL and show the canned demo results.

Fallback plan
- If live APIs fail during the interview, switch to Demo mode (?demo=1) and continue the presentation. This guarantees the app looks polished and the UI flows are demonstrated.

Notes for interviewers
- The project stores API keys in browser localStorage only when you opt-in.
- For a production deployment I would add serverless proxy endpoints (implemented here as Vercel functions) and store keys in platform env variables.

Done — enjoy the demo!
