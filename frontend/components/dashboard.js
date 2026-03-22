import { api } from '../js/api.js';
import { renderAnalytics } from './analytics.js';
import { showToast } from '../js/utils.js';
import {
  CURRENCIES, loadRates,
  getDisplayCurrency, setDisplayCurrency,
} from '../js/currency.js';

let currentFilter = 'all';
let allDebts = [];
let displayCurrency = getDisplayCurrency();
let currentRates = null; // rates[X] = how many X per 1 displayCurrency

export function initDashboard(onSelect, onNew) {
  const page = document.getElementById('page-dashboard');

  page.innerHTML = `
    <div id="analytics-container"></div>

    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.75rem;margin-bottom:1rem;">
      <div class="filter-bar" id="filter-bar">
        <button class="filter-btn active" data-filter="all">All</button>
        <button class="filter-btn" data-filter="owed">Owed to me</button>
        <button class="filter-btn" data-filter="owe">I owe</button>
        <button class="filter-btn" data-filter="overdue">Overdue</button>
        <button class="filter-btn" data-filter="closed">Closed</button>
      </div>
      <button class="btn btn-primary" id="btn-new">+ New Debt</button>
    </div>

    <div class="currency-bar" id="currency-bar">
      <span class="currency-label">Show in:</span>
      ${CURRENCIES.map((c) => `
        <button class="currency-btn${c === displayCurrency ? ' active' : ''}" data-cur="${c}">${c}</button>
      `).join('')}
      <span class="rates-badge" id="rates-badge"></span>
    </div>

    <div class="debt-list" id="debt-list">
      <div class="empty"><p>Loading…</p></div>
    </div>
  `;

  document.getElementById('btn-new').addEventListener('click', onNew);

  document.getElementById('filter-bar').addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    currentFilter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    renderList();
  });

  document.getElementById('currency-bar').addEventListener('click', async (e) => {
    const btn = e.target.closest('.currency-btn');
    if (!btn) return;
    displayCurrency = btn.dataset.cur;
    setDisplayCurrency(displayCurrency);
    document.querySelectorAll('.currency-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    await fetchRates();
    renderList();
    renderAnalytics(document.getElementById('analytics-container'), displayCurrency, currentRates);
  });

  loadDashboard();
}

async function fetchRates() {
  const badge = document.getElementById('rates-badge');
  try {
    if (badge) badge.textContent = 'fetching rates…';
    currentRates = await loadRates(displayCurrency);
    if (badge) badge.textContent = '';
  } catch {
    if (badge) badge.textContent = 'rates unavailable';
    currentRates = null;
  }
}

export async function loadDashboard() {
  await Promise.all([
    fetchRates(),
    api.getDebts()
      .then((d) => { allDebts = d; })
      .catch((err) => { showToast(err.message, 'error'); allDebts = []; }),
  ]);
  renderAnalytics(document.getElementById('analytics-container'), displayCurrency, currentRates);
  renderList();
}

function renderList() {
  const container = document.getElementById('debt-list');
  if (!container) return;

  let debts = [...allDebts];
  if (currentFilter === 'owed')    debts = debts.filter((d) => d.type === 'owed' && !d.isClosed);
  if (currentFilter === 'owe')     debts = debts.filter((d) => d.type === 'owe'  && !d.isClosed);
  if (currentFilter === 'overdue') debts = debts.filter((d) => d.isOverdue);
  if (currentFilter === 'closed')  debts = debts.filter((d) => d.isClosed);
  if (currentFilter === 'all')     debts = debts.filter((d) => !d.isClosed);

  if (debts.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <p>No debts found</p>
      </div>`;
    return;
  }

  container.innerHTML = debts.map(debtCard).join('');
  container.querySelectorAll('.debt-card').forEach((el) => {
    el.addEventListener('click', () => window._onDebtSelect(el.dataset.id));
  });
}

function debtCard(d) {
  const classes = ['debt-card', d.type, d.isOverdue ? 'overdue' : '', d.isClosed ? 'closed' : '']
    .filter(Boolean).join(' ');
  const amountClass = d.type === 'owed' ? 'positive' : 'negative';
  const sign = d.type === 'owed' ? '+' : '-';
  const paidPct = d.amount > 0 ? Math.min(100, ((d.amount - d.remaining) / d.amount) * 100) : 100;

  let tag = '';
  if (d.isClosed)       tag = `<span class="tag tag-muted">Closed</span>`;
  else if (d.isOverdue) tag = `<span class="tag tag-orange">Overdue</span>`;
  else if (d.type === 'owed') tag = `<span class="tag tag-green">Incoming</span>`;
  else                  tag = `<span class="tag tag-red">Outgoing</span>`;

  const due = d.dueDate ? ` · Due ${fmtDate(d.dueDate)}` : '';

  // Converted amount: rates[X] = how many X per 1 displayCurrency
  // → to convert d.remaining (in d.currency) to displayCurrency: d.remaining / rates[d.currency]
  let convertedHtml = '';
  const needsConversion = currentRates && d.currency !== displayCurrency;
  if (needsConversion) {
    const rate = currentRates[d.currency];
    if (rate) {
      const converted = d.remaining / rate;
      convertedHtml = `
        <div class="converted-amount">
          ≈ ${sign}${fmtAmt(converted)} ${esc(displayCurrency)}
        </div>`;
    }
  }

  return `
    <div class="${classes}" data-id="${d.id}">
      <div class="debt-card-info">
        <div class="debt-card-title">${esc(d.title)}</div>
        <div class="debt-card-meta">${esc(d.person)}${due}</div>
        <div style="margin-top:0.4rem;display:flex;gap:0.4rem;align-items:center;">
          ${tag}
          <div style="flex:1;max-width:120px;">
            <div class="progress-bar">
              <div class="progress-fill ${d.isOverdue ? 'orange' : d.type === 'owed' ? 'green' : 'red'}"
                   style="width:${paidPct}%"></div>
            </div>
          </div>
          <span style="font-size:0.7rem;color:var(--muted)">${Math.round(paidPct)}%</span>
        </div>
      </div>
      <div class="debt-card-amount">
        <div class="amount ${amountClass}">${sign}${fmtAmt(d.remaining)} ${esc(d.currency)}</div>
        ${convertedHtml}
        <div class="remaining">of ${fmtAmt(d.amount)} ${esc(d.currency)}</div>
      </div>
    </div>`;
}

function fmtAmt(n) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDate(s) {
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
