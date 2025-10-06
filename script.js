// Simple JavaScript that looks like a beginner wrote it
// NOTE: built-in API key removed for interview/demo safety. Use the in-page input or a server-side proxy.
let API_KEY = null; // intentionally blank — prefer in-page input or proxy env
// Demo mode if ?demo=1 present
const DEMO_MODE = (new URLSearchParams(window.location.search)).get('demo') === '1';

// Airport coordinates and ICAO codes
const airports = {
    'JFK': { lat: 40.6413, lon: -73.7781, name: 'JFK - New York', icao: 'KJFK' },
    'LAX': { lat: 33.9425, lon: -118.4081, name: 'LAX - Los Angeles', icao: 'KLAX' },
    'ORD': { lat: 41.9742, lon: -87.9073, name: 'ORD - Chicago', icao: 'KORD' },
    'ATL': { lat: 33.6407, lon: -84.4277, name: 'ATL - Atlanta', icao: 'KATL' },
    'DFW': { lat: 32.8998, lon: -97.0403, name: 'DFW - Dallas', icao: 'KDFW' },
    'DEN': { lat: 39.8561, lon: -104.6737, name: 'DEN - Denver', icao: 'KDEN' },
    'SFO': { lat: 37.6213, lon: -122.3790, name: 'SFO - San Francisco', icao: 'KSFO' },
    'SEA': { lat: 47.4502, lon: -122.3088, name: 'SEA - Seattle', icao: 'KSEA' },
    'MIA': { lat: 25.7959, lon: -80.2870, name: 'MIA - Miami', icao: 'KMIA' },
    'BOS': { lat: 42.3656, lon: -71.0096, name: 'BOS - Boston', icao: 'KBOS' }
};

// Function to check flight delays (main function)
async function checkFlightDelay() {
    const airportCode = document.getElementById('airport').value;
    
    if (!airportCode) {
        alert('Please select an airport first!');
        return;
    }
    
    // Show loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    
    try {
        // Get weather data
        const weatherData = await getWeatherData(airportCode);
        
        // Calculate delay prediction
        const delayInfo = calculateDelayRisk(weatherData);
        
        // Display results
        displayResults(weatherData, delayInfo, airportCode);
        
    } catch (error) {
        console.error('Error:', error);
        const delayPredictionDiv = document.getElementById('delayPrediction');
        delayPredictionDiv.innerHTML = `<div class="delay-high"><h3>⚠️ Error</h3><p>Could not retrieve weather data: ${error.message}</p><p>Please check your internet connection and your API key.</p></div>`;
        document.getElementById('results').style.display = 'block';
    }
    
    // Hide loading
    document.getElementById('loading').style.display = 'none';
}

