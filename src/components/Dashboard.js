import { Box, Card, CardContent, Grid, Typography, Tab, Tabs } from '@mui/material';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useState, useMemo } from 'react';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Dashboard({ transactions }) {
  const [timeRange, setTimeRange] = useState('all');
  const [chartView, setChartView] = useState('overview');

  const filteredTransactions = useMemo(() => {
    if (timeRange === 'all') return transactions;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    return transactions.filter(t => {
      const date = new Date(t.date);
      if (timeRange === 'thisMonth') {
        return date >= monthStart;
      }
      return date >= lastMonthStart && date < monthStart;
    });
  }, [transactions, timeRange]);

  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;

    const expensesByCategory = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    const monthlyData = transactions.reduce((acc, t) => {
      const date = new Date(t.date);
      const monthYear = MONTHS[date.getMonth()] + ' ' + date.getFullYear();
      if (!acc[monthYear]) {
        acc[monthYear] = { income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        acc[monthYear].income += t.amount;
      } else {
        acc[monthYear].expenses += t.amount;
      }
      return acc;
    }, {});

    return {
      income,
      expenses,
      balance,
      expensesByCategory,
      monthlyData
    };
  }, [filteredTransactions, transactions]);

  const overviewChartData = {
    labels: ['Income', 'Expenses'],
    datasets: [{
      data: [stats.income, stats.expenses],
      backgroundColor: ['#4caf50', '#f44336'],
      borderColor: ['#43a047', '#e53935'],
      borderWidth: 1,
    }],
  };

  const categoryChartData = {
    labels: Object.keys(stats.expensesByCategory),
    datasets: [{
      data: Object.values(stats.expensesByCategory),
      backgroundColor: Object.keys(stats.expensesByCategory).map((_, i) => 
        'hsl(' + ((i * 360) / Object.keys(stats.expensesByCategory).length) + ', 70%, 50%)'
      ),
    }],
  };

  const monthlyChartData = {
    labels: Object.keys(stats.monthlyData).slice(-6),
    datasets: [
      {
        label: 'Income',
        data: Object.values(stats.monthlyData).slice(-6).map(d => d.income),
        backgroundColor: '#4caf50',
      },
      {
        label: 'Expenses',
        data: Object.values(stats.monthlyData).slice(-6).map(d => d.expenses),
        backgroundColor: '#f44336',
      },
    ],
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Tabs
            value={timeRange}
            onChange={(_, newValue) => setTimeRange(newValue)}
            sx={{ mb: 2 }}
          >
            <Tab value="all" label="All Time" />
            <Tab value="thisMonth" label="This Month" />
            <Tab value="lastMonth" label="Last Month" />
          </Tabs>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Balance
              </Typography>
              <Typography variant="h5" component="div" color={stats.balance >= 0 ? 'success.main' : 'error.main'}>
                ${stats.balance.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Income
              </Typography>
              <Typography variant="h5" component="div" color="success.main">
                ${stats.income.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Expenses
              </Typography>
              <Typography variant="h5" component="div" color="error.main">
                ${stats.expenses.toFixed(2)}
              </Typography>
              {stats.expenses > 0 && (
                <Typography variant="body2" color="textSecondary">
                  Savings Rate: {((stats.income - stats.expenses) / stats.income * 100).toFixed(1)}%
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Tabs
            value={chartView}
            onChange={(_, newValue) => setChartView(newValue)}
            sx={{ mb: 2 }}
          >
            <Tab value="overview" label="Overview" />
            <Tab value="categories" label="Categories" />
            <Tab value="trends" label="Trends" />
          </Tabs>
        </Grid>

        {chartView === 'overview' && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Income vs Expenses
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Doughnut data={overviewChartData} options={{ maintainAspectRatio: false }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {chartView === 'categories' && (
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Expenses by Category
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Doughnut data={categoryChartData} options={{ maintainAspectRatio: false }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {chartView === 'trends' && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  6-Month Trend
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Bar
                    data={monthlyChartData}
                    options={{
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}