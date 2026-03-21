import { api } from '../js/api.js';

export async function renderAnalytics(container) {
  try {
    const data = await api.getAnalytics();
    container.innerHTML = `
      <div class="analytics-grid">
        <div class="stat-card positive">
          <div class="label">Owed to me</div>
          <div class="value">+${fmt(data.totalOwedToMe)}</div>
        </div>
        <div class="stat-card negative">
          <div class="label">I owe</div>
          <div class="value">-${fmt(data.totalIOwe)}</div>
        </div>
        <div class="stat-card ${data.balance >= 0 ? 'positive' : 'negative'}">
          <div class="label">Balance</div>
          <div class="value">${data.balance >= 0 ? '+' : ''}${fmt(data.balance)}</div>
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
