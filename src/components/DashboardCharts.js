import React from 'react';
import { Paper, Typography, Grid, Box } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { getTransactionsByCategory } from '../data/transactions';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
          family: '"Inter", "Roboto", sans-serif',
        },
      },
    },
  },
};

const getGradient = (ctx, chartArea, color1, color2) => {
  if (!ctx || !chartArea) return color1;
  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
};

export default function DashboardCharts({ transactions }) {
  // Group transactions by date for the line chart
  const dailyTotals = transactions.reduce((acc, t) => {
    const date = t.date;
    if (!acc[date]) {
      acc[date] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      acc[date].income += t.amount;
    } else {
      acc[date].expense += t.amount;
    }
    return acc;
  }, {});

  const dates = Object.keys(dailyTotals).sort();
  const incomeData = dates.map(date => dailyTotals[date].income);
  const expenseData = dates.map(date => dailyTotals[date].expense);

  // Get category data for pie charts
  const incomeByCategory = getTransactionsByCategory(transactions, 'income');
  const expenseByCategory = getTransactionsByCategory(transactions, 'expense');

  const lineChartData = {
    labels: dates.map(date => new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })),
    datasets: [
      {
        label: 'Income',
        data: incomeData,
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Expenses',
        data: expenseData,
        borderColor: '#f44336',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const incomePieData = {
    labels: Object.keys(incomeByCategory),
    datasets: [{
      data: Object.values(incomeByCategory).map(transactions => 
        transactions.reduce((sum, t) => sum + t.amount, 0)
      ),
      backgroundColor: [
        'rgba(76, 175, 80, 0.8)',
        'rgba(76, 175, 80, 0.6)',
        'rgba(76, 175, 80, 0.4)',
        'rgba(76, 175, 80, 0.2)',
      ],
      borderWidth: 1,
    }],
  };

  const expensePieData = {
    labels: Object.keys(expenseByCategory),
    datasets: [{
      data: Object.values(expenseByCategory).map(transactions => 
        transactions.reduce((sum, t) => sum + t.amount, 0)
      ),
      backgroundColor: [
        'rgba(244, 67, 54, 0.8)',
        'rgba(244, 67, 54, 0.6)',
        'rgba(244, 67, 54, 0.4)',
        'rgba(244, 67, 54, 0.2)',
      ],
      borderWidth: 1,
    }],
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
        Financial Overview
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              height: 300,
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
            }}
          >
            <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary' }}>
              Cash Flow
            </Typography>
            <Line 
              data={lineChartData} 
              options={{
                ...chartOptions,
                scales: {
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                    },
                  },
                },
              }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              height: 300,
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
            }}
          >
            <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary' }}>
              Income by Category
            </Typography>
            <Doughnut 
              data={incomePieData} 
              options={{
                ...chartOptions,
                cutout: '70%',
              }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              height: 300,
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
            }}
          >
            <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary' }}>
              Expenses by Category
            </Typography>
            <Doughnut 
              data={expensePieData}
              options={{
                ...chartOptions,
                cutout: '70%',
              }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}