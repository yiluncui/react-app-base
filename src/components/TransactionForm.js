import React, { useState } from 'react';
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Paper,
  Typography,
  InputAdornment,
  Grid,
  Tooltip,
  IconButton
} from '@mui/material';
import { categories } from '../data/transactions';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ClearIcon from '@mui/icons-material/Clear';
import { alpha } from '@mui/material/styles';

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
      [name]: value,
      ...(name === 'type' ? { category: '' } : {})
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...transaction,
      amount: parseFloat(transaction.amount)
    });
    handleReset();
  };

  const handleReset = () => {
    setTransaction({
      type: 'expense',
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 3,
        mb: 3,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: theme => 
            `linear-gradient(90deg, ${
              transaction.type === 'income' 
                ? theme.palette.success.main 
                : theme.palette.error.main
            } 0%, ${
              transaction.type === 'income' 
                ? theme.palette.success.light 
                : theme.palette.error.light
            } 100%)`,
        }
      }}
    >
      <Box 
        component="form" 
        onSubmit={handleSubmit}
      >
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Add New Transaction
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={transaction.type}
                onChange={handleChange}
                label="Type"
                startAdornment={
                  <InputAdornment position="start">
                    {transaction.type === 'income' 
                      ? <AttachMoneyIcon sx={{ color: 'success.main' }} />
                      : <ShoppingBagIcon sx={{ color: 'error.main' }} />}
                  </InputAdornment>
                }
              >
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
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
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Amount"
              name="amount"
              type="number"
              value={transaction.amount}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: transaction.type === 'income' 
                      ? 'success.main' 
                      : 'error.main',
                  },
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date"
              name="date"
              type="date"
              value={transaction.date}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={transaction.description}
              onChange={handleChange}
              multiline
              rows={2}
              placeholder="Add a note about this transaction..."
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color={transaction.type === 'income' ? 'success' : 'error'}
                type="submit"
                disabled={!transaction.category || !transaction.amount}
                sx={{
                  flex: 1,
                  py: 1.5,
                  bgcolor: transaction.type === 'income' 
                    ? 'success.main' 
                    : 'error.main',
                  '&:hover': {
                    bgcolor: transaction.type === 'income' 
                      ? 'success.dark' 
                      : 'error.dark',
                  }
                }}
              >
                Add {transaction.type === 'income' ? 'Income' : 'Expense'}
              </Button>
              
              <Tooltip title="Reset form">
                <IconButton
                  onClick={handleReset}
                  sx={{
                    bgcolor: theme => alpha(theme.palette.text.secondary, 0.1),
                    '&:hover': {
                      bgcolor: theme => alpha(theme.palette.text.secondary, 0.2),
                    }
                  }}
                >
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}