"use strict";

let mesto = "Home";
let fetchCesta, homeCoords;

// zjištění polohy home, pokud nejde, nastaví se Strážnice

const getPosition = function () {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

const getHomeCoords = async function () {
  try {
    const position = await getPosition();
    const { latitude, longitude } = position.coords;
    return { latitude, longitude };
  } catch (err) {
    alert(
      "Nebyli jsme schopni načíst Vaši polohu. Umístili jsme Vás proto do Strážnice, je to hezké město 🍷🏘🏘"
    );
    return { latitude: 48.8957, longitude: 17.318 };
  }
};

//vykreslení počasí pro home/Strážnici po spuštění
getHomeCoords().then((coords) => {
  fetchCesta = `https://api.openweathermap.org/data/2.5/onecall?lat=${coords.latitude}&lon=${coords.longitude}&exclude=minutely,hourly&units=metric&lang=cz&appid=55e696532f166939726049f05dfb145d`;
  homeCoords = coords;
  nactiMisto();
});

function nactiMisto() {
  fetch(fetchCesta)
    .then((response) => response.json())
    .then(zobrazPocasi)
    .catch((err) => {
      console.error(err);
    });
}

function zobrazPocasi(data) {
  //předpověď počasí - data z API
  document.querySelector("#teplota").textContent = Math.round(
    data.current.temp
  );
  document.querySelector("#popis").textContent =
    data.current.weather[0].description;
  document.querySelector("#vlhkost").textContent = data.current.humidity;
  document.querySelector("#vitr").textContent = data.current.wind_speed.toFixed(
    1
  );
  document.querySelector("#mesto").textContent = mesto;

  let cas = getNormalTime(data.current.sunrise);
  document.querySelector("#vychod").textContent = `${cas.hodiny}:${cas.minuty}`;
  cas = getNormalTime(data.current.sunset);
  document.querySelector("#zapad").textContent = `${cas.hodiny}:${cas.minuty}`;

  //ikony
  let novaIkona = getWeatherIcon(
    data.current.weather[0].id,
    data.current.weather[0].icon
  );
  document.querySelector("#ikona").innerHTML = novaIkona;

  // předpověď na 4 dny - tvorba HTML

  let predpovedHtml = "";
  const dnyCesky = [
    "Neděle",
    "Pondělí",
    "Úterý",
    "Středa",
    "Čtvrtek",
    "Pátek",
    "Sobota",
  ];
  for (let i = 1; i < 5; i++) {
    const datum = getNormalTime(data.daily[i].dt);
    const { denVtydnu, datumKolikateho, datumMesic } = datum;

    let ikona = getWeatherIcon(
      data.daily[i].weather[0].id,
      data.daily[i].weather[0].icon
    );

    predpovedHtml += `<div class="forecast">
		<div class="forecast__day">${dnyCesky[denVtydnu]} ${datumKolikateho}.${
      datumMesic + 1
    }.</div>
		<div class="forecast__icon">
		${ikona}
		</div>
		<div class="forecast__temp">${Math.round(data.daily[i].temp.day)} °C </div>
		</div>`;
  }

  document.querySelector("#predpoved").innerHTML = predpovedHtml;
}

//přidání dalších měst

function Praha() {
  mesto = "Praha";
  fetchCesta =
    "https://api.openweathermap.org/data/2.5/onecall?lat=50.0847&lon=14.4215&exclude=minutely,hourly&units=metric&lang=cz&appid=55e696532f166939726049f05dfb145d";
  nactiMisto();
  document.querySelector("body").style.background =
    "url(images/praha.jpg) center/cover no-repeat";
}

function Brno() {
  mesto = "Brno";
  fetchCesta =
    "https://api.openweathermap.org/data/2.5/onecall?lat=49.20&lon=16.61&exclude=minutely,hourly&units=metric&lang=cz&appid=55e696532f166939726049f05dfb145d";
  nactiMisto();
  document.querySelector("body").style.background =
    "url(images/brno.jpg) center/cover no-repeat";
}

function Ostrava() {
  mesto = "Ostrava";
  fetchCesta =
    "https://api.openweathermap.org/data/2.5/onecall?lat=49.83&lon=18.26&exclude=minutely,hourly&units=metric&lang=cz&appid=55e696532f166939726049f05dfb145d";
  nactiMisto();
  document.querySelector("body").style.background =
    "url(images/ostrava.jfif) center/cover no-repeat";
}

function domu() {
  mesto = "Home";
  fetchCesta = `https://api.openweathermap.org/data/2.5/onecall?lat=${homeCoords.latitude}&lon=${homeCoords.longitude}&exclude=minutely,hourly&units=metric&lang=cz&appid=55e696532f166939726049f05dfb145d`;
  nactiMisto();
  document.querySelector("body").style.background =
    "url(images/straznice.jpg) center/cover no-repeat";
}

//pomocná funkce na přepočet timeUNIX na potřebné hodnoty
function getNormalTime(timeUnix) {
  const datum = new Date(timeUnix * 1000);
  const hodiny = datum.getHours();
  let minuty = datum.getMinutes();
  if (minuty < 10) minuty = "0" + minuty;
  const denVtydnu = datum.getDay();
  const datumKolikateho = datum.getDate();
  const datumMesic = datum.getMonth();
  return { hodiny, minuty, denVtydnu, datumKolikateho, datumMesic };
}

//hezčí ikony až do konce
function getWeatherIcon(code, img) {
  let prefix = "wi wi-";
  let partOfDay = "";
  let icon = weatherIconss[code].icon;

  if (img.slice(-1) === "d") {
    partOfDay = "day-";
  } else if (img.slice(-1) === "n") {
    partOfDay = "night-";
  }

  // icons 7xx and 9xx do not get prefixed with day/night
  if (!(code > 699 && code < 800) && !(code > 899 && code < 1000)) {
    icon = partOfDay + icon;
  }

  // Put everything together and return it
  return `<i class="${prefix + icon}"></i>`;
}

// mapping of Weather Icons (https://github.com/erikflowers/weather-icons)
// to OpenWeatherMap weather codes
const weatherIconss = {
  200: {
    label: "thunderstorm with light rain",
    icon: "storm-showers",
  },

  201: {
    label: "thunderstorm with rain",
    icon: "storm-showers",
  },

  202: {
    label: "thunderstorm with heavy rain",
    icon: "storm-showers",
  },

  210: {
    label: "light thunderstorm",
    icon: "storm-showers",
  },

  211: {
    label: "thunderstorm",
    icon: "thunderstorm",
  },

  212: {
    label: "heavy thunderstorm",
    icon: "thunderstorm",
  },

  221: {
    label: "ragged thunderstorm",
    icon: "thunderstorm",
  },

  230: {
    label: "thunderstorm with light drizzle",
    icon: "storm-showers",
  },

  231: {
    label: "thunderstorm with drizzle",
    icon: "storm-showers",
  },

  232: {
    label: "thunderstorm with heavy drizzle",
    icon: "storm-showers",
  },

  300: {
    label: "light intensity drizzle",
    icon: "sprinkle",
  },

  301: {
    label: "drizzle",
    icon: "sprinkle",
  },

  302: {
    label: "heavy intensity drizzle",
    icon: "sprinkle",
  },

  310: {
    label: "light intensity drizzle rain",
    icon: "sprinkle",
  },

  311: {
    label: "drizzle rain",
    icon: "sprinkle",
  },

  312: {
    label: "heavy intensity drizzle rain",
    icon: "sprinkle",
  },

  313: {
    label: "shower rain and drizzle",
    icon: "sprinkle",
  },

  314: {
    label: "heavy shower rain and drizzle",
    icon: "sprinkle",
  },

  321: {
    label: "shower drizzle",
    icon: "sprinkle",
  },

  500: {
    label: "light rain",
    icon: "rain",
  },

  501: {
    label: "moderate rain",
    icon: "rain",
  },

  502: {
    label: "heavy intensity rain",
    icon: "rain",
  },

  503: {
    label: "very heavy rain",
    icon: "rain",
  },

  504: {
    label: "extreme rain",
    icon: "rain",
  },

  511: {
    label: "freezing rain",
    icon: "rain-mix",
  },

  520: {
    label: "light intensity shower rain",
    icon: "showers",
  },

  521: {
    label: "shower rain",
    icon: "showers",
  },

  522: {
    label: "heavy intensity shower rain",
    icon: "showers",
  },

  531: {
    label: "ragged shower rain",
    icon: "showers",
  },

  600: {
    label: "light snow",
    icon: "snow",
  },

  601: {
    label: "snow",
    icon: "snow",
  },

  602: {
    label: "heavy snow",
    icon: "snow",
  },

  611: {
    label: "sleet",
    icon: "sleet",
  },

  612: {
    label: "shower sleet",
    icon: "sleet",
  },

  615: {
    label: "light rain and snow",
    icon: "rain-mix",
  },

  616: {
    label: "rain and snow",
    icon: "rain-mix",
  },

  620: {
    label: "light shower snow",
    icon: "rain-mix",
  },

  621: {
    label: "shower snow",
    icon: "rain-mix",
  },

  622: {
    label: "heavy shower snow",
    icon: "rain-mix",
  },

  701: {
    label: "mist",
    icon: "sprinkle",
  },

  711: {
    label: "smoke",
    icon: "smoke",
  },

  721: {
    label: "haze",
    icon: "day-haze",
  },

  731: {
    label: "sand, dust whirls",
    icon: "cloudy-gusts",
  },

  741: {
    label: "fog",
    icon: "fog",
  },

  751: {
    label: "sand",
    icon: "cloudy-gusts",
  },

  761: {
    label: "dust",
    icon: "dust",
  },

  762: {
    label: "volcanic ash",
    icon: "smog",
  },

  771: {
    label: "squalls",
    icon: "day-windy",
  },

  781: {
    label: "tornado",
    icon: "tornado",
  },

  800: {
    label: "clear sky",
    icon: "sunny",
  },

  801: {
    label: "few clouds",
    icon: "cloudy",
  },

  802: {
    label: "scattered clouds",
    icon: "cloudy",
  },

  803: {
    label: "broken clouds",
    icon: "cloudy",
  },

  804: {
    label: "overcast clouds",
    icon: "cloudy",
  },

  900: {
    label: "tornado",
    icon: "tornado",
  },

  901: {
    label: "tropical storm",
    icon: "hurricane",
  },

  902: {
    label: "hurricane",
    icon: "hurricane",
  },

  903: {
    label: "cold",
    icon: "snowflake-cold",
  },

  904: {
    label: "hot",
    icon: "hot",
  },

  905: {
    label: "windy",
    icon: "windy",
  },

  906: {
    label: "hail",
    icon: "hail",
  },

  951: {
    label: "calm",
    icon: "sunny",
  },

  952: {
    label: "light breeze",
    icon: "cloudy-gusts",
  },

  953: {
    label: "gentle breeze",
    icon: "cloudy-gusts",
  },

  954: {
    label: "moderate breeze",
    icon: "cloudy-gusts",
  },

  955: {
    label: "fresh breeze",
    icon: "cloudy-gusts",
  },

  956: {
    label: "strong breeze",
    icon: "cloudy-gusts",
  },

  957: {
    label: "high wind, near gale",
    icon: "cloudy-gusts",
  },

  958: {
    label: "gale",
    icon: "cloudy-gusts",
  },

  959: {
    label: "severe gale",
    icon: "cloudy-gusts",
  },

  960: {
    label: "storm",
    icon: "thunderstorm",
  },

  961: {
    label: "violent storm",
    icon: "thunderstorm",
  },

  962: {
    label: "hurricane",
    icon: "cloudy-gusts",
  },
};
