const searchBar = document.getElementById("search");
const hourlyForecast = document.getElementsByClassName("hours")[0];
const locationName = document.getElementById("location-name");
const currLocationDegree = document.getElementsByClassName("curr-degree")[0];
const currentCondition = document.getElementsByClassName("curr-condition")[0];
const current_high = document.getElementsByClassName("curr-h")[0];
const current_low = document.getElementsByClassName("curr-l")[0];

//saved locations
const savedCities = document.getElementsByClassName("saved-cities")[0];

const displaySavedLocations = () => {
  savedLocations.forEach((location) => {
    const sc = document.createElement("div");
    sc.classList.add("saved-city");
    const header = document.createElement("div");
    header.classList.add("header");
    const ht = document.createElement("div");
    ht.classList.add("header-text");

    const h3 = document.createElement("h3");
    h3.innerHTML = location.location.name;
    const p = document.createElement("p");
    p.innerHTML = location.location.time;
    ht.appendChild(h3);
    ht.appendChild(p);
    header.appendChild(ht);

    const htemp = document.createElement("div");
    htemp.classList.add("header-temp");
    htemp.innerHTML = location.forecast["7days"][0]["avgtmp_f"] + "&deg;";
    header.appendChild(htemp);
    sc.appendChild(header);

    const ci = document.createElement("div");
    ci.classList.add("city-info");

    const p1 = document.createElement("p");
    p1.classList.add("condition-text");
    p1.innerHTML = location.forecast["7days"][0].condition.text;
    const p2 = document.createElement("p");
    p2.innerHTML = `H:<span class="high">${
      location.forecast["7days"][0]["maxtemp_f"] + "&deg;"
    }&deg;</span> L:<span class="low">${
      location.forecast["7days"][0]["mintemp_f"] + "&deg;"
    }&deg;</span>`;
    ci.appendChild(p1);
    ci.appendChild(p2);
    sc.appendChild(ci);
    savedCities.appendChild(sc);
  });
};

const displayCurrentLocation = () => {
  locationName.textContent = `${weatherData.location.name}, ${weatherData.location.region}`;
  currLocationDegree.innerHTML = `${weatherData.forecast["24hours"][0]["temp_f"]}&deg;`;
  currentCondition.textContent =
    weatherData.forecast["7days"][0].condition.text;
  current_high.textContent = weatherData.forecast["7days"][0]["maxtemp_f"];
  current_low.textContent = weatherData.forecast["7days"][0]["mintemp_f"];
};

let weatherData;
let savedLocations;

searchBar.addEventListener("keyup", async (e) => {
  if (e.key === "Enter") {
    let location = searchBar.value;
    let data = await getWeather(location);
    weatherData = data.currentLocationData;
    displayForecast();
    displayCurrentLocation();
  }
});

const getWeather = async (location) => {
  const response = await fetch("/weather" + `?q=${location}`);
  const data = await response.json();
  return data;
};

const displayForecast = () => {
  hourlyForecast.innerHTML = "";
  weatherData.forecast["24hours"].forEach((hour, i) => {
    const li = document.createElement("li");
    const p = document.createElement("p");
    p.classList.add("hour");
    const img = document.createElement("img");
    img.src = `./images${hour.icon}`;
    const temp = document.createElement("p");
    temp.classList.add("avg-temp");
    temp.innerHTML = `${hour["temp_f"]}&deg;`;
    i === 0 ? (p.innerHTML = "Now") : (p.innerHTML = hour["time_str"]);

    li.appendChild(p);
    li.appendChild(img);
    li.appendChild(temp);
    hourlyForecast.appendChild(li);
  });
};

const getGeoLocation = () => {
  navigator.geolocation.getCurrentPosition(async (pos) => {
    let location = `${pos.coords.latitude},${pos.coords.longitude}`;

    const data = await getWeather(location);
    weatherData = data.currentLocationData;
    savedLocations = data.savedLocations;
    displayForecast();
    displayCurrentLocation();
    displaySavedLocations();
  });
  // console.log(location);
};

getGeoLocation();
