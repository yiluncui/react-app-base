import React from 'react';
import { Paper, Typography, Grid, Box, LinearProgress } from '@mui/material';
import { getTransactionsByCategory } from '../data/transactions';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { alpha } from '@mui/material/styles';

export default function TransactionStats({ transactions }) {
  const incomeByCategory = getTransactionsByCategory(transactions, 'income');
  const expenseByCategory = getTransactionsByCategory(transactions, 'expense');

  const totalIncome = Object.values(incomeByCategory).reduce(
    (sum, transactions) => sum + transactions.reduce((s, t) => s + t.amount, 0),
    0
  );

  const totalExpenses = Object.values(expenseByCategory).reduce(
    (sum, transactions) => sum + transactions.reduce((s, t) => s + t.amount, 0),
    0
  );

  const formatCategoryData = (categoryData, total) => {
    return Object.entries(categoryData)
      .map(([category, transactions]) => ({
        category,
        amount: transactions.reduce((sum, t) => sum + t.amount, 0),
        percentage: (transactions.reduce((sum, t) => sum + t.amount, 0) / total) * 100
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const topIncomeCategories = formatCategoryData(incomeByCategory, totalIncome);
  const topExpenseCategories = formatCategoryData(expenseByCategory, totalExpenses);

  const CategoryProgress = ({ data, type }) => (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: type === 'income' ? alpha('#4caf50', 0.1) : alpha('#f44336', 0.1),
            color: type === 'income' ? 'success.main' : 'error.main',
            mr: 2
          }}
        >
          {type === 'income' ? <TrendingUpIcon /> : <TrendingDownIcon />}
        </Box>
        <Typography variant="subtitle2" sx={{ flex: 1 }}>
          {data.category}
        </Typography>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', ml: 2 }}>
          ${data.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={data.percentage}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: type === 'income' ? alpha('#4caf50', 0.1) : alpha('#f44336', 0.1),
          '& .MuiLinearProgress-bar': {
            bgcolor: type === 'income' ? 'success.main' : 'error.main',
            borderRadius: 3,
          },
        }}
      />
      <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
        {data.percentage.toFixed(1)}% of total {type}
      </Typography>
    </Box>
  );

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={6}>
        <Paper
          elevation={1}
          sx={{
            p: 3,
            height: '100%',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
            },
          }}
        >
          <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary', mb: 3 }}>
            Top Income Sources
          </Typography>
          {topIncomeCategories.map(data => (
            <CategoryProgress key={data.category} data={data} type="income" />
          ))}
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper
          elevation={1}
          sx={{
            p: 3,
            height: '100%',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
            },
          }}
        >
          <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary', mb: 3 }}>
            Top Expense Categories
          </Typography>
          {topExpenseCategories.map(data => (
            <CategoryProgress key={data.category} data={data} type="expense" />
          ))}
        </Paper>
      </Grid>
    </Grid>
  );
}