import { useFinance } from '../context/FinanceContext';
import { Paper, Typography, Grid, Box, Card, CardContent, Divider } from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  Repeat as RepeatIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ 
          backgroundColor: `${color}.lighter`,
          borderRadius: '50%',
          p: 1,
          mr: 2,
          display: 'flex'
        }}>
          {icon}
        </Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ mb: 1 }}>
        ${value.toLocaleString()}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const { transactions, categories, budgets, recurringTransactions } = useFinance();

  // Calculate current month's transactions
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const currentMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  // Calculate previous month's transactions
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const previousMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === previousMonth && date.getFullYear() === previousYear;
  });

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const previousMonthExpenses = previousMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseChange = previousMonthExpenses 
    ? ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses * 100).toFixed(1)
    : 0;

  // Calculate category insights
  const expensesByCategory = categories.expense.map(category => ({
    category,
    amount: transactions
      .filter(t => t.type === 'expense' && t.category === category)
      .reduce((sum, t) => sum + t.amount, 0),
    currentMonthAmount: currentMonthTransactions
      .filter(t => t.type === 'expense' && t.category === category)
      .reduce((sum, t) => sum + t.amount, 0),
    budget: budgets[category] || 0
  }));

  const pieData = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        data: [totalIncome, totalExpenses],
        backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: expensesByCategory.map(e => e.category),
    datasets: [
      {
        label: 'Expenses by Category',
        data: expensesByCategory.map(e => e.amount),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Find categories over budget
  const categoriesOverBudget = expensesByCategory
    .filter(cat => cat.currentMonthAmount > cat.budget && cat.budget > 0)
    .sort((a, b) => (b.currentMonthAmount - b.budget) - (a.currentMonthAmount - a.budget));

  // Calculate upcoming recurring expenses
  const upcomingRecurring = recurringTransactions
    .filter(rt => rt.type === 'expense')
    .reduce((sum, rt) => sum + rt.amount, 0);

  return (
    <Grid container spacing={3}>
      {/* Quick Stats */}
      <Grid item xs={12}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Current Balance"
              value={totalIncome - totalExpenses}
              icon={<AccountBalanceIcon color="primary" />}
              color="primary"
              subtitle="Total available funds"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Monthly Income"
              value={currentMonthIncome}
              icon={<TrendingUpIcon color="success" />}
              color="success"
              subtitle="This month's earnings"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Monthly Expenses"
              value={currentMonthExpenses}
              icon={<TrendingDownIcon color="error" />}
              color="error"
              subtitle={`${expenseChange}% vs last month`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Recurring Expenses"
              value={upcomingRecurring}
              icon={<RepeatIcon color="warning" />}
              color="warning"
              subtitle="Monthly commitments"
            />
          </Grid>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Expense Analysis
          </Typography>
          <Box sx={{ height: 300, mb: 2 }}>
            <Bar
              data={barData}
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
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Top Expense Categories
          </Typography>
          <Grid container spacing={2}>
            {expensesByCategory
              .sort((a, b) => b.currentMonthAmount - a.currentMonthAmount)
              .slice(0, 3)
              .map(cat => (
                <Grid item xs={12} sm={4} key={cat.category}>
                  <Typography variant="body2" color="text.secondary">
                    {cat.category}
                  </Typography>
                  <Typography variant="h6">
                    ${cat.currentMonthAmount}
                  </Typography>
                </Grid>
              ))}
          </Grid>
        </Paper>
      </Grid>

      {/* Insights and Alerts */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <WarningIcon color="warning" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Insights & Alerts
            </Typography>
          </Box>
          
          {/* Budget Alerts */}
          {categoriesOverBudget.length > 0 ? (
            <>
              <Typography variant="subtitle2" color="error" gutterBottom>
                Categories Over Budget:
              </Typography>
              {categoriesOverBudget.map(cat => (
                <Box key={cat.category} sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    {cat.category}: ${cat.currentMonthAmount} / ${cat.budget}
                  </Typography>
                  <Typography variant="body2" color="error">
                    Over by ${(cat.currentMonthAmount - cat.budget).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </>
          ) : (
            <Typography variant="body2" color="success.main" gutterBottom>
              All categories within budget! 🎉
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Savings Rate */}
          <Typography variant="subtitle2" gutterBottom>
            Monthly Savings Rate
          </Typography>
          <Typography variant="body2">
            {currentMonthIncome > 0 ? (
              `${(((currentMonthIncome - currentMonthExpenses) / currentMonthIncome) * 100).toFixed(1)}% of income saved`
            ) : (
              'No income recorded this month'
            )}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* Income vs Expenses */}
          <Typography variant="subtitle2" gutterBottom>
            Income Distribution
          </Typography>
          <Box sx={{ height: 200 }}>
            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}