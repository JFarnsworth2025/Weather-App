// --- City Autocomplete, Error Reset, and Unit Switching ---
// List of countries using imperial (Fahrenheit)
const imperialCountries = ['US', 'BS', 'BZ', 'KY', 'PW'];
let selectedCountryCode = null;
const cityInput = document.getElementById('city-input');
const citySuggestions = document.getElementById('city-suggestions');

let debounceTimeout;
cityInput.addEventListener('input', function() {
    // Reset error and UI state
    error404.style.display = 'none';
    error404.classList.remove('fadeIn');
    container.style.height = '';
    weatherBox.style.display = '';
    weatherDetails.style.display = '';

    const query = this.value.trim();
    if (!query) {
        citySuggestions.style.display = 'none';
        citySuggestions.innerHTML = '';
        return;
    }
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => fetchCitySuggestions(query), 300);
});

citySuggestions.addEventListener('click', function(e) {
    if (e.target.tagName === 'LI') {
        cityInput.value = e.target.textContent.replace(/, [A-Z]{2}$/, '');
        // Extract country code from suggestion text (last 2 chars after last comma)
        const match = e.target.textContent.match(/, ([A-Z]{2})$/);
        selectedCountryCode = match ? match[1] : null;
        citySuggestions.style.display = 'none';
        citySuggestions.innerHTML = '';
        search.click();
    }
});

function fetchCitySuggestions(query) {
    fetch(`https://geodb-free-service.wirefreethought.com/v1/geo/cities?limit=5&namePrefix=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
            if (!data.data || !data.data.length) {
                citySuggestions.style.display = 'none';
                citySuggestions.innerHTML = '';
                return;
            }
            citySuggestions.innerHTML = data.data.map(city => `<li>${city.city}${city.region ? ', ' + city.region : ''}, ${city.country}</li>`).join('');
            citySuggestions.style.display = 'block';
        });
}
function setColor(input) {
    const lightness = getLightnessFromHex(input.value);
    document.body.setAttribute('style', `
        --base-color: ${input.value}; 
        --text-color: ${lightness > 60 ? 'black' : 'white'};
    `);

    localStorage.setItem('weatherAppBgColor', input.value);

    const container = document.querySelector('.container');
    if (!container) return;

    if (lightness > 95) {
        container.classList.add('dark');
    } else {
        container.classList.remove('dark');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const savedColor = localStorage.getItem('weatherAppBgColor');
    if (savedColor) {
        const colorInput = document.getElementById('base-color-input');
        if (colorInput) {
            colorInput.value = savedColor;
            setColor(colorInput);
        }
    }
});

function getLightnessFromHex(hex) {

    hex = hex.replace(/^#/, '');

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    //Luminance formula (Perceived Brightness)
    const brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

    return +(brightness * 100).toFixed(2);
}

const container = document.querySelector('.container');
const search = document.querySelector('.search-box button');
const weatherBox = document.querySelector('.weather-box');
const weatherDetails = document.querySelector('.weather-details');
const error404 = document.querySelector('.not-found');

search.addEventListener('click', () => {
    
    const APIKey = 'e217e2c91c4ae126b133af30f43674e1';
    const city = cityInput.value;

    // Hide suggestions on search
    citySuggestions.style.display = 'none';
    citySuggestions.innerHTML = '';

    if (!city) return;

    // Always fetch in metric (Celsius)
    let units = 'metric';
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${APIKey}&units=${units}`)
        .then(response => response.json())
        .then(data => {
            if (data.cod === '404') {
                error404.style.display = 'block';
                container.style.height = '400px';
                weatherBox.style.display = 'none';
                weatherDetails.style.display = 'none';
                error404.classList.add('fadeIn');
                return;
            }

            error404.style.display = 'none';
            error404.classList.remove('fadeIn');

            const image = document.querySelector('.weather-box img');
            const temperature = document.querySelector('.weather-box .temperature');
            const description = document.querySelector('.weather-box .description');
            const humidity = document.querySelector('.weather-details .humidity span');
            const windSpeed = document.querySelector('.weather-details .wind span');

            switch(data.weather[0].main) {
                case 'Clear':
                    image.src = 'images/clear.png';
                    break;
                case 'Clouds':
                    image.src = 'images/cloudy.png';
                    break;
                case 'Rain':
                    image.src = 'images/rain.png';
                    break;
                case 'Snow':
                    image.src = 'images/snow.png';
                    break;
                case 'Mist':
                    image.src = 'images/mist.png';
                    break;
                case 'Haze':
                    image.src = 'images/haze.png';
                    break;
                default:
                    image.src = '';
            }

            const celsius = data.main.temp;
            const fahrenheit = (celsius * 9/5) + 32;
            temperature.innerHTML = `${Math.round(fahrenheit)}<span>°F</span> &nbsp; / &nbsp; ${Math.round(celsius)}<span>°C</span>`;
            description.innerHTML = `${data.weather[0].description}`;
            humidity.innerHTML = `${data.main.humidity}%`;
            windSpeed.innerHTML = `${parseInt(data.wind.speed)} m/s`;

            weatherBox.style.display = '';
            weatherDetails.style.display = '';
            weatherBox.classList.add('fadeIn');
            weatherDetails.classList.add('fadeIn');
            container.style.height = '590px';
        })
        .catch(() => {
            error404.style.display = 'block';
        });
});
