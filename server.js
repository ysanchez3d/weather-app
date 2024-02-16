const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;
const data = require("./data");

app.use(express.static("public"));

const sanitizeData = (data) => {
  const weatherData = {
    location: {
      name: "",
      region: ""
    },
    forecast: {
      "24hours": [],
      "7days": []
    }
  };

  weatherData.location.name = data.location.name;
  weatherData.location.region = data.location.region;
  const currentHour = new Date(data.current["last_updated"]);

  weatherData.forecast["7days"] = data.forecast.forecastday.map(
    (dateObj, i) => {
      const currentDay = {
        date: dateObj.date,
        day_str: parseDateString(dateObj.date),
        maxtemp_c: dateObj.day.maxtemp_c,
        maxtemp_f: dateObj.day.maxtemp_f,
        mintemp_c: dateObj.day.mintemp_c,
        mintemp_f: dateObj.day.mintemp_f,
        avgtmp_c: dateObj.day.avgtmp_c,
        avgtmp_f: dateObj.day.avgtmp_f,
        condition: {
          text: dateObj.day.condition.text,
          icon: parseIconPath(dateObj.day.condition.icon)
        }
      };

      if (weatherData.forecast["24hours"].length < 26) {
        dateObj.hour.forEach((hour) => {
          const thisHour = new Date(hour.time);

          if (
            currentHour.getTime() >= thisHour.getTime() &&
            weatherData.forecast["24hours"].length < 26
          ) {
            const hourCast = {
              time_str: parseTime(thisHour),
              temp_c: hour.temp_c,
              temp_f: hour.temp_f,
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
  const ampm = hour > 12 ? "PM" : "AM";
  hour = hour % 12;
  hour = hour === 0 ? 12 : hour;
  return `${hour}${ampm}`;
};

const parseIconPath = (path) => {
  return path.split(".com")[1];
};

const parseDateString = (date) => {
  return new Date(date).toString().split(" ")[0];
};

console.log(sanitizeData(data));

app.listen(PORT, () => {
  console.log(`Weather App listening on port ${PORT}`);
});
