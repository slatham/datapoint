# datapoint
Wrapper for the Met Office's DataPoint API - [DataPoint](https://www.metoffice.gov.uk/datapoint)

## Usage

### Install
Use your node package manager to install.
```
npm install @slatham/datapoint
```

### Import
Include in your node project
```javascript
// import the module
const datapoint = require('@slatham/datapoint');
```
### Setup
Define your datapoint API key while instantiating a new Datapoint object.  You can register for a key [here](https://register.metoffice.gov.uk/WaveRegistrationClient/public/register.do?service=datapoint)
```javascript
const apiKey = xxxx-xxxx-xxxx-xxxx-xxxx-xxxx
const dp = new datapoint(apiKey);
```

### Initialise
Before using any of the datapoint functionality you must first run the init() function.  This is an async operation with a callback function passed as the argument.  When called, the datapoint api will be queried for all forecast and observation sites.  It will then store these sites in 2 separate quadtrees - one for forecast sites and one for observation sites.  This is because these lists rarely change so it saves multiple async calls to the datapoint api for the same data.  Also, as the locations are stored in a quadtree data structure they're organised based on their location.  This makes queries for nearby sites more efficient.  It is recommended to run any call to datapoint in the callback function of the init() function call.  That way you'll be sure everything is set up and ready. 
```javascript
dp.init((ready) => {
  // YOUR CODE GOES HERE
});
```
You could even test if everything is working and no errors have occurred during initialisation
```javascript
dp.init((ready) => {
  if(ready) {
    // YOUR CODE GOES HERE
  } else {
    // SOMETHING HAS GONE WRONG
  }
});
````

### Get all forecast sites
Retrieve a full listing of all forecast sites (locations) in the UK that are covered.  Note that will be a listing of over 5000 sites!  The data returned contains a site id.  A site id is needed so as you can request a weather forecast for that site id.
```javascript
dp.init((ready) => {
  const allSites = dp.getAllForecastSites();
});
```
### Get all observation sites
Retrieve a full listing of all observation sites (locations) in the UK that are covered.  Note that will be a listing of over 140 sites - much less than the forecast sites.  The data returned contains a site id.  A site id is needed so as you can request observations for that site id.
```javascript
dp.init((ready) => {
  const allSites = dp.getAllObservationSites();
});
```

### Get nearby forecast sites
Retrieve a list of nearby forecast locations rather than a full listing.  
```javascript
// need a location with latitude / longitude and the minimum amount of sites you want back from the query
const location = {latitude: 53.430828, longitude: -2.960830};
// set a size for the area to search
// see [Wikipedia](https://en.wikipedia.org/wiki/Decimal_degrees) precision table for a guide on setting this.
const areaSize = 0.1; // decimal degrees
dp.init((ready) => {
  const nearbySites = dp.getNearbyForecastSites(locationm areaSize);
});
```
This query for nearby sites uses a [quadtree](https://github.com/slatham/quadtree) data structure for fast retrival.  Once init() has run these queries do not hit your datapoint api quota.

### Get nearest forecast site
Given a coordinate, find the nearest forecast site.  You will have a Set() containing a single item returned.
```javascript
dp.init((ready) => {
  // for a given location
  const location = {latitude: 53.430828, longitude: -2.960830};
  // find the nearest site that datapoint has forecasts for
  const nearestSite = dp.getNearestForecastSite(location);
});
```
### Get nearest observation site
Given a coordinate, find the nearest observation site.  You will have a Set() containing a single item returned.
```javascript
dp.init((ready) => {
  // for a given location
  const location = {latitude: 53.430828, longitude: -2.960830};
  // find the nearest site that datapoint has observations for
  const nearestSite = dp.getNearestObservationSite(location);
});
```

### Get a forecast
Pull a weather forecast for a given site.  Remember, you'll have to query for the site id before you can get a forecast or observation.  You can pull a 3hourly or daily forecast from the api.  You just set what time resolution you require as the second parameter.  The first parameter is the ID of the site you're interested in.
```javascript
const siteId = 322315;
dp.init((ready) => {
  // get the 3hourly forecast for the site
  dp.getForecast(siteId, '3hourly').then((forecast) => {
    console.log(forecast)
  });
});
```
### Get observations
Pull weather observations for a given site.  Remember, you'll have to query for the site id before you can get a forecast or observation.  Also, the site ID for a forecast location isn't the same as an ID for an observations site.  You'll have to query for them as decribed above.  You can pull hourly observations for the last 24 hours from the api.  The only parameter is the ID of the site you're interested in.
```javascript
const siteId = 322315;
dp.init((ready) => {
  // get the observations for the site
  dp.getObservations(siteId).then((observation) => {
    console.log(observations)
  });
});
```
Note: The get

### Get forecasts or observations for nearby sites
Combine the above to firstly find nearby sites, then use their IDs to pull the weather for them.
```javascript
// set a location with latitude / longitude and the minimum amount of sites you want back from the query
const location = {lat:53.430828, lon:-2.960830, minimum:10};
dp.siteList(location).then((sites) => {
  sites.forEach((site) => {
    dp.forecast(site.data.id).then((weather) => {
      console.log(forecast.forecast);
    });
  });
});
```
__Careful with this - don't try to query hundreds of sites at once for weather or you'll have your API key blocked for 24 hours!__
