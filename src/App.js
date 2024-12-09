import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Tab,
  Tabs,
  AppBar,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Snackbar,
  Alert,
} from '@mui/material';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import AddTransaction from './components/AddTransaction';
import BudgetTracker from './components/BudgetTracker';
import { mockTransactions } from './data/mockData';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function TabPanel({ children, value, index }) {
  return value === index && <Box sx={{ py: 3 }}>{children}</Box>;
}

function App() {
  const [transactions, setTransactions] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    } else {
      setTransactions(mockTransactions);
      localStorage.setItem('transactions', JSON.stringify(mockTransactions));
    }
  }, []);

  const handleAddTransaction = (newTransaction) => {
    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    setSnackbar({
      open: true,
      message: 'Transaction added successfully',
      severity: 'success'
    });
  };

  const handleDeleteTransaction = (transactionId) => {
    const updatedTransactions = transactions.filter(t => t.id !== transactionId);
    setTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    setSnackbar({
      open: true,
      message: 'Transaction deleted successfully',
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static">
          <Container>
            <Typography variant="h6" component="div" sx={{ py: 2 }}>
              Personal Finance Tracker
            </Typography>
          </Container>
        </AppBar>
        
        <Container sx={{ mt: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', borderRadius: '4px 4px 0 0' }}>
            <Tabs 
              value={currentTab} 
              onChange={(e, newValue) => setCurrentTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Dashboard" />
              <Tab label="Transactions" />
              <Tab label="Budget" />
              <Tab label="Add Transaction" />
            </Tabs>
          </Box>

          <Box sx={{ bgcolor: 'background.paper', borderRadius: '0 0 4px 4px', p: 2 }}>
            <TabPanel value={currentTab} index={0}>
              <Dashboard transactions={transactions} />
            </TabPanel>

            <TabPanel value={currentTab} index={1}>
              <TransactionList 
                transactions={transactions}
                onDeleteTransaction={handleDeleteTransaction}
              />
            </TabPanel>

            <TabPanel value={currentTab} index={2}>
              <BudgetTracker transactions={transactions} />
            </TabPanel>

            <TabPanel value={currentTab} index={3}>
              <AddTransaction onAddTransaction={handleAddTransaction} />
            </TabPanel>
          </Box>
        </Container>
      </Box>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
