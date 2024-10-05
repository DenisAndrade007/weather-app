const API_KEY = "20069434696b79a218a819cb35bfa261";
const weatherInfo = document.getElementById("weather-info");
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const suggestionsContainer = document.getElementById("suggestions");

const getWeatherData = async (city) => {
	try {
		const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=pt_br`;
		const response = await fetch(url);
		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Cidade não encontrada");
		}
		return await response.json();
	} catch (error) {
		console.error("Erro ao buscar dados do clima:", error);
		throw error;
	}
};

const displayWeather = (data) => {
	const { name, main, weather, wind } = data;
	weatherInfo.innerHTML = `
        <h2>${name}</h2>
        <img class="weather-icon" src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="${weather[0].description}">
        <p class="weather-temp">${Math.round(main.temp)}°C</p>
        <p class="weather-description">${weather[0].description}</p>
        <div class="weather-details">
            <div>
                <p>Sensação</p>
                <p>${Math.round(main.feels_like)}°C</p>
            </div>
            <div>
                <p>Umidade</p>
                <p>${main.humidity}%</p>
            </div>
            <div>
                <p>Vento</p>
                <p>${Math.round(wind.speed * 3.6)} km/h</p>
            </div>
        </div>
    `;
	updateBackgroundByTemperature(main.temp);
};

const updateBackgroundByTemperature = (temperature) => {
	const temperatureRanges = [
		{ max: 0, class: "very-cold" },
		{ max: 10, class: "cold" },
		{ max: 20, class: "mild" },
		{ max: 30, class: "warm" },
		{ max: 35, class: "hot" },
		{ max: Number.POSITIVE_INFINITY, class: "very-hot" },
	];

	const temperatureClass = temperatureRanges.find(
		(range) => temperature <= range.max,
	).class;

	document.body.className = temperatureClass;
};

const handleSearch = async () => {
	const city = cityInput.value.trim();
	if (!city) {
		showMessage("Por favor, insira o nome de uma cidade.");
		return;
	}

	try {
		showLoading();
		const data = await getWeatherData(city);
		displayWeather(data);
	} catch (error) {
		showMessage(`Erro: ${error.message}`);
	}
};

const showLoading = () => {
	weatherInfo.innerHTML = '<p class="message">Carregando...</p>';
};

const showMessage = (message) => {
	weatherInfo.innerHTML = `<p class="message">${message}</p>`;
};

const showInitialState = () => {
	weatherInfo.innerHTML = `
        <p class="initial-message">
            Digite o nome de uma cidade para ver a previsão do tempo.
        </p>
    `;
	document.body.className = "";
};

const debounce = (func, delay) => {
	let timeoutId;
	return (...args) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => func(...args), delay);
	};
};

const cities = [
	"São Paulo",
	"Rio de Janeiro",
	"Belo Horizonte",
	"Salvador",
	"Brasília",
];

const showSuggestions = () => {
	const value = cityInput.value.toLowerCase();
	const filteredCities = cities.filter((city) =>
		city.toLowerCase().startsWith(value),
	);

	suggestionsContainer.innerHTML = "";
	for (const city of filteredCities) {
		const div = document.createElement("div");
		div.textContent = city;
		div.addEventListener("click", () => {
			cityInput.value = city;
			suggestionsContainer.innerHTML = "";
			handleSearch();
		});
		suggestionsContainer.appendChild(div);
	}
};

const debouncedShowSuggestions = debounce(showSuggestions, 300);

searchBtn.addEventListener("click", handleSearch);
cityInput.addEventListener("keypress", (e) => {
	if (e.key === "Enter") handleSearch();
});
cityInput.addEventListener("input", debouncedShowSuggestions);

document.addEventListener("click", (e) => {
	if (e.target !== cityInput && e.target !== suggestionsContainer) {
		suggestionsContainer.innerHTML = "";
	}
});

// Inicializa o app com o estado inicial
document.addEventListener("DOMContentLoaded", showInitialState);
