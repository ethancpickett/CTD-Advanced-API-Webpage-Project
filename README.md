# Weather Explorer

A multi-view web application built with vanilla HTML, CSS, and JavaScript that interacts with the Open-Meteo public APIs.

## Project Overview
Developed as part of the Code the Dream Advanced Pre-Work assignment, this application allows users to search for any city to view its geographic coordinates and live weather conditions through a responsive, custom-styled multi-view interface.

## API Endpoints Used
1. **Open-Meteo Geocoding API**: (`/v1/search`) Converts a user-submitted city name into precise geographical coordinates (`latitude` and `longitude`).
2. **Open-Meteo Forecast API**: (`/v1/forecast`) Retrieves live meteorological conditions (temperature, wind speed) based on the fetched coordinates.

## Features
* **Multi-View Navigation:** Seamlessly switch between the Location endpoint view and the Weather endpoint view without reloading the page.
* **Unit Toggle:** Instantly toggle temperature display between Celsius (°C) and Fahrenheit (°F) with a real-time math conversion.
* **Custom Styling:** Designed using a custom color palette (light aqua, darker teal, pastel burnt-orange, black) and Century Gothic typography.
* **Error Handling:** Gracefully catches and displays error messages if a city cannot be found or if network connections fail.

## How to Run the Webpage Locally
1. Clone or download this repository to your local machine.
2. Open the project folder in your code editor (such as VS Code).
3. Open `index.html` directly in any modern web browser (Chrome, Firefox, Safari, Edge), or use a live server extension like **Live Server** in VS Code to view and test the app.
