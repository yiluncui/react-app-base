import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { categories } from '../data/mockData';

const BudgetTracker = ({ transactions }) => {
  const [budgets, setBudgets] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [newBudget, setNewBudget] = useState({ category: '', amount: '' });

  useEffect(() => {
    const savedBudgets = localStorage.getItem('budgets');
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
  }, []);

  const handleSaveBudget = () => {
    if (newBudget.category && newBudget.amount) {
      const updatedBudgets = {
        ...budgets,
        [newBudget.category]: parseFloat(newBudget.amount)
      };
      setBudgets(updatedBudgets);
      localStorage.setItem('budgets', JSON.stringify(updatedBudgets));
      setOpenDialog(false);
      setNewBudget({ category: '', amount: '' });
    }
  };

  const calculateSpending = (category) => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    return Math.abs(
      transactions
        .filter(t => t.category === category && 
                    t.amount < 0 &&
                    new Date(t.date) >= monthStart)
        .reduce((sum, t) => sum + t.amount, 0)
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Monthly Budget Tracking</Typography>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>
          Set Budget
        </Button>
      </Box>

      <Grid container spacing={2}>
        {Object.entries(budgets).map(([category, budget]) => {
          const spent = calculateSpending(category);
          const percentage = (spent / budget) * 100;
          
          return (
            <Grid item xs={12} md={6} key={category}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1">{category}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>
                    ${spent.toFixed(2)} of ${budget.toFixed(2)}
                  </Typography>
                  <Typography color={percentage > 100 ? 'error' : 'inherit'}>
                    {percentage.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(percentage, 100)}
                  color={percentage > 100 ? 'error' : 'primary'}
                />
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Set Monthly Budget</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newBudget.category}
                label="Category"
                onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
              >
                {categories.filter(c => c !== 'Income').map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Budget Amount"
              type="number"
              value={newBudget.amount}
              onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveBudget} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BudgetTracker;