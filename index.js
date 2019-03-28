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
    console.log(`Number of all forecast sites = ${dp.getAllForecastSites().size}`);
    // return a Set() of all observation sites
    console.log(`Number of all observation sites = ${dp.getAllObservationSites().size}`);
    // get forecast sites within given area
    const areaSize = 0.1;
    const location = {lat: 53.430828, lon: -2.960830};
    console.log(dp.getNearbyForecastSites(location, areaSize).size);
  }
});



// you must wrap any calls in an init() call, though.
// that way it ensures initialisation has successfully
// completed
// dp.init(() => {
//   // get forecast data for a given site
//   dp.getForecast(322315, '3hourly').then((forecast) => {
//     console.log(forecast);
//   });
// });

// failure do do so could result in either
// being returned undefined or no results
//console.log(dp.getAllForecastSites());




dp.init((ready) => {
  if (ready) {
    // cilliau Aeron
    const location = {latitude:52.543741, longitude: -4.052158};
    console.log(dp.getNearestForecastSite(location));
  }
});


dp.getNearestObservationSite();


