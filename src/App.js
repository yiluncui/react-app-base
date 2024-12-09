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
} from '@mui/material';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import AddTransaction from './components/AddTransaction';
import { mockTransactions } from './data/mockData';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});

function TabPanel({ children, value, index }) {
  return value === index && <Box sx={{ py: 3 }}>{children}</Box>;
}

function App() {
  const [transactions, setTransactions] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);

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
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Container>
            <Typography variant="h6" component="div" sx={{ py: 2 }}>
              Personal Finance Tracker
            </Typography>
          </Container>
        </AppBar>
        
        <Container sx={{ mt: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
              <Tab label="Dashboard" />
              <Tab label="Transactions" />
              <Tab label="Add Transaction" />
            </Tabs>
          </Box>

          <TabPanel value={currentTab} index={0}>
            <Dashboard transactions={transactions} />
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            <TransactionList transactions={transactions} />
          </TabPanel>

          <TabPanel value={currentTab} index={2}>
            <AddTransaction onAddTransaction={handleAddTransaction} />
          </TabPanel>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
