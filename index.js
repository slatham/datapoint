const datapoint = require('./src/datapoint');
require('dotenv').config();
const apiKey = process.env.DATAPOINT_API_KEY;
console.log(apiKey);

const dp = new datapoint(apiKey);

// return a Set() of all forecast sites
dp.getAllForecastSites().then((sites) => {
  console.log(sites.size); // 5936
});

// return a Set() of all observation sites
dp.getAllObservationSites().then((sites) => {
  console.log(sites.size); // 140
});

// get forecast data for a given site
dp.getForecast(322315, '3hourly').then((forecast) => {
  console.log(forecast)
});

dp.getNearbyForecastSites();

dp.getNearestForecastSite();

dp.getNearestObservationSite();


