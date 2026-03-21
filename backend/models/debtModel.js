const { v4: uuidv4 } = require('uuid');

function createDebt({ title, person, amount, currency, type, dueDate }) {
  return {
    id: uuidv4(),
    title,
    person,
    amount: Number(amount),
    currency: currency || 'USD',
    type, // 'owed' | 'owe'
    createdAt: new Date().toISOString(),
    dueDate: dueDate || null,
    isClosed: false,
    payments: [],
  };
}

function createPayment(amount) {
  return {
    id: uuidv4(),
    amount: Number(amount),
    date: new Date().toISOString(),
  };
}

function getRemainingBalance(debt) {
  const paid = debt.payments.reduce((sum, p) => sum + p.amount, 0);
  return debt.amount - paid;
}

function isOverdue(debt) {
  if (!debt.dueDate || debt.isClosed) return false;
  return new Date() > new Date(debt.dueDate);
}

module.exports = { createDebt, createPayment, getRemainingBalance, isOverdue };
