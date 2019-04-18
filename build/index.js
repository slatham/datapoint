/** Author: S Latham */

const axios = require('axios');
const qtree = require('@slatham/quadtree');
const haversine = require('haversine');

const settings = {
  'quadtree': {
    'ukBoundingArea': [-10, 50, 12, 10],
    'maxPointsPerNode': 10,
    'areaIncrementSize': 0.1
  },
  'datapoint': {
    'baseURL': 'http://datapoint.metoffice.gov.uk/public/data/',
    'timeout': 10000,
    'forecastPath': 'val/wxfcs/all/json/',
    'observationPath': 'val/wxobs/all/json/'
  }
};

//# sourceMappingURL=settings.js.map








/**
 * Describe datapoint class
 */


class Datapoint {
  /**
   * Set up the datapoint object
   * set the API key
   * @param {String} apiKey
   */
  constructor() {
    this.apiKey = '';
    this.ukArea = new qtree.Rectangle(...settings.quadtree.ukBoundingArea);
    this.pointLimit = settings.quadtree.maxPointsPerNode;
    this.forecastSites = new qtree.Quadtree(this.ukArea, this.pointLimit);
    this.observationSites = new qtree.Quadtree(this.ukArea, this.pointLimit);
    this.ready = false;
    this.areaIncrementSize = settings.quadtree.areaIncrementSize;
  }
  /**
   * Set up the class ready
   * for use by pre-loading site lists
   * @param {String} apiKey
   * @param {Function} cb
   */


  async init(apiKey, cb) {
    if (!this.ready) {
      this.apiKey = apiKey;
      await this._queryForecastSites().catch(err => {
        this.ready = false; // console.log(err);
      });
      await this._queryObservationSites().catch(err => {
        this.ready = false; // console.log(err);
      });
    }

    this.ready = true; // console.log('ready...');

    cb(this.ready);
  }
  /**
   * Pull all the forecast sites
   * from the datapoint API
   * @return {Promise}
   */


  _queryForecastSites() {
    return axios.get(settings.datapoint.forecastPath + 'sitelist', {
      baseURL: settings.datapoint.baseURL,
      params: {
        key: this.apiKey
      },
      timeout: settings.datapoint.timeout
    }).then(response => {
      response.data.Locations.Location.forEach(loc => {
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
    return axios.get(settings.datapoint.observationPath + 'sitelist', {
      baseURL: settings.datapoint.baseURL,
      params: {
        key: this.apiKey
      },
      timeout: settings.datapoint.timeout
    }).then(response => {
      response.data.Locations.Location.forEach(loc => {
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
    return axios.get(settings.datapoint.forecastPath + siteId, {
      baseURL: settings.datapoint.baseURL,
      params: {
        res: resolution,
        key: this.apiKey
      },
      timeout: settings.datapoint.timeout
    }).then(response => {
      return response.data.SiteRep;
    }).catch(err => err);
  }
  /**
   * Get hourly observations for a site
   * @param {Int} siteId
   * @param {String} resolution
   * @return {Promise}
   */


  _querySiteObservations(siteId, resolution = 'hourly') {
    return axios.get(settings.datapoint.observationPath + siteId, {
      baseURL: settings.datapoint.baseURL,
      params: {
        res: resolution,
        key: this.apiKey
      },
      timeout: settings.datapoint.timeout
    }).then(response => {
      return response.data.SiteRep;
    }).catch(err => err);
  }
  /**
   * use haversine to find nearest site
   * @param {Object} location
   * @param {Set} locations
   * @return {Set}
   */


  _findNearest(location, locations) {
    let nearest;
    let distance;
    locations.forEach(loc => {
      const newDistance = haversine(location, {
        latitude: loc.data.latitude,
        longitude: loc.data.longitude
      });

      if (newDistance < distance || typeof distance === 'undefined') {
        distance = newDistance;
        nearest = loc;
      }
    });
    return new Set().add(nearest);
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
   * @param {object} loc
   * @param {int} size
   * @return {Set}
   */


  getNearestObservationSite(loc, size = 0) {
    const queryArea = new qtree.Area(loc.longitude, loc.latitude, size, size);
    const results = this.observationSites.queryPoints(queryArea); // early return bit base case

    if (results.size === 1) {
      return results;
    } // return nearest


    if (results.size > 0) {
      return this._findNearest(loc, results);
    } // recursive bit


    if (results.size === 0) {
      size += this.areaIncrementSize;
      return this.getNearestObservationSite(loc, size);
    }
  }
  /**
   * Get the nearest site to a give location
   * @param {Object} loc
   * @param {Float} size
   * @return {Set}
   */


  getNearestForecastSite(loc, size = 0) {
    const queryArea = new qtree.Area(loc.longitude, loc.latitude, size, size);
    const results = this.forecastSites.queryPoints(queryArea); // early return bit base case

    if (results.size === 1) {
      return results;
    } // return nearest


    if (results.size > 0) {
      return this._findNearest(loc, results);
    } // recursive bit


    if (results.size === 0) {
      size += this.areaIncrementSize;
      return this.getNearestForecastSite(loc, size);
    }
  }
  /**
   * Get the nearest sites based on a location
   * @param {Object} loc
   * @param {Float} size
   * Should return an object containing a Set() of points
   * @return {Set}
   */


  getNearbyForecastSites(loc, size) {
    const queryArea = new qtree.Area(loc.longitude, loc.latitude, size, size);
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
  /**
   * Get 24h hourly observations
   * @param {Int} siteId
   */


  async getObservations(siteId) {
    return await this._querySiteObservations(siteId);
  }

}


//# sourceMappingURL=datapoint.js.map

if (typeof module !== 'undefined') {
	module.exports = new Datapoint();
	}