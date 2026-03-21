import { api } from '../js/api.js';
import { showToast } from '../js/utils.js';

export function initDebtForm(onSaved, onCancel) {
  const page = document.getElementById('page-form');

  page.innerHTML = `
    <button class="back-btn" id="btn-back-form">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      Back
    </button>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:1.75rem;max-width:520px;">
      <h2 style="margin-bottom:1.5rem;">New Debt</h2>
      <form id="debt-form">
        <div class="form-row">
          <div class="form-group">
            <label>Title</label>
            <input type="text" name="title" placeholder="e.g. Laptop loan" required />
          </div>
          <div class="form-group">
            <label>Person</label>
            <input type="text" name="person" placeholder="Name" required />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Amount</label>
            <input type="number" name="amount" min="0.01" step="0.01" placeholder="0.00" required />
          </div>
          <div class="form-group">
            <label>Currency</label>
            <select name="currency">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="UZS">UZS</option>
              <option value="RUB">RUB</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Type</label>
          <select name="type" required>
            <option value="owed">Owed to me (they owe me)</option>
            <option value="owe">I owe (I owe them)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Due Date <span style="color:var(--muted)">(optional)</span></label>
          <input type="date" name="dueDate" />
        </div>
        <div style="display:flex;gap:0.75rem;margin-top:1.5rem;">
          <button type="submit" class="btn btn-primary btn-full">Create Debt</button>
          <button type="button" class="btn btn-ghost" id="btn-cancel-form">Cancel</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById('btn-back-form').addEventListener('click', onCancel);
  document.getElementById('btn-cancel-form').addEventListener('click', onCancel);

  document.getElementById('debt-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd);
    if (!data.dueDate) delete data.dueDate;

    const btn = e.target.querySelector('[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Saving…';

    try {
      await api.createDebt(data);
      showToast('Debt created', 'success');
      onSaved();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Create Debt';
    }
  });
}
