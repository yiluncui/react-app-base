import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InfoIcon from '@mui/icons-material/Info';
import RecommendIcon from '@mui/icons-material/Recommend';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { alpha } from '@mui/material/styles';

export default function FinancialInsights({ transactions }) {
  const calculateInsights = () => {
    const monthlyData = transactions.reduce((acc, t) => {
      const month = t.date.substring(0, 7); // YYYY-MM
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

    const months = Object.keys(monthlyData).sort();
    const currentMonth = months[months.length - 1];
    const previousMonth = months[months.length - 2];

    const currentIncome = monthlyData[currentMonth]?.income || 0;
    const currentExpenses = monthlyData[currentMonth]?.expenses || 0;
    const previousIncome = monthlyData[previousMonth]?.income || 0;
    const previousExpenses = monthlyData[previousMonth]?.expenses || 0;

    const incomeChange = previousIncome ? ((currentIncome - previousIncome) / previousIncome) * 100 : 0;
    const expensesChange = previousExpenses ? ((currentExpenses - previousExpenses) / previousExpenses) * 100 : 0;
    const savingsRate = currentIncome ? ((currentIncome - currentExpenses) / currentIncome) * 100 : 0;

    // Category analysis
    const categorySpending = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        if (!acc[t.category]) acc[t.category] = 0;
        acc[t.category] += t.amount;
        return acc;
      }, {});

    const topExpenseCategories = Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return {
      currentIncome,
      currentExpenses,
      incomeChange,
      expensesChange,
      savingsRate,
      topExpenseCategories,
    };
  };

  const insights = calculateInsights();

  const getRecommendations = () => {
    const recommendations = [];

    if (insights.savingsRate < 20) {
      recommendations.push({
        type: 'warning',
        text: 'Your savings rate is below recommended 20%. Consider reducing non-essential expenses.',
      });
    }

    if (insights.expensesChange > 10) {
      recommendations.push({
        type: 'warning',
        text: 'Your expenses have increased significantly. Review your spending patterns.',
      });
    }

    if (insights.savingsRate >= 30) {
      recommendations.push({
        type: 'success',
        text: 'Great job! Your savings rate is above 30%. Consider investing the extra savings.',
      });
    }

    if (insights.incomeChange > 0) {
      recommendations.push({
        type: 'success',
        text: 'Your income has increased. Consider allocating the additional income to savings or investments.',
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  const MetricCard = ({ title, value, change, icon: Icon, color }) => (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(color, 0.1),
              color: color,
              mr: 2,
            }}
          >
            <Icon />
          </Box>
          <Typography variant="h6">{title}</Typography>
        </Box>

        <Typography variant="h4" sx={{ mb: 1, color: color }}>
          ${value.toLocaleString()}
        </Typography>

        {change !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip
              icon={change >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={`${change >= 0 ? '+' : ''}${change.toFixed(1)}%`}
              size="small"
              color={change >= 0 ? 'success' : 'error'}
              sx={{ mr: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              vs last month
            </Typography>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 150,
          height: 150,
          background: color,
          opacity: 0.05,
          borderRadius: '50%',
        }}
      />
    </Paper>
  );

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
        Financial Insights
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Monthly Income"
            value={insights.currentIncome}
            change={insights.incomeChange}
            icon={TrendingUpIcon}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Monthly Expenses"
            value={insights.currentExpenses}
            change={insights.expensesChange}
            icon={TrendingDownIcon}
            color="#f44336"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha('#2196f3', 0.1),
                    color: '#2196f3',
                    mr: 2,
                  }}
                >
                  <InfoIcon />
                </Box>
                <Typography variant="h6">Savings Rate</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(insights.savingsRate, 100)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha('#2196f3', 0.1),
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#2196f3',
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>

              <Typography variant="h4" sx={{ mb: 1, color: '#2196f3' }}>
                {insights.savingsRate.toFixed(1)}%
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Recommended: 20-30%
              </Typography>
            </Box>

            <Box
              sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 150,
                height: 150,
                background: '#2196f3',
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
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Recommendations
            </Typography>
            <List>
              {recommendations.map((rec, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {rec.type === 'warning' ? (
                      <WarningIcon color="warning" />
                    ) : (
                      <CheckCircleIcon color="success" />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={rec.text} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Top Expense Categories
            </Typography>
            <Grid container spacing={2}>
              {insights.topExpenseCategories.map(([category, amount]) => (
                <Grid item xs={12} md={4} key={category}>
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {category}
                    </Typography>
                    <Typography variant="h5" color="error">
                      ${amount.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}