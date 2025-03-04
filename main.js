
const container = document.querySelector('.container');
const search = document.querySelector('.search-box input');
const searchButton = document.querySelector('.search-box button');
const weatherBox = document.querySelector('.weather-box');
const weatherDetails = document.querySelector('.weather-details');
const error404 = document.querySelector('.not-found');
const cityHide = document.querySelector('.city-hide');
const suggestionsList = document.querySelector('.suggestions-list'); 
const forecastContainer = document.querySelector('.forecast-container .forecast');
const suggestionItem = document.querySelector('.suggestions-list li');
const favoriteContainer = document.querySelector('.favorite-container');
const favoriteList = document.querySelector('.favorite-list');

console.log('Initial display state:', favoriteContainer.style.display); 
favoriteContainer.style.display = 'none'; 


async function fetchCitySuggestions(query) {
    const apiKey = '15f1673625f743659e97c6cbb47427e7';
    try{
    const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&apiKey=${apiKey}`);
    const data = await response.json();
    return data.features;
    } 
    catch (error) {
        console.error('Error during city search:', error);
}
}

async function fetchForecast(city) {
    const apiKey = 'c11b568515e39132ec55de719c3809f5';
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`);
    const data = await response.json();
    console.log('Forecast API response:', data);
    return data.list;
}

async function setBackgroundImage(city, weatherCondition) {
    const query = encodeURIComponent(city);
    const spinner = document.querySelector('.loading-spinner');

    spinner.removeAttribute('hidden');
  
    try {
      const response = await fetch(`https://api.pexels.com/v1/search?query=${query}`, {
        headers: {
          Authorization: '64m1eNshE3eAkR93ojoPvomt6H9v0qxtObH32tdIcyFZETVpR42JIIqN',
        },
      });
  
      if (!response.ok) {
        throw new Error(`Pexels API error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      const imageUrl = data.photos[0]?.src?.original;
  
      if (imageUrl) {
        document.body.style.backgroundImage = `url(${imageUrl})`;
        document.body.style.backgroundSize = "cover";
      } else {
        console.error(`Image not found for ${city}`);
      }
    } catch (error) {
      console.error('Error fetching image from Pexels:', error);
    } finally {
      spinner.setAttribute('hidden', '');
    }
  }

const loadingSpinner = document.querySelector('.loading-spinner')

async function setBackgroundImage(city) {
    const query = encodeURIComponent(city);
    const spinner = document.querySelector('.loading-spinner');

    spinner.removeAttribute('hidden');

    try {
        const response = await fetch(`https://api.pexels.com/v1/search?query=${query}`, {
            headers: {
                Authorization: '64m1eNshE3eAkR93ojoPvomt6H9v0qxtObH32tdIcyFZETVpR42JIIqN', 
            },
        });

        if (!response.ok) {
            throw new Error(`Pexels API error! Status: ${response.status}`);
        }

        const data = await response.json();
        const imageUrl = data.photos[0]?.src?.original;

        if (imageUrl) {
            document.body.style.backgroundImage = `url(${imageUrl})`;
            document.body.style.backgroundSize = 'cover';
        } else {
            console.error(`Image not found for ${city}`);
        }
    } catch (error) {
        console.error('Error fetching image from Pexels:', error);
    } finally {
        spinner.setAttribute('hidden', '');
    }
}



function createFavoriteButton() {
    const favoriteButton = document.createElement('button');
    favoriteButton.classList.add('heart-button');
    favoriteButton.innerHTML = '<i class="bx bxs-heart bx-border-circle"></i>';
    favoriteButton.addEventListener('click', saveToFavorite);

    container.appendChild(favoriteButton);
}


let favoriteCities = [];

function saveToFavorite() {
    const city = search.value.trim();

    if (city !== '' && !favoriteCities.includes(city)) {
        favoriteCities.push(city);
        saveFavoriteCitiesToLocalStorage();
        displayFavoriteCities();
    }
}


function displayFavoriteCities() {

    if (favoriteCities.length > 0 && cityHide.textContent !== "") {
        favoriteContainer.style.display = 'flex';
        favoriteList.style.display = 'block';
    } else {
        favoriteContainer.style.display = 'none';
        favoriteList.style.display = 'none';
    }

    // Clear the existing list
    favoriteList.innerHTML = '';

    // Iterate through the favoriteCities array and create list items
    favoriteCities.forEach((city) => {
        const listItem = document.createElement('li');
        listItem.textContent = city;
        favoriteList.appendChild(listItem);
    });
    
 
}

function saveFavoriteCitiesToLocalStorage() {
    localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
}


function loadFavoriteCitiesFromLocalStorage() {
    const storedCities = localStorage.getItem('favoriteCities');
    favoriteCities = storedCities ? JSON.parse(storedCities) : [];
}


document.querySelector('.heart-button').addEventListener('click', () => {
    saveToFavorite();
    displayFavoriteCities(); 
});

search.addEventListener('focus', displayFavoriteCities);

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('heart-button')) {
        saveToFavorite();
        displayFavoriteCities();  
    }
});



