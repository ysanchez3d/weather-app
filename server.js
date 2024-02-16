const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;
const API_URL = process.env.API_URL;
const data = require("./data");
const querystring = require("node:querystring");
const axios = require("axios");
const exp = require("node:constants");
const { json } = require("body-parser");
let loadedSavedLocations = false;

app.use(express.static("public"));
app.use(express.json());

app.get("/weather", async (req, res) => {
  const query = req.query.q;
  console.log("queryyyyyy", req.query)

  const response = await getWeatherData(query);
  const currentLocationData = sanitizeData(response);
  const needSavedLocations = req.query.savedLocations;

  if (!loadedSavedLocations) {
    await getSavedLocations(savedLocations);
    loadedSavedLocations = true;
  }

  if (needSavedLocations) {
    res.end(JSON.stringify({ currentLocationData, savedLocations }));
  } else {
    res.end(JSON.stringify({ currentLocationData }));
  }



});

const queryParams = {
  key: API_KEY,
  days: 7,
  q: ""
};

const sanitizeData = (data) => {
  const weatherData = {
    location: {
      name: data.location.name,
      region: data.location.region,
      time: ""
    },
    forecast: {
      "24hours": [],
      "7days": []
    }
  };
  const localTime = parseTime(new Date(data.location.localtime));
  weatherData.location.time = `${localTime[0]}:${localTime[1]}${localTime[2]}`;
  const currentHour = new Date(data.current["last_updated"]);

  weatherData.forecast["7days"] = data.forecast.forecastday.map(
    (dateObj, i) => {
      const currentDay = {
        date: dateObj.date,
        day_str: parseDateString(dateObj.date),
        maxtemp_c: Math.round(dateObj.day.maxtemp_c),
        maxtemp_f: Math.round(dateObj.day.maxtemp_f),
        mintemp_c: Math.round(dateObj.day.mintemp_c),
        mintemp_f: Math.round(dateObj.day.mintemp_f),
        avgtmp_c: Math.round(dateObj.day.avgtemp_c),
        avgtmp_f: Math.round(dateObj.day.avgtemp_f),
        condition: {
          text: dateObj.day.condition.text,
          icon: parseIconPath(dateObj.day.condition.icon)
        }
      };

      if (weatherData.forecast["24hours"].length < 24) {
        dateObj.hour.forEach((hour) => {
          const thisHour = new Date(hour.time);

          if (
            currentHour.getTime() <= thisHour.getTime() &&
            weatherData.forecast["24hours"].length < 24
          ) {
            let h = parseTime(thisHour);
            const hourCast = {
              time_str: h[0] + h[2],
              temp_c: Math.round(hour.temp_c),
              temp_f: Math.round(hour.temp_f),
              icon: parseIconPath(hour.condition.icon)
            };
            weatherData.forecast["24hours"].push(hourCast);
          }
        });
      }
      return currentDay;
    }
  );

  return weatherData;
};

const parseTime = (date) => {
  let hour = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hour > 12 ? "PM" : "AM";
  hour = hour % 12;
  hour = hour === 0 ? 12 : hour;
  return [hour, minutes, ampm];
};

const parseIconPath = (path) => {
  return path.split(".com")[1];
};

const parseDateString = (date) => {
  let today = new Date(date)
  let nextDay = new Date(today.getTime() + (24 * 60 * 60 * 1000));
  return nextDay.toString().split(" ")[0];
};

const getWeatherData = async (location) => {
  queryParams.q = location;
  const encoded = querystring.encode(queryParams);
  console.log(encoded);
  const response = await axios.get(API_URL + encoded);
  return response.data;
};

let savedLocations = ["Las Vegas", "New York", "London", "Paris"];

const getSavedLocations = async (locations) => {
  for (let i = 0; i < locations.length; i++) {
    const response = await getWeatherData(locations[i]);
    savedLocations[i] = sanitizeData(response);
  }

  return savedLocations;
};

app.listen(PORT, () => {
  console.log(`Weather App listening on port ${PORT}`);
});
