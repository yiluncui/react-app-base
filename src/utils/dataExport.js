import { loadTransactions } from './storage';
import { loadCategories } from './categories';
import { loadBudgets } from './budgets';
import { loadGoals } from './goals';
import { loadRecurring } from './recurring';

export const exportData = () => {
  const data = {
    transactions: loadTransactions(),
    categories: loadCategories(),
    budgets: loadBudgets(),
    goals: loadGoals(),
    recurring: loadRecurring(),
    exportDate: new Date().toISOString(),
    version: '1.0'
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'finance_data_' + new Date().toISOString().split('T')[0] + '.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importData = (jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    
    // Validate data structure
    if (!data.version || !data.exportDate) {
      throw new Error('Invalid data format');
    }

    // Store each data type
    if (data.transactions) {
      localStorage.setItem('personal_finance_data', JSON.stringify(data.transactions));
    }
    if (data.categories) {
      localStorage.setItem('personal_finance_categories', JSON.stringify(data.categories));
    }
    if (data.budgets) {
      localStorage.setItem('personal_finance_budgets', JSON.stringify(data.budgets));
    }
    if (data.goals) {
      localStorage.setItem('personal_finance_goals', JSON.stringify(data.goals));
    }
    if (data.recurring) {
      localStorage.setItem('personal_finance_recurring', JSON.stringify(data.recurring));
    }

    return {
      success: true,
      message: 'Data imported successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Import failed: ' + error.message
    };
  }
};