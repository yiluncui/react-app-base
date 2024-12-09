import { useState, useEffect } from 'react';
import { Box, Container, Fab, SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import CategoryManager from './components/CategoryManager';
import BudgetManager from './components/BudgetManager';
import { loadTransactions, addTransaction, deleteTransaction } from './utils/storage';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isBudgetManagerOpen, setIsBudgetManagerOpen] = useState(false);
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);

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

  const actions = [
    { icon: <AddIcon />, name: 'Add Transaction', onClick: () => setIsFormOpen(true) },
    { icon: <CategoryIcon />, name: 'Manage Categories', onClick: () => setIsCategoryManagerOpen(true) },
    { icon: <AccountBalanceWalletIcon />, name: 'Manage Budgets', onClick: () => setIsBudgetManagerOpen(true) },
  ];

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
        <CategoryManager
          open={isCategoryManagerOpen}
          onClose={() => setIsCategoryManagerOpen(false)}
        />
        <BudgetManager
          open={isBudgetManagerOpen}
          onClose={() => setIsBudgetManagerOpen(false)}
          transactions={transactions}
        />
        <SpeedDial
          ariaLabel="Finance Actions"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
          onClose={() => setIsSpeedDialOpen(false)}
          onOpen={() => setIsSpeedDialOpen(true)}
          open={isSpeedDialOpen}
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              tooltipOpen
              onClick={() => {
                action.onClick();
                setIsSpeedDialOpen(false);
              }}
            />
          ))}
        </SpeedDial>
      </Container>
    </Box>
  );
}

export default App;
