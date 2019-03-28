const datapoint = require('./src/datapoint');
require('dotenv').config();
const apiKey = process.env.DATAPOINT_API_KEY;

// instantiate a new datapoint object
const dp = new datapoint(apiKey);
// initialise datapoint
dp.init((ready) => {
  // optionally, you can check if initialisation
  // worked okay.
  if (ready) {
    // return a Set() of all forecast sites
    console.log(dp.getAllForecastSites());
    // return a Set() of all observation sites
    console.log(dp.getAllObservationSites());
  }
});

dp.getForecast(322315, '3hourly').then((forecast) => {
  console.log(forecast);
});

// you must wrap any calls in an init() call, though.
// that way it ensures initialisation has successfully
// completed
dp.init(() => {
  // get forecast data for a given site
  dp.getForecast(322315, '3hourly').then((forecast) => {
    console.log(forecast);
  });
});

// failure do do so could result in either
// being returned undefined or no results
console.log(dp.getAllForecastSites());

dp.getNearbyForecastSites();

dp.getNearestForecastSite();

dp.getNearestObservationSite();


