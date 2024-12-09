const CATEGORIES_KEY = 'personal_finance_categories';

const defaultCategories = {
  income: ['Salary', 'Freelance', 'Investment', 'Other'],
  expense: [
    'Food & Dining',
    'Transportation',
    'Housing',
    'Utilities',
    'Healthcare',
    'Entertainment',
    'Shopping',
    'Education',
    'Travel',
    'Insurance',
    'Savings',
    'Other'
  ]
};

export const loadCategories = () => {
  const stored = localStorage.getItem(CATEGORIES_KEY);
  return stored ? JSON.parse(stored) : defaultCategories;
};

export const saveCategories = (categories) => {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
};

export const addCategory = (type, category) => {
  const categories = loadCategories();
  if (!categories[type].includes(category)) {
    categories[type] = [...categories[type], category];
    saveCategories(categories);
  }
  return categories;
};

export const deleteCategory = (type, category) => {
  const categories = loadCategories();
  categories[type] = categories[type].filter(c => c !== category);
  saveCategories(categories);
  return categories;
};