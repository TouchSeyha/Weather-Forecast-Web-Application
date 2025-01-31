# Weather Forecast Web Application

A single-page weather forecast website that provides real-time weather data using the OpenWeatherMap API. The application features a clean and responsive design, with two main tabs: **Today's Forecast** and **5-Day Forecast**.

![overview](https://github.com/user-attachments/assets/7e9e4847-5783-4ffa-8374-ce43b703ee58)
![image](https://github.com/user-attachments/assets/7b8dd938-e814-4b79-951e-7e8e9bfa5172)



## Features

### Today's Forecast
- **Current Weather Summary**: Displays the date, weather icon, description, temperature, real feel, sunrise, sunset, and day length.
- **Hourly Forecast**: Shows the weather conditions for the rest of the day, including time, icon, description, temperature, real feel, and wind speed/direction.
- **Nearby Cities**: Displays weather information for nearby cities, including name, icon, and temperature.

### 5-Day Forecast
- **Daily Overview**: Provides a short forecast for each of the next five days, including the day of the week, date, icon, temperature, and description.
- **Hourly Breakdown**: When a day is selected, it shows a detailed hourly forecast for that day.

### Additional Features
- **Geolocation**: Automatically detects the user's location to display the weather for their current city. If geolocation is unavailable, it defaults to a predefined city.
- **City Search**: Users can search for weather information for any city worldwide.
- **Error Handling**: Displays a 404 error page if the entered city is not found or if the API fails to return data.

## Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript
- **APIs**: OpenWeatherMap API, Geolocation API
- **Design**: Responsive layout using CSS Grid and Flexbox

## How to Use
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/TouchSeyha/Weather-Forecast-Web-Application.git

2. **Open the Project**: Navigate to the project folder and open index.html in your browser.

4. **Get an API Key**:

    - Sign up at OpenWeatherMap to get your API key.
  
    - Replace YOUR_API_KEY in the script.js file with your actual API key.

 5. **Run the Application**: The application will automatically detect your location or default to a predefined city. You can also search for any city using the search bar.
