import { api } from '../js/api.js';
import { showToast } from '../js/utils.js';
import { CURRENCIES } from '../js/currency.js';

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

  renderView(page, debt, id, onBack);
}

function renderView(page, debt, id, onBack) {
  const isOwed = debt.type === 'owed';
  const colorClass = debt.isOverdue ? 'orange' : isOwed ? 'green' : 'red';
  const paidPct = debt.amount > 0 ? Math.min(100, ((debt.amount - debt.remaining) / debt.amount) * 100) : 100;
  const due = debt.dueDate ? fmtDate(debt.dueDate) : '—';
  const paid = debt.amount - debt.remaining;

  let statusTag = '';
  if (debt.isClosed)       statusTag = `<span class="tag tag-muted">Closed</span>`;
  else if (debt.isOverdue) statusTag = `<span class="tag tag-orange">Overdue</span>`;
  else if (isOwed)         statusTag = `<span class="tag tag-green">Active · Incoming</span>`;
  else                     statusTag = `<span class="tag tag-red">Active · Outgoing</span>`;

  page.innerHTML = `
    <button class="back-btn" id="btn-back">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
      </svg>
      Dashboard
    </button>

    <div class="detail-header">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.5rem;">
        <div>
          <h2>${esc(debt.title)}</h2>
          <div class="meta">${esc(debt.person)} · Created ${fmtDate(debt.createdAt)} · Due ${due}</div>
          ${statusTag}
        </div>
        <div style="display:flex;gap:0.5rem;">
          <button class="btn btn-ghost" id="btn-edit">Edit</button>
          <button class="btn btn-danger" id="btn-delete">Delete</button>
        </div>
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
    <div class="payment-list">
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

  document.getElementById('btn-edit').addEventListener('click', () => {
    renderEditForm(page, debt, id, onBack);
  });

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
        const updated = await api.getDebt(id);
        renderView(page, updated, id, onBack);
      } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
      }
    });
  }
}

function renderEditForm(page, debt, id, onBack) {
  const dueDateValue = debt.dueDate ? debt.dueDate.slice(0, 10) : '';

  page.innerHTML = `
    <button class="back-btn" id="btn-back-edit">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
      </svg>
      Cancel
    </button>

    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:1.75rem;max-width:520px;">
      <h2 style="margin-bottom:1.5rem;">Edit Debt</h2>
      <form id="edit-form">
        <div class="form-row">
          <div class="form-group">
            <label>Title</label>
            <input type="text" name="title" value="${esc(debt.title)}" required />
          </div>
          <div class="form-group">
            <label>Person</label>
            <input type="text" name="person" value="${esc(debt.person)}" required />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Amount</label>
            <input type="number" name="amount" value="${debt.amount}" min="0.01" step="0.01" required />
          </div>
          <div class="form-group">
            <label>Currency</label>
            <select name="currency">
              ${CURRENCIES.map((c) => `<option value="${c}"${c === debt.currency ? ' selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Type</label>
          <select name="type">
            <option value="owed"${debt.type === 'owed' ? ' selected' : ''}>Owed to me (they owe me)</option>
            <option value="owe"${debt.type === 'owe' ? ' selected' : ''}>I owe (I owe them)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Due Date <span style="color:var(--muted)">(optional)</span></label>
          <input type="date" name="dueDate" value="${dueDateValue}" />
        </div>
        <div style="display:flex;gap:0.75rem;margin-top:1.5rem;">
          <button type="submit" class="btn btn-primary btn-full">Save Changes</button>
          <button type="button" class="btn btn-ghost" id="btn-cancel-edit">Cancel</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById('btn-back-edit').addEventListener('click', () => renderView(page, debt, id, onBack));
  document.getElementById('btn-cancel-edit').addEventListener('click', () => renderView(page, debt, id, onBack));

  document.getElementById('edit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const updates = Object.fromEntries(fd);
    if (!updates.dueDate) delete updates.dueDate;

    const btn = e.target.querySelector('[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Saving…';

    try {
      const updated = await api.updateDebt(id, updates);
      showToast('Debt updated', 'success');
      renderView(page, updated, id, onBack);
    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Save Changes';
    }
  });
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
