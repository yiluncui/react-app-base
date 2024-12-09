import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { loadCategories } from '../utils/categories';
import { loadBudgets, setBudget, deleteBudget, calculateBudgetStatus } from '../utils/budgets';

export default function BudgetManager({ open, onClose, transactions }) {
  const [budgets, setBudgets] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const categories = loadCategories();

  useEffect(() => {
    setBudgets(loadBudgets());
  }, []);

  const handleAddBudget = () => {
    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const updatedBudgets = setBudget(selectedCategory, parseFloat(amount));
    setBudgets(updatedBudgets);
    setSelectedCategory('');
    setAmount('');
    setError('');
  };

  const handleDeleteBudget = (category) => {
    const updatedBudgets = deleteBudget(category);
    setBudgets(updatedBudgets);
  };

  const budgetStatus = calculateBudgetStatus(transactions, budgets);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Monthly Budgets</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <TextField
            select
            fullWidth
            label="Category"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setError('');
            }}
            size="small"
            sx={{ mb: 1 }}
          >
            {categories.expense.map((category) => (
              <MenuItem 
                key={category} 
                value={category}
                disabled={category in budgets}
              >
                {category}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Budget Amount"
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError('');
            }}
            error={!!error}
            helperText={error}
            InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            size="small"
            sx={{ mb: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleAddBudget}
            size="small"
          >
            Add Budget
          </Button>
        </Box>

        <List>
          {budgetStatus.map(({ category, budget, spent, remaining, percentage }) => (
            <ListItem key={category}>
              <ListItemText
                primary={category}
                secondary={
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        ${spent.toFixed(2)} of ${budget.toFixed(2)}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color={remaining >= 0 ? 'success.main' : 'error.main'}
                      >
                        ${Math.abs(remaining).toFixed(2)} {remaining >= 0 ? 'left' : 'over'}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(percentage, 100)}
                      color={percentage <= 85 ? 'primary' : percentage <= 100 ? 'warning' : 'error'}
                    />
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleDeleteBudget(category)}
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