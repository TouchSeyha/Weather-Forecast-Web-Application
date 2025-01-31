const API_KEY = "";

document.addEventListener("DOMContentLoaded", () => {
  getLocation();
  setupEventListeners();
});

function setupEventListeners() {
  // Cache DOM references
  const tabs = document.querySelectorAll(".tab");
  const searchInput = document.getElementById("search");

  tabs.forEach((tab) => {
    tab.addEventListener("click", switchTab);
  });

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const city = e.target.value.trim();
      if (city) fetchWeatherData(city);
    }
  });
}

async function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => fetchWeatherByCoords(position.coords),
      () => fetchWeatherData("Phnom Penh")
    );
  } else {
    fetchWeatherData();
  }
}

async function fetchWeatherByCoords(coords) {
  try {
    const [weatherResponse, cityResponse] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${coords.latitude}&lon=${coords.longitude}&units=metric&exclude=minutely,alerts&appid=${API_KEY}`
      ),
      fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${coords.latitude}&lon=${coords.longitude}&limit=1&appid=${API_KEY}`
      ),
    ]);

    if (!weatherResponse.ok || !cityResponse.ok) throw new Error("API error");

    const [weatherData, cityData] = await Promise.all([
      weatherResponse.json(),
      cityResponse.json(),
    ]);

    updateWeatherData(weatherData, cityData[0].name);
  } catch (error) {
    showError();
  }
}

async function fetchWeatherData(city) {
  try {
    hideError();
    const geoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
    );

    if (!geoResponse.ok) throw new Error("Geocoding failed");
    const geoData = await geoResponse.json();
    if (!geoData.length) throw new Error("City not found");

    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${geoData[0].lat}&lon=${geoData[0].lon}&units=metric&exclude=minutely,alerts&appid=${API_KEY}`
    );

    if (!weatherResponse.ok) throw new Error("Weather data failed");
    const weatherData = await weatherResponse.json();

    updateWeatherData(weatherData, city);
  } catch (error) {
    showError();
  }
}

function updateWeatherData(data, cityName) {
  const domElements = {
    search: document.getElementById("search"),
    currentSummary: document.querySelector("#today .current-summary"),
    hourlyForecast: document.querySelector("#today .hourly-forecast"),
    dailyForecast: document.querySelector("#five-day .day-forecast"),
  };

  // Update city name
  domElements.search.value = cityName;

  // Update current weather
  const current = data.current;
  domElements.currentSummary.innerHTML = `
    <div style="display: flex;flex-direction: column;flex-wrap: nowrap;">
    <div style="display: flex;flex-direction: row;align-items: center;align-content: center;flex-wrap: nowrap;justify-content: space-between;">
      <h3>Current Weather</h3>
      <h3>${new Date(current.dt * 1000).toLocaleDateString()}</h3>
    </div>
      <div style="display: flex;flex-direction: row;align-items: center;align-content: center;flex-wrap: nowrap;justify-content: space-around;">
        <div>
          <img src="https://openweathermap.org/img/wn/${
            current.weather[0].icon
          }@2x.png">
          <p>${current.weather[0].description}</p>
        </div>
        <div>
          <p>Temp: ${current.temp}°C</p>
          <p>Feels like: ${current.feels_like}°C</p>
        </div>
        <div>
          <p>Sunrise: ${new Date(
            current.sunrise * 1000
          ).toLocaleTimeString()}</p>
          <p>Sunset: ${new Date(current.sunset * 1000).toLocaleTimeString()}</p>
          <p>Day length: ${((current.sunset - current.sunrise) / 3600).toFixed(
            1
          )} hours</p>
        </div>
      </div>
    </div>
  `;

  // Update hourly forecast
  domElements.hourlyForecast.innerHTML = data.hourly
    .slice(0, 24)
    .map((entry) => createHourlyItem(entry))
    .join("");

  // Update 5-day forecast
  domElements.dailyForecast.innerHTML = data.daily
    .slice(0, 5)
    .map((day, index) => createDailyItem(day, index))
    .join("");
}

// Helper functions
function createHourlyItem(entry) {
  return `
    <div class="hourly-item">
      <p>${new Date(entry.dt * 1000).toLocaleTimeString([], {
        hour: "2-digit",
      })}</p>
      <img src="https://openweathermap.org/img/wn/${entry.weather[0].icon}.png">
      <p>${entry.weather[0].description}</p>
      <p>${entry.temp}°C</p>
      <p>Feels like ${entry.feels_like}°C</p>
      <p>${entry.wind_speed} m/s ${getWindDirection(entry.wind_deg)}</p>
    </div>
  `;
}

function createDailyItem(day, index) {
  return `
    <div class="day-item ${index === 0 ? "active" : ""}" data-day="${day.dt}">
      <p>${new Date(day.dt * 1000).toLocaleDateString("en-US", {
        weekday: "short",
      })}</p>
      <p>${new Date(day.dt * 1000).toLocaleDateString()}</p>
      <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
      <p>${Math.round(day.temp.day)}°C</p>
      <p>${day.weather[0].description}</p>
    </div>
  `;
}

function getWindDirection(degrees) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.round(degrees / 45) % 8];
}

function switchTab(e) {
  document
    .querySelectorAll(".tab, .tab-content")
    .forEach((el) => el.classList.remove("active"));
  e.target.classList.add("active");
  document.getElementById(e.target.dataset.tab).classList.add("active");
}

function showError() {
  document.getElementById("error").style.display = "block";
  document
    .querySelectorAll(".tab-content")
    .forEach((el) => (el.style.display = "none"));
}

function hideError() {
  document.getElementById("error").style.display = "none";
}
