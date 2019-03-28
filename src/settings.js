module.exports = {
  'quadtree': {
    'ukBoundingArea': [-10, 50, 12, 10],
    'maxPointsPerNode': 10,
    'areaIncrementSize': 0.1,
  },
  'datapoint': {
    'baseURL': 'http://datapoint.metoffice.gov.uk/public/data/',
    'timeout': 10000,
    'forecastPath': 'val/wxfcs/all/json/',
    'observationPath': 'val/wxobs/all/json/',
  },
};
