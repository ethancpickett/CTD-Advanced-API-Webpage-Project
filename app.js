// Grab DOM elements
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const locationContainer = document.getElementById('location-container');
const weatherContainer = document.getElementById('weather-container');

// Main function executing the dual-fetch architecture
async function fetchWeather(cityName) {
  try {
    // ENDPOINT 1: Open-Meteo Geocoding API (City Name -> Lat/Lon)
    const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&format=json`);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      locationContainer.innerHTML = `<p style="color: #ff5555;">City not found. Please try another name.</p>`;
      weatherContainer.innerHTML = '';
      return;
    }

    const location = geoData.results[0];

    // ENDPOINT 2: Open-Meteo Forecast API (Lat/Lon -> Current Weather Conditions)
    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true`);
    const weatherData = await weatherResponse.json();

    displayWeather(location, weatherData.current_weather);

  } catch (error) {
    console.error('Error fetching weather data:', error);
    locationContainer.innerHTML = `<p style="color: #ff5555;">An error occurred while fetching data.</p>`;
  }
}

// Render the results onto the page
function displayWeather(location, weather) {
  const region = location.admin1 ? location.admin1 : location.country;

  locationContainer.innerHTML = `
    <h2>${location.name}, ${region}</h2>
    <p style="color: #b3b3b3;">Latitude: ${location.latitude.toFixed(2)} | Longitude: ${location.longitude.toFixed(2)}</p>
  `;

  weatherContainer.innerHTML = `
    <div class="weather-card">
      <div class="temperature">${weather.temperature}°C</div>
      <p>Wind Speed: <strong>${weather.windspeed} km/h</strong></p>
      <p style="color: #b3b3b3; font-size: 0.85em; margin-top: 15px;">Powered by Open-Meteo API</p>
    </div>
  `;
}

// Event Listeners for UI interaction
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