import React from 'react';
import { Paper, Typography, Grid, Box } from '@mui/material';
import { calculateTotalByType } from '../data/transactions';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export default function Summary({ transactions }) {
  const income = calculateTotalByType(transactions, 'income');
  const expenses = calculateTotalByType(transactions, 'expense');
  const balance = income - expenses;

  const cards = [
    {
      title: 'Income',
      amount: income,
      icon: TrendingUpIcon,
      color: 'success.main',
      lightColor: 'success.light',
      darkColor: 'success.dark'
    },
    {
      title: 'Expenses',
      amount: expenses,
      icon: TrendingDownIcon,
      color: 'error.main',
      lightColor: 'error.light',
      darkColor: 'error.dark'
    },
    {
      title: 'Balance',
      amount: balance,
      icon: AccountBalanceWalletIcon,
      color: balance >= 0 ? 'primary.main' : 'warning.main',
      lightColor: balance >= 0 ? 'primary.light' : 'warning.light',
      darkColor: balance >= 0 ? 'primary.dark' : 'warning.dark'
    }
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Grid item xs={12} sm={4} key={card.title}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                }
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  p: 2,
                  color: card.color,
                }}
              >
                <Icon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'text.secondary',
                    mb: 1,
                    fontWeight: 500
                  }}
                >
                  {card.title}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    color: card.color,
                    fontWeight: 600,
                    mb: 1
                  }}
                >
                  ${Math.abs(card.amount).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 500
                  }}
                >
                  {card.title === 'Balance' 
                    ? `Net ${balance >= 0 ? 'Savings' : 'Spending'}`
                    : `Total ${card.title.toLowerCase()} this period`}
                </Typography>
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  width: 120,
                  height: 120,
                  background: card.lightColor,
                  opacity: 0.1,
                  borderRadius: '50%'
                }}
              />
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
}