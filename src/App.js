import { Container, CssBaseline, Typography, Box } from '@mui/material';
import { FinanceProvider } from './context/FinanceContext';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import BudgetTracker from './components/BudgetTracker';

function App() {
  return (
    <FinanceProvider>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Personal Finance Tracker
          </Typography>
          <Dashboard />
          <TransactionList />
          <BudgetTracker />
        </Box>
      </Container>
    </FinanceProvider>
  );
}

export default App;
