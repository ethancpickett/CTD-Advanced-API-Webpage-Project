# Weather Explorer

A multi-view web application built with vanilla HTML, CSS, and JavaScript that fetches real-time meteorological data using the Open-Meteo public API.

## Project Overview
This project was developed as part of the Code the Dream Advanced Pre-Work assignment. It demonstrates asynchronous JavaScript operations, DOM manipulation, defensive error handling, and multi-endpoint API integration without requiring authentication keys.

## API Endpoints Used
1. **Open-Meteo Geocoding API**: Converts a user-submitted city name into precise geographical coordinates (`latitude` and `longitude`).
   - *Endpoint:* `https://geocoding-api.open-meteo.com/v1/search?name={cityName}`
2. **Open-Meteo Forecast API**: Retrieves live weather conditions based on the coordinates returned from the first endpoint.
   - *Endpoint:* `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true`

## Features
* Clean, responsive user interface designed with a modern dark theme.
* Dual-fetch data architecture chaining dependent API requests.
* Robust error handling for invalid city queries or failed network requests.
* Event listeners supporting both button clicks and keyboard "Enter" submissions.

## Technologies Used
* HTML5
* CSS3
* JavaScript (ES6+ Async/Await, Fetch API)
* Open-Meteo Public APIs

## How to Run Locally
1. Clone or download this repository to your local machine.
2. Open the project folder in your preferred code editor (such as VS Code).
3. Open `index.html` in any modern web browser to view and test the application.