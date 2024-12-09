import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Repeat as RepeatIcon } from '@mui/icons-material';

export default function RecurringTransactions() {
  const {
    recurringTransactions,
    categories,
    addRecurringTransaction,
    deleteRecurringTransaction,
  } = useFinance();

  const [open, setOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    tags: [],
  });

  const handleAdd = () => {
    if (newTransaction.amount && newTransaction.category && newTransaction.description) {
      addRecurringTransaction(newTransaction);
      setOpen(false);
      setNewTransaction({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        tags: [],
      });
    }
  };

  const getFrequencyLabel = (frequency) => {
    switch (frequency) {
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      default:
        return frequency;
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Recurring Transactions</Typography>
        <IconButton color="primary" onClick={() => setOpen(true)}>
          <AddIcon />
        </IconButton>
      </Box>

      <List>
        {recurringTransactions.map((transaction) => (
          <ListItem
            key={transaction.id}
            secondaryAction={
              <IconButton edge="end" onClick={() => deleteRecurringTransaction(transaction.id)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {transaction.description}
                  <RepeatIcon fontSize="small" color="action" />
                  <Chip
                    label={getFrequencyLabel(transaction.frequency)}
                    size="small"
                    color="default"
                    variant="outlined"
                  />
                </Box>
              }
              secondary={
                <Box sx={{ mt: 0.5 }}>
                  <Typography
                    component="span"
                    variant="body2"
                    color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                  >
                    ${transaction.amount}
                  </Typography>
                  {' - '}
                  {transaction.category}
                  {' - '}
                  Starts: {transaction.startDate}
                  <Box sx={{ mt: 0.5 }}>
                    {transaction.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Recurring Transaction</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select
              value={newTransaction.type}
              onChange={(e) =>
                setNewTransaction({ ...newTransaction, type: e.target.value, category: '' })
              }
              label="Type"
            >
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={newTransaction.category}
              onChange={(e) =>
                setNewTransaction({ ...newTransaction, category: e.target.value })
              }
              label="Category"
            >
              {categories[newTransaction.type].map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Frequency</InputLabel>
            <Select
              value={newTransaction.frequency}
              onChange={(e) =>
                setNewTransaction({ ...newTransaction, frequency: e.target.value })
              }
              label="Frequency"
            >
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            label="Amount"
            type="number"
            value={newTransaction.amount}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) })
            }
          />

          <TextField
            fullWidth
            margin="normal"
            label="Description"
            value={newTransaction.description}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, description: e.target.value })
            }
          />

          <TextField
            fullWidth
            margin="normal"
            label="Start Date"
            type="date"
            value={newTransaction.startDate}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, startDate: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}