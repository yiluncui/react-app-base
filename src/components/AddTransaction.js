import React, { useState } from 'react';
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from '@mui/material';
import { categories } from '../data/mockData';

const AddTransaction = ({ onAddTransaction }) => {
  const [transaction, setTransaction] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!transaction.description || !transaction.amount || !transaction.category) {
      return;
    }
    
    onAddTransaction({
      ...transaction,
      id: Date.now(),
      amount: parseFloat(transaction.amount),
    });

    setTransaction({
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ '& > :not(style)': { m: 1 } }}>
      <TextField
        label="Description"
        value={transaction.description}
        onChange={(e) => setTransaction({ ...transaction, description: e.target.value })}
        required
      />
      <TextField
        label="Amount"
        type="number"
        value={transaction.amount}
        onChange={(e) => setTransaction({ ...transaction, amount: e.target.value })}
        required
      />
      <FormControl required sx={{ minWidth: 120 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={transaction.category}
          label="Category"
          onChange={(e) => setTransaction({ ...transaction, category: e.target.value })}
        >
          {categories.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        type="date"
        value={transaction.date}
        onChange={(e) => setTransaction({ ...transaction, date: e.target.value })}
        required
      />
      <Button type="submit" variant="contained" color="primary">
        Add Transaction
      </Button>
    </Box>
  );
};

export default AddTransaction;