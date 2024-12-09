const GOALS_KEY = 'personal_finance_goals';

export const GoalStatus = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

export const loadGoals = () => {
  const stored = localStorage.getItem(GOALS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveGoals = (goals) => {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
};

export const addGoal = (goal) => {
  const goals = loadGoals();
  const newGoals = [...goals, { ...goal, id: Date.now(), status: GoalStatus.IN_PROGRESS }];
  saveGoals(newGoals);
  return newGoals;
};

export const updateGoal = (goalId, updates) => {
  const goals = loadGoals();
  const newGoals = goals.map(g => 
    g.id === goalId ? { ...g, ...updates } : g
  );
  saveGoals(newGoals);
  return newGoals;
};

export const deleteGoal = (goalId) => {
  const goals = loadGoals();
  const newGoals = goals.filter(g => g.id !== goalId);
  saveGoals(newGoals);
  return newGoals;
};

export const calculateGoalProgress = (goal, transactions) => {
  const relevantTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const startDate = new Date(goal.startDate);
    const endDate = new Date(goal.targetDate);
    return transactionDate >= startDate && transactionDate <= endDate;
  });

  let progress = 0;

  switch (goal.type) {
    case 'savings':
      progress = relevantTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0) -
        relevantTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      break;

    case 'spending_reduction':
      const totalExpenses = relevantTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      progress = goal.targetAmount - totalExpenses;
      break;

    case 'debt_payment':
      progress = relevantTransactions
        .filter(t => t.category === goal.category)
        .reduce((sum, t) => sum + t.amount, 0);
      break;

    default:
      break;
  }

  return {
    current: progress,
    percentage: (progress / goal.targetAmount) * 100,
    remaining: goal.targetAmount - progress,
    isCompleted: progress >= goal.targetAmount
  };
};