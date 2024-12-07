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
  useMediaQuery,
  Snackbar,
  Alert,
  Fab,
  Zoom,
  useScrollTrigger,
  Fade
} from '@mui/material';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Summary from './components/Summary';
import DashboardCharts from './components/DashboardCharts';
import TransactionStats from './components/TransactionStats';
import QuickActions from './components/QuickActions';
import BudgetTracker from './components/BudgetTracker';
import FinancialGoals from './components/FinancialGoals';
import FinancialInsights from './components/FinancialInsights';
import RecurringTransactions from './components/RecurringTransactions';
import InvestmentTracker from './components/InvestmentTracker';
import CashFlowForecast from './components/CashFlowForecast';
import TaxPlanner from './components/TaxPlanner';
import {
  loadTransactions,
  addTransaction,
  deleteTransaction,
  getTransactionsByType,
  saveTransactions
} from './data/transactions';
import { theme } from './theme';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddIcon from '@mui/icons-material/Add';

function ScrollTop() {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Zoom in={trigger}>
      <Box
        onClick={handleClick}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <Fab
          color="primary"
          size="small"
          aria-label="scroll back to top"
          sx={{
            boxShadow: theme => `0 0 20px ${theme.palette.primary.main}25`,
          }}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      </Box>
    </Zoom>
  );
}

function App() {
  const [transactions, setTransactions] = useState([]);
  const [tab, setTab] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    setTransactions(loadTransactions());
  }, []);

  const handleAddTransaction = (newTransaction) => {
    setTransactions(prevTransactions => 
      addTransaction(prevTransactions, newTransaction)
    );
    setShowForm(false);
    setSnackbar({
      open: true,
      message: 'Transaction added successfully',
      severity: 'success'
    });
  };

  const handleDeleteTransaction = (id) => {
    setTransactions(prevTransactions => 
      deleteTransaction(prevTransactions, id)
    );
    setSnackbar({
      open: true,
      message: 'Transaction deleted',
      severity: 'info'
    });
  };

  const handleClearTransactions = () => {
    setTransactions([]);
    saveTransactions([]);
    setSnackbar({
      open: true,
      message: 'All transactions cleared',
      severity: 'info'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
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
        <Container maxWidth="lg">
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
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons={isMobile ? "auto" : false}
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
              <Tab label="Dashboard" />
              <Tab label="Transactions" />
              <Tab label="Recurring" />
              <Tab label="Budgets" />
              <Tab label="Goals" />
              <Tab label="Investments" />
              <Tab label="Forecast" />
              <Tab label="Tax" />
              <Tab label="Insights" />
            </Tabs>
          </Paper>

          {/* Dashboard Tab */}
          {tab === 0 && (
            <>
              <QuickActions 
                transactions={transactions}
                onClearTransactions={handleClearTransactions}
              />
              {transactions.length > 0 && (
                <>
                  <DashboardCharts transactions={transactions} />
                  <TransactionStats transactions={transactions} />
                </>
              )}
            </>
          )}

          {/* Transactions Tab */}
          {tab === 1 && (
            <>
              <Paper 
                elevation={1} 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <Tabs 
                  value={tab === 1 ? 0 : 1}
                  onChange={(e, newValue) => setTab(newValue)}
                  variant={isMobile ? "fullWidth" : "standard"}
                  centered={!isMobile}
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

              <Fade in={showForm}>
                <Box>
                  {showForm && <TransactionForm onSubmit={handleAddTransaction} />}
                </Box>
              </Fade>
              
              <TransactionList 
                transactions={filteredTransactions} 
                onDelete={handleDeleteTransaction}
              />
            </>
          )}

          {/* Recurring Tab */}
          {tab === 2 && (
            <RecurringTransactions
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
            />
          )}

          {/* Budgets Tab */}
          {tab === 3 && (
            <BudgetTracker transactions={transactions} />
          )}

          {/* Goals Tab */}
          {tab === 4 && (
            <FinancialGoals transactions={transactions} />
          )}

          {/* Investments Tab */}
          {tab === 5 && (
            <InvestmentTracker />
          )}

          {/* Forecast Tab */}
          {tab === 6 && (
            <CashFlowForecast
              transactions={transactions}
              recurringTransactions={[]} // TODO: Add recurring transactions state
            />
          )}

          {/* Tax Tab */}
          {tab === 7 && (
            <TaxPlanner transactions={transactions} />
          )}

          {/* Insights Tab */}
          {tab === 8 && (
            <FinancialInsights transactions={transactions} />
          )}
        </Container>

        <Fab
          color="primary"
          aria-label="add transaction"
          onClick={() => setShowForm(!showForm)}
          sx={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            transform: showForm ? 'rotate(45deg)' : 'none',
            transition: 'transform 0.2s',
            boxShadow: theme => `0 0 20px ${theme.palette.primary.main}25`,
          }}
        >
          <AddIcon />
        </Fab>

        <ScrollTop />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;
