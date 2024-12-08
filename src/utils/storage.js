const STORAGE_KEY = 'personal_finance_data';

export const loadTransactions = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTransactions = (transactions) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
};

export const addTransaction = (transaction) => {
  const transactions = loadTransactions();
  const newTransactions = [...transactions, { ...transaction, id: Date.now() }];
  saveTransactions(newTransactions);
  return newTransactions;
};

export const deleteTransaction = (transactionId) => {
  const transactions = loadTransactions();
  const newTransactions = transactions.filter(t => t.id !== transactionId);
  saveTransactions(newTransactions);
  return newTransactions;
};