import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import DownloadIcon from '@mui/icons-material/Download';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InfoIcon from '@mui/icons-material/Info';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

const timeRanges = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Last Year' },
  { value: 'ytd', label: 'Year to Date' },
  { value: 'all', label: 'All Time' },
];

const ReportsAnalytics = ({ transactions }) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('spending');

  const filteredTransactions = useMemo(() => {
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'ytd':
        startDate.setMonth(0, 1);
        break;
      case 'all':
        return transactions;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    return transactions.filter(t => new Date(t.date) >= startDate);
  }, [transactions, timeRange]);

  const analytics = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = Math.abs(
      filteredTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0)
    );

    const expensesByCategory = filteredTransactions
      .filter(t => t.amount < 0)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
      }, {});

    const monthlyData = filteredTransactions.reduce((acc, t) => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = { income: 0, expenses: 0 };
      }
      
      if (t.amount > 0) {
        acc[monthKey].income += t.amount;
      } else {
        acc[monthKey].expenses += Math.abs(t.amount);
      }
      
      return acc;
    }, {});

    // Calculate trends
    const sortedMonths = Object.keys(monthlyData).sort();
    const trends = {
      income: 0,
      expenses: 0,
    };

    if (sortedMonths.length > 1) {
      const lastMonth = monthlyData[sortedMonths[sortedMonths.length - 1]];
      const prevMonth = monthlyData[sortedMonths[sortedMonths.length - 2]];
      
      trends.income = ((lastMonth.income - prevMonth.income) / prevMonth.income) * 100;
      trends.expenses = ((lastMonth.expenses - prevMonth.expenses) / prevMonth.expenses) * 100;
    }

    // Calculate average daily spending
    const dayCount = Math.max(1, Math.ceil((new Date() - new Date(filteredTransactions[0]?.date)) / (1000 * 60 * 60 * 24)));
    const avgDailySpending = expenses / dayCount;

    // Forecast next month's expenses
    const forecastedExpenses = Object.values(monthlyData).reduce((sum, month) => sum + month.expenses, 0) / Object.keys(monthlyData).length;

    return {
      income,
      expenses,
      expensesByCategory,
      monthlyData,
      trends,
      avgDailySpending,
      forecastedExpenses,
      savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
    };
  }, [filteredTransactions]);

  const monthlyTrendsData = {
    labels: Object.keys(analytics.monthlyData),
    datasets: [
      {
        label: 'Income',
        data: Object.values(analytics.monthlyData).map(d => d.income),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Expenses',
        data: Object.values(analytics.monthlyData).map(d => d.expenses),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  const expensesByCategoryData = {
    labels: Object.keys(analytics.expensesByCategory),
    datasets: [
      {
        data: Object.values(analytics.expensesByCategory),
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

  const handleExportData = () => {
    const data = {
      transactions: filteredTransactions,
      analytics: {
        income: analytics.income,
        expenses: analytics.expenses,
        savingsRate: analytics.savingsRate,
        expensesByCategory: analytics.expensesByCategory,
        trends: analytics.trends,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-report-${timeRange}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Reports & Analytics</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              {timeRanges.map((range) => (
                <MenuItem key={range.value} value={range.value}>
                  {range.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportData}
          >
            Export Data
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography color="text.secondary" gutterBottom>
              Total Income
            </Typography>
            <Typography variant="h4" sx={{ mb: 1 }}>
              ${analytics.income.toFixed(2)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {analytics.trends.income > 0 ? (
                <TrendingUpIcon color="success" />
              ) : (
                <TrendingDownIcon color="error" />
              )}
              <Typography
                variant="body2"
                color={analytics.trends.income > 0 ? 'success.main' : 'error.main'}
                sx={{ ml: 1 }}
              >
                {Math.abs(analytics.trends.income).toFixed(1)}% vs prev period
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography color="text.secondary" gutterBottom>
              Total Expenses
            </Typography>
            <Typography variant="h4" sx={{ mb: 1 }}>
              ${analytics.expenses.toFixed(2)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {analytics.trends.expenses < 0 ? (
                <TrendingDownIcon color="success" />
              ) : (
                <TrendingUpIcon color="error" />
              )}
              <Typography
                variant="body2"
                color={analytics.trends.expenses < 0 ? 'success.main' : 'error.main'}
                sx={{ ml: 1 }}
              >
                {Math.abs(analytics.trends.expenses).toFixed(1)}% vs prev period
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography color="text.secondary" gutterBottom>
              Average Daily Spending
            </Typography>
            <Typography variant="h4" sx={{ mb: 1 }}>
              ${analytics.avgDailySpending.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Based on {timeRanges.find(r => r.value === timeRange)?.label.toLowerCase()}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography color="text.secondary" gutterBottom>
              Savings Rate
            </Typography>
            <Typography variant="h4" sx={{ mb: 1 }}>
              {analytics.savingsRate.toFixed(1)}%
            </Typography>
            <Typography
              variant="body2"
              color={analytics.savingsRate >= 20 ? 'success.main' : 'warning.main'}
            >
              {analytics.savingsRate >= 20 ? 'On track' : 'Below target'}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="subtitle2">
              Forecasted Expenses for Next Month: ${analytics.forecastedExpenses.toFixed(2)}
            </Typography>
            Based on your spending patterns, we predict this will be your expense level for the next month.
          </Alert>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Income vs Expenses Trend
            </Typography>
            <Box sx={{ height: 400 }}>
              <Line
                data={monthlyTrendsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Expenses by Category
            </Typography>
            <Box sx={{ height: 400 }}>
              <Pie
                data={expensesByCategoryData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Spending Insights
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(analytics.expensesByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => (
                  <Grid item xs={12} md={4} key={category}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          {category}
                        </Typography>
                        <Typography variant="h5" component="div">
                          ${amount.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {((amount / analytics.expenses) * 100).toFixed(1)}% of total expenses
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportsAnalytics;