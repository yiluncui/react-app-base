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
  LinearProgress,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const goalTypes = [
  { value: 'savings', label: 'Savings Goal' },
  { value: 'debt', label: 'Debt Repayment' },
  { value: 'purchase', label: 'Major Purchase' },
  { value: 'emergency', label: 'Emergency Fund' },
  { value: 'investment', label: 'Investment Goal' },
];

const FinancialGoals = ({ transactions }) => {
  const [goals, setGoals] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({
    id: null,
    name: '',
    type: '',
    targetAmount: '',
    targetDate: '',
    currentAmount: 0,
  });

  useEffect(() => {
    const savedGoals = localStorage.getItem('financialGoals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  const calculateCurrentAmount = (goal) => {
    if (goal.type === 'savings' || goal.type === 'emergency' || goal.type === 'investment') {
      // For savings goals, sum all positive transactions in the savings category
      return transactions
        .filter(t => t.amount > 0 && t.category === 'Savings')
        .reduce((sum, t) => sum + t.amount, 0);
    } else if (goal.type === 'debt') {
      // For debt goals, track payments made
      return Math.abs(transactions
        .filter(t => t.amount < 0 && t.category === 'Debt Payment')
        .reduce((sum, t) => sum + t.amount, 0));
    }
    return goal.currentAmount; // For other types, use manual tracking
  };

  const handleOpenDialog = (goal = null) => {
    if (goal) {
      setEditingGoal(goal);
      setNewGoal({ ...goal });
    } else {
      setEditingGoal(null);
      setNewGoal({
        id: Date.now(),
        name: '',
        type: '',
        targetAmount: '',
        targetDate: '',
        currentAmount: 0,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGoal(null);
    setNewGoal({
      id: null,
      name: '',
      type: '',
      targetAmount: '',
      targetDate: '',
      currentAmount: 0,
    });
  };

  const handleSaveGoal = () => {
    if (!newGoal.name || !newGoal.type || !newGoal.targetAmount || !newGoal.targetDate) {
      return;
    }

    const updatedGoals = editingGoal
      ? goals.map(g => (g.id === editingGoal.id ? { ...newGoal } : g))
      : [...goals, { ...newGoal }];

    setGoals(updatedGoals);
    localStorage.setItem('financialGoals', JSON.stringify(updatedGoals));
    handleCloseDialog();
  };

  const handleDeleteGoal = (goalId) => {
    const updatedGoals = goals.filter(g => g.id !== goalId);
    setGoals(updatedGoals);
    localStorage.setItem('financialGoals', JSON.stringify(updatedGoals));
  };

  const calculateProgress = (goal) => {
    const current = calculateCurrentAmount(goal);
    return (current / parseFloat(goal.targetAmount)) * 100;
  };

  const calculateProjectedCompletion = (goal) => {
    const current = calculateCurrentAmount(goal);
    const targetDate = new Date(goal.targetDate);
    const today = new Date();
    const totalDays = (targetDate - new Date(goal.startDate || today)) / (1000 * 60 * 60 * 24);
    const remainingDays = (targetDate - today) / (1000 * 60 * 60 * 24);
    
    if (remainingDays <= 0) return 'Past due date';
    
    const progressRate = current / (totalDays - remainingDays); // Amount per day
    const projectedDaysToComplete = (goal.targetAmount - current) / progressRate;
    
    const projectedDate = new Date(today.getTime() + (projectedDaysToComplete * 24 * 60 * 60 * 1000));
    return projectedDate > targetDate ? 'Behind schedule' : 'On track';
  };

  const getGoalStatus = (goal) => {
    const progress = calculateProgress(goal);
    const targetDate = new Date(goal.targetDate);
    const today = new Date();
    
    if (progress >= 100) return { label: 'Completed', color: 'success' };
    if (targetDate < today) return { label: 'Overdue', color: 'error' };
    if (progress < 25) return { label: 'Just Started', color: 'info' };
    if (progress < 75) return { label: 'In Progress', color: 'primary' };
    return { label: 'Almost There', color: 'success' };
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Financial Goals</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Goal
        </Button>
      </Box>

      <Grid container spacing={2}>
        {goals.map((goal) => {
          const progress = calculateProgress(goal);
          const status = getGoalStatus(goal);
          const currentAmount = calculateCurrentAmount(goal);

          return (
            <Grid item xs={12} md={6} key={goal.id}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {goal.name}
                  </Typography>
                  <Box>
                    <Tooltip title="Edit goal">
                      <IconButton size="small" onClick={() => handleOpenDialog(goal)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete goal">
                      <IconButton size="small" onClick={() => handleDeleteGoal(goal.id)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Alert severity={status.color} sx={{ mb: 2 }}>
                  {status.label} - {calculateProjectedCompletion(goal)}
                </Alert>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Target: ${parseFloat(goal.targetAmount).toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Current: ${currentAmount.toFixed(2)}
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={Math.min(progress, 100)}
                  color={status.color}
                  sx={{ mb: 1, height: 8, borderRadius: 4 }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {progress.toFixed(1)}% completed
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Due: {new Date(goal.targetDate).toLocaleDateString()}
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
          {editingGoal ? 'Edit Financial Goal' : 'Create New Financial Goal'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Goal Name"
              value={newGoal.name}
              onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Goal Type</InputLabel>
              <Select
                value={newGoal.type}
                label="Goal Type"
                onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
              >
                {goalTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Target Amount"
              type="number"
              value={newGoal.targetAmount}
              onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
              fullWidth
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />

            <TextField
              label="Target Date"
              type="date"
              value={newGoal.targetDate}
              onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveGoal}
            variant="contained"
            disabled={!newGoal.name || !newGoal.type || !newGoal.targetAmount || !newGoal.targetDate}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FinancialGoals;