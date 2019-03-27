# data-point
Wrapper for the Met Office's DataPoint API - [DataPoint](https://www.metoffice.gov.uk/datapoint)

For use in node projects

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
const dp = require('@slatham/datapoint');
```
### Set your API key
Define your datapoint API key.  You can register for a key [here](https://register.metoffice.gov.uk/WaveRegistrationClient/public/register.do?service=datapoint)
```javascript
// define your API Key (required)
dp.apiKey = 'this-is-where-your-key-goes';
```
### Specify data type
Optionally, you can specify the type of weather data you want to retrieve from the datapoint API.  You have only two options - ```'forecast'``` or ```'observations'```.  By default, ```'forecast'``` is set.
```javascript
// set the data type to pull from datapoint
dp.type = 'forecast';
```
### Specify the time resolution
Optionally, you can set the time period for data.  You only have two options for this - ```'3hourly'``` or ```'daily'```.  The default here is ```'daily'```.
```javascript
// set time resolution
dp.resolution = '3hourly';
```

### Get all sites
Retrieve a full listing of all sites (locations) in the UK that are covered.  Note if you have the data type set to ```'forecast'``` that will be a listing of over 5000 sites!  There are fewer sites available for observations.  This is an async operation so you are returned a Promise.  The data returned contains a site id.  A site id is needed so as you can request a weather forecast for that site id.
```javascript
dp.siteList().then((sites) => {
  console.log(sites);
});
```

### Get nearby sites
Retrieve a list of nearby locations rather than a full listing.  You do this by simply adding an argument to the above ```'siteList() '``` function.
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
// set a location with latitudem longitude and the minimum amount of sites you want back from the query
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
