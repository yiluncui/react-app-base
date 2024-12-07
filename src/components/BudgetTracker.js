import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Tooltip,
  Chip,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { alpha } from '@mui/material/styles';

const defaultBudgets = {
  Food: { limit: 500, color: '#2196f3' },
  Transportation: { limit: 200, color: '#ff9800' },
  Housing: { limit: 1500, color: '#f44336' },
  Entertainment: { limit: 300, color: '#4caf50' },
  Shopping: { limit: 400, color: '#9c27b0' },
  Healthcare: { limit: 200, color: '#00bcd4' },
};

export default function BudgetTracker({ transactions }) {
  const [budgets, setBudgets] = useState(defaultBudgets);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newBudget, setNewBudget] = useState({ category: '', limit: '', color: '#2196f3' });

  const calculateCategorySpending = (category) => {
    return transactions
      .filter(t => t.type === 'expense' && t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setSelectedCategory(category);
      setNewBudget({
        category,
        limit: budgets[category].limit,
        color: budgets[category].color,
      });
    } else {
      setSelectedCategory(null);
      setNewBudget({ category: '', limit: '', color: '#2196f3' });
    }
    setDialogOpen(true);
  };

  const handleSaveBudget = () => {
    if (selectedCategory) {
      setBudgets(prev => ({
        ...prev,
        [selectedCategory]: {
          limit: parseFloat(newBudget.limit),
          color: newBudget.color,
        },
      }));
    } else {
      setBudgets(prev => ({
        ...prev,
        [newBudget.category]: {
          limit: parseFloat(newBudget.limit),
          color: newBudget.color,
        },
      }));
    }
    setDialogOpen(false);
  };

  const handleDeleteBudget = (category) => {
    setBudgets(prev => {
      const { [category]: _, ...rest } = prev;
      return rest;
    });
  };

  const BudgetProgress = ({ category, budget }) => {
    const spending = calculateCategorySpending(category);
    const percentage = (spending / budget.limit) * 100;
    const isOverBudget = spending > budget.limit;
    const isNearLimit = percentage >= 80 && !isOverBudget;

    return (
      <Paper
        elevation={1}
        sx={{
          p: 3,
          mb: 2,
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ flex: 1 }}>
              {category}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {isOverBudget && (
                <Chip
                  icon={<WarningIcon />}
                  label="Over Budget"
                  color="error"
                  size="small"
                />
              )}
              {isNearLimit && (
                <Chip
                  icon={<WarningIcon />}
                  label="Near Limit"
                  color="warning"
                  size="small"
                />
              )}
              {!isNearLimit && !isOverBudget && (
                <Chip
                  icon={<CheckCircleIcon />}
                  label="On Track"
                  color="success"
                  size="small"
                />
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ flex: 1 }}>
              <LinearProgress
                variant="determinate"
                value={Math.min(percentage, 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: alpha(budget.color, 0.1),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: isOverBudget ? 'error.main' : budget.color,
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
            <Box sx={{ ml: 2 }}>
              <CircularProgress
                variant="determinate"
                value={Math.min(percentage, 100)}
                size={40}
                thickness={4}
                sx={{
                  color: isOverBudget ? 'error.main' : budget.color,
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  },
                }}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              ${spending.toFixed(2)} of ${budget.limit.toFixed(2)}
            </Typography>
            <Box>
              <Tooltip title="Edit Budget">
                <IconButton
                  size="small"
                  onClick={() => handleOpenDialog(category)}
                  sx={{ color: 'text.secondary' }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Budget">
                <IconButton
                  size="small"
                  onClick={() => handleDeleteBudget(category)}
                  sx={{ color: 'text.secondary' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 150,
            height: 150,
            background: budget.color,
            opacity: 0.05,
            borderRadius: '50%',
          }}
        />
      </Paper>
    );
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ flex: 1, color: 'text.secondary' }}>
          Budget Tracking
        </Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          variant="contained"
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          Add Budget
        </Button>
      </Box>

      <Grid container spacing={2}>
        {Object.entries(budgets).map(([category, budget]) => (
          <Grid item xs={12} md={6} key={category}>
            <BudgetProgress category={category} budget={budget} />
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedCategory ? 'Edit Budget' : 'Add New Budget'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {!selectedCategory && (
              <TextField
                fullWidth
                label="Category"
                value={newBudget.category}
                onChange={(e) => setNewBudget(prev => ({ ...prev, category: e.target.value }))}
                sx={{ mb: 2 }}
              />
            )}
            <TextField
              fullWidth
              label="Monthly Limit"
              type="number"
              value={newBudget.limit}
              onChange={(e) => setNewBudget(prev => ({ ...prev, limit: e.target.value }))}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Color"
              type="color"
              value={newBudget.color}
              onChange={(e) => setNewBudget(prev => ({ ...prev, color: e.target.value }))}
              sx={{
                '& input': {
                  height: 50,
                  padding: 1,
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveBudget}
            variant="contained"
            disabled={!newBudget.limit || (!selectedCategory && !newBudget.category)}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}