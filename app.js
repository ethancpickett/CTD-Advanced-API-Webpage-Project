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

// Main function executing the dual-fetch architecture
async function fetchWeather(cityName) {
  try {
    // ENDPOINT 1: Open-Meteo Geocoding API
    const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&format=json`);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      endpointNav.style.display = 'none';
      viewContainer.innerHTML = `<p style="color: #ff5555; text-align: center;">City not found. Please try another name.</p>`;
      return;
    }

    appData.location = geoData.results[0];

    // ENDPOINT 2: Open-Meteo Forecast API
    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${appData.location.latitude}&longitude=${appData.location.longitude}&current_weather=true`);
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
  const region = loc.admin1 ? loc.admin1 : loc.country;

  if (appData.currentView === 'location') {
    viewContainer.innerHTML = `
      <div class="card">
        <h2 style="color: #7fffd4; margin-top: 0;">📍 Location Endpoint</h2>
        <h3>${loc.name}, ${region}</h3>
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
        <h3>${loc.name}</h3>
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
