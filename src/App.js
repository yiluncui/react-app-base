import { useState, useEffect } from 'react';
import { Box, Container, SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import RepeatIcon from '@mui/icons-material/Repeat';
import FlagIcon from '@mui/icons-material/Flag';
import StorageIcon from '@mui/icons-material/Storage';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import CategoryManager from './components/CategoryManager';
import BudgetManager from './components/BudgetManager';
import RecurringTransactions from './components/RecurringTransactions';
import GoalsManager from './components/GoalsManager';
import DataManager from './components/DataManager';
import { loadTransactions, addTransaction, deleteTransaction } from './utils/storage';
import { processRecurringTransactions } from './utils/recurring';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isBudgetManagerOpen, setIsBudgetManagerOpen] = useState(false);
  const [isRecurringOpen, setIsRecurringOpen] = useState(false);
  const [isGoalsOpen, setIsGoalsOpen] = useState(false);
  const [isDataManagerOpen, setIsDataManagerOpen] = useState(false);
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);

  useEffect(() => {
    setTransactions(loadTransactions());
  }, []);

  // Process recurring transactions daily
  useEffect(() => {
    const checkRecurring = () => {
      processRecurringTransactions([], addTransaction);
    };

    // Check on mount and set up daily check
    checkRecurring();
    const interval = setInterval(checkRecurring, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
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

  const handleDataImported = () => {
    setTransactions(loadTransactions());
    setIsDataManagerOpen(false);
  };

  const actions = [
    { icon: <AddIcon />, name: 'Add Transaction', onClick: () => setIsFormOpen(true) },
    { icon: <CategoryIcon />, name: 'Manage Categories', onClick: () => setIsCategoryManagerOpen(true) },
    { icon: <AccountBalanceWalletIcon />, name: 'Manage Budgets', onClick: () => setIsBudgetManagerOpen(true) },
    { icon: <RepeatIcon />, name: 'Recurring Transactions', onClick: () => setIsRecurringOpen(true) },
    { icon: <FlagIcon />, name: 'Financial Goals', onClick: () => setIsGoalsOpen(true) },
    { icon: <StorageIcon />, name: 'Import/Export Data', onClick: () => setIsDataManagerOpen(true) },
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
        <RecurringTransactions
          open={isRecurringOpen}
          onClose={() => setIsRecurringOpen(false)}
        />
        <GoalsManager
          open={isGoalsOpen}
          onClose={() => setIsGoalsOpen(false)}
          transactions={transactions}
        />
        <DataManager
          open={isDataManagerOpen}
          onClose={() => setIsDataManagerOpen(false)}
          onDataImported={handleDataImported}
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
