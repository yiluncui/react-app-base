import { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const FinanceContext = createContext();

const INITIAL_DATA = {
  transactions: [
    { id: '1', type: 'income', amount: 5000, category: 'Salary', date: '2024-01-01', description: 'Monthly salary', tags: ['recurring'] },
    { id: '2', type: 'expense', amount: 1000, category: 'Rent', date: '2024-01-02', description: 'Monthly rent', tags: ['recurring', 'housing'] },
    { id: '3', type: 'expense', amount: 200, category: 'Groceries', date: '2024-01-03', description: 'Weekly groceries', tags: ['essential'] },
  ],
  goals: [
    {
      id: 'g1',
      name: 'Emergency Fund',
      type: 'savings',
      targetAmount: 10000,
      startDate: '2024-01-01',
      deadline: '2024-12-31',
      category: 'Savings',
      description: 'Build emergency fund for unexpected expenses',
    },
    {
      id: 'g2',
      name: 'Reduce Food Expenses',
      type: 'spending',
      targetAmount: 400,
      startDate: '2024-01-01',
      deadline: '2024-01-31',
      category: 'Groceries',
      description: 'Keep monthly grocery expenses under control',
    },
  ],
  recurringTransactions: [
    { 
      id: 'r1',
      type: 'income',
      amount: 5000,
      category: 'Salary',
      description: 'Monthly salary',
      frequency: 'monthly',
      startDate: '2024-01-01',
      lastGenerated: '2024-01-01',
      tags: ['recurring']
    },
    {
      id: 'r2',
      type: 'expense',
      amount: 1000,
      category: 'Rent',
      description: 'Monthly rent',
      frequency: 'monthly',
      startDate: '2024-01-02',
      lastGenerated: '2024-01-02',
      tags: ['recurring', 'housing']
    }
  ],
  categories: {
    income: ['Salary', 'Freelance', 'Investments'],
    expense: ['Rent', 'Groceries', 'Utilities', 'Entertainment', 'Transportation']
  },
  budgets: {
    Rent: 1200,
    Groceries: 500,
    Utilities: 300,
    Entertainment: 200,
    Transportation: 150
  }
};

const generateRecurringTransactions = (data, currentDate = new Date()) => {
  const newTransactions = [];
  
  data.recurringTransactions.forEach(recurring => {
    const lastDate = new Date(recurring.lastGenerated);
    const startDate = new Date(recurring.startDate);
    
    if (startDate > currentDate) return;

    let nextDate = new Date(lastDate);
    
    while (nextDate <= currentDate) {
      if (recurring.frequency === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else if (recurring.frequency === 'weekly') {
        nextDate.setDate(nextDate.getDate() + 7);
      }

      if (nextDate <= currentDate) {
        newTransactions.push({
          id: uuidv4(),
          type: recurring.type,
          amount: recurring.amount,
          category: recurring.category,
          description: recurring.description,
          date: nextDate.toISOString().split('T')[0],
          tags: recurring.tags,
          recurringId: recurring.id
        });
      }
    }
  });

  return newTransactions;
};

export function FinanceProvider({ children }) {
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem('financeData');
    const initialData = savedData ? JSON.parse(savedData) : INITIAL_DATA;
    
    // Generate any missing recurring transactions on load
    const newTransactions = generateRecurringTransactions(initialData);
    if (newTransactions.length > 0) {
      initialData.transactions = [...initialData.transactions, ...newTransactions];
      initialData.recurringTransactions = initialData.recurringTransactions.map(rt => ({
        ...rt,
        lastGenerated: new Date().toISOString().split('T')[0]
      }));
    }
    
    return initialData;
  });

  useEffect(() => {
    localStorage.setItem('financeData', JSON.stringify(data));
  }, [data]);

  const addTransaction = (transaction) => {
    setData(prev => ({
      ...prev,
      transactions: [...prev.transactions, { ...transaction, id: uuidv4(), tags: transaction.tags || [] }]
    }));
  };

  const deleteTransaction = (id) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
  };

  const addRecurringTransaction = (transaction) => {
    const recurringId = uuidv4();
    const firstTransaction = {
      ...transaction,
      id: uuidv4(),
      tags: [...(transaction.tags || []), 'recurring'],
      recurringId
    };

    setData(prev => ({
      ...prev,
      transactions: [...prev.transactions, firstTransaction],
      recurringTransactions: [...prev.recurringTransactions, {
        ...transaction,
        id: recurringId,
        tags: [...(transaction.tags || []), 'recurring'],
        lastGenerated: transaction.startDate
      }]
    }));
  };

  const deleteRecurringTransaction = (recurringId) => {
    setData(prev => ({
      ...prev,
      recurringTransactions: prev.recurringTransactions.filter(rt => rt.id !== recurringId),
      transactions: prev.transactions.filter(t => t.recurringId !== recurringId)
    }));
  };

  const updateBudget = (category, amount) => {
    setData(prev => ({
      ...prev,
      budgets: { ...prev.budgets, [category]: amount }
    }));
  };

  const addCategory = (type, category) => {
    setData(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [type]: [...prev.categories[type], category]
      }
    }));
  };

  const addTag = (transactionId, tag) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => 
        t.id === transactionId 
          ? { ...t, tags: [...new Set([...(t.tags || []), tag])] }
          : t
      )
    }));
  };

  const removeTag = (transactionId, tag) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => 
        t.id === transactionId 
          ? { ...t, tags: (t.tags || []).filter(t => t !== tag) }
          : t
      )
    }));
  };

  const addGoal = (goal) => {
    const newGoal = {
      ...goal,
      id: uuidv4(),
      startDate: new Date().toISOString().split('T')[0],
    };
    setData(prev => ({
      ...prev,
      goals: [...prev.goals, newGoal]
    }));
  };

  const updateGoal = (updatedGoal) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === updatedGoal.id ? updatedGoal : g)
    }));
  };

  const deleteGoal = (goalId) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== goalId)
    }));
  };

  const value = {
    transactions: data.transactions,
    recurringTransactions: data.recurringTransactions,
    categories: data.categories,
    budgets: data.budgets,
    goals: data.goals,
    addTransaction,
    deleteTransaction,
    addRecurringTransaction,
    deleteRecurringTransaction,
    updateBudget,
    addCategory,
    addTag,
    removeTag,
    addGoal,
    updateGoal,
    deleteGoal
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  return useContext(FinanceContext);
}