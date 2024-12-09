import { Container, CssBaseline, Typography, Box, Grid, Paper, Tab, Tabs } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { FinanceProvider } from './context/FinanceContext';
import theme from './theme';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import BudgetTracker from './components/BudgetTracker';
import CategoryManager from './components/CategoryManager';
import MonthlyTrends from './components/MonthlyTrends';
import RecurringTransactions from './components/RecurringTransactions';
import FinancialGoals from './components/FinancialGoals';
import FinancialInsights from './components/FinancialInsights';
import { useState } from 'react';

function TabPanel({ children, value, index }) {
  return value === index && children;
}

function App() {
  const [tabValue, setTabValue] = useState(0);

  return (
    <ThemeProvider theme={theme}>
      <FinanceProvider>
        <CssBaseline />
        <Container maxWidth="lg">
          <Box sx={{ my: 4 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Personal Finance Tracker
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track your income, expenses, and financial goals all in one place
            </Typography>
          </Paper>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Overview" />
              <Tab label="Insights" />
              <Tab label="Transactions" />
              <Tab label="Recurring" />
              <Tab label="Budget" />
              <Tab label="Goals" />
              <Tab label="Categories" />
              <Tab label="Trends" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Dashboard />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Paper sx={{ p: 2 }}>
              <FinancialInsights />
            </Paper>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <TransactionList />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <RecurringTransactions />
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <BudgetTracker />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={5}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FinancialGoals />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={6}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <CategoryManager />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={7}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <MonthlyTrends />
              </Grid>
            </Grid>
          </TabPanel>
        </Box>
      </Container>
    </FinanceProvider>
    </ThemeProvider>
  );
}

export default App;