// Get weather data from API
async function getWeatherData(airportCode) {
    const airport = airports[airportCode];
    // Demo fixture
    if (DEMO_MODE) {
        return {
            main: { temp: 55, humidity: 60 },
            weather: [{ main: 'Clear', description: 'clear sky' }],
            wind: { speed: 6 },
            visibility: 10000
        };
    }

    // Prefer API key from the in-page input when present
    const inputKeyEl = document.getElementById('apiKeyInput');
    const inputKey = inputKeyEl && inputKeyEl.value && inputKeyEl.value.trim() !== '' ? inputKeyEl.value.trim() : null;

    // If a Vercel proxy is available, use it (avoids exposing keys). Otherwise fall back to direct OpenWeather when key present.
    const proxyUrl = `/api/weather?lat=${airport.lat}&lon=${airport.lon}`;
    try {
        // Try proxy first (works when deployed to Vercel with env vars)
        const res = await fetch(proxyUrl);
        if (res.ok) {
            return await res.json();
        }
        // If proxy returns 404/500, fall through to trying direct fetch
    } catch (e) {
        // network/proxy not available locally — fallback below
    }

    // If no proxy, require an API key from the input (do not use a built-in key)
    const keyToUse = inputKey;
    if (!keyToUse) throw new Error('No OpenWeather API key provided. Enter a key in the UI or deploy with a proxy.');

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${airport.lat}&lon=${airport.lon}&appid=${keyToUse}&units=imperial`;
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) {
        const msg = data && data.message ? data.message : 'Failed to fetch weather data';
        throw new Error(msg);
    }
    return data;
}

// ------- API key UI helpers -------
const STORAGE_KEY = 'flight_delay_api_key';
const FLIGHT_STORAGE_KEY = 'flight_schedules_api_key';

function setStatus(msg, color) {
    const el = document.getElementById('apiKeyStatus');
    if (el) {
        el.textContent = msg;
        el.style.color = color || '#666';
    }
}

async function validateApiKeyOnce(key) {
    // quick test: query a well-known coordinate (JFK) to validate key
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=40.6413&lon=-73.7781&appid=${key}&units=imperial`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data && data.message ? data.message : 'Invalid response');
        return { ok: true };
    } catch (err) {
        return { ok: false, message: err.message };
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // ...existing code...
    // hook up API-key UI buttons
    const saveBtn = document.getElementById('saveKeyBtn');
    const clearBtn = document.getElementById('clearKeyBtn');
    const validateBtn = document.getElementById('validateKeyBtn');
    const inputEl = document.getElementById('apiKeyInput');
    const saveCheckbox = document.getElementById('saveApiKey');

    // populate from storage if present (but only if user previously opted in)
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        inputEl.value = stored;
        saveCheckbox.checked = true;
        setStatus('Loaded saved key', 'green');
    } else {
        // If no stored key, pre-fill the input with the embedded API key so the app works out-of-the-box.
        if (inputEl) inputEl.value = API_KEY;
        setStatus('Using built-in key (no save)', '#666');
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', async function () {
            const key = inputEl.value && inputEl.value.trim();
            if (!key) { setStatus('Please enter a key to save', 'red'); return; }
            // only save if checkbox checked (opt-in)
            if (saveCheckbox && saveCheckbox.checked) {
                localStorage.setItem(STORAGE_KEY, key);
                setStatus('Key saved locally', 'green');
            } else {
                setStatus('Enable "Save key" to persist', 'orange');
            }
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            inputEl.value = '';
            if (localStorage.getItem(STORAGE_KEY)) {
                localStorage.removeItem(STORAGE_KEY);
            }
            if (saveCheckbox) saveCheckbox.checked = false;
            setStatus('Key cleared', '#666');
        });
    }

    // Manage toggle for API key advanced controls
    const manageApiBtn = document.getElementById('manageApiBtn');
    const apiAdvanced = document.getElementById('apiAdvanced');
    if (manageApiBtn && apiAdvanced) {
        manageApiBtn.addEventListener('click', function () {
            const hidden = apiAdvanced.getAttribute('aria-hidden') === 'true';
            apiAdvanced.setAttribute('aria-hidden', hidden ? 'false' : 'true');
        });
    }

    if (validateBtn) {
        validateBtn.addEventListener('click', async function () {
            const key = inputEl.value && inputEl.value.trim();
            if (!key) { setStatus('Enter a key to validate', 'red'); return; }
            setStatus('Validating...', '#666');
            const r = await validateApiKeyOnce(key);
            if (r.ok) setStatus('Key appears valid', 'green');
            else setStatus('Invalid key: ' + (r.message || 'unknown'), 'red');
        });
    }

});


// Simple delay calculation (beginner-level logic)
function calculateDelayRisk(weather) {
    let riskScore = 0;
    let reasons = [];

    // Defensive: ensure structure exists
    const temp = weather && weather.main && typeof weather.main.temp === 'number' ? weather.main.temp : null;

    // Check temperature
    if (temp !== null && temp < 32) {
        riskScore += 30;
        reasons.push('Freezing temperature');
    }
    
    // Check wind speed
    const windSpeed = weather && weather.wind && typeof weather.wind.speed === 'number' ? weather.wind.speed : 0;
    if (windSpeed > 15) {
        riskScore += 25;
        reasons.push('High wind speed');
    }
    
    // Check weather conditions
    let condition = '';
    if (weather && Array.isArray(weather.weather) && weather.weather[0] && weather.weather[0].main) {
        condition = String(weather.weather[0].main).toLowerCase();
    }
    if (condition.includes('rain')) {
        riskScore += 20;
        reasons.push('Rain');
    }
    if (condition.includes('snow')) {
        riskScore += 40;
        reasons.push('Snow');
    }
    if (condition.includes('storm') || condition.includes('thunder')) {
        riskScore += 50;
        reasons.push('Thunderstorm');
    }
    if (condition.includes('fog') || condition.includes('mist')) {
        riskScore += 35;
        reasons.push('Poor visibility');
    }
    
    // Check visibility
    if (weather && typeof weather.visibility === 'number' && weather.visibility < 5000) {
        riskScore += 30;
        reasons.push('Low visibility');
    }
    
    // Determine risk level
    let riskLevel;
    if (riskScore < 20) {
        riskLevel = 'low';
    } else if (riskScore < 50) {
        riskLevel = 'medium';
    } else {
        riskLevel = 'high';
    }
    
    return {
        score: Math.min(riskScore, 100),
        level: riskLevel,
        reasons: reasons
    };
}

