import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Card,
  CardContent,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import BackupIcon from '@mui/icons-material/Backup';
import RestoreIcon from '@mui/icons-material/Restore';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { categories as defaultCategories } from '../data/mockData';

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

const defaultSettings = {
  currency: 'USD',
  theme: 'light',
  notifications: true,
  backupFrequency: 'weekly',
  savingsGoal: 20, // percentage
  monthlyBudgetAlert: 80, // percentage
  showDecimals: true,
  defaultView: 'dashboard',
};

const Settings = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [openDialog, setOpenDialog] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [newItem, setNewItem] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    // Load settings
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Load categories
    const savedCategories = localStorage.getItem('customCategories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      const initialCategories = defaultCategories.map(name => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        color: getRandomColor(),
        icon: 'default',
        type: name === 'Income' ? 'income' : 'expense',
      }));
      setCategories(initialCategories);
      localStorage.setItem('customCategories', JSON.stringify(initialCategories));
    }

    // Load accounts
    const savedAccounts = localStorage.getItem('accounts');
    if (savedAccounts) {
      setAccounts(JSON.parse(savedAccounts));
    }
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('settings', JSON.stringify(settings));
    showSnackbar('Settings saved successfully', 'success');
  };

  const handleAddCategory = () => {
    if (!newItem.name) return;

    const categoryId = newItem.name.toLowerCase().replace(/\s+/g, '-');
    const newCategory = {
      id: categoryId,
      name: newItem.name,
      color: newItem.color || getRandomColor(),
      icon: newItem.icon || 'default',
      type: newItem.type || 'expense',
    };

    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    localStorage.setItem('customCategories', JSON.stringify(updatedCategories));
    handleCloseDialog();
    showSnackbar('Category added successfully', 'success');
  };

  const handleEditCategory = () => {
    if (!editItem || !newItem.name) return;

    const updatedCategories = categories.map(cat =>
      cat.id === editItem.id
        ? {
            ...cat,
            name: newItem.name,
            color: newItem.color || cat.color,
            icon: newItem.icon || cat.icon,
            type: newItem.type || cat.type,
          }
        : cat
    );

    setCategories(updatedCategories);
    localStorage.setItem('customCategories', JSON.stringify(updatedCategories));
    handleCloseDialog();
    showSnackbar('Category updated successfully', 'success');
  };

  const handleDeleteCategory = (categoryId) => {
    const updatedCategories = categories.filter(cat => cat.id !== categoryId);
    setCategories(updatedCategories);
    localStorage.setItem('customCategories', JSON.stringify(updatedCategories));
    showSnackbar('Category deleted successfully', 'success');
  };

  const handleAddAccount = () => {
    if (!newItem.name || !newItem.type) return;

    const newAccount = {
      id: Date.now(),
      name: newItem.name,
      type: newItem.type,
      balance: parseFloat(newItem.balance) || 0,
      currency: newItem.currency || settings.currency,
      color: newItem.color || getRandomColor(),
      isDefault: accounts.length === 0,
    };

    const updatedAccounts = [...accounts, newAccount];
    setAccounts(updatedAccounts);
    localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
    handleCloseDialog();
    showSnackbar('Account added successfully', 'success');
  };

  const handleEditAccount = () => {
    if (!editItem || !newItem.name) return;

    const updatedAccounts = accounts.map(acc =>
      acc.id === editItem.id
        ? {
            ...acc,
            name: newItem.name,
            type: newItem.type || acc.type,
            balance: parseFloat(newItem.balance) ?? acc.balance,
            currency: newItem.currency || acc.currency,
            color: newItem.color || acc.color,
          }
        : acc
    );

    setAccounts(updatedAccounts);
    localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
    handleCloseDialog();
    showSnackbar('Account updated successfully', 'success');
  };

  const handleDeleteAccount = (accountId) => {
    const updatedAccounts = accounts.filter(acc => acc.id !== accountId);
    setAccounts(updatedAccounts);
    localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
    showSnackbar('Account deleted successfully', 'success');
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const exportData = {
        settings,
        categories,
        accounts,
        transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
        budgets: JSON.parse(localStorage.getItem('budgets') || '[]'),
        goals: JSON.parse(localStorage.getItem('financialGoals') || '[]'),
        billReminders: JSON.parse(localStorage.getItem('billReminders') || '[]'),
        recurringTransactions: JSON.parse(localStorage.getItem('recurringTransactions') || '[]'),
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSnackbar('Data exported successfully', 'success');
    } catch (error) {
      showSnackbar('Error exporting data', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (event) => {
    try {
      setIsImporting(true);
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          
          // Validate imported data structure
          if (!importedData.settings || !importedData.categories || !importedData.accounts) {
            throw new Error('Invalid backup file format');
          }

          // Import settings
          setSettings(importedData.settings);
          localStorage.setItem('settings', JSON.stringify(importedData.settings));

          // Import categories
          setCategories(importedData.categories);
          localStorage.setItem('customCategories', JSON.stringify(importedData.categories));

          // Import accounts
          setAccounts(importedData.accounts);
          localStorage.setItem('accounts', JSON.stringify(importedData.accounts));

          // Import other data
          if (importedData.transactions) {
            localStorage.setItem('transactions', JSON.stringify(importedData.transactions));
          }
          if (importedData.budgets) {
            localStorage.setItem('budgets', JSON.stringify(importedData.budgets));
          }
          if (importedData.goals) {
            localStorage.setItem('financialGoals', JSON.stringify(importedData.goals));
          }
          if (importedData.billReminders) {
            localStorage.setItem('billReminders', JSON.stringify(importedData.billReminders));
          }
          if (importedData.recurringTransactions) {
            localStorage.setItem('recurringTransactions', JSON.stringify(importedData.recurringTransactions));
          }

          showSnackbar('Data imported successfully', 'success');
        } catch (error) {
          showSnackbar('Error parsing import file', 'error');
        }
      };
      reader.readAsText(file);
    } catch (error) {
      showSnackbar('Error importing data', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const handleOpenDialog = (type, item = null) => {
    setOpenDialog(type);
    setEditItem(item);
    if (item) {
      setNewItem({ ...item });
    } else {
      setNewItem({});
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog('');
    setEditItem(null);
    setNewItem({});
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              General Settings
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={settings.currency}
                  label="Currency"
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                >
                  {currencies.map((currency) => (
                    <MenuItem key={currency.code} value={currency.code}>
                      {currency.symbol} - {currency.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={settings.theme}
                  label="Theme"
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="system">System Default</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications}
                    onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                  />
                }
                label="Enable Notifications"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.showDecimals}
                    onChange={(e) => setSettings({ ...settings, showDecimals: e.target.checked })}
                  />
                }
                label="Show Decimals"
              />

              <TextField
                label="Savings Goal (%)"
                type="number"
                value={settings.savingsGoal}
                onChange={(e) => setSettings({ ...settings, savingsGoal: parseInt(e.target.value) })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />

              <TextField
                label="Budget Alert Threshold (%)"
                type="number"
                value={settings.monthlyBudgetAlert}
                onChange={(e) => setSettings({ ...settings, monthlyBudgetAlert: parseInt(e.target.value) })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />

              <Button variant="contained" onClick={handleSaveSettings}>
                Save Settings
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Data Management */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Data Management
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<BackupIcon />}
                onClick={handleExportData}
                disabled={isExporting}
              >
                {isExporting ? (
                  <CircularProgress size={24} />
                ) : (
                  'Export Data Backup'
                )}
              </Button>

              <Button
                variant="outlined"
                component="label"
                startIcon={<RestoreIcon />}
                disabled={isImporting}
              >
                {isImporting ? (
                  <CircularProgress size={24} />
                ) : (
                  'Import Data Backup'
                )}
                <input
                  type="file"
                  hidden
                  accept=".json"
                  onChange={handleImportData}
                  onClick={(e) => e.target.value = null}
                />
              </Button>

              <Alert severity="info">
                Regular backups help protect your financial data. We recommend exporting a backup at least monthly.
              </Alert>
            </Box>
          </Paper>
        </Grid>

        {/* Category Management */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Categories
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog('category')}
              >
                Add Category
              </Button>
            </Box>

            <List>
              {categories.map((category) => (
                <ListItem
                  key={category.id}
                  secondaryAction={
                    <Box>
                      <Tooltip title="Edit">
                        <IconButton
                          edge="end"
                          onClick={() => handleOpenDialog('category', category)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={category.type === 'income'}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={category.name}
                    secondary={category.type}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: category.color,
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Account Management */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Accounts
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog('account')}
              >
                Add Account
              </Button>
            </Box>

            <Grid container spacing={2}>
              {accounts.map((account) => (
                <Grid item xs={12} sm={6} key={account.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" component="div">
                          {account.name}
                        </Typography>
                        <Box>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog('account', account)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteAccount(account.id)}
                              disabled={account.isDefault}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      <Typography color="text.secondary" gutterBottom>
                        {account.type}
                      </Typography>
                      <Typography variant="h5" component="div" color={account.color}>
                        {currencies.find(c => c.code === account.currency)?.symbol}
                        {account.balance.toFixed(2)}
                      </Typography>
                      {account.isDefault && (
                        <Typography variant="caption" color="primary">
                          Default Account
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Category Dialog */}
      <Dialog
        open={openDialog === 'category'}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editItem ? 'Edit Category' : 'Add Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Category Name"
              value={newItem.name || ''}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={newItem.type || 'expense'}
                label="Type"
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
              >
                <MenuItem value="expense">Expense</MenuItem>
                <MenuItem value="income">Income</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Color"
              type="color"
              value={newItem.color || '#000000'}
              onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ColorLensIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={editItem ? handleEditCategory : handleAddCategory}
            variant="contained"
            disabled={!newItem.name}
          >
            {editItem ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Account Dialog */}
      <Dialog
        open={openDialog === 'account'}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editItem ? 'Edit Account' : 'Add Account'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Account Name"
              value={newItem.name || ''}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Account Type</InputLabel>
              <Select
                value={newItem.type || ''}
                label="Account Type"
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
              >
                <MenuItem value="checking">Checking</MenuItem>
                <MenuItem value="savings">Savings</MenuItem>
                <MenuItem value="credit">Credit Card</MenuItem>
                <MenuItem value="investment">Investment</MenuItem>
                <MenuItem value="cash">Cash</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Initial Balance"
              type="number"
              value={newItem.balance || ''}
              onChange={(e) => setNewItem({ ...newItem, balance: e.target.value })}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountBalanceIcon />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                value={newItem.currency || settings.currency}
                label="Currency"
                onChange={(e) => setNewItem({ ...newItem, currency: e.target.value })}
              >
                {currencies.map((currency) => (
                  <MenuItem key={currency.code} value={currency.code}>
                    {currency.symbol} - {currency.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Color"
              type="color"
              value={newItem.color || '#000000'}
              onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ColorLensIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={editItem ? handleEditAccount : handleAddAccount}
            variant="contained"
            disabled={!newItem.name || !newItem.type}
          >
            {editItem ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};

export default Settings;