const analyticsService = require('../services/analyticsService');

function getAnalytics(req, res, next) {
  try {
    const data = analyticsService.getAnalytics();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAnalytics };
