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
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  useMediaQuery,
  Toolbar,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import RepeatIcon from '@mui/icons-material/Repeat';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import CloseIcon from '@mui/icons-material/Close';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import AddTransaction from './components/AddTransaction';
import BudgetTracker from './components/BudgetTracker';
import RecurringTransactions from './components/RecurringTransactions';
import FinancialGoals from './components/FinancialGoals';
import ReportsAnalytics from './components/ReportsAnalytics';
import BillReminders from './components/BillReminders';
import { mockTransactions } from './data/mockData';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const drawerWidth = 240;

import AssessmentIcon from '@mui/icons-material/Assessment';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ReportsAnalytics from './components/ReportsAnalytics';
import BillReminders from './components/BillReminders';

const menuItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, id: 0 },
  { label: 'Transactions', icon: <ReceiptIcon />, id: 1 },
  { label: 'Budget', icon: <AccountBalanceWalletIcon />, id: 2 },
  { label: 'Financial Goals', icon: <TrackChangesIcon />, id: 3 },
  { label: 'Recurring', icon: <RepeatIcon />, id: 4 },
  { label: 'Bill Reminders', icon: <NotificationsActiveIcon />, id: 5 },
  { label: 'Reports', icon: <AssessmentIcon />, id: 6 },
  { label: 'Add Transaction', icon: <AddIcon />, id: 7 },
];

function TabPanel({ children, value, index }) {
  return value === index && <Box sx={{ py: 3 }}>{children}</Box>;
}

function App() {
  const [transactions, setTransactions] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Finance Tracker
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={currentTab === item.id}
              onClick={() => {
                setCurrentTab(item.id);
                if (isMobile) setMobileOpen(false);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              {menuItems[currentTab].label}
            </Typography>
          </Toolbar>
        </AppBar>

        <Box
          component="nav"
          sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        >
          <Drawer
            variant={isMobile ? 'temporary' : 'permanent'}
            open={isMobile ? mobileOpen : true}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { md: `calc(100% - ${drawerWidth}px)` },
            mt: 8,
            bgcolor: 'background.default',
          }}
        >
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
            <FinancialGoals transactions={transactions} />
          </TabPanel>

          <TabPanel value={currentTab} index={4}>
            <RecurringTransactions onAddTransaction={handleAddTransaction} />
          </TabPanel>

          <TabPanel value={currentTab} index={5}>
            <BillReminders onAddTransaction={handleAddTransaction} />
          </TabPanel>

          <TabPanel value={currentTab} index={6}>
            <ReportsAnalytics transactions={transactions} />
          </TabPanel>

          <TabPanel value={currentTab} index={7}>
            <AddTransaction onAddTransaction={handleAddTransaction} />
          </TabPanel>
        </Box>
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
