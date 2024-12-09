import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  TextField,
  Typography,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { loadCategories } from '../utils/categories';
import {
  loadRecurring,
  addRecurring,
  deleteRecurring,
  RecurringFrequency,
  getNextOccurrence,
} from '../utils/recurring';

export default function RecurringTransactions({ open, onClose }) {
  const [recurring, setRecurring] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    category: '',
    amount: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    frequency: RecurringFrequency.MONTHLY,
  });
  const [error, setError] = useState('');
  const categories = loadCategories();

  useEffect(() => {
    setRecurring(loadRecurring());
  }, []);

  const handleAddRecurring = () => {
    if (!newTransaction.category) {
      setError('Please select a category');
      return;
    }
    if (!newTransaction.amount || parseFloat(newTransaction.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!newTransaction.description) {
      setError('Please enter a description');
      return;
    }

    const updatedRecurring = addRecurring({
      ...newTransaction,
      amount: parseFloat(newTransaction.amount),
    });
    setRecurring(updatedRecurring);
    setNewTransaction({
      type: 'expense',
      category: '',
      amount: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      frequency: RecurringFrequency.MONTHLY,
    });
    setError('');
  };

  const handleDeleteRecurring = (id) => {
    const updatedRecurring = deleteRecurring(id);
    setRecurring(updatedRecurring);
  };

  const getFrequencyLabel = (frequency) => {
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  };

  const getNextDateLabel = (transaction) => {
    const nextDate = getNextOccurrence(transaction.startDate, transaction.frequency);
    if (!nextDate) return 'No upcoming';
    return 'Next: ' + nextDate.toLocaleDateString();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Recurring Transactions</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <TextField
            select
            fullWidth
            label="Type"
            value={newTransaction.type}
            onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value, category: '' })}
            size="small"
            sx={{ mb: 1 }}
          >
            <MenuItem value="income">Income</MenuItem>
            <MenuItem value="expense">Expense</MenuItem>
          </TextField>

          <TextField
            select
            fullWidth
            label="Category"
            value={newTransaction.category}
            onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
            size="small"
            sx={{ mb: 1 }}
          >
            {categories[newTransaction.type].map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={newTransaction.amount}
            onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
            InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            size="small"
            sx={{ mb: 1 }}
          />

          <TextField
            fullWidth
            label="Description"
            value={newTransaction.description}
            onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
            size="small"
            sx={{ mb: 1 }}
          />

          <TextField
            fullWidth
            label="Start Date"
            type="date"
            value={newTransaction.startDate}
            onChange={(e) => setNewTransaction({ ...newTransaction, startDate: e.target.value })}
            size="small"
            sx={{ mb: 1 }}
          />

          <TextField
            select
            fullWidth
            label="Frequency"
            value={newTransaction.frequency}
            onChange={(e) => setNewTransaction({ ...newTransaction, frequency: e.target.value })}
            size="small"
            sx={{ mb: 1 }}
          >
            {Object.values(RecurringFrequency).map((freq) => (
              <MenuItem key={freq} value={freq}>
                {getFrequencyLabel(freq)}
              </MenuItem>
            ))}
          </TextField>

          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 1 }}>
              {error}
            </Typography>
          )}

          <Button
            variant="contained"
            onClick={handleAddRecurring}
            size="small"
          >
            Add Recurring Transaction
          </Button>
        </Box>

        <List>
          {recurring.map((transaction) => (
            <ListItem key={transaction.id}>
              <ListItemText
                primary={transaction.description}
                secondary={
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {transaction.category} - ${transaction.amount.toFixed(2)}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={getFrequencyLabel(transaction.frequency)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={getNextDateLabel(transaction)}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleDeleteRecurring(transaction.id)}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}