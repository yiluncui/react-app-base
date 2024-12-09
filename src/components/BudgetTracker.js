import React, { useState, useEffect, useMemo } from 'react';
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
  IconButton,
  Tooltip,
  Alert,
  AlertTitle,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { categories, defaultBudgets } from '../data/mockData';

const BudgetTracker = ({ transactions }) => {
  const [budgets, setBudgets] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [newBudget, setNewBudget] = useState({ category: '', amount: '' });
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    const savedBudgets = localStorage.getItem('budgets');
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    } else {
      // Initialize with default budgets
      setBudgets(defaultBudgets);
      localStorage.setItem('budgets', JSON.stringify(defaultBudgets));
    }
  }, []);

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setNewBudget({ category, amount: budgets[category] });
    } else {
      setEditingCategory(null);
      setNewBudget({ category: '', amount: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewBudget({ category: '', amount: '' });
    setEditingCategory(null);
  };

  const handleSaveBudget = () => {
    if (newBudget.category && newBudget.amount) {
      const updatedBudgets = {
        ...budgets,
        [newBudget.category]: parseFloat(newBudget.amount)
      };
      setBudgets(updatedBudgets);
      localStorage.setItem('budgets', JSON.stringify(updatedBudgets));
      handleCloseDialog();
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

  const budgetSummary = useMemo(() => {
    const totalBudget = Object.values(budgets).reduce((sum, amount) => sum + amount, 0);
    const totalSpent = Object.keys(budgets).reduce((sum, category) => sum + calculateSpending(category), 0);
    const overBudgetCategories = Object.entries(budgets)
      .filter(([category, budget]) => calculateSpending(category) > budget)
      .map(([category]) => category);

    return {
      totalBudget,
      totalSpent,
      remaining: totalBudget - totalSpent,
      overBudgetCategories,
    };
  }, [budgets, transactions]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Monthly Budget Tracking</Typography>
        <Button 
          variant="contained" 
          onClick={() => handleOpenDialog()}
          startIcon={<EditIcon />}
        >
          Set New Budget
        </Button>
      </Box>

      {budgetSummary.overBudgetCategories.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Budget Alert</AlertTitle>
          You've exceeded your budget in: {budgetSummary.overBudgetCategories.join(', ')}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary" gutterBottom>Total Budget</Typography>
            <Typography variant="h4">${budgetSummary.totalBudget.toFixed(2)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary" gutterBottom>Total Spent</Typography>
            <Typography variant="h4" color="error.main">
              ${budgetSummary.totalSpent.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary" gutterBottom>Remaining</Typography>
            <Typography 
              variant="h4" 
              color={budgetSummary.remaining >= 0 ? 'success.main' : 'error.main'}
            >
              ${budgetSummary.remaining.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {Object.entries(budgets).map(([category, budget]) => {
          const spent = calculateSpending(category);
          const percentage = (spent / budget) * 100;
          const remaining = budget - spent;
          
          return (
            <Grid item xs={12} md={6} key={category}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">{category}</Typography>
                  <Tooltip title="Edit budget">
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenDialog(category)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Budget: ${budget.toFixed(2)}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color={percentage > 100 ? 'error.main' : 'text.secondary'}
                  >
                    Spent: ${spent.toFixed(2)}
                  </Typography>
                </Box>

                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(percentage, 100)}
                  color={percentage > 100 ? 'error' : percentage > 80 ? 'warning' : 'primary'}
                  sx={{ mb: 1, height: 8, borderRadius: 4 }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography 
                    variant="body2" 
                    color={percentage > 100 ? 'error.main' : 'text.secondary'}
                  >
                    {percentage.toFixed(1)}% used
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color={remaining >= 0 ? 'success.main' : 'error.main'}
                  >
                    ${Math.abs(remaining).toFixed(2)} {remaining >= 0 ? 'remaining' : 'over budget'}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCategory ? `Edit Budget: ${editingCategory}` : 'Set New Budget'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newBudget.category}
                label="Category"
                onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                disabled={!!editingCategory}
              >
                {categories
                  .filter(c => c !== 'Income' && c !== 'Other')
                  .map((category) => (
                    <MenuItem 
                      key={category} 
                      value={category}
                      disabled={!!editingCategory && category !== editingCategory}
                    >
                      {category}
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
            <TextField
              label="Budget Amount"
              type="number"
              value={newBudget.amount}
              onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
              fullWidth
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveBudget} 
            variant="contained"
            disabled={!newBudget.category || !newBudget.amount}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BudgetTracker;