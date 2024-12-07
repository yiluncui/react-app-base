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
  Button,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { alpha } from '@mui/material/styles';
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
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

export default function FinancialReports({ transactions }) {
  const [period, setPeriod] = useState('month');
  const [reportType, setReportType] = useState('overview');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [reportData, setReportData] = useState(null);

  const periods = {
    week: { label: 'This Week', days: 7 },
    month: { label: 'This Month', days: 30 },
    quarter: { label: 'This Quarter', days: 90 },
    year: { label: 'This Year', days: 365 },
  };

  const reportTypes = {
    overview: 'Financial Overview',
    income: 'Income Analysis',
    expenses: 'Expense Analysis',
    comparison: 'Period Comparison',
  };

  useEffect(() => {
    generateReport();
  }, [period, reportType, transactions]);

  const generateReport = () => {
    const now = new Date();
    const startDate = new Date(now.getTime() - periods[period].days * 24 * 60 * 60 * 1000);
    
    const filteredTransactions = transactions.filter(t => 
      new Date(t.date) >= startDate && new Date(t.date) <= now
    );

    const periodData = {
      totalIncome: filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
      totalExpenses: filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
      transactions: filteredTransactions,
    };

    // Calculate daily totals
    const dailyData = filteredTransactions.reduce((acc, t) => {
      if (!acc[t.date]) {
        acc[t.date] = { income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        acc[t.date].income += t.amount;
      } else {
        acc[t.date].expenses += t.amount;
      }
      return acc;
    }, {});

    // Calculate category totals
    const categoryData = filteredTransactions.reduce((acc, t) => {
      if (!acc[t.type]) {
        acc[t.type] = {};
      }
      if (!acc[t.type][t.category]) {
        acc[t.type][t.category] = 0;
      }
      acc[t.type][t.category] += t.amount;
      return acc;
    }, { income: {}, expense: {} });

    setReportData({
      period: periodData,
      daily: dailyData,
      categories: categoryData,
    });
  };

  const handleExport = (format) => {
    // TODO: Implement export functionality
    console.log('Export as:', format);
    setMenuAnchor(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value, total) => {
    return ((value / total) * 100).toFixed(1) + '%';
  };

  const getChangeIndicator = (current, previous) => {
    const change = ((current - previous) / previous) * 100;
    const isPositive = change >= 0;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {isPositive ? (
          <TrendingUpIcon sx={{ color: 'success.main' }} />
        ) : (
          <TrendingDownIcon sx={{ color: 'error.main' }} />
        )}
        <Typography
          variant="body2"
          sx={{ color: isPositive ? 'success.main' : 'error.main' }}
        >
          {Math.abs(change).toFixed(1)}%
        </Typography>
      </Box>
    );
  };

  const renderOverviewReport = () => {
    if (!reportData) return null;

    const { period, categories } = reportData;
    const netIncome = period.totalIncome - period.totalExpenses;
    const savingsRate = (netIncome / period.totalIncome) * 100;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Alert
            severity={netIncome >= 0 ? 'success' : 'warning'}
            sx={{ mb: 3 }}
          >
            <Typography variant="h6">
              Net {netIncome >= 0 ? 'Income' : 'Loss'}: {formatCurrency(Math.abs(netIncome))}
            </Typography>
            <Typography variant="body2">
              Savings Rate: {savingsRate.toFixed(1)}%
            </Typography>
          </Alert>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Income Summary</Typography>
            <Typography variant="h4" sx={{ color: 'success.main', mb: 2 }}>
              {formatCurrency(period.totalIncome)}
            </Typography>
            {Object.entries(categories.income)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => (
                <Box key={category} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>{category}</Typography>
                    <Typography>{formatCurrency(amount)}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(amount / period.totalIncome) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha('#4caf50', 0.1),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'success.main',
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Expense Summary</Typography>
            <Typography variant="h4" sx={{ color: 'error.main', mb: 2 }}>
              {formatCurrency(period.totalExpenses)}
            </Typography>
            {Object.entries(categories.expense)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => (
                <Box key={category} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>{category}</Typography>
                    <Typography>{formatCurrency(amount)}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(amount / period.totalExpenses) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha('#f44336', 0.1),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'error.main',
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              ))}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.period.transactions
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 5)
                    .map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.category}
                            size="small"
                            sx={{
                              bgcolor: alpha(
                                transaction.type === 'income' ? '#4caf50' : '#f44336',
                                0.1
                              ),
                              color: transaction.type === 'income' ? 'success.main' : 'error.main',
                            }}
                          />
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell align="right">
                          <Typography
                            sx={{
                              color: transaction.type === 'income' ? 'success.main' : 'error.main',
                              fontWeight: 600,
                            }}
                          >
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderIncomeAnalysis = () => {
    if (!reportData) return null;

    const { daily } = reportData;
    const dates = Object.keys(daily).sort();
    
    const chartData = {
      labels: dates.map(date => new Date(date).toLocaleDateString()),
      datasets: [
        {
          label: 'Income',
          data: dates.map(date => daily[date].income),
          borderColor: '#4caf50',
          backgroundColor: alpha('#4caf50', 0.1),
          tension: 0.4,
          fill: true,
        },
      ],
    };

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Income Trends</Typography>
            <Box sx={{ height: 400 }}>
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: value => formatCurrency(value),
                      },
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderExpenseAnalysis = () => {
    if (!reportData) return null;

    const { categories } = reportData;
    const expenseCategories = Object.keys(categories.expense);
    const expenseAmounts = expenseCategories.map(cat => categories.expense[cat]);

    const chartData = {
      labels: expenseCategories,
      datasets: [
        {
          data: expenseAmounts,
          backgroundColor: [
            '#f44336',
            '#ff9800',
            '#ffc107',
            '#4caf50',
            '#2196f3',
            '#9c27b0',
            '#795548',
          ],
        },
      ],
    };

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Expense Distribution</Typography>
            <Box sx={{ height: 400 }}>
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: value => formatCurrency(value),
                      },
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ flex: 1, color: 'text.secondary' }}>
          Financial Reports
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={period}
              label="Period"
              onChange={(e) => setPeriod(e.target.value)}
            >
              {Object.entries(periods).map(([key, { label }]) => (
                <MenuItem key={key} value={key}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={reportType}
              label="Report Type"
              onChange={(e) => setReportType(e.target.value)}
            >
              {Object.entries(reportTypes).map(([key, label]) => (
                <MenuItem key={key} value={key}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem onClick={() => handleExport('pdf')}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export as PDF</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleExport('csv')}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export as CSV</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleExport('print')}>
            <ListItemIcon>
              <PrintIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Print Report</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleExport('share')}>
            <ListItemIcon>
              <ShareIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Share Report</ListItemText>
          </MenuItem>
        </Menu>
      </Box>

      {reportType === 'overview' && renderOverviewReport()}
      {reportType === 'income' && renderIncomeAnalysis()}
      {reportType === 'expenses' && renderExpenseAnalysis()}
    </Box>
  );
}