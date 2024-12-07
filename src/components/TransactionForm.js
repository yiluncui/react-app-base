import React, { useState } from 'react';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';
import { categories } from '../data/transactions';

export default function TransactionForm({ onSubmit }) {
  const [transaction, setTransaction] = useState({
    type: 'expense',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTransaction(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...transaction,
      amount: parseFloat(transaction.amount)
    });
    setTransaction({
      type: 'expense',
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ '& > :not(style)': { m: 1 } }}>
      <FormControl fullWidth>
        <InputLabel>Type</InputLabel>
        <Select
          name="type"
          value={transaction.type}
          onChange={handleChange}
          label="Type"
        >
          <MenuItem value="income">Income</MenuItem>
          <MenuItem value="expense">Expense</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Category</InputLabel>
        <Select
          name="category"
          value={transaction.category}
          onChange={handleChange}
          label="Category"
        >
          {categories[transaction.type].map(cat => (
            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Amount"
        name="amount"
        type="number"
        value={transaction.amount}
        onChange={handleChange}
        required
      />

      <TextField
        fullWidth
        label="Date"
        name="date"
        type="date"
        value={transaction.date}
        onChange={handleChange}
        required
      />

      <TextField
        fullWidth
        label="Description"
        name="description"
        value={transaction.description}
        onChange={handleChange}
        multiline
        rows={2}
      />

      <Button
        fullWidth
        variant="contained"
        color="primary"
        type="submit"
        disabled={!transaction.category || !transaction.amount}
      >
        Add Transaction
      </Button>
    </Box>
  );
}