const https = require('https');

// In-memory cache: { timestamp, rates: { EUR: 0.86, UZS: 12171, ... } }
const cache = {};
const TTL = 60 * 60 * 1000; // 1 hour

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function getRates(base = 'usd') {
  const key = base.toLowerCase();
  const now = Date.now();

  if (cache[key] && now - cache[key].timestamp < TTL) {
    return cache[key].rates;
  }

  const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${key}.json`;
  const data = await fetchJson(url);
  const rates = data[key];

  cache[key] = { timestamp: now, rates };
  return rates;
}

// Convert amount from one currency to another
async function convert(amount, from, to) {
  if (from.toLowerCase() === to.toLowerCase()) return amount;
  // Get rates relative to `from`
  const rates = await getRates(from.toLowerCase());
  const rate = rates[to.toLowerCase()];
  if (!rate) throw new Error(`No rate available for ${to}`);
  return amount * rate;
}

module.exports = { getRates, convert };
