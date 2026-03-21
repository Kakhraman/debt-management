import { api } from '../js/api.js';
import { showToast } from '../js/utils.js';

export async function renderDebtDetail(id, onBack) {
  const page = document.getElementById('page-detail');
  page.innerHTML = `<div style="color:var(--muted);padding:2rem;">Loading…</div>`;

  let debt;
  try {
    debt = await api.getDebt(id);
  } catch (err) {
    showToast(err.message, 'error');
    onBack();
    return;
  }

  const isOwed = debt.type === 'owed';
  const colorClass = debt.isOverdue ? 'orange' : isOwed ? 'green' : 'red';
  const paidPct = debt.amount > 0 ? Math.min(100, ((debt.amount - debt.remaining) / debt.amount) * 100) : 100;
  const due = debt.dueDate ? fmtDate(debt.dueDate) : '—';
  const paid = debt.amount - debt.remaining;

  let statusTag = '';
  if (debt.isClosed)      statusTag = `<span class="tag tag-muted">Closed</span>`;
  else if (debt.isOverdue) statusTag = `<span class="tag tag-orange">Overdue</span>`;
  else if (isOwed)         statusTag = `<span class="tag tag-green">Active · Incoming</span>`;
  else                     statusTag = `<span class="tag tag-red">Active · Outgoing</span>`;

  page.innerHTML = `
    <button class="back-btn" id="btn-back">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      Dashboard
    </button>

    <div class="detail-header">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.5rem;">
        <div>
          <h2>${esc(debt.title)}</h2>
          <div class="meta">${esc(debt.person)} · Created ${fmtDate(debt.createdAt)} · Due ${due}</div>
          ${statusTag}
        </div>
        <button class="btn btn-danger" id="btn-delete">Delete</button>
      </div>

      <div class="detail-amounts">
        <div class="amount-block">
          <div class="lbl">Total</div>
          <div class="val">${fmtAmt(debt.amount)} ${esc(debt.currency)}</div>
        </div>
        <div class="amount-block">
          <div class="lbl">Paid</div>
          <div class="val" style="color:var(--green)">${fmtAmt(paid)} ${esc(debt.currency)}</div>
        </div>
        <div class="amount-block">
          <div class="lbl">Remaining</div>
          <div class="val" style="color:var(--${colorClass})">${fmtAmt(debt.remaining)} ${esc(debt.currency)}</div>
        </div>
      </div>

      <div class="progress-bar" style="height:8px;">
        <div class="progress-fill ${colorClass}" style="width:${paidPct}%"></div>
      </div>
      <div style="text-align:right;font-size:0.75rem;color:var(--muted);margin-top:0.3rem;">${Math.round(paidPct)}% paid</div>
    </div>

    ${!debt.isClosed ? `
    <p class="section-title">Add Payment</p>
    <div class="payment-form">
      <div class="form-group">
        <label>Amount (max ${fmtAmt(debt.remaining)} ${esc(debt.currency)})</label>
        <input type="number" id="payment-amount" min="0.01" max="${debt.remaining}" step="0.01" placeholder="0.00" />
      </div>
      <button class="btn btn-green" id="btn-pay">Pay</button>
    </div>
    ` : ''}

    <p class="section-title">Payment History (${debt.payments.length})</p>
    <div class="payment-list" id="payment-list">
      ${debt.payments.length === 0
        ? `<div class="empty"><p>No payments yet</p></div>`
        : debt.payments.map((p) => `
          <div class="payment-item">
            <span class="p-date">${fmtDate(p.date)}</span>
            <span class="p-amount">+${fmtAmt(p.amount)} ${esc(debt.currency)}</span>
          </div>`).join('')
      }
    </div>
  `;

  document.getElementById('btn-back').addEventListener('click', onBack);

  document.getElementById('btn-delete').addEventListener('click', async () => {
    if (!confirm(`Delete "${debt.title}"? This cannot be undone.`)) return;
    try {
      await api.deleteDebt(id);
      showToast('Debt deleted', 'success');
      onBack();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  if (!debt.isClosed) {
    document.getElementById('btn-pay').addEventListener('click', async () => {
      const input = document.getElementById('payment-amount');
      const amount = parseFloat(input.value);
      if (!amount || amount <= 0) return showToast('Enter a valid amount', 'error');

      const btn = document.getElementById('btn-pay');
      btn.disabled = true;
      try {
        await api.addPayment(id, amount);
        showToast('Payment added', 'success');
        await renderDebtDetail(id, onBack);
      } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
      }
    });
  }
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
