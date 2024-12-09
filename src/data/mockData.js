const mockTransactions = [
  // January 2024
  {
    id: 1,
    date: '2024-01-01',
    description: 'Grocery Shopping',
    amount: -120.50,
    category: 'Food'
  },
  {
    id: 2,
    date: '2024-01-02',
    description: 'Monthly Salary',
    amount: 3000.00,
    category: 'Income'
  },
  {
    id: 3,
    date: '2024-01-03',
    description: 'Electric Bill',
    amount: -85.20,
    category: 'Utilities'
  },
  {
    id: 4,
    date: '2024-01-04',
    description: 'Restaurant Dinner',
    amount: -45.80,
    category: 'Food'
  },
  {
    id: 5,
    date: '2024-01-05',
    description: 'Gas Station',
    amount: -40.00,
    category: 'Transportation'
  },
  {
    id: 6,
    date: '2024-01-15',
    description: 'Movie Night',
    amount: -30.00,
    category: 'Entertainment'
  },
  {
    id: 7,
    date: '2024-01-20',
    description: 'Pharmacy',
    amount: -25.50,
    category: 'Healthcare'
  },
  {
    id: 8,
    date: '2024-01-25',
    description: 'Clothing Store',
    amount: -89.99,
    category: 'Shopping'
  },
  // February 2024
  {
    id: 9,
    date: '2024-02-01',
    description: 'Monthly Salary',
    amount: 3000.00,
    category: 'Income'
  },
  {
    id: 10,
    date: '2024-02-02',
    description: 'Grocery Store',
    amount: -95.30,
    category: 'Food'
  },
  {
    id: 11,
    date: '2024-02-03',
    description: 'Internet Bill',
    amount: -79.99,
    category: 'Utilities'
  },
  {
    id: 12,
    date: '2024-02-05',
    description: 'Bus Pass',
    amount: -60.00,
    category: 'Transportation'
  },
  {
    id: 13,
    date: '2024-02-10',
    description: 'Concert Tickets',
    amount: -75.00,
    category: 'Entertainment'
  },
  {
    id: 14,
    date: '2024-02-15',
    description: 'Doctor Visit',
    amount: -50.00,
    category: 'Healthcare'
  }
];

const categories = [
  'Food',
  'Transportation',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Income',
  'Other'
];

const defaultBudgets = {
  Food: 400,
  Transportation: 200,
  Utilities: 300,
  Entertainment: 150,
  Healthcare: 200,
  Shopping: 200
};

export { mockTransactions, categories, defaultBudgets };