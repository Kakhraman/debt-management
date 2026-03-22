const BASE = '';

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

async function request(method, url, body) {
  const opts = { method, headers: authHeaders() };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(BASE + url, opts);
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  login: (login, password) =>
    fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
    }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Login failed');
      return d;
    }),

  register: (login, password) =>
    fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
    }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Register failed');
      return d;
    }),

  // Debts
  getDebts: () => request('GET', '/debts'),
  getDebt: (id) => request('GET', `/debts/${id}`),
  createDebt: (data) => request('POST', '/debts', data),
  updateDebt: (id, data) => request('PUT', `/debts/${id}`, data),
  deleteDebt: (id) => request('DELETE', `/debts/${id}`),
  addPayment: (id, amount) => request('POST', `/debts/${id}/payments`, { amount }),

  // Analytics
  getAnalytics: () => request('GET', '/analytics'),

  // Rates
  getRates: (base = 'USD') => request('GET', `/rates?base=${base}`),
};
