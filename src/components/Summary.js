import React from 'react';
import { Paper, Typography, Grid } from '@mui/material';
import { calculateTotalByType } from '../data/transactions';

export default function Summary({ transactions }) {
  const income = calculateTotalByType(transactions, 'income');
  const expenses = calculateTotalByType(transactions, 'expense');
  const balance = income - expenses;

  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid item xs={12} sm={4}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            bgcolor: 'success.light',
            color: 'success.contrastText'
          }}
        >
          <Typography variant="h6">Income</Typography>
          <Typography variant="h4">${income.toFixed(2)}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            bgcolor: 'error.light',
            color: 'error.contrastText'
          }}
        >
          <Typography variant="h6">Expenses</Typography>
          <Typography variant="h4">${expenses.toFixed(2)}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            bgcolor: balance >= 0 ? 'primary.light' : 'warning.light',
            color: balance >= 0 ? 'primary.contrastText' : 'warning.contrastText'
          }}
        >
          <Typography variant="h6">Balance</Typography>
          <Typography variant="h4">${balance.toFixed(2)}</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}