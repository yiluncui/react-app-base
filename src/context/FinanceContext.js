import { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const FinanceContext = createContext();

const INITIAL_DATA = {
  transactions: [
    { id: '1', type: 'income', amount: 5000, category: 'Salary', date: '2024-01-01', description: 'Monthly salary' },
    { id: '2', type: 'expense', amount: 1000, category: 'Rent', date: '2024-01-02', description: 'Monthly rent' },
    { id: '3', type: 'expense', amount: 200, category: 'Groceries', date: '2024-01-03', description: 'Weekly groceries' },
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

export function FinanceProvider({ children }) {
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem('financeData');
    return savedData ? JSON.parse(savedData) : INITIAL_DATA;
  });

  useEffect(() => {
    localStorage.setItem('financeData', JSON.stringify(data));
  }, [data]);

  const addTransaction = (transaction) => {
    setData(prev => ({
      ...prev,
      transactions: [...prev.transactions, { ...transaction, id: uuidv4() }]
    }));
  };

  const deleteTransaction = (id) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
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

  const value = {
    transactions: data.transactions,
    categories: data.categories,
    budgets: data.budgets,
    addTransaction,
    deleteTransaction,
    updateBudget,
    addCategory
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