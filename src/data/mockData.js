const mockTransactions = [
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
    description: 'Salary',
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
    description: 'Restaurant',
    amount: -45.80,
    category: 'Food'
  },
  {
    id: 5,
    date: '2024-01-05',
    description: 'Gas',
    amount: -40.00,
    category: 'Transportation'
  }
];

const categories = [
  'Food',
  'Transportation',
  'Utilities',
  'Entertainment',
  'Income',
  'Shopping',
  'Healthcare',
  'Other'
];

export { mockTransactions, categories };