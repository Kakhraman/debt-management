const debtService = require('../services/debtService');

function getAll(req, res, next) {
  try {
    const debts = debtService.getAllDebts();
    res.json(debts);
  } catch (err) {
    next(err);
  }
}

function getOne(req, res, next) {
  try {
    const debt = debtService.getDebtById(req.params.id);
    if (!debt) return res.status(404).json({ error: 'Debt not found' });
    res.json(debt);
  } catch (err) {
    next(err);
  }
}

function create(req, res, next) {
  try {
    const { title, person, amount, currency, type, dueDate } = req.body;
    if (!title || !person || !amount || !type) {
      return res.status(400).json({ error: 'title, person, amount, type are required' });
    }
    if (!['owed', 'owe'].includes(type)) {
      return res.status(400).json({ error: 'type must be "owed" or "owe"' });
    }
    const debt = debtService.createNewDebt({ title, person, amount, currency, type, dueDate });
    res.status(201).json(debt);
  } catch (err) {
    next(err);
  }
}

function update(req, res, next) {
  try {
    const debt = debtService.updateDebt(req.params.id, req.body);
    if (!debt) return res.status(404).json({ error: 'Debt not found' });
    res.json(debt);
  } catch (err) {
    next(err);
  }
}

function remove(req, res, next) {
  try {
    const deleted = debtService.deleteDebt(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Debt not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

function addPayment(req, res, next) {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount)) return res.status(400).json({ error: 'Valid amount required' });
    const debt = debtService.addPayment(req.params.id, Number(amount));
    if (!debt) return res.status(404).json({ error: 'Debt not found' });
    res.json(debt);
  } catch (err) {
    if (err.message.startsWith('Payment exceeds') || err.message.startsWith('Payment amount')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

module.exports = { getAll, getOne, create, update, remove, addPayment };
