// Compute analytics from debts list, converting every amount to displayCurrency using rates.
// rates[X] = how many X per 1 displayCurrency (from loadRates(displayCurrency))
// → to convert amount in currency C to displayCurrency: amount / rates[C]
export function renderAnalytics(container, displayCurrency, rates, debts) {
  if (!container) return;

  let totalOwedToMe = 0;
  let totalIOwe = 0;
  let overdueCount = 0;
  let conversionMissing = false;

  for (const debt of (debts || [])) {
    if (debt.isClosed) continue;

    let remaining = debt.remaining;

    if (debt.currency !== displayCurrency) {
      if (rates && rates[debt.currency]) {
        remaining = remaining / rates[debt.currency];
      } else {
        conversionMissing = true;
        continue; // skip debts we can't convert
      }
    }

    if (debt.type === 'owed') totalOwedToMe += remaining;
    else                      totalIOwe     += remaining;

    if (debt.isOverdue) overdueCount++;
  }

  const balance = totalOwedToMe - totalIOwe;
  const cur = displayCurrency || '';
  const warn = conversionMissing
    ? `<div style="font-size:0.7rem;color:var(--orange);margin-top:0.3rem;">Some debts skipped (no rate)</div>`
    : '';

  container.innerHTML = `
    <div class="analytics-grid">
      <div class="stat-card positive">
        <div class="label">Owed to me</div>
        <div class="value">+${fmt(totalOwedToMe)}</div>
        <div style="font-size:0.72rem;color:var(--muted);margin-top:0.2rem;">${cur}</div>
        ${warn}
      </div>
      <div class="stat-card negative">
        <div class="label">I owe</div>
        <div class="value">-${fmt(totalIOwe)}</div>
        <div style="font-size:0.72rem;color:var(--muted);margin-top:0.2rem;">${cur}</div>
        ${warn}
      </div>
      <div class="stat-card ${balance >= 0 ? 'positive' : 'negative'}">
        <div class="label">Balance</div>
        <div class="value">${balance >= 0 ? '+' : ''}${fmt(balance)}</div>
        <div style="font-size:0.72rem;color:var(--muted);margin-top:0.2rem;">${cur}</div>
        ${warn}
      </div>
      <div class="stat-card warning">
        <div class="label">Overdue</div>
        <div class="value">${overdueCount}</div>
      </div>
    </div>
  `;
}

function fmt(n) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
