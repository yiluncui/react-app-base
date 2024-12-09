import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = ({ transactions }) => {
  const totalBalance = transactions.reduce((sum, t) => sum + t.amount, 0);
  const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const expenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));

  // Calculate expenses by category
  const expensesByCategory = transactions
    .filter(t => t.amount < 0)
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {});

  const chartData = {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        data: Object.values(expensesByCategory),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ],
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6">Total Balance</Typography>
          <Typography variant="h4" color={totalBalance >= 0 ? 'success.main' : 'error.main'}>
            ${totalBalance.toFixed(2)}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6">Income</Typography>
          <Typography variant="h4" color="success.main">
            ${income.toFixed(2)}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6">Expenses</Typography>
          <Typography variant="h4" color="error.main">
            ${expenses.toFixed(2)}
          </Typography>
        </Paper>
      </Box>
      
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Expenses by Category
        </Typography>
        <Box sx={{ height: 300 }}>
          <Pie data={chartData} options={{ maintainAspectRatio: false }} />
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard;