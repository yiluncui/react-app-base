import { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Tooltip,
  IconButton,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
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

const InsightCard = ({ title, value, subtitle, icon, color, trend, trendValue }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ 
          backgroundColor: `${color}.lighter`,
          borderRadius: '50%',
          p: 1,
          display: 'flex'
        }}>
          {icon}
        </Box>
      </Box>
      <Typography variant="h4" component="div" gutterBottom>
        {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {trend && (
          <Chip
            size="small"
            icon={trend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
            label={`${trendValue}%`}
            color={trend === 'up' ? 'success' : 'error'}
          />
        )}
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

export default function FinancialInsights() {
  const { transactions, goals, budgets } = useFinance();

  // Calculate monthly spending trends
  const monthlyData = useMemo(() => {
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear(),
        income: 0,
        expenses: 0,
        date: date,
      };
    }).reverse();

    transactions.forEach(transaction => {
      const transDate = new Date(transaction.date);
      const monthData = last12Months.find(
        m => m.date.getMonth() === transDate.getMonth() && m.date.getFullYear() === transDate.getFullYear()
      );
      if (monthData) {
        if (transaction.type === 'income') {
          monthData.income += transaction.amount;
        } else {
          monthData.expenses += transaction.amount;
        }
      }
    });

    return last12Months;
  }, [transactions]);

  // Calculate key metrics
  const metrics = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthData = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const previousMonthData = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === (currentMonth - 1) && date.getFullYear() === currentYear;
    });

    const currentIncome = currentMonthData
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const currentExpenses = currentMonthData
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const previousIncome = previousMonthData
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const previousExpenses = previousMonthData
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const incomeTrend = previousIncome ? ((currentIncome - previousIncome) / previousIncome * 100).toFixed(1) : 0;
    const expenseTrend = previousExpenses ? ((currentExpenses - previousExpenses) / previousExpenses * 100).toFixed(1) : 0;

    // Calculate savings rate
    const totalIncome = currentMonthData
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const savingsRate = totalIncome ? ((totalIncome - currentExpenses) / totalIncome * 100).toFixed(1) : 0;

    // Calculate budget utilization
    const budgetUtilization = Object.entries(budgets).map(([category, budget]) => {
      const spent = currentMonthData
        .filter(t => t.type === 'expense' && t.category === category)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        category,
        budget,
        spent,
        percentage: (spent / budget) * 100,
      };
    });

    // Calculate recurring expenses
    const recurringExpenses = transactions
      .filter(t => t.type === 'expense' && t.tags?.includes('recurring'))
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      currentIncome,
      currentExpenses,
      incomeTrend,
      expenseTrend,
      savingsRate,
      budgetUtilization,
      recurringExpenses,
    };
  }, [transactions, budgets]);

  const chartData = {
    labels: monthlyData.map(d => `${d.month} ${d.year}`),
    datasets: [
      {
        label: 'Income',
        data: monthlyData.map(d => d.income),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: monthlyData.map(d => d.expenses),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`,
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
    <Box>
      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12} md={6} lg={3}>
          <InsightCard
            title="Monthly Income"
            value={metrics.currentIncome}
            subtitle="vs. last month"
            icon={<TrendingUpIcon color="success" />}
            color="success"
            trend={metrics.incomeTrend > 0 ? 'up' : 'down'}
            trendValue={Math.abs(metrics.incomeTrend)}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <InsightCard
            title="Monthly Expenses"
            value={metrics.currentExpenses}
            subtitle="vs. last month"
            icon={<TrendingDownIcon color="error" />}
            color="error"
            trend={metrics.expenseTrend > 0 ? 'up' : 'down'}
            trendValue={Math.abs(metrics.expenseTrend)}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <InsightCard
            title="Savings Rate"
            value={`${metrics.savingsRate}%`}
            subtitle="of monthly income"
            icon={<TrendingUpIcon color="info" />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <InsightCard
            title="Fixed Expenses"
            value={metrics.recurringExpenses}
            subtitle="recurring monthly"
            icon={<WarningIcon color="warning" />}
            color="warning"
          />
        </Grid>

        {/* Income vs Expenses Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Income vs Expenses Trend</Typography>
              <Tooltip title="Shows your income and expenses over the last 12 months">
                <IconButton size="small">
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ height: 400 }}>
              <Line data={chartData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* Budget Utilization */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Budget Utilization
            </Typography>
            <Grid container spacing={2}>
              {metrics.budgetUtilization.map(({ category, budget, spent, percentage }) => (
                <Grid item xs={12} sm={6} md={4} key={category}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2">{category}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${spent.toLocaleString()} / ${budget.toLocaleString()}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(percentage, 100)}
                      color={percentage > 100 ? 'error' : percentage > 80 ? 'warning' : 'primary'}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {percentage > 100 ? 'Over budget' : `${percentage.toFixed(1)}% used`}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Goal Progress */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Financial Goals Progress
            </Typography>
            <Grid container spacing={2}>
              {goals.map(goal => {
                const progress = goal.type === 'savings'
                  ? transactions
                      .filter(t => t.tags?.includes(`goal:${goal.id}`))
                      .reduce((sum, t) => sum + t.amount, 0)
                  : transactions
                      .filter(t => t.type === 'expense' && t.category === goal.category)
                      .reduce((sum, t) => sum + t.amount, 0);
                
                const progressPercent = (progress / goal.targetAmount) * 100;
                const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                const isExpired = daysLeft < 0;
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={goal.id}>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2">{goal.name}</Typography>
                        <Chip
                          size="small"
                          label={isExpired ? 'Expired' : `${daysLeft} days left`}
                          color={isExpired ? 'error' : daysLeft < 7 ? 'warning' : 'default'}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(progressPercent, 100)}
                          sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                          color={progressPercent >= 100 ? 'success' : isExpired ? 'error' : 'primary'}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {progressPercent.toFixed(0)}%
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        ${progress.toLocaleString()} of ${goal.targetAmount.toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}