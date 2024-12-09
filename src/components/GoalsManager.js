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
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { loadCategories } from '../utils/categories';
import {
  loadGoals,
  addGoal,
  deleteGoal,
  updateGoal,
  calculateGoalProgress,
  GoalStatus,
} from '../utils/goals';

const GOAL_TYPES = [
  { value: 'savings', label: 'Savings Target' },
  { value: 'spending_reduction', label: 'Spending Reduction' },
  { value: 'debt_payment', label: 'Debt Payment' },
];

export default function GoalsManager({ open, onClose, transactions }) {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({
    type: 'savings',
    category: '',
    targetAmount: '',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: '',
    description: '',
  });
  const [error, setError] = useState('');
  const categories = loadCategories();

  useEffect(() => {
    setGoals(loadGoals());
  }, []);

  const handleAddGoal = () => {
    if (!newGoal.targetAmount || parseFloat(newGoal.targetAmount) <= 0) {
      setError('Please enter a valid target amount');
      return;
    }
    if (!newGoal.targetDate) {
      setError('Please select a target date');
      return;
    }
    if (!newGoal.description) {
      setError('Please enter a description');
      return;
    }
    if (new Date(newGoal.targetDate) <= new Date(newGoal.startDate)) {
      setError('Target date must be after start date');
      return;
    }

    const updatedGoals = addGoal({
      ...newGoal,
      targetAmount: parseFloat(newGoal.targetAmount),
    });
    setGoals(updatedGoals);
    setNewGoal({
      type: 'savings',
      category: '',
      targetAmount: '',
      startDate: new Date().toISOString().split('T')[0],
      targetDate: '',
      description: '',
    });
    setError('');
  };

  const handleDeleteGoal = (id) => {
    const updatedGoals = deleteGoal(id);
    setGoals(updatedGoals);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'success';
    if (percentage >= 75) return 'info';
    if (percentage >= 50) return 'warning';
    return 'error';
  };

  const getDaysRemaining = (targetDate) => {
    const remaining = Math.ceil(
      (new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    return remaining > 0 ? remaining : 0;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Financial Goals</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <TextField
            select
            fullWidth
            label="Goal Type"
            value={newGoal.type}
            onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value, category: '' })}
            size="small"
            sx={{ mb: 1 }}
          >
            {GOAL_TYPES.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </TextField>

          {newGoal.type === 'debt_payment' && (
            <TextField
              select
              fullWidth
              label="Debt Category"
              value={newGoal.category}
              onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
              size="small"
              sx={{ mb: 1 }}
            >
              {categories.expense.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            fullWidth
            label="Target Amount"
            type="number"
            value={newGoal.targetAmount}
            onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
            InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            size="small"
            sx={{ mb: 1 }}
          />

          <TextField
            fullWidth
            label="Description"
            value={newGoal.description}
            onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
            size="small"
            sx={{ mb: 1 }}
          />

          <TextField
            fullWidth
            label="Start Date"
            type="date"
            value={newGoal.startDate}
            onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
            size="small"
            sx={{ mb: 1 }}
          />

          <TextField
            fullWidth
            label="Target Date"
            type="date"
            value={newGoal.targetDate}
            onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
            size="small"
            sx={{ mb: 1 }}
          />

          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 1 }}>
              {error}
            </Typography>
          )}

          <Button
            variant="contained"
            onClick={handleAddGoal}
            size="small"
          >
            Add Goal
          </Button>
        </Box>

        <Grid container spacing={2}>
          {goals.map((goal) => {
            const progress = calculateGoalProgress(goal, transactions);
            const daysRemaining = getDaysRemaining(goal.targetDate);
            const progressColor = getProgressColor(progress.percentage);

            return (
              <Grid item xs={12} md={6} key={goal.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {goal.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {GOAL_TYPES.find(t => t.value === goal.type)?.label}
                          {goal.category && ' - ' + goal.category}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                          Progress: ${progress.current.toFixed(2)} of ${goal.targetAmount.toFixed(2)}
                        </Typography>
                        <Typography variant="body2">
                          {progress.percentage.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(progress.percentage, 100)}
                        color={progressColor}
                        sx={{ mb: 1 }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          {daysRemaining} days remaining
                        </Typography>
                        <Typography
                          variant="body2"
                          color={progress.isCompleted ? 'success.main' : 'text.secondary'}
                        >
                          {progress.isCompleted ? 'Completed!' : '$' + progress.remaining.toFixed(2) + ' to go'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}