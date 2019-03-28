const qtree = require('@slatham/quadtree');
const settings = require('./settings');
const axios = require('axios');
/**
 * Describe datapoint class
 */
class Datapoint {
  /**
   * Set up the datapoint object
   * set the API key
   * @param {String} apiKey
   */
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.ukArea = new qtree.Rectangle(...settings.quadtree.ukBoundingArea);
    this.pointLimit = settings.quadtree.maxPointsPerNode;
    this.forecastSites = new qtree.Quadtree(this.ukArea, this.pointLimit);
    this.observationSites = new qtree.Quadtree(this.ukArea, this.pointLimit);
    this.ready = false;
  }
  /**
   * Set up the class ready
   * for use by pre-loading site lists
   * @param {function} cb
   */
  async init(cb) {
    if (!this.ready) {
      this.ready = true;
      await this._queryForecastSites().catch((err) => {
        this.ready = false;
        console.log(err);
      });
      await this._queryObservationSites().catch((err) => {
        this.ready = false;
        console.log(err);
      });
    }
    cb(this.ready);
  }
  /**
   * Pull all the forecast sites
   * from the datapoint API
   * @return {Promise}
   */
  _queryForecastSites() {
    return axios.get(
        settings.datapoint.forecastPath + 'sitelist',
        {baseURL: settings.datapoint.baseURL,
          params: {key: this.apiKey},
          timeout: settings.datapoint.timeout}
    ).then((response) => {
      response.data.Locations.Location.forEach((loc) => {
        const point = new qtree.Point(loc.longitude, loc.latitude, loc);
        this.forecastSites.insertPoint(point);
      });
    });
  }
  /**
   * Pull all the observation sites
   * from the datapoint API
   * @return {Promise}
   */
  _queryObservationSites() {
    return axios.get(
        settings.datapoint.observationPath + 'sitelist',
        {baseURL: settings.datapoint.baseURL,
          params: {key: this.apiKey},
          timeout: settings.datapoint.timeout}
    ).then((response) => {
      response.data.Locations.Location.forEach((loc) => {
        const point = new qtree.Point(loc.longitude, loc.latitude, loc);
        this.observationSites.insertPoint(point);
      });
    });
  }
  /**
   * Query the datapoint API for
   * forecast data for a given site
   * @param {int} siteId
   * @param {String} resolution
   * @return {Object}
   */
  _querySiteForecast(siteId, resolution) {
    return axios.get(
        settings.datapoint.forecastPath + siteId,
        {baseURL: settings.datapoint.baseURL,
          params: {res: resolution, key: this.apiKey},
          timeout: settings.datapoint.timeout}
    ).then((response) => {
      return response.data.SiteRep;
    }).catch((err) => {console.log(err)});
  }
  /**
   * Get a list of all the sites where forecast
   * data is available
   * @return {Set}
   */
  getAllForecastSites() {
    if (this.ready) {
      return this.forecastSites.queryPoints();
    }
  }
  /**
   * Get a list of all the sites where observation
   * data is available
   * @return {Set}
   */
  getAllObservationSites() {
    if (this.ready) {
      return this.observationSites.queryPoints();
    }
  }
  /**
   * Get nearest site to a given location
   * @param {object} location
   */
  getNearestObservationSite(location) {
    // not yet implemented
  }
  /**
   * Get the nearest site to a give location
   * @param {Object} location
   */
  getNearestForecastSite(location) {
    // not yet implemented
  }
  /**
   * Get the nearest sites based on a location
   * @param {Object} loc 
   * @param {Float} size
   * Should return an object containing a Set() of points
   * for NE, NW, SE, SW surrounding the location
   * so {NW: Set(), NE: Set()...}
   * @return {Set}
   */
  getNearbyForecastSites(loc, size) {
    const queryArea = new qtree.Area(loc.lon, loc.lat, size, size);
    return this.forecastSites.queryPoints(queryArea);
  }

  /**
   * Get a forecast for
   * a given site
   * @param {Int} siteId
   * @param {String} resolution
   * @return {Promise}
   */
  async getForecast(siteId, resolution) {
    if (this.ready) {
      return await this._querySiteForecast(siteId, resolution);
    }
  }
}
module.exports = Datapoint;
