const { getAllDebts } = require('./debtService');

function getAnalytics() {
  const debts = getAllDebts();

  let totalOwedToMe = 0;
  let totalIOwe = 0;
  let overdueCount = 0;

  for (const debt of debts) {
    if (debt.isClosed) continue;
    if (debt.type === 'owed') {
      totalOwedToMe += debt.remaining;
    } else {
      totalIOwe += debt.remaining;
    }
    if (debt.isOverdue) overdueCount++;
  }

  return {
    totalOwedToMe: Math.round(totalOwedToMe * 100) / 100,
    totalIOwe: Math.round(totalIOwe * 100) / 100,
    balance: Math.round((totalOwedToMe - totalIOwe) * 100) / 100,
    overdueCount,
  };
}

module.exports = { getAnalytics };
