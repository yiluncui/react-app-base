import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  Box,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import BarChartIcon from '@mui/icons-material/BarChart';
import { alpha } from '@mui/material/styles';

export default function QuickActions({ transactions, onClearTransactions }) {
  const downloadTransactions = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'transactions.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const uploadTransactions = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (Array.isArray(data)) {
            // Here you would typically validate the data structure
            // and then call a function to update the transactions
            console.log('Uploaded transactions:', data);
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const getInsights = () => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const savingsRate = totalIncome > 0 
      ? ((totalIncome - totalExpenses) / totalIncome) * 100 
      : 0;

    const biggestExpense = transactions
      .filter(t => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)[0];

    return {
      savingsRate,
      biggestExpense,
      transactionCount: transactions.length,
    };
  };

  const insights = getInsights();

  const quickActions = [
    {
      icon: FileDownloadIcon,
      title: 'Export Data',
      action: downloadTransactions,
      color: 'primary',
    },
    {
      icon: FileUploadIcon,
      title: 'Import Data',
      action: () => document.getElementById('upload-transactions').click(),
      color: 'secondary',
    },
    {
      icon: DeleteSweepIcon,
      title: 'Clear All',
      action: onClearTransactions,
      color: 'error',
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={8}>
        <Paper
          elevation={1}
          sx={{
            p: 3,
            height: '100%',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <BarChartIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
              Quick Insights
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box>
                <Typography variant="h4" sx={{ color: 'primary.main', mb: 1 }}>
                  {insights.savingsRate.toFixed(1)}%
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Savings Rate
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box>
                <Typography variant="h4" sx={{ color: 'primary.main', mb: 1 }}>
                  {insights.transactionCount}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Total Transactions
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box>
                <Typography variant="h4" sx={{ color: 'error.main', mb: 1 }}>
                  ${insights.biggestExpense?.amount.toFixed(2) || '0.00'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Biggest Expense
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Paper
          elevation={1}
          sx={{
            p: 3,
            height: '100%',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
            },
          }}
        >
          <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3 }}>
            Quick Actions
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {quickActions.map(({ icon: Icon, title, action, color }) => (
              <Button
                key={title}
                variant="contained"
                color={color}
                onClick={action}
                startIcon={<Icon />}
                sx={{
                  flex: 1,
                  minWidth: 120,
                  textTransform: 'none',
                  bgcolor: theme => alpha(theme.palette[color].main, 0.1),
                  color: `${color}.main`,
                  '&:hover': {
                    bgcolor: theme => alpha(theme.palette[color].main, 0.2),
                  },
                }}
              >
                {title}
              </Button>
            ))}
          </Box>
          <input
            type="file"
            id="upload-transactions"
            accept=".json"
            onChange={uploadTransactions}
            style={{ display: 'none' }}
          />
        </Paper>
      </Grid>
    </Grid>
  );
}