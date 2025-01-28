const API_KEY = ""; // Replace with your OpenWeatherMap API key

document.addEventListener("DOMContentLoaded", () => {
  getLocation();
  setupEventListeners();
});

function setupEventListeners() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", switchTab);
  });

  document.getElementById("search").addEventListener("keypress", (e) => {
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
      () => fetchWeatherData("Phnom Penh") // Default city
    );
  } else {
    fetchWeatherData("Phnom Penh");
  }
}

async function fetchWeatherByCoords(coords) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/3.0/weather?lat=${coords.latitude}&lon=${coords.longitude}&units=metric&appid=${API_KEY}`
    );
    const data = await response.json();
    fetchWeatherData(data.name);
  } catch (error) {
    showError();
  }
}

async function fetchWeatherData(city) {
  try {
    hideError();
    const [currentData, forecastData, nearbyData] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/3.0/weather?q=${city}&units=metric&appid=${API_KEY}`
      ),
      fetch(
        `https://api.openweathermap.org/data/3.0/forecast?q=${city}&units=metric&appid=${API_KEY}`
      ),
      fetch(
        `https://api.openweathermap.org/data/3.0/find?lat=${currentData.coord.lat}&lon=${currentData.coord.lon}&cnt=5&units=metric&appid=${API_KEY}`
      ),
    ]);

    if (!currentData.ok || !forecastData.ok) throw new Error("City not found");

    const current = await currentData.json();
    const forecast = await forecastData.json();
    const nearby = await nearbyData.json();

    document.getElementById("search").value = current.name;
    updateTodayTab(current, forecast.list, nearby.list);
    updateFiveDayTab(forecast.list, current.timezone);
  } catch (error) {
    showError();
  }
}

function updateTodayTab(current, hourly, nearby) {
  // Update current weather
  const currentHtml = `
                <div>
                    <h2>${new Date(current.dt * 1000).toLocaleDateString()}</h2>
                    <img src="https://openweathermap.org/img/wn/${
                      current.weather[0].icon
                    }@2x.png">
                    <p>${current.weather[0].description}</p>
                    <p>Temp: ${current.main.temp}°C</p>
                    <p>Feels like: ${current.main.feels_like}°C</p>
                    <p>Sunrise: ${new Date(
                      current.sys.sunrise * 1000
                    ).toLocaleTimeString()}</p>
                    <p>Sunset: ${new Date(
                      current.sys.sunset * 1000
                    ).toLocaleTimeString()}</p>
                    <p>Day length: ${(
                      (current.sys.sunset - current.sys.sunrise) /
                      3600
                    ).toFixed(1)} hours</p>
                </div>
            `;
  document.querySelector("#today .current-summary").innerHTML = currentHtml;

  // Update hourly forecast
  const hourlyHtml = hourly
    .slice(0, 8)
    .map(
      (entry) => `
                <div class="hourly-item">
                    <p>${new Date(entry.dt * 1000).toLocaleTimeString([], {
                      hour: "2-digit",
                    })}</p>
                    <img src="https://openweathermap.org/img/wn/${
                      entry.weather[0].icon
                    }.png">
                    <p>${entry.weather[0].description}</p>
                    <p>${entry.main.temp}°C</p>
                    <p>Feels like ${entry.main.feels_like}°C</p>
                    <p>${entry.wind.speed} m/s ${getWindDirection(
        entry.wind.deg
      )}</p>
                </div>
            `
    )
    .join("");
  document.querySelector("#today .hourly-forecast").innerHTML = hourlyHtml;

  // Update nearby cities
  const nearbyHtml = nearby.list
    .filter((c) => c.id !== current.id)
    .slice(0, 4)
    .map(
      (city) => `
                <div class="nearby-city">
                    <p>${city.name}</p>
                    <img src="https://openweathermap.org/img/wn/${city.weather[0].icon}.png">
                    <p>${city.main.temp}°C</p>
                </div>
            `
    )
    .join("");
  document.querySelector("#today .nearby-cities").innerHTML = nearbyHtml;
}

function updateFiveDayTab(forecastList, timezone) {
  const grouped = groupByDay(forecastList, timezone);
  const days = Object.keys(grouped).sort();

  // Create day forecast items
  const dayHtml = days
    .map((day, index) => {
      const date = new Date(day);
      const entries = grouped[day];
      return `
                    <div class="day-item ${
                      index === 0 ? "active" : ""
                    }" data-day="${day}">
                        <p>${date.toLocaleDateString("en-US", {
                          weekday: "short",
                        })}</p>
                        <p>${date.toLocaleDateString()}</p>
                        <img src="https://openweathermap.org/img/wn/${
                          entries[4].weather[0].icon
                        }.png">
                        <p>${Math.round(entries[4].main.temp)}°C</p>
                        <p>${entries[4].weather[0].description}</p>
                    </div>
                `;
    })
    .join("");
  document.querySelector("#five-day .day-forecast").innerHTML = dayHtml;

  // Show initial hourly forecast
  updateHourlyForecast(grouped[days[0]]);
}

function groupByDay(forecastList, timezone) {
  return forecastList.reduce((acc, entry) => {
    const date = new Date((entry.dt + timezone) * 1000);
    const day = date.toISOString().split("T")[0];
    if (!acc[day]) acc[day] = [];
    acc[day].push(entry);
    return acc;
  }, {});
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
