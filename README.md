# Flight Delay Predictor

A simple website that predicts flight delays based on weather conditions at major airports.

## How it works

This project uses weather data from OpenWeatherMap API to predict if flights might be delayed due to bad weather conditions.

## Files

- `index.html` - Main webpage
- `style.css` - Styling for the website
- `script.js` - JavaScript code for getting weather data and making predictions
- `weather_processor.py` - Python script for processing weather data (optional)

## Setup

1. Get a free API key from OpenWeatherMap:
   - Go to https://openweathermap.org/api
   - Sign up for a free account
   - Get your API key

2. Replace `YOUR_API_KEY_HERE` in `script.js` with your actual API key

3. Open `index.html` in your web browser

## Features

- Select from 10 major US airports
- Get current weather conditions
- Simple delay risk calculation based on:
  - Temperature (freezing conditions)
  - Wind speed
  - Precipitation (rain, snow)
  - Storms and poor visibility
- Color-coded risk levels (low, medium, high)

## How the prediction works

The delay prediction uses simple rules:
- Freezing temperature: +30 risk points
- High winds (>15 mph): +25 risk points  
- Rain: +20 risk points
- Snow: +40 risk points
## Flight Delay Predictor

A small static web app that fetches current weather and shows a simple, explainable risk score for flight delays. It also supports fetching recent flight schedules (OpenSky / AviationStack) and has an in-page API key UI with opt-in local saving.

This repo is a static site (HTML/CSS/JavaScript). No build step required.

### Quick run (local)

1. From the project root, start a simple HTTP server (Python 3):

```bash
python3 -m http.server 5500
```

2. Open http://localhost:5500/ in your browser.

3. Use the page controls to select an airport and "Check Delay Risk". You can optionally paste your own OpenWeather API key or a flight API key (AviationStack) in the UI.

### Files of interest

- `index.html` – main UI
- `style.css` – styles
- `script.js` – app logic, weather + schedules fetching, UI wiring

### API keys & safety

- The site ships with a convenience OpenWeather key to let people try the demo. For real usage, paste your own keys using the inputs on the page.
- Saving keys in the browser is opt-in and stored only in `localStorage`. Do not save keys on shared/public computers.
- For production / public deployment, prefer a server-side proxy (Netlify Functions, Cloudflare Worker, Vercel serverless) to keep keys secret.

### Git & deployment

Recommended steps to save and publish the project:

```bash
# initialize git
cd /path/to/flight_delay_tracker-main
git init
git add .
git commit -m "Initial commit: Flight Delay Predictor"

# create a remote repo on GitHub (manually or via gh cli), then push
# example using GitHub CLI:
# gh repo create your-username/flight_delay_predictor --public --source=. --remote=origin
# git push -u origin main
```

Deployment options (pick one):
- GitHub Pages: good for static sites; requires a `gh-pages` branch or using repo settings. Works well if your site does not rely on server-side keys.
- Vercel: great for static + serverless functions. Connect your GitHub repo and deploy; add serverless functions if you need to proxy API keys.
- Netlify: similar to Vercel; supports functions for key secrecy and identity.

### Troubleshooting

- CORS / mixed-content: If you deploy the site over HTTPS and an API endpoint is HTTP-only (e.g., some AviationStack endpoints), the browser will block the request. Use HTTPS endpoints or a serverless proxy if you see mixed-content errors.
- OpenSky: Some OpenSky endpoints require ICAO codes (e.g., KJFK). If you see 404 errors, try AviationStack or add ICAO codes to the airport map.

### Next steps (suggested)

- Add a small serverless proxy to keep flight API keys secret.
- Add more airports (ICAO mapping) and richer schedule UI.
- Add a GitHub Actions workflow that runs a quick HTML/CSS/JS linter or smoke test.

---

Made by Anushree Sabade (2025)