async function handleCitySearch() {
    const city = search.value.trim();

    if (city === '') {
        
        return;
    }

    try {
        loadingSpinner.style.display = 'block';


        const suggestions = await fetchCitySuggestions(city);
        displaySuggestions(suggestions);

        const APIKey = 'c11b568515e39132ec55de719c3809f5';
        const cityValue = document.querySelector('.search-box input').value;
        await setBackgroundImage(cityValue);
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityValue}&units=metric&appid=${APIKey}`);
        const json = await response.json();

        if (json.cod == '404') {
            cityHide.textContent = cityValue;
            container.style.height = '400px';
            weatherBox.classList.remove('active');
            weatherDetails.classList.remove('active');
            error404.classList.add('active');
            suggestionsList.innerHTML = ''
            return;
        }

        const forecastContainer = document.querySelector('.forecast-container');

        // Display the forecast container
        forecastContainer.style.display = 'block'

        
        
        
        const image = document.querySelector('.weather-box img');
        const temperature = document.querySelector('.weather-box .temperature');
        const description = document.querySelector('.weather-box .description');
        const humidity = document.querySelector('.weather-details .humidity span');
        const wind = document.querySelector('.weather-details .wind span');

        if (cityHide.textContent == cityValue) {
            return;
        } else {
            
            cityHide.textContent = cityValue;

            container.style.height = '555px';
            container.classList.add('active');
            weatherBox.classList.add('active');
            weatherDetails.classList.add('active');
            error404.classList.remove('active');
            
            
            favoriteContainer.style.display = 'none';

            setTimeout(() => {
                if (cityHide.textContent !== cityValue) {
                    favoriteContainer.style.display = 'flex';
                    favoriteContainer.classList.add('active');
                    container.classList.remove('active');
                }
            }, 2500);

            switch (json.weather[0].main) {
                case 'Clear':
                    image.src = 'images/clear.png';
                    break;

                case 'Rain':
                    image.src = 'images/rain.png';
                    break;

                case 'Snow':
                    image.src = 'images/snow.png';
                    break;

                case 'Clouds':
                    image.src = 'images/cloud.png';
                    break;

                case 'Mist':
                case 'Haze':
                    image.src = 'images/mist.png';
                    break;

                default:
                    image.src = 'images/cloud.png';
            }

            temperature.innerHTML = `${parseInt(json.main.temp)}<span>°C</span>`;
            description.innerHTML = `${json.weather[0].description}`;
            humidity.innerHTML = `${json.main.humidity}%`;
            wind.innerHTML = `${parseInt(json.wind.speed)}Km/h`;

            const infoWeather = document.querySelector('.info-weather');
            const infoHumidity = document.querySelector('.info-humidity');
            const infoWind = document.querySelector('.info-wind');

            const elCloneInfoWeather = infoWeather.cloneNode(true);
            const elCloneInfoHumidity = infoHumidity.cloneNode(true);
            const elCloneInfoWind = infoWind.cloneNode(true);

            elCloneInfoWeather.id = 'clone-info-weather';
            elCloneInfoWeather.classList.add('active-clone');

            elCloneInfoHumidity.id = 'clone-info-humidity';
            elCloneInfoHumidity.classList.add('active-clone');

            elCloneInfoWind.id = 'clone-info-wind';
            elCloneInfoWind.classList.add('active-clone');
           
            setTimeout(() => {
                infoWeather.insertAdjacentElement("afterend", elCloneInfoWeather);
                infoHumidity.insertAdjacentElement("afterend", elCloneInfoHumidity);
                infoWind.insertAdjacentElement("afterend", elCloneInfoWind);
            }, 2200);

            const cloneInfoWeather = document.querySelectorAll('.info-weather.active-clone');
            const totalCloneInfoWeather = cloneInfoWeather.length;
            const cloneInfoWeatherFirst = cloneInfoWeather[0];

            const cloneInfoHumidity = document.querySelectorAll('.info-humidity.active-clone');
            const cloneInfoHumidityFirst = cloneInfoHumidity[0];

            const cloneInfoWind = document.querySelectorAll('.info-wind.active-clone');
            const cloneInfoWindFirst = cloneInfoWind[0];

            if (totalCloneInfoWeather > 0) {
                cloneInfoWeatherFirst.classList.remove('active-clone');
                cloneInfoHumidityFirst.classList.remove('active-clone');
                cloneInfoWindFirst.classList.remove('active-clone');

                setTimeout(() => {
                    cloneInfoWeatherFirst.remove();
                    cloneInfoHumidityFirst.remove();
                    cloneInfoWindFirst.remove();
                }, 2200);
            }
            
            console.log('Fetching forecast data...');
            const forecastData = await fetchForecast(cityValue);
            console.log('Forecast Data:', forecastData); 
            displayForecast(forecastData);
            console.log('Displaying forecast...');
            console.log('Container visibility:', favoriteContainer.style.display);


             
            suggestionsList.style.display = 'none';
        }
    } catch (error) {
        console.error('Error during city search:', error);
    } finally {
       
        loadingSpinner.style.display = 'none';
    }
    
}


function displayForecast(forecastData) {
    forecastContainer.innerHTML = '';

    forecastData.slice(0, 4).forEach((forecastItem, index) => {
        const forecastCard = document.createElement('div');
        forecastCard.classList.add('forecast-card');

        const forecastDate = new Date(forecastItem.dt * 1000);
        const dayOfWeek = forecastDate.toLocaleDateString('en-US', { weekday: 'short' });

        forecastCard.innerHTML = `
            <div class="forecast-date">${getConsecutiveDay(index)}</div>
            <img src="${getWeatherIcon(forecastItem.weather[0].main)}" alt="${forecastItem.weather[0].description}">
            <div class="forecast-temperature">${parseInt(forecastItem.main.temp)}°C</div>
            <div class="forecast-humidity">Humidity: ${forecastItem.main.humidity}%</div>
            <div class="forecast-wind">Wind: ${parseInt(forecastItem.wind.speed)}Km/h</div>
        `;

        forecastContainer.appendChild(forecastCard);
    });

    forecastContainer.style.display = 'flex';
}

function getConsecutiveDay(index) {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    const consecutiveDay = (today + index) % 7;
    return daysOfWeek[consecutiveDay];
}

function getWeatherIcon(weather) {
    
    switch (weather) {
        case 'Clear':
            return 'images/clear.png';
        case 'Rain':
            return 'images/rain.png';
        case 'Snow':
            return 'images/snow.png';
        case 'Clouds':
            return 'images/cloud.png';
        case 'Mist':
        case 'Haze':
            return 'images/mist.png';
        default:
            return 'images/cloud.png';
    }
}


searchButton.addEventListener('click', handleCitySearch);


search.addEventListener('input', async () => {
    const city = search.value.trim();

    if (city === '') {
        suggestionsList.innerHTML = ''; 
        
        return;
    }

    try {
        const suggestions = await fetchCitySuggestions(city);
        displaySuggestions(suggestions);
      
        
         const favoriteList = document.querySelector('.favorite-list');
         if (suggestions.length > 0) {
             favoriteList.classList.remove('visible');
         } else {
             favoriteList.classList.add('visible');
         }
 

        suggestionsList.style.display = 'block';
    } catch (error) {
        console.error('Error during city autocomplete:', error);
    }
});

favoriteList.addEventListener('click', async (event) => {
    const selectedCity = event.target.textContent.trim();

    if (selectedCity) {
        
        search.value = selectedCity;

        try {
            
            handleCitySearch();

            
            displayFavoriteCities();

            
            suggestionsList.style.display = 'none';

            
            search.focus();
        } catch (error) {
            console.error('Error during city selection:', error);
        }
    }
});



document.addEventListener('DOMContentLoaded', () => {
    

    const suggestionItem = document.querySelector('.suggestions-list li');
    
    if (suggestionItem) {
        suggestionItem.addEventListener('click', async () => {
            
            if (suggestion.properties && suggestion.properties.formatted) {
                search.value = suggestion.properties.formatted;

                try {
                    const selectedCity = search.value.trim();
                    const citySuggestions = await fetchCitySuggestions(selectedCity);
                    
                    
                    handleCitySearch();

                    
                    displayFavoriteCities();

                   
                    const favoriteList = document.querySelector('.favorite-list');
                    if (citySuggestions.length > 0) {
                        favoriteList.classList.remove('visible');
                    } else {
                        favoriteList.classList.add('visible');
                    }

                    
                    suggestionsList.style.display = 'none';
                  
                   
                    search.focus();
                 
                } catch (error) {
                    console.error('Error during city selection:', error);
                }
            }
        });
    }
});

function displaySuggestions(suggestions) {
    suggestionsList.innerHTML = '';

    suggestions.forEach((suggestion) => {
        const suggestionItem = document.createElement('li');
        suggestionItem.textContent = suggestion.properties.formatted;
        suggestionItem.addEventListener('click', async () => {
            search.value = suggestion.properties.formatted;

            try {
                const selectedCity = search.value.trim();
                const citySuggestions = await fetchCitySuggestions(selectedCity);
                displayFavoriteCities();

                document.querySelector('.favorite-container').classList.add('active');
    
                suggestionsList.style.display = 'none';
    
                search.focus();
                handleCitySearch();
                suggestionsList.style.display = 'none';
                search.focus();
            } catch (error) {
                console.error('Error during city selection:', error);
            }
        });
        
        suggestionsList.appendChild(suggestionItem);
    });

    suggestionsList.style.display = 'block';
}

document.querySelector('.suggestions-list').addEventListener('click', async (event) => {
    const suggestionItem = event.target.closest('li');
    if (suggestionItem) {
        search.value = suggestionItem.textContent;

        try {
            const selectedCity = search.value.trim();
            const citySuggestions = await fetchCitySuggestions(selectedCity);
         

            document.querySelector('.favorite-container').classList.add('active');

             suggestionsList.style.display = 'none';

            search.focus();
            handleCitySearch();
            suggestionsList.style.display = 'none';
            search.focus();
        } catch (error) {
            console.error('Error during city selection:', error);
        }
    }
}); 