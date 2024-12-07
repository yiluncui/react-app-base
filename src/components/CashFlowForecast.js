import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  IconButton,
  Alert,
  LinearProgress,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { alpha } from '@mui/material/styles';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

export default function CashFlowForecast({ transactions, recurringTransactions = [] }) {
  const [forecastPeriod, setForecastPeriod] = useState('6months');
  const [forecastData, setForecastData] = useState(null);

  const periods = {
    '1month': { label: '1 Month', days: 30 },
    '3months': { label: '3 Months', days: 90 },
    '6months': { label: '6 Months', days: 180 },
    '1year': { label: '1 Year', days: 365 },
  };

  const calculateMonthlyAverages = () => {
    const monthlyData = transactions.reduce((acc, t) => {
      const month = t.date.substring(0, 7);
      if (!acc[month]) {
        acc[month] = { income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        acc[month].income += t.amount;
      } else {
        acc[month].expenses += t.amount;
      }
      return acc;
    }, {});

    const months = Object.keys(monthlyData);
    const totalMonths = months.length;

    return {
      avgIncome: months.reduce((sum, month) => sum + monthlyData[month].income, 0) / totalMonths,
      avgExpenses: months.reduce((sum, month) => sum + monthlyData[month].expenses, 0) / totalMonths,
    };
  };

  const calculateRecurringTotals = () => {
    return recurringTransactions.reduce(
      (acc, t) => {
        const monthlyAmount = t.amount * getMonthlyFrequencyMultiplier(t.frequency);
        if (t.type === 'income') {
          acc.income += monthlyAmount;
        } else {
          acc.expenses += monthlyAmount;
        }
        return acc;
      },
      { income: 0, expenses: 0 }
    );
  };

  const getMonthlyFrequencyMultiplier = (frequency) => {
    switch (frequency) {
      case 'daily': return 30;
      case 'weekly': return 4;
      case 'biweekly': return 2;
      case 'monthly': return 1;
      case 'quarterly': return 1/3;
      case 'yearly': return 1/12;
      default: return 1;
    }
  };

  const generateForecastData = () => {
    const { avgIncome, avgExpenses } = calculateMonthlyAverages();
    const recurringTotals = calculateRecurringTotals();

    const totalMonthlyIncome = avgIncome + recurringTotals.income;
    const totalMonthlyExpenses = avgExpenses + recurringTotals.expenses;
    const monthlyNet = totalMonthlyIncome - totalMonthlyExpenses;

    const months = Math.ceil(periods[forecastPeriod].days / 30);
    const labels = Array.from({ length: months }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });

    let currentBalance = transactions.reduce((sum, t) => 
      sum + (t.type === 'income' ? t.amount : -t.amount), 0);

    const balanceData = [currentBalance];
    const incomeData = [totalMonthlyIncome];
    const expenseData = [totalMonthlyExpenses];

    for (let i = 1; i < months; i++) {
      currentBalance += monthlyNet;
      balanceData.push(currentBalance);
      incomeData.push(totalMonthlyIncome);
      expenseData.push(totalMonthlyExpenses);
    }

    return {
      labels,
      balanceData,
      incomeData,
      expenseData,
      monthlyNet,
      projectedBalance: balanceData[balanceData.length - 1],
      totalMonthlyIncome,
      totalMonthlyExpenses,
    };
  };

  useEffect(() => {
    setForecastData(generateForecastData());
  }, [forecastPeriod, transactions, recurringTransactions]);

  if (!forecastData) return null;

  const chartData = {
    labels: forecastData.labels,
    datasets: [
      {
        label: 'Projected Balance',
        data: forecastData.balanceData,
        borderColor: '#2196f3',
        backgroundColor: alpha('#2196f3', 0.1),
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Income Trend',
        data: forecastData.incomeData,
        borderColor: '#4caf50',
        backgroundColor: alpha('#4caf50', 0.1),
        tension: 0.4,
        fill: true,
        borderDash: [5, 5],
      },
      {
        label: 'Expense Trend',
        data: forecastData.expenseData,
        borderColor: '#f44336',
        backgroundColor: alpha('#f44336', 0.1),
        tension: 0.4,
        fill: true,
        borderDash: [5, 5],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: '"Inter", "Roboto", sans-serif',
          },
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumSignificantDigits: 3,
            }).format(value);
          },
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ flex: 1, color: 'text.secondary' }}>
          Cash Flow Forecast
        </Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Period</InputLabel>
          <Select
            value={forecastPeriod}
            label="Period"
            onChange={(e) => setForecastPeriod(e.target.value)}
            size="small"
          >
            {Object.entries(periods).map(([key, { label }]) => (
              <MenuItem key={key} value={key}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              bgcolor: alpha('#2196f3', 0.05),
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Projected Balance</Typography>
                <Tooltip title="Final balance at the end of the forecast period">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="h4" sx={{ color: 'primary.main' }}>
                ${Math.abs(forecastData.projectedBalance).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {forecastData.projectedBalance >= 0 ? 'Positive' : 'Negative'} balance
              </Typography>
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 150,
                height: 150,
                background: 'primary.main',
                opacity: 0.05,
                borderRadius: '50%',
              }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              bgcolor: alpha('#4caf50', 0.05),
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Monthly Income</Typography>
                <Tooltip title="Average monthly income including recurring transactions">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="h4" sx={{ color: 'success.main' }}>
                ${forecastData.totalMonthlyIncome.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Projected monthly income
              </Typography>
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 150,
                height: 150,
                background: 'success.main',
                opacity: 0.05,
                borderRadius: '50%',
              }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              bgcolor: alpha('#f44336', 0.05),
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingDownIcon sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="h6">Monthly Expenses</Typography>
                <Tooltip title="Average monthly expenses including recurring transactions">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="h4" sx={{ color: 'error.main' }}>
                ${forecastData.totalMonthlyExpenses.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Projected monthly expenses
              </Typography>
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 150,
                height: 150,
                background: 'error.main',
                opacity: 0.05,
                borderRadius: '50%',
              }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              height: 400,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Line data={chartData} options={chartOptions} />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Alert
            severity={forecastData.monthlyNet >= 0 ? 'success' : 'warning'}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Monthly Net Cash Flow: ${forecastData.monthlyNet.toLocaleString()}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={50 + (forecastData.monthlyNet / forecastData.totalMonthlyIncome * 50)}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: alpha(forecastData.monthlyNet >= 0 ? 'success.main' : 'warning.main', 0.1),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: forecastData.monthlyNet >= 0 ? 'success.main' : 'warning.main',
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
}