const apiKey = 'fbab3deacc4c9d49e1ea2b91ab39eb0d'; 
let isCelsius = true; // 

document.getElementById('loginBtn').addEventListener('click', login);
document.getElementById('logoutBtn').addEventListener('click', logout);
document.getElementById('getWeatherBtn').addEventListener('click', function() {
    const city = document.getElementById('cityInput').value;
    fetchWeather(city);
});

document.getElementById('getLocationBtn').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeatherByCoords(lat, lon);
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

document.getElementById('toggleUnitBtn').addEventListener('click', function() {
    isCelsius = !isCelsius; 
    const unit = isCelsius ? 'metric' : 'imperial'; 
    const city = document.getElementById('cityInput').value;
    
    if (city) {
        fetchWeather(city, unit);
    }
});

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
            fetchForecast(city, unit);
        })
        .catch(error => {
            hideLoading();
            alert(error.message);
        });
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


window.onload = updateUI;