// ------------------ Flight schedules integration ------------------

// Simple helper to fetch arrivals/departures from OpenSky (no key) or AviationStack (key)
async function fetchFlightSchedules(airportCode, provider, flightApiKey, scheduleType = 'arrival') {
    const airport = airports[airportCode];
    if (!airport) throw new Error('Unknown airport');

    if (provider === 'opensky') {
        // OpenSky provides arrival and departure endpoints that can be used without a key for limited data
        // We'll use the OpenSky Network endpoint (time-windowed). To keep things simple request the
        // items in the last 12 hours using Unix timestamps.
        const now = Math.floor(Date.now() / 1000);
        const from = now - 12 * 3600;
        const to = now;
        const endpoint = scheduleType === 'departure' ? 'departure' : 'arrival';
        // OpenSky prefers ICAO airport codes (e.g., KJFK). Use airport.icao when available, otherwise fall back to IATA.
        const airportParam = airport.icao || airportCode;
        const url = `https://opensky-network.org/api/flights/${endpoint}?airport=${airportParam}&begin=${from}&end=${to}`;
        const res = await fetch(url);
        if (!res.ok) {
            const text = await res.text();
            if (res.status === 404) {
                throw new Error(`OpenSky returned 404 — try switching to ICAO codes or use AviationStack. (${res.status})`);
            }
            throw new Error(`OpenSky error: ${res.status} ${text}`);
        }
        const arr = await res.json();
        // Normalize a few fields for display
        return arr.map(f => ({
            callsign: f.callsign || 'UNK',
            estArrivalAirport: f.estArrivalAirport || airportCode,
            estDepartureAirport: f.estDepartureAirport || 'UNK',
            firstSeen: f.firstSeen || null,
            lastSeen: f.lastSeen || null,
            estArrivalTime: f.lastSeen || null
        }));
    } else if (provider === 'aviationstack') {
        // AviationStack requires a key; we will call the flights endpoint for the arrival schedule
        if (!flightApiKey) throw new Error('AviationStack requires an API key');
        // Using the free-tier API v1 flights endpoint (note: real usage may vary by subscription)
    // For aviationstack, use arr_iata or dep_iata depending on scheduleType
    const qparam = scheduleType === 'departure' ? 'dep_iata' : 'arr_iata';
    const url = `http://api.aviationstack.com/v1/flights?${qparam}=${airportCode}&limit=12&access_key=${flightApiKey}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok || data.error) {
            const msg = (data && data.error && data.error.message) ? data.error.message : `AviationStack error: ${res.status}`;
            throw new Error(msg);
        }
        // Normalize to friendly objects
        return (data.data || []).map(f => ({
            airline: f.airline && f.airline.name ? f.airline.name : (f.airline && f.airline.iata ? f.airline.iata : 'Unknown'),
            flight: f.flight && f.flight.iata ? f.flight.iata : (f.flight && f.flight.number ? f.flight.number : 'UNK'),
            departure: f.departure && (f.departure.iata || f.departure.airport) ? (f.departure.iata || f.departure.airport) : 'UNK',
            arrival: f.arrival && (f.arrival.iata || f.arrival.airport) ? (f.arrival.iata || f.arrival.airport) : airportCode,
            status: f.flight_status || 'unknown',
            scheduled: f.arrival && f.arrival.scheduled ? f.arrival.scheduled : null
        }));
    } else {
        throw new Error('Unknown provider');
    }
}

function renderFlightSchedules(rows, provider, scheduleType = 'arrival') {
    const containerId = 'flightSchedules';
    let container = document.getElementById(containerId);
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.className = 'flight-schedules';
        const resultsDiv = document.getElementById('results');
        if (resultsDiv) resultsDiv.appendChild(container);
    }
    if (DEMO_MODE && (!rows || rows.length === 0)) {
        // demo fixture
        rows = [
            { callsign: 'DL123', airline: 'Delta', estDepartureAirport: 'BOS', estArrivalAirport: 'JFK', scheduled: new Date().toISOString() },
            { callsign: 'AA456', airline: 'American', estDepartureAirport: 'BOS', estArrivalAirport: 'LAX', scheduled: new Date(Date.now()+3600*1000).toISOString() }
        ];
    }
    if (!rows || rows.length === 0) {
        container.innerHTML = `<div class="schedules-empty">No recent ${scheduleType}s found for provider ${provider}.</div>`;
        return;
    }

    const rowsHtml = rows.slice(0, 12).map(r => {
        const time = r.scheduled || r.estArrivalTime || r.lastSeen || r.firstSeen || null;
        const timeStr = time ? (typeof time === 'number' ? new Date(time * 1000).toLocaleString() : new Date(time).toLocaleString()) : 'N/A';
        const callsign = r.callsign || r.flight || r.flight || '—';
        const airline = r.airline || '';
        const from = r.estDepartureAirport || r.departure || '—';
        return `
            <div class="flight-row">
                <div class="flight-main"><strong>${callsign}</strong> ${airline ? '- ' + airline : ''}</div>
                <div class="flight-sub">From: ${from} → To: ${r.estArrivalAirport || r.arrival || '—'}</div>
                <div class="flight-time">${timeStr}</div>
            </div>
        `;
    }).join('');

    container.innerHTML = `<h3>Recent ${scheduleType}s (provider: ${provider})</h3><div class="flight-list">${rowsHtml}</div>`;
}

// Wire up flight schedules UI and storage
document.addEventListener('DOMContentLoaded', function () {
    const flightProviderEl = document.getElementById('flightApiProvider');
    const showBtn = document.getElementById('showSchedulesBtn');
    const flightKeyInput = document.getElementById('flightApiKeyInput');
    const saveFlightBtn = document.getElementById('saveFlightKeyBtn');
    const clearFlightBtn = document.getElementById('clearFlightKeyBtn');
    const validateFlightBtn = document.getElementById('validateFlightKeyBtn');
    const saveFlightCheckbox = document.getElementById('saveFlightApiKey');
    const flightStatus = document.getElementById('flightApiKeyStatus');

    // load saved flight key if present
    const storedFlightKey = localStorage.getItem(FLIGHT_STORAGE_KEY);
    if (storedFlightKey) {
        flightKeyInput.value = storedFlightKey;
        if (saveFlightCheckbox) saveFlightCheckbox.checked = true;
        if (flightStatus) { flightStatus.textContent = 'Loaded saved flight key'; flightStatus.style.color = 'green'; }
    }

    if (saveFlightBtn) {
        saveFlightBtn.addEventListener('click', function () {
            const v = flightKeyInput.value && flightKeyInput.value.trim();
            if (!v) { if (flightStatus) { flightStatus.textContent = 'Enter a key to save'; flightStatus.style.color = 'red'; } return; }
            if (saveFlightCheckbox && saveFlightCheckbox.checked) {
                localStorage.setItem(FLIGHT_STORAGE_KEY, v);
                if (flightStatus) { flightStatus.textContent = 'Flight key saved'; flightStatus.style.color = 'green'; }
            } else {
                if (flightStatus) { flightStatus.textContent = 'Enable "Save flight key" to persist'; flightStatus.style.color = 'orange'; }
            }
        });
    }

    if (clearFlightBtn) {
        clearFlightBtn.addEventListener('click', function () {
            flightKeyInput.value = '';
            if (localStorage.getItem(FLIGHT_STORAGE_KEY)) localStorage.removeItem(FLIGHT_STORAGE_KEY);
            if (saveFlightCheckbox) saveFlightCheckbox.checked = false;
            if (flightStatus) { flightStatus.textContent = 'Flight key cleared'; flightStatus.style.color = '#666'; }
        });
    }

    if (validateFlightBtn) {
        validateFlightBtn.addEventListener('click', async function () {
            const key = flightKeyInput.value && flightKeyInput.value.trim();
            if (!key) { if (flightStatus) { flightStatus.textContent = 'Enter a key to validate'; flightStatus.style.color = 'red'; } return; }
            if (flightStatus) { flightStatus.textContent = 'Validating...'; flightStatus.style.color = '#666'; }
            try {
                // Try a lightweight AviationStack lookup if provider chosen, else just check OpenSky availability
                const provider = flightProviderEl ? flightProviderEl.value : 'opensky';
                if (provider === 'aviationstack') {
                    const testUrl = `http://api.aviationstack.com/v1/flights?access_key=${key}&limit=1`;
                    const r = await fetch(testUrl);
                    const d = await r.json();
                    if (!r.ok || d.error) throw new Error((d && d.error && d.error.message) ? d.error.message : `Status ${r.status}`);
                    if (flightStatus) { flightStatus.textContent = 'Flight key appears valid'; flightStatus.style.color = 'green'; }
                } else {
                    if (flightStatus) { flightStatus.textContent = 'OpenSky does not require a key'; flightStatus.style.color = 'green'; }
                }
            } catch (err) {
                if (flightStatus) { flightStatus.textContent = 'Invalid key: ' + err.message; flightStatus.style.color = 'red'; }
            }
        });
    }

    if (showBtn) {
        showBtn.addEventListener('click', async function () {
            const airportCode = document.getElementById('airport').value;
            if (!airportCode) { alert('Choose an airport first to see schedules'); return; }
            const provider = flightProviderEl ? flightProviderEl.value : 'opensky';
            const scheduleTypeEl = document.getElementById('flightScheduleType');
            const scheduleType = scheduleTypeEl ? scheduleTypeEl.value : 'arrival';
            const key = flightKeyInput && flightKeyInput.value && flightKeyInput.value.trim() ? flightKeyInput.value.trim() : localStorage.getItem(FLIGHT_STORAGE_KEY);
            try {
                const rows = await fetchFlightSchedules(airportCode, provider, key, scheduleType);
                renderFlightSchedules(rows, provider, scheduleType);
            } catch (err) {
                // Show user-friendly message
                renderFlightSchedules([], provider, scheduleType);
                console.error('Flight schedules error', err);
                if (flightStatus) { flightStatus.textContent = 'Schedules error: ' + err.message; flightStatus.style.color = 'red'; }
            }
        });
    }

    // Manage toggle for flight API advanced controls
    const manageFlightBtn = document.getElementById('manageFlightBtn');
    const flightAdvanced = document.getElementById('flightAdvanced');
    if (manageFlightBtn && flightAdvanced) {
        manageFlightBtn.addEventListener('click', function () {
            const hidden = flightAdvanced.getAttribute('aria-hidden') === 'true';
            flightAdvanced.setAttribute('aria-hidden', hidden ? 'false' : 'true');
        });
    }
});

