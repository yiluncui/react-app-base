import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'personal_finance_transactions';

// Sample categories
export const categories = {
  income: ['Salary', 'Freelance', 'Investments', 'Other Income'],
  expense: ['Food', 'Transportation', 'Housing', 'Utilities', 'Entertainment', 'Healthcare', 'Shopping', 'Other']
};

// Sample initial data
const sampleTransactions = [
  {
    id: uuidv4(),
    type: 'income',
    category: 'Salary',
    amount: 5000,
    date: '2024-01-01',
    description: 'Monthly salary'
  },
  {
    id: uuidv4(),
    type: 'expense',
    category: 'Food',
    amount: 50,
    date: '2024-01-02',
    description: 'Grocery shopping'
  },
  {
    id: uuidv4(),
    type: 'expense',
    category: 'Transportation',
    amount: 30,
    date: '2024-01-03',
    description: 'Bus fare'
  }
];

// Load transactions from localStorage or use sample data
export const loadTransactions = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : sampleTransactions;
};

// Save transactions to localStorage
export const saveTransactions = (transactions) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
};

// Add a new transaction
export const addTransaction = (transactions, transaction) => {
  const newTransaction = {
    ...transaction,
    id: uuidv4(),
    date: transaction.date || new Date().toISOString().split('T')[0]
  };
  const updatedTransactions = [...transactions, newTransaction];
  saveTransactions(updatedTransactions);
  return updatedTransactions;
};

// Delete a transaction
export const deleteTransaction = (transactions, id) => {
  const updatedTransactions = transactions.filter(t => t.id !== id);
  saveTransactions(updatedTransactions);
  return updatedTransactions;
};

// Calculate balance
export const calculateBalance = (transactions) => {
  return transactions.reduce((balance, transaction) => {
    return balance + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
  }, 0);
};

// Get transactions by type
export const getTransactionsByType = (transactions, type) => {
  return transactions.filter(t => t.type === type);
};

// Calculate total by type
export const calculateTotalByType = (transactions, type) => {
  return transactions
    .filter(t => t.type === type)
    .reduce((total, t) => total + t.amount, 0);
};

// Get transactions grouped by category
export const getTransactionsByCategory = (transactions, type) => {
  return transactions
    .filter(t => t.type === type)
    .reduce((grouped, t) => {
      if (!grouped[t.category]) {
        grouped[t.category] = [];
      }
      grouped[t.category].push(t);
      return grouped;
    }, {});
};