import { useState, useEffect } from 'react';
import { Box, Container, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import { loadTransactions, addTransaction, deleteTransaction } from './utils/storage';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    setTransactions(loadTransactions());
  }, []);

  const handleAddTransaction = (newTransaction) => {
    const updatedTransactions = addTransaction(newTransaction);
    setTransactions(updatedTransactions);
    setIsFormOpen(false);
  };

  const handleDeleteTransaction = (transactionId) => {
    const updatedTransactions = deleteTransaction(transactionId);
    setTransactions(updatedTransactions);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container>
        <Dashboard transactions={transactions} />
        <TransactionList 
          transactions={transactions} 
          onDelete={handleDeleteTransaction}
        />
        <TransactionForm
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleAddTransaction}
        />
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setIsFormOpen(true)}
        >
          <AddIcon />
        </Fab>
      </Container>
    </Box>
  );
}

export default App;
