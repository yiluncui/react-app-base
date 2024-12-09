const BUDGETS_KEY = 'personal_finance_budgets';

export const loadBudgets = () => {
  const stored = localStorage.getItem(BUDGETS_KEY);
  return stored ? JSON.parse(stored) : {};
};

export const saveBudgets = (budgets) => {
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
};

export const setBudget = (category, amount) => {
  const budgets = loadBudgets();
  budgets[category] = amount;
  saveBudgets(budgets);
  return budgets;
};

export const deleteBudget = (category) => {
  const budgets = loadBudgets();
  delete budgets[category];
  saveBudgets(budgets);
  return budgets;
};

export const calculateBudgetStatus = (transactions, budgets) => {
  const currentDate = new Date();
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  
  const monthlyExpenses = transactions
    .filter(t => t.type === 'expense' && new Date(t.date) >= monthStart)
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  return Object.entries(budgets).map(([category, budget]) => ({
    category,
    budget,
    spent: monthlyExpenses[category] || 0,
    remaining: budget - (monthlyExpenses[category] || 0),
    percentage: ((monthlyExpenses[category] || 0) / budget) * 100
  }));
};