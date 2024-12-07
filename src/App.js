import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Tab, Tabs } from '@mui/material';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Summary from './components/Summary';
import {
  loadTransactions,
  addTransaction,
  deleteTransaction,
  getTransactionsByType
} from './data/transactions';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [tab, setTab] = useState(0);

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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Personal Finance Tracker
      </Typography>

      <Summary transactions={transactions} />
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={tab} 
          onChange={(e, newValue) => setTab(newValue)}
          centered
        >
          <Tab label="All" />
          <Tab label="Income" />
          <Tab label="Expenses" />
        </Tabs>
      </Box>

      <TransactionForm onSubmit={handleAddTransaction} />
      
      <TransactionList 
        transactions={filteredTransactions} 
        onDelete={handleDeleteTransaction}
      />
    </Container>
  );
}

export default App;
