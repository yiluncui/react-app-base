import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  AlertTitle,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TimelineIcon from '@mui/icons-material/Timeline';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SavingsIcon from '@mui/icons-material/Savings';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';

const FinancialInsights = ({ transactions, budgets, goals }) => {
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [healthScore, setHealthScore] = useState(0);

  const financialMetrics = useMemo(() => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const yearStart = new Date(today.getFullYear(), 0, 1);

    // Filter transactions
    const monthlyTransactions = transactions.filter(t => new Date(t.date) >= monthStart);
    const yearlyTransactions = transactions.filter(t => new Date(t.date) >= yearStart);

    // Calculate metrics
    const monthlyIncome = monthlyTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = Math.abs(
      monthlyTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0)
    );

    const yearlyIncome = yearlyTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const yearlyExpenses = Math.abs(
      yearlyTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0)
    );

    // Calculate category spending
    const categorySpending = monthlyTransactions
      .filter(t => t.amount < 0)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
      }, {});

    // Calculate savings rate
    const monthlySavingsRate = monthlyIncome > 0
      ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
      : 0;

    const yearlySavingsRate = yearlyIncome > 0
      ? ((yearlyIncome - yearlyExpenses) / yearlyIncome) * 100
      : 0;

    // Calculate budget adherence
    const budgetAdherence = Object.entries(budgets || {}).map(([category, budget]) => {
      const spent = categorySpending[category] || 0;
      const percentage = (spent / budget) * 100;
      return {
        category,
        budget,
        spent,
        percentage,
        status: percentage > 100 ? 'exceeded' : percentage > 80 ? 'warning' : 'good',
      };
    });

    // Calculate recurring expenses
    const recurringExpenses = monthlyTransactions
      .filter(t => t.amount < 0)
      .reduce((acc, t) => {
        const key = `${t.description}-${t.amount}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

    const potentialRecurring = Object.entries(recurringExpenses)
      .filter(([, count]) => count > 1)
      .map(([key]) => {
        const [description, amount] = key.split('-');
        return { description, amount: Math.abs(parseFloat(amount)) };
      });

    return {
      monthlyIncome,
      monthlyExpenses,
      yearlyIncome,
      yearlyExpenses,
      monthlySavingsRate,
      yearlySavingsRate,
      categorySpending,
      budgetAdherence,
      potentialRecurring,
    };
  }, [transactions, budgets]);

  useEffect(() => {
    generateInsights();
  }, [financialMetrics]);

  const generateInsights = () => {
    setIsLoading(true);
    try {
      const newInsights = [];
      const newRecommendations = [];

      // Savings Rate Analysis
      if (financialMetrics.monthlySavingsRate < 20) {
        newInsights.push({
          type: 'warning',
          title: 'Low Savings Rate',
          description: `Your current monthly savings rate is ${financialMetrics.monthlySavingsRate.toFixed(1)}%. Consider increasing your savings to reach the recommended 20%.`,
          icon: <SavingsIcon />,
        });
        newRecommendations.push({
          priority: 'high',
          action: 'Increase monthly savings rate to at least 20%',
          description: 'Review expenses and identify areas where you can cut back.',
          impact: 'Improved financial security and faster goal achievement',
        });
      } else {
        newInsights.push({
          type: 'success',
          title: 'Healthy Savings Rate',
          description: `Great job! Your monthly savings rate of ${financialMetrics.monthlySavingsRate.toFixed(1)}% is above the recommended minimum.`,
          icon: <CheckCircleIcon />,
        });
      }

      // Budget Analysis
      const exceededBudgets = financialMetrics.budgetAdherence.filter(b => b.status === 'exceeded');
      if (exceededBudgets.length > 0) {
        newInsights.push({
          type: 'warning',
          title: 'Budget Alerts',
          description: `You've exceeded your budget in ${exceededBudgets.length} categories.`,
          icon: <WarningIcon />,
        });
        newRecommendations.push({
          priority: 'high',
          action: 'Review and adjust budgets',
          description: 'Analyze overspending categories and set realistic budget limits.',
          impact: 'Better spending control and financial planning',
        });
      }

      // Recurring Expenses
      if (financialMetrics.potentialRecurring.length > 0) {
        newInsights.push({
          type: 'info',
          title: 'Recurring Expenses Detected',
          description: `Found ${financialMetrics.potentialRecurring.length} potential recurring expenses that could be optimized.`,
          icon: <TimelineIcon />,
        });
        newRecommendations.push({
          priority: 'medium',
          action: 'Review recurring expenses',
          description: 'Look for opportunities to reduce or eliminate unnecessary subscriptions.',
          impact: 'Reduced monthly expenses and increased savings',
        });
      }

      // Income Stability
      const incomeVariability = Math.abs(
        (financialMetrics.monthlyIncome - (financialMetrics.yearlyIncome / 12)) /
        (financialMetrics.yearlyIncome / 12)
      ) * 100;

      if (incomeVariability > 20) {
        newInsights.push({
          type: 'warning',
          title: 'Variable Income',
          description: 'Your monthly income shows significant variation. Consider building a larger emergency fund.',
          icon: <ShowChartIcon />,
        });
        newRecommendations.push({
          priority: 'medium',
          action: 'Build emergency fund',
          description: 'Aim for 6-9 months of expenses due to income variability.',
          impact: 'Increased financial security',
        });
      }

      // Expense Categories Analysis
      const topExpenseCategories = Object.entries(financialMetrics.categorySpending)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

      newInsights.push({
        type: 'info',
        title: 'Top Expense Categories',
        description: `Your highest spending categories are: ${topExpenseCategories.map(([cat]) => cat).join(', ')}`,
        icon: <LocalAtmIcon />,
      });

      // Calculate Financial Health Score
      let score = 100;
      if (financialMetrics.monthlySavingsRate < 20) score -= 20;
      if (exceededBudgets.length > 0) score -= 15 * exceededBudgets.length;
      if (incomeVariability > 20) score -= 10;
      if (financialMetrics.potentialRecurring.length > 3) score -= 10;

      setHealthScore(Math.max(0, score));
      setInsights(newInsights);
      setRecommendations(newRecommendations);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Financial Insights
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Financial Health Score */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Financial Health Score</Typography>
                <Tooltip title="Based on savings rate, budget adherence, and spending patterns">
                  <IconButton size="small">
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress
                    variant="determinate"
                    value={healthScore}
                    size={80}
                    color={healthScore > 80 ? 'success' : healthScore > 60 ? 'warning' : 'error'}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h6" component="div">
                      {healthScore}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body1" color="text.secondary">
                    {healthScore > 80
                      ? 'Excellent financial health'
                      : healthScore > 60
                      ? 'Good financial health, with room for improvement'
                      : 'Financial health needs attention'}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Key Metrics */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Key Metrics
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUpIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Monthly Income"
                    secondary={`$${financialMetrics.monthlyIncome.toFixed(2)}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TrendingDownIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Monthly Expenses"
                    secondary={`$${financialMetrics.monthlyExpenses.toFixed(2)}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SavingsIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Monthly Savings Rate"
                    secondary={`${financialMetrics.monthlySavingsRate.toFixed(1)}%`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AutoGraphIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Yearly Savings Rate"
                    secondary={`${financialMetrics.yearlySavingsRate.toFixed(1)}%`}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Budget Status */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Budget Status
              </Typography>
              <List>
                {financialMetrics.budgetAdherence.map((budget) => (
                  <ListItem key={budget.category}>
                    <ListItemText
                      primary={budget.category}
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">
                              ${budget.spent.toFixed(2)} of ${budget.budget.toFixed(2)}
                            </Typography>
                            <Typography
                              variant="body2"
                              color={
                                budget.status === 'exceeded'
                                  ? 'error.main'
                                  : budget.status === 'warning'
                                  ? 'warning.main'
                                  : 'success.main'
                              }
                            >
                              {budget.percentage.toFixed(1)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(budget.percentage, 100)}
                            color={
                              budget.status === 'exceeded'
                                ? 'error'
                                : budget.status === 'warning'
                                ? 'warning'
                                : 'success'
                            }
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Insights */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Insights & Recommendations
            </Typography>
            <Grid container spacing={2}>
              {insights.map((insight, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Alert
                    severity={insight.type}
                    icon={insight.icon}
                    sx={{ height: '100%' }}
                  >
                    <AlertTitle>{insight.title}</AlertTitle>
                    {insight.description}
                  </Alert>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Recommendations */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Action Items
              </Typography>
              <List>
                {recommendations.map((rec, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon>
                        {rec.priority === 'high' ? (
                          <PriorityHighIcon color="error" />
                        ) : (
                          <InfoIcon color="primary" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {rec.action}
                            <Chip
                              label={rec.priority}
                              size="small"
                              color={rec.priority === 'high' ? 'error' : 'primary'}
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {rec.description}
                            </Typography>
                            <Typography variant="body2" color="primary">
                              Impact: {rec.impact}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < recommendations.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default FinancialInsights;