// Display the results
function displayResults(weather, delayInfo, airportCode) {
    const resultsDiv = document.getElementById('results');
    const weatherInfoDiv = document.getElementById('weatherInfo');
    const delayPredictionDiv = document.getElementById('delayPrediction');
    
    // Weather information
    weatherInfoDiv.innerHTML = `
        <div class="weather-info">
            <h3>${airports[airportCode].name}</h3>
            <div class="weather-details">
                <div class="weather-item">
                    <strong>${Math.round(weather.main.temp)}°F</strong>
                    Temperature
                </div>
                <div class="weather-item">
                    <strong>${weather.weather[0].description}</strong>
                    Conditions
                </div>
                <div class="weather-item">
                    <strong>${weather.wind ? Math.round(weather.wind.speed) : 0} mph</strong>
                    Wind Speed
                </div>
                <div class="weather-item">
                    <strong>${weather.main.humidity}%</strong>
                    Humidity
                </div>
            </div>
        </div>
    `;
    
    // Delay prediction
    let delayMessage;
    let delayClass;
    
    if (delayInfo.level === 'low') {
        delayMessage = `
            <h3>✅ Low Delay Risk (${delayInfo.score}%)</h3>
            <p>Weather conditions look good! Your flight should be on time.</p>
        `;
        delayClass = 'delay-low';
    } else if (delayInfo.level === 'medium') {
        delayMessage = `
            <h3>⚠️ Medium Delay Risk (${delayInfo.score}%)</h3>
            <p>Some weather issues detected. Possible delays of 30-60 minutes.</p>
        `;
        delayClass = 'delay-medium';
    } else {
        delayMessage = `
            <h3>❌ High Delay Risk (${delayInfo.score}%)</h3>
            <p>Poor weather conditions! Expect significant delays or cancellations.</p>
        `;
        delayClass = 'delay-high';
    }
    
    if (delayInfo.reasons.length > 0) {
        delayMessage += `<p><strong>Weather factors:</strong> ${delayInfo.reasons.join(', ')}</p>`;
    }
    
    delayPredictionDiv.innerHTML = `<div class="${delayClass}">${delayMessage}</div>`;
    
    // Show results
    resultsDiv.style.display = 'block';
    // add a class for subtle reveal animation
    resultsDiv.classList.add('show');

    // Update risk meter (visual bar) if present
    try {
        const riskMeter = document.getElementById('riskMeter');
        if (riskMeter) {
            const score = (delayInfo && typeof delayInfo.score === 'number') ? Math.round(delayInfo.score) : 0;
            // animate SVG gauge
            const progress = document.getElementById('gaugeProgress');
            const label = document.getElementById('gaugeLabel');
            if (progress) {
                // circumference = 2 * PI * r ; r = 44
                const circumference = 2 * Math.PI * 44;
                const offset = circumference - (score / 100) * circumference;
                // ensure initial state
                progress.style.strokeDasharray = `${circumference}`;
                progress.style.strokeDashoffset = `${circumference}`;
                // force reflow
                // eslint-disable-next-line no-unused-expressions
                progress.offsetWidth;
                // set to offset (animated via CSS transition)
                progress.style.strokeDashoffset = `${offset}`;
            }
            if (label) {
                label.textContent = `${score}%`;
            }
            riskMeter.setAttribute('aria-valuenow', score);
            riskMeter.setAttribute('aria-valuemin', '0');
            riskMeter.setAttribute('aria-valuemax', '100');
        }
    } catch (e) {
        // Non-critical: if risk meter fails, ignore
        console.warn('Risk meter update failed', e);
    }

    // Update last-updated text
    const lastEl = document.getElementById('lastUpdated');
    if (lastEl) {
        lastEl.textContent = `Last updated: ${getCurrentTime()}`;
    }
}

// Simple function to get current time (not really used but looks beginner-ish)
function getCurrentTime() {
    return new Date().toLocaleString();
}

// Add some basic validation
document.addEventListener('DOMContentLoaded', function() {
    console.log('Flight Delay Predictor loaded!');
    // Optional: wire up the button here instead of relying on inline onclick
    const btn = document.getElementById('checkWeather');
    if (btn) {
        // keep existing inline onclick working, but ensure function exists
        btn.addEventListener('click', function (e) {
            // Prevent double-submission if the button is disabled elsewhere
            checkFlightDelay();
        });
    }
    
});

// Onboarding modal: parse ?ow_key and ?flight_key, show modal if no saved keys
document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('onboardModal');
    const useBuiltInBtn = document.getElementById('useBuiltInBtn');
    const applyBtn = document.getElementById('applyOnboardBtn');
    const onboardOwKey = document.getElementById('onboardOwKey');
    const onboardFlightKey = document.getElementById('onboardFlightKey');

    function getQueryParams() {
        return new URLSearchParams(window.location.search);
    }

    // If user already saved keys, don't show modal
    const haveOwSaved = !!localStorage.getItem(STORAGE_KEY);
    const haveFlightSaved = !!localStorage.getItem(FLIGHT_STORAGE_KEY);

    const params = getQueryParams();
    const urlOw = params.get('ow_key');
    const urlFlight = params.get('flight_key');

    // If URL has keys, prefill and show modal so user can confirm
    if ((!haveOwSaved && !haveFlightSaved) && (urlOw || urlFlight)) {
        if (onboardOwKey && urlOw) onboardOwKey.value = urlOw;
        if (onboardFlightKey && urlFlight) onboardFlightKey.value = urlFlight;
        modal.setAttribute('aria-hidden', 'false');
    } else if (!haveOwSaved && !haveFlightSaved) {
        // show a lightweight modal to offer built-in quick-start
        modal.setAttribute('aria-hidden', 'false');
    }

    if (useBuiltInBtn) {
        useBuiltInBtn.addEventListener('click', function () {
            // populate inputs with built-in convenience key (OpenWeather) and leave flight key blank
            const apiInput = document.getElementById('apiKeyInput');
            if (apiInput) apiInput.value = API_KEY;
            const flightInput = document.getElementById('flightApiKeyInput');
            if (flightInput) flightInput.value = '';
            modal.setAttribute('aria-hidden', 'true');
        });
    }

    if (applyBtn) {
        applyBtn.addEventListener('click', function () {
            const apiInput = document.getElementById('apiKeyInput');
            const flightInput = document.getElementById('flightApiKeyInput');
            if (apiInput && onboardOwKey && onboardOwKey.value.trim()) apiInput.value = onboardOwKey.value.trim();
            if (flightInput && onboardFlightKey && onboardFlightKey.value.trim()) flightInput.value = onboardFlightKey.value.trim();
            modal.setAttribute('aria-hidden', 'true');
        });
    }
});
