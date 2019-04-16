const datapoint = require('../build/index');
const expect = require('chai').expect;
require('dotenv').config();
const apiKey = process.env.DATAPOINT_API_KEY;
const dp = new datapoint(apiKey);
const location = {latitude: 52.543741, longitude: -4.052158};
const areaSize = 0.1;

const locations = [
  {latitude: 52.573921, longitude: -0.250830},
  {latitude: 57.653484, longitude: -3.335724},
  {latitude: 53.002666, longitude: -2.179404},
  {latitude: 52.412811, longitude: -1.778197},
  {latitude: 51.481583, longitude: -3.179090},
  {latitude: 50.768036, longitude: 0.290472},
  {latitude: 51.752022, longitude: -1.257677},
  {latitude: 51.509865, longitude: -0.118092},
  {latitude: 51.568535, longitude: -1.772232},
  {latitude: 51.441883, longitude: 0.370759}
];

describe('# Datapoint', () => {

  beforeEach((done) => {
    dp.init((ready) => {
      if (ready) {
        done();
      }
    });
  });
  it('# init() - Should initialise a quadtree data structure for observation sites', () => {
    expect(dp.observationSites.constructor.name).to.equal('Quadtree');
  });
  it('# init() - Should initialise a quadtree data structure for forecast sites', () => {
    expect(dp.forecastSites.constructor.name).to.equal('Quadtree');
  });
  it('# getAllObservationSites() - Should allow you to query all observation sites and return them as a Set()', () => {
    expect(dp.getAllObservationSites().size).to.be.at.least(140);
    expect(dp.getAllObservationSites() instanceof Set).to.equal(true);
  });
  it('# getAllForecastSites() - Should allow you to query all forecast sites and return them as a Set()', () => {
    expect(dp.getAllForecastSites().size).to.be.at.least(5000);
    expect(dp.getAllForecastSites() instanceof Set).to.equal(true);
  });
  it('# getNearestForecastSite(location) - Should return only one nearest forecast site', () => {
    locations.forEach((location) => {
      expect(dp.getNearestForecastSite(location).size).to.equal(1);
    });  
  });
  it('# getNearestObservationSite(location) - Should return only one nearest observation site', () => {
    locations.forEach((location) => {
      expect(dp.getNearestObservationSite(location).size).to.equal(1);
    });  
  });
  it('# getNearestForecastSite(location) - Should return the nearest forecast site for a given location', () => {
    expect(dp.getNearestForecastSite(location).values().next().value.data.name).to.equal('Aberdovey');
  });
  it('# getNearestObservationSite(location) - Should return the nearest observation site for a given location', () => {
    expect(dp.getNearestObservationSite(location).values().next().value.data.name).to.equal('Trawsgoed');
  });
  it('# getNearbyForecastSites(location, areaSize) - Should return nearby forecast sites', () => {
    expect(dp.getNearbyForecastSites(location, areaSize).size).to.be.at.least(3);
  });
  it('# getForecast(siteId, resolution)', () => {
    return dp.getForecast(322315, '3hourly').then((forecast) => {
      expect(typeof forecast).to.equal('object');
      expect(forecast.DV.type).to.equal('Forecast');  
    });
  });
  it('# getObservations(siteId) - Should return observations', () => {
    return dp.getObservations(3503).then((observation) => {
      expect(typeof observation).to.equal('object');
      expect(observation.DV.type).to.equal('Obs');
    });
  });
});
