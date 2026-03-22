const { getRates } = require('../services/ratesService');

async function getRatesHandler(req, res, next) {
  try {
    const base = (req.query.base || 'usd').toLowerCase();
    const rates = await getRates(base);

    // Return only the currencies the app uses + common ones
    const supported = ['usd', 'eur', 'uzs', 'rub', 'gbp', 'jpy', 'cny', 'try', 'kzt'];
    const filtered = {};
    for (const cur of supported) {
      if (rates[cur] !== undefined) filtered[cur.toUpperCase()] = rates[cur];
    }

    res.json({ base: base.toUpperCase(), rates: filtered });
  } catch (err) {
    next(err);
  }
}

module.exports = { getRatesHandler };
