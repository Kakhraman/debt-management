const { readDb, writeDb } = require('../utils/fileDb');
const { createDebt, createPayment, getRemainingBalance, isOverdue } = require('../models/debtModel');

function enrichDebt(debt) {
  return {
    ...debt,
    remaining: getRemainingBalance(debt),
    isOverdue: isOverdue(debt),
  };
}

function getAllDebts() {
  return readDb('debts').map(enrichDebt);
}

function getDebtById(id) {
  const debts = readDb('debts');
  const debt = debts.find((d) => d.id === id);
  if (!debt) return null;
  return enrichDebt(debt);
}

function createNewDebt(data) {
  const debts = readDb('debts');
  const debt = createDebt(data);
  debts.push(debt);
  writeDb('debts', debts);
  return enrichDebt(debt);
}

function updateDebt(id, updates) {
  const debts = readDb('debts');
  const idx = debts.findIndex((d) => d.id === id);
  if (idx === -1) return null;

  const allowed = ['title', 'person', 'amount', 'currency', 'type', 'dueDate'];
  allowed.forEach((field) => {
    if (updates[field] !== undefined) debts[idx][field] = updates[field];
  });

  writeDb('debts', debts);
  return enrichDebt(debts[idx]);
}

function deleteDebt(id) {
  const debts = readDb('debts');
  const idx = debts.findIndex((d) => d.id === id);
  if (idx === -1) return false;
  debts.splice(idx, 1);
  writeDb('debts', debts);
  return true;
}

function addPayment(id, amount) {
  const debts = readDb('debts');
  const idx = debts.findIndex((d) => d.id === id);
  if (idx === -1) return null;

  const remaining = getRemainingBalance(debts[idx]);
  if (amount <= 0) throw new Error('Payment amount must be positive');
  if (amount > remaining) throw new Error(`Payment exceeds remaining balance of ${remaining}`);

  const payment = createPayment(amount);
  debts[idx].payments.push(payment);

  const newRemaining = getRemainingBalance(debts[idx]);
  if (newRemaining === 0) debts[idx].isClosed = true;

  writeDb('debts', debts);
  return enrichDebt(debts[idx]);
}

module.exports = { getAllDebts, getDebtById, createNewDebt, updateDebt, deleteDebt, addPayment };
