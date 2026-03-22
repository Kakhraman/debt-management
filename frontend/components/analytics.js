import { api } from '../js/api.js';

export async function renderAnalytics(container, displayCurrency, rates) {
  if (!container) return;
  try {
    const data = await api.getAnalytics();

    // If rates available and display currency differs from raw totals (which are mixed),
    // show a note that analytics sums are in original currencies (conversion not meaningful for mixed)
    const note = displayCurrency
      ? `<div style="font-size:0.72rem;color:var(--muted);margin-top:0.35rem;">Totals are native currency sums</div>`
      : '';

    container.innerHTML = `
      <div class="analytics-grid">
        <div class="stat-card positive">
          <div class="label">Owed to me</div>
          <div class="value">+${fmt(data.totalOwedToMe)}</div>
          ${note}
        </div>
        <div class="stat-card negative">
          <div class="label">I owe</div>
          <div class="value">-${fmt(data.totalIOwe)}</div>
          ${note}
        </div>
        <div class="stat-card ${data.balance >= 0 ? 'positive' : 'negative'}">
          <div class="label">Balance</div>
          <div class="value">${data.balance >= 0 ? '+' : ''}${fmt(data.balance)}</div>
          ${note}
        </div>
        <div class="stat-card warning">
          <div class="label">Overdue</div>
          <div class="value">${data.overdueCount}</div>
        </div>
      </div>
    `;
  } catch {
    container.innerHTML = '';
  }
}

function fmt(n) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
