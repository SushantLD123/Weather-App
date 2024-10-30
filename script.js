const apiKey = 'fbab3deacc4c9d49e1ea2b91ab39eb0d'; 
let isCelsius = true; 
let windUnit = 'metric'; 
const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
const recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];

// Event Listeners
document.getElementById('loginBtn').addEventListener('click', login);
document.getElementById('logoutBtn').addEventListener('click', logout);
document.getElementById('getWeatherBtn').addEventListener('click', function() {
    const city = document.getElementById('cityInput').value;
    fetchWeather(city);
});
document.getElementById('getLocationBtn').addEventListener('click', getLocation);
document.getElementById('toggleUnitBtn').addEventListener('click', toggleUnit);
document.getElementById('toggleWindUnitBtn').addEventListener('click', toggleWindUnit);
document.getElementById('saveFavoriteBtn').addEventListener('click', function() {
    const city = document.getElementById('cityInput').value;
    saveFavoriteCity(city);
});
document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);


function login() {
    const username = document.getElementById('usernameInput').value;
    if (username) {
        localStorage.setItem('username', username);
        updateUI();
    } else {
        alert('Please enter a username');
    }
}

function logout() {
    localStorage.removeItem('username'); 
    updateUI(); 
}

function updateUI() {
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'block';
        document.getElementById('weatherSection').style.display = 'block';
        document.getElementById('weatherDescription').innerText = `Welcome, ${username}!`;
    } else {
        document.getElementById('authSection').style.display = 'block';
        document.getElementById('loginBtn').style.display = 'block';
        document.getElementById('logoutBtn').style.display = 'none';
        document.getElementById('weatherSection').style.display = 'none';
        document.getElementById('usernameInput').value = ''; 
    }
}

function fetchWeather(city, unit = 'metric') {
    showLoading();
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`;
    fetch(url)
        .then(response => {
            hideLoading();
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            displayWeather(data);
            fetchWeatherAlerts(city);
            fetchForecast(city, unit);
            saveRecentSearch(city); 
        })
        .catch(error => {
            hideLoading();
            alert(error.message);
        });
}

function saveRecentSearch(city) {
    if (!recentSearches.includes(city)) {
        recentSearches.push(city);
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
        displayRecentSearches();
    }
}

function displayRecentSearches() {
    const recentSearchesList = document.getElementById('recentSearchesList');
    recentSearchesList.innerHTML = '';
    recentSearches.forEach(city => {
        recentSearchesList.innerHTML += `<li>${city}</li>`;
    });
}

function fetchWeatherAlerts(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayAlerts(data);
        })
        .catch(error => console.error(error));
}

function displayAlerts(data) {
    const alertsDiv = document.getElementById('alerts');
    alertsDiv.innerHTML = '';
    if (data.alerts && data.alerts.length > 0) {
        data.alerts.forEach(alert => {
            alertsDiv.innerHTML += `<div class="alert alert-warning">${alert.description}</div>`;
        });
    } else {
        alertsDiv.innerHTML = '<p>No weather alerts.</p>';
    }
}

function saveFavoriteCity(city) {
    if (!favorites.includes(city)) {
        favorites.push(city);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayFavorites();
    } else {
        alert('City is already in favorites.');
    }
}

function displayFavorites() {
    const favoritesList = document.getElementById('favoritesList');
    favoritesList.innerHTML = '';
    favorites.forEach(city => {
        favoritesList.innerHTML += `<li>${city} <button onclick="removeFavorite('${city}')">Remove</button></li>`;
    });
}

function removeFavorite(city) {
    const index = favorites.indexOf(city);
    if (index > -1) {
        favorites.splice(index, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayFavorites();
    }
}

function toggleUnit() {
    isCelsius = !isCelsius;
    const unit = isCelsius ? 'metric' : 'imperial';
    const city = document.getElementById('cityInput').value;

    if (city) {
        fetchWeather(city, unit);
    }
}

function toggleWindUnit() {
    windUnit = windUnit === 'metric' ? 'imperial' : 'metric';
    const windUnitText = windUnit === 'metric' ? 'm/s' : 'mph';
    document.getElementById('windDescription').innerText = `Wind speed unit: ${windUnitText}`;
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeatherByCoords(lat, lon);
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

function fetchWeatherByCoords(lat, lon, unit = 'metric') {
    showLoading();
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;
    fetch(url)
        .then(response => {
            hideLoading();
            if (!response.ok) {
                throw new Error('Weather data not found');
            }
            return response.json();
        })
        .then(data => {
            displayWeather(data);
            fetchForecast(data.name, unit);
        })
        .catch(error => {
            hideLoading();
            alert(error.message);
        });
}

function displayWeather(data) {
    const tempUnit = isCelsius ? '°C' : '°F';
    document.getElementById('weatherDescription').innerText = `Temperature: ${data.main.temp} ${tempUnit}, ${data.weather[0].description}`;
    const windSpeed = windUnit === 'metric' ? data.wind.speed : data.wind.speed * 2.23694; // Convert to mph
    const windUnitText = windUnit === 'metric' ? 'm/s' : 'mph';
    document.getElementById('windDescription').innerText = `Wind Speed: ${windSpeed.toFixed(2)} ${windUnitText}`;
    const weatherIcon = document.getElementById('weatherIcon');
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
    weatherIcon.style.display = 'block';
}

function fetchForecast(city, unit) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            displayForecast(data);
        })
        .catch(error => alert(error.message));
}

function displayForecast(data) {
    const forecastDiv = document.getElementById('forecast');
    forecastDiv.innerHTML = ''; // Clear previous forecast
    const forecastItems = data.list.filter(item => item.dt_txt.includes('12:00:00')); // Get midday forecasts

    forecastItems.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        const temp = item.main.temp;
        const tempUnit = isCelsius ? '°C' : '°F';
        const desc = item.weather[0].description;

        forecastDiv.innerHTML += `
            <div class="forecast-item">
                <strong>${date}</strong>: ${temp} ${tempUnit}, ${desc}
            </div>
        `;
    });
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showHome() {
    hideAllSections();
    document.getElementById('weatherSection').style.display = 'block';
}

function showFavorites() {
    hideAllSections();
    document.getElementById('favoritesSection').style.display = 'block';
    displayFavorites();
}

function showSettings() {
    hideAllSections();
    document.getElementById('settingsSection').style.display = 'block';
    loadSettings();
}

function showAbout() {
    hideAllSections();
    document.getElementById('aboutSection').style.display = 'block';
}

function loadSettings() {
    const savedTheme = localStorage.getItem('selectedTheme') || 'light';
    const savedInterval = localStorage.getItem('refreshInterval') || 5;

    document.getElementById('themeSelect').value = savedTheme;
    document.getElementById('refreshInterval').value = savedInterval;
    applyTheme(savedTheme);
}

function saveSettings() {
    const selectedTheme = document.getElementById('themeSelect').value;
    const refreshInterval = document.getElementById('refreshInterval').value;

    localStorage.setItem('selectedTheme', selectedTheme);
    localStorage.setItem('refreshInterval', refreshInterval);
    
    alert('Settings saved!');
    applyTheme(selectedTheme);
}

function applyTheme(theme) {
    document.body.className = theme; 
}

function hideAllSections() {
    document.getElementById('weatherSection').style.display = 'none';
    document.getElementById('favoritesSection').style.display = 'none';
    document.getElementById('settingsSection').style.display = 'none';
    document.getElementById('aboutSection').style.display = 'none';
    document.getElementById('helpSection').style.display = 'none';
    document.getElementById('contactSection').style.display = 'none';
}

document.getElementById('loginBtn').addEventListener('click', login);
document.getElementById('logoutBtn').addEventListener('click', logout);
document.getElementById('getWeatherBtn').addEventListener('click', function() {
    const city = document.getElementById('cityInput').value;
    fetchWeather(city);
});
document.getElementById('getLocationBtn').addEventListener('click', getLocation);
document.getElementById('toggleUnitBtn').addEventListener('click', toggleUnit);
document.getElementById('toggleWindUnitBtn').addEventListener('click', toggleWindUnit);
document.getElementById('saveFavoriteBtn').addEventListener('click', function() {
    const city = document.getElementById('cityInput').value;
    saveFavoriteCity(city);
});
document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
document.getElementById('helpBtn').addEventListener('click', showHelp); // Add event listener for Help
document.getElementById('contactBtn').addEventListener('click', showContact); // Add event listener for Contact Us


function showHelp() {
    hideAllSections();
    document.getElementById('helpSection').style.display = 'block'; // Show Help section
}

function showContact() {
    hideAllSections();
    document.getElementById('contactSection').style.display = 'block'; // Show Contact Us section
}



function hideAllSections() {
    document.getElementById('weatherSection').style.display = 'none';
    document.getElementById('favoritesSection').style.display = 'none';
    document.getElementById('settingsSection').style.display = 'none';
    document.getElementById('aboutSection').style.display = 'none';
    document.getElementById('helpSection').style.display = 'none'; // Ensure Help is hidden
    document.getElementById('contactSection').style.display = 'none'; // Ensure Contact Us is hidden
}


updateUI();




