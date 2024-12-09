const RECURRING_KEY = 'personal_finance_recurring';

export const RecurringFrequency = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly'
};

export const loadRecurring = () => {
  const stored = localStorage.getItem(RECURRING_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveRecurring = (recurring) => {
  localStorage.setItem(RECURRING_KEY, JSON.stringify(recurring));
};

export const addRecurring = (transaction) => {
  const recurring = loadRecurring();
  const newRecurring = [...recurring, { ...transaction, id: Date.now() }];
  saveRecurring(newRecurring);
  return newRecurring;
};

export const deleteRecurring = (transactionId) => {
  const recurring = loadRecurring();
  const newRecurring = recurring.filter(t => t.id !== transactionId);
  saveRecurring(newRecurring);
  return newRecurring;
};

export const getNextOccurrence = (startDate, frequency) => {
  const date = new Date(startDate);
  const today = new Date();
  
  while (date <= today) {
    switch (frequency) {
      case RecurringFrequency.DAILY:
        date.setDate(date.getDate() + 1);
        break;
      case RecurringFrequency.WEEKLY:
        date.setDate(date.getDate() + 7);
        break;
      case RecurringFrequency.BIWEEKLY:
        date.setDate(date.getDate() + 14);
        break;
      case RecurringFrequency.MONTHLY:
        date.setMonth(date.getMonth() + 1);
        break;
      case RecurringFrequency.QUARTERLY:
        date.setMonth(date.getMonth() + 3);
        break;
      case RecurringFrequency.YEARLY:
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        return null;
    }
  }
  return date;
};

export const processRecurringTransactions = (recurring, addTransaction) => {
  const processed = [];
  
  recurring.forEach(transaction => {
    const nextDate = getNextOccurrence(transaction.startDate, transaction.frequency);
    if (nextDate) {
      const newTransaction = {
        ...transaction,
        date: nextDate.toISOString().split('T')[0],
        id: Date.now() + Math.random()
      };
      delete newTransaction.startDate;
      delete newTransaction.frequency;
      
      addTransaction(newTransaction);
      processed.push(newTransaction);
    }
  });
  
  return processed;
};