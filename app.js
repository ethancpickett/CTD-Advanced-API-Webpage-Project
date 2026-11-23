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

// US State Abbreviation Lookup (allows both "VA" and "Virginia")
const US_STATES = {
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
  DC: 'District of Columbia'
};

// Helper to parse "City, State" input
function parseLocationInput(rawInput) {
  const parts = rawInput.split(',').map(part => part.trim()).filter(Boolean);
  const city = parts[0] || '';
  const rawState = parts[1] || '';

  // Expand 2-letter US state code if applicable, otherwise keep raw string (supports international regions too)
  const upperState = rawState.toUpperCase();
  const normalizedState = US_STATES[upperState] || rawState;

  return { city, rawState, normalizedState };
}

// Helper to format location consistently as "City, State"
function formatCityState(loc) {
  const region = loc.admin1 || loc.country;
  return region ? `${loc.name}, ${region}` : loc.name;
}

// Main function executing the dual-fetch architecture
async function fetchWeather(rawQuery) {
  const { city, rawState, normalizedState } = parseLocationInput(rawQuery);

  if (!city) return;

  try {
    // ENDPOINT 1: Open-Meteo Geocoding API (fetch up to 25 candidates to filter by state)
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=25&format=json`
    );
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      endpointNav.style.display = 'none';
      viewContainer.innerHTML = `<p style="color: #ff5555; text-align: center;">City not found. Please use the format: City, State</p>`;
      return;
    }

    let matchedLocation = null;

    if (normalizedState) {
      const targetState = normalizedState.toLowerCase();
      const targetRaw = rawState.toLowerCase();

      matchedLocation = geoData.results.find(item => {
        const admin1 = (item.admin1 || '').toLowerCase();
        const country = (item.country || '').toLowerCase();
        return admin1 === targetState || admin1 === targetRaw || country === targetState;
      });

      if (!matchedLocation) {
        endpointNav.style.display = 'none';
        viewContainer.innerHTML = `<p style="color: #ff5555; text-align: center;">Could not find "${city}" in "${rawState}". Check spelling or state code.</p>`;
        return;
      }
    } else {
      // Fallback if user omits the comma and state
      matchedLocation = geoData.results[0];
    }

    appData.location = matchedLocation;

    // ENDPOINT 2: Open-Meteo Forecast API
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${appData.location.latitude}&longitude=${appData.location.longitude}&current_weather=true`
    );
    const weatherData = await weatherResponse.json();

    appData.weather = weatherData.current_weather;

    // Show navigation tabs and render current view
    endpointNav.style.display = 'flex';
    renderView();

  } catch (error) {
    console.error('Error fetching data:', error);
    endpointNav.style.display = 'none';
    viewContainer.innerHTML = `<p style="color: #ff5555; text-align: center;">An error occurred while connecting to APIs.</p>`;
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
        <button class="toggle-btn" id="toggle-unit-btn">Switch to ${appData.isFahrenheit ? 'Celsius (°C)' : 'Fahrenheit (°F)'}</button>
        <p style="color: #739e9e; font-size: 0.8em; margin-top: 15px;">Source: Open-Meteo Forecast API</p>
      </div>
    `;

    // Attach event listener for the unit toggle button
    document.getElementById('toggle-unit-btn').addEventListener('click', () => {
      appData.isFahrenheit = !appData.isFahrenheit;
      renderView();
    });
  }

  // Update active tab styling
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
