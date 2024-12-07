import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Tab, 
  Tabs,
  ThemeProvider,
  CssBaseline,
  Paper,
  useMediaQuery
} from '@mui/material';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Summary from './components/Summary';
import {
  loadTransactions,
  addTransaction,
  deleteTransaction,
  getTransactionsByType
} from './data/transactions';
import { theme } from './theme';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [tab, setTab] = useState(0);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    setTransactions(loadTransactions());
  }, []);

  const handleAddTransaction = (newTransaction) => {
    setTransactions(prevTransactions => 
      addTransaction(prevTransactions, newTransaction)
    );
  };

  const handleDeleteTransaction = (id) => {
    setTransactions(prevTransactions => 
      deleteTransaction(prevTransactions, id)
    );
  };

  const filteredTransactions = tab === 0 
    ? transactions 
    : getTransactionsByType(transactions, tab === 1 ? 'income' : 'expense');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          minHeight: '100vh',
          bgcolor: 'background.default',
          py: { xs: 2, sm: 4 }
        }}
      >
        <Container maxWidth="md">
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              mb: 4
            }}
          >
            <AccountBalanceWalletIcon 
              sx={{ 
                fontSize: { xs: 32, sm: 40 },
                color: 'primary.main'
              }} 
            />
            <Typography 
              variant={isMobile ? "h4" : "h3"} 
              component="h1" 
              sx={{
                fontWeight: 600,
                background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Finance Tracker
            </Typography>
          </Box>

          <Summary transactions={transactions} />
          
          <Paper 
            elevation={1} 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <Tabs 
              value={tab} 
              onChange={(e, newValue) => setTab(newValue)}
              variant={isMobile ? "fullWidth" : "standard"}
              centered={!isMobile}
              sx={{
                bgcolor: 'background.paper',
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  py: 2,
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    color: 'primary.main',
                  },
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    All Transactions
                    {transactions.length > 0 && 
                      <Box
                        component="span"
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {transactions.length}
                      </Box>
                    }
                  </Box>
                }
              />
              <Tab 
                label="Income"
                sx={{
                  '&.Mui-selected': {
                    color: 'success.main',
                  },
                }}
              />
              <Tab 
                label="Expenses"
                sx={{
                  '&.Mui-selected': {
                    color: 'error.main',
                  },
                }}
              />
            </Tabs>
          </Paper>

          <TransactionForm onSubmit={handleAddTransaction} />
          
          <TransactionList 
            transactions={filteredTransactions} 
            onDelete={handleDeleteTransaction}
          />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
