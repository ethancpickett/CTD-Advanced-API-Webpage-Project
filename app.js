// Grab DOM elements
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const endpointNav = document.getElementById('endpoint-nav');
const viewContainer = document.getElementById('view-container');
const navTabs = document.querySelectorAll('.nav-tab');

// Application State Store
let appData = {
  location: null,
  weather: null,
  currentView: 'location', // 'location' or 'weather'
  isFahrenheit: false
};

// US State & Territory Abbreviation Lookup
const US_STATES_AND_TERRITORIES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia',
  AS: 'American Samoa', GU: 'Guam', MP: 'Northern Mariana Islands',
  PR: 'Puerto Rico', VI: 'U.S. Virgin Islands'
};

// Show a flagged message box and clear any previous result
function showFlaggedMessage(message) {
  appData.location = null;
  appData.weather = null;
  endpointNav.style.display = 'none';
  viewContainer.innerHTML = `<div class="flag-box">🚩 ${message}</div>`;
}

// Parse "City, State" input
function parseLocationInput(rawInput) {
  const hasComma = rawInput.includes(',');
  const parts = rawInput.split(',').map(part => part.trim()).filter(Boolean);
  const city = parts[0] || '';
  const rawState = parts[1] || '';

  const upperState = rawState.toUpperCase();
  const normalizedState = US_STATES_AND_TERRITORIES[upperState] || rawState;

  return { city, rawState, normalizedState, hasComma };
}

// Format location consistently as "City, State"
function formatCityState(loc) {
  const region = loc.admin1 || loc.country;
  return region ? `${loc.name}, ${region}` : loc.name;
}

// Main function executing the dual-fetch architecture
async function fetchWeather(rawQuery) {
  const { city, rawState, normalizedState, hasComma } = parseLocationInput(rawQuery);

  if (!city) return;

  // Block search and show flag message when no state/territory is given
  if (!hasComma || !rawState) {
    showFlaggedMessage('Please, specify a state or territory.');
    return;
  }

  try {
    // ENDPOINT 1: Open-Meteo Geocoding API
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=25&format=json`
    );
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      showFlaggedMessage(`City "${city}" not found. Please, specify a state or territory.`);
      return;
    }

    const targetState = normalizedState.toLowerCase();
    const targetRaw = rawState.toLowerCase();

    const matchedLocation = geoData.results.find(item => {
      const admin1 = (item.admin1 || '').toLowerCase();
      const country = (item.country || '').toLowerCase();
      return admin1 === targetState || admin1 === targetRaw || country === targetState || country === targetRaw;
    });

    if (!matchedLocation) {
      showFlaggedMessage(`No match for "${city}, ${rawState}". Please, specify a state or territory.`);
      return;
    }

    appData.location = matchedLocation;

    // ENDPOINT 2: Open-Meteo Forecast API
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${appData.location.latitude}&longitude=${appData.location.longitude}&current_weather=true`
    );
    const weatherData = await weatherResponse.json();

    appData.weather = weatherData.current_weather;

    endpointNav.style.display = 'flex';
    renderView();

  } catch (error) {
    console.error('Error fetching data:', error);
    showFlaggedMessage('An error occurred while connecting to APIs.');
  }
}

// Render UI based on active tab state
function renderView() {
  if (!appData.location) return;

  const loc = appData.location;
  const formattedTitle = formatCityState(loc);

  if (appData.currentView === 'location') {
    viewContainer.innerHTML = `
      <div class="card">
        <h2 style="color: #7fffd4; margin-top: 0;">📍 Location Endpoint</h2>
        <h3>${formattedTitle}</h3>
        <p><strong>Latitude:</strong> ${loc.latitude.toFixed(4)}</p>
        <p><strong>Longitude:</strong> ${loc.longitude.toFixed(4)}</p>
        <p><strong>Country:</strong> ${loc.country || 'N/A'}</p>
        <p style="color: #739e9e; font-size: 0.8em; margin-top: 15px;">Source: Open-Meteo Geocoding API</p>
      </div>
    `;
  } else if (appData.currentView === 'weather') {
    let temp = appData.weather.temperature;
    let unit = '°C';

    if (appData.isFahrenheit) {
      temp = (temp * 9/5) + 32;
      unit = '°F';
    }

    viewContainer.innerHTML = `
      <div class="card">
        <h2 style="color: #7fffd4; margin-top: 0;">🌤️ Weather Endpoint</h2>
        <h3>${formattedTitle}</h3>
        <div class="temperature">${temp.toFixed(1)}${unit}</div>
        <p>Wind Speed: <strong>${appData.weather.windspeed} km/h</strong></p>
        <button class="toggle-btn" id="toggle-unit-btn" type="button">Switch to ${appData.isFahrenheit ? 'Celsius (°C)' : 'Fahrenheit (°F)'}</button>
        <p style="color: #739e9e; font-size: 0.8em; margin-top: 15px;">Source: Open-Meteo Forecast API</p>
      </div>
    `;

    document.getElementById('toggle-unit-btn').addEventListener('click', () => {
      appData.isFahrenheit = !appData.isFahrenheit;
      renderView();
    });
  }

  navTabs.forEach(tab => {
    if (tab.getAttribute('data-view') === appData.currentView) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
}

// Event Listeners for Navigation Tabs
navTabs.forEach(tab => {
  tab.addEventListener('click', (e) => {
    appData.currentView = e.target.getAttribute('data-view');
    renderView();
  });
});

// Event Listeners for Search Actions
searchBtn.addEventListener('click', () => {
  const query = cityInput.value.trim();
  if (query) fetchWeather(query);
});

cityInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    const query = cityInput.value.trim();
    if (query) fetchWeather(query);
  }
});
