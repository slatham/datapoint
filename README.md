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
Retrieve a full listing of all observation sites (locations) in the UK that are covered.  Note that will be a listing of over 140 sites - much less than the forecast sites  The data returned contains a site id.  A site id is needed so as you can request observations for that site id.
```javascript
dp.init((ready) => {
  const allSites = dp.getAllObservationSites();
});
```

### Get nearby forecast sites
Retrieve a list of nearby forecast locations rather than a full listing.  
```javascript
// set a location with latitudem longitude and the minimum amount of sites you want back from the query
const location = {lat:53.430828, lon:-2.960830, minimum:10};
dp.siteList(location).then((sites) => {
  console.log(sites);
});
```
This query for nearby sites uses a [quadtree](https://github.com/slatham/quadtree) data structure for fast retrival.   

### Get a forecast or observation
Pull a weather forecast or observation (depending how you've set your data type) for a site.  Remember, you'll have to query for the site id before you can get a forecast or observation.
```javascript
const siteID = 12345;
// get forecast for site with ID of siteID
dp.forecast(siteID).then((weather) => {
  console.log(weather);
});
```

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
