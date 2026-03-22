import { api } from './api.js';

// Supported display currencies
export const CURRENCIES = ['USD', 'EUR', 'UZS', 'RUB', 'GBP'];

const ratesCache = {}; // { USD: { EUR: 0.86, UZS: 12171, ... }, ... }

export async function loadRates(base) {
  if (ratesCache[base]) return ratesCache[base];
  const { rates } = await api.getRates(base);
  ratesCache[base] = rates;
  return rates;
}

// Convert amount from `from` currency to `to` currency
// rates = result of loadRates(from)
export function convertAmount(amount, from, to, rates) {
  if (from === to) return amount;
  const rate = rates[to];
  if (!rate) return null;
  return amount * rate;
}

export function getDisplayCurrency() {
  return localStorage.getItem('displayCurrency') || 'USD';
}

export function setDisplayCurrency(cur) {
  localStorage.setItem('displayCurrency', cur);
}

export function fmtConverted(amount, currency) {
  return `${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}
