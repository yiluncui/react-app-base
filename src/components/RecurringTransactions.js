import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import RepeatIcon from '@mui/icons-material/Repeat';
import { categories } from '../data/mockData';

const frequencies = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const RecurringTransactions = ({ onAddTransaction }) => {
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [newTransaction, setNewTransaction] = useState({
    id: null,
    description: '',
    amount: '',
    category: '',
    frequency: 'monthly',
    startDate: '',
    active: true,
    lastProcessed: null,
  });

  useEffect(() => {
    const savedTransactions = localStorage.getItem('recurringTransactions');
    if (savedTransactions) {
      setRecurringTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  useEffect(() => {
    // Check and process recurring transactions
    const today = new Date();
    const processedTransactions = recurringTransactions.map(transaction => {
      if (!transaction.active) return transaction;

      const lastProcessed = transaction.lastProcessed ? new Date(transaction.lastProcessed) : null;
      const shouldProcess = shouldProcessTransaction(transaction, lastProcessed, today);

      if (shouldProcess) {
        // Add the transaction
        const newTransactionEntry = {
          id: Date.now(),
          description: transaction.description,
          amount: parseFloat(transaction.amount),
          category: transaction.category,
          date: today.toISOString().split('T')[0],
        };
        onAddTransaction(newTransactionEntry);

        // Update last processed date
        return { ...transaction, lastProcessed: today.toISOString() };
      }

      return transaction;
    });

    if (JSON.stringify(processedTransactions) !== JSON.stringify(recurringTransactions)) {
      setRecurringTransactions(processedTransactions);
      localStorage.setItem('recurringTransactions', JSON.stringify(processedTransactions));
    }
  }, [recurringTransactions, onAddTransaction]);

  const shouldProcessTransaction = (transaction, lastProcessed, today) => {
    if (!lastProcessed) return true;

    const daysSinceLastProcess = Math.floor((today - lastProcessed) / (1000 * 60 * 60 * 24));

    switch (transaction.frequency) {
      case 'weekly':
        return daysSinceLastProcess >= 7;
      case 'biweekly':
        return daysSinceLastProcess >= 14;
      case 'monthly':
        return daysSinceLastProcess >= 30;
      case 'quarterly':
        return daysSinceLastProcess >= 90;
      case 'yearly':
        return daysSinceLastProcess >= 365;
      default:
        return false;
    }
  };

  const handleOpenDialog = (transaction = null) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setNewTransaction({ ...transaction });
    } else {
      setEditingTransaction(null);
      setNewTransaction({
        id: Date.now(),
        description: '',
        amount: '',
        category: '',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        active: true,
        lastProcessed: null,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTransaction(null);
    setNewTransaction({
      id: null,
      description: '',
      amount: '',
      category: '',
      frequency: 'monthly',
      startDate: '',
      active: true,
      lastProcessed: null,
    });
  };

  const handleSaveTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.category) {
      return;
    }

    const updatedTransactions = editingTransaction
      ? recurringTransactions.map(t => (t.id === editingTransaction.id ? { ...newTransaction } : t))
      : [...recurringTransactions, { ...newTransaction }];

    setRecurringTransactions(updatedTransactions);
    localStorage.setItem('recurringTransactions', JSON.stringify(updatedTransactions));
    handleCloseDialog();
  };

  const handleDeleteTransaction = (transactionId) => {
    const updatedTransactions = recurringTransactions.filter(t => t.id !== transactionId);
    setRecurringTransactions(updatedTransactions);
    localStorage.setItem('recurringTransactions', JSON.stringify(updatedTransactions));
  };

  const handleToggleActive = (transactionId) => {
    const updatedTransactions = recurringTransactions.map(t =>
      t.id === transactionId ? { ...t, active: !t.active } : t
    );
    setRecurringTransactions(updatedTransactions);
    localStorage.setItem('recurringTransactions', JSON.stringify(updatedTransactions));
  };

  const getNextProcessingDate = (transaction) => {
    if (!transaction.lastProcessed) return 'Next run: Today';

    const lastProcessed = new Date(transaction.lastProcessed);
    let nextDate = new Date(lastProcessed);

    switch (transaction.frequency) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'biweekly':
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        return 'Unknown';
    }

    return `Next run: ${nextDate.toLocaleDateString()}`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Recurring Transactions</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Recurring Transaction
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Frequency</TableCell>
              <TableCell>Next Run</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recurringTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.description}</TableCell>
                <TableCell
                  sx={{
                    color: parseFloat(transaction.amount) < 0 ? 'error.main' : 'success.main',
                  }}
                >
                  ${Math.abs(parseFloat(transaction.amount)).toFixed(2)}
                </TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell>
                  <Chip
                    icon={<RepeatIcon />}
                    label={frequencies.find(f => f.value === transaction.frequency)?.label}
                    size="small"
                  />
                </TableCell>
                <TableCell>{getNextProcessingDate(transaction)}</TableCell>
                <TableCell>
                  <Switch
                    checked={transaction.active}
                    onChange={() => handleToggleActive(transaction.id)}
                    color="primary"
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => handleOpenDialog(transaction)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {recurringTransactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary">
                    No recurring transactions set up
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingTransaction ? 'Edit Recurring Transaction' : 'Create Recurring Transaction'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Description"
              value={newTransaction.description}
              onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
              fullWidth
            />

            <TextField
              label="Amount"
              type="number"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
              fullWidth
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newTransaction.category}
                label="Category"
                onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Frequency</InputLabel>
              <Select
                value={newTransaction.frequency}
                label="Frequency"
                onChange={(e) => setNewTransaction({ ...newTransaction, frequency: e.target.value })}
              >
                {frequencies.map((freq) => (
                  <MenuItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Start Date"
              type="date"
              value={newTransaction.startDate}
              onChange={(e) => setNewTransaction({ ...newTransaction, startDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveTransaction}
            variant="contained"
            disabled={!newTransaction.description || !newTransaction.amount || !newTransaction.category}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecurringTransactions;