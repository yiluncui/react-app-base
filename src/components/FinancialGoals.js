import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Paper,
  Typography,
  Box,
  Grid,
  LinearProgress,
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
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

export default function FinancialGoals() {
  const { goals, addGoal, updateGoal, deleteGoal, transactions } = useFinance();
  const [open, setOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
    category: '',
    type: 'savings', // 'savings' or 'spending'
    description: '',
  });

  const calculateProgress = (goal) => {
    if (goal.type === 'savings') {
      const relevantTransactions = transactions.filter(t => 
        t.type === 'income' && 
        t.tags?.includes(`goal:${goal.id}`) &&
        new Date(t.date) <= new Date(goal.deadline)
      );
      return relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
    } else {
      const relevantTransactions = transactions.filter(t =>
        t.type === 'expense' &&
        t.category === goal.category &&
        new Date(t.date) <= new Date(goal.deadline)
      );
      return relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
    }
  };

  const handleSave = () => {
    if (editingGoal) {
      updateGoal({ ...editingGoal, ...newGoal });
    } else {
      addGoal(newGoal);
    }
    setOpen(false);
    setEditingGoal(null);
    setNewGoal({
      name: '',
      targetAmount: '',
      deadline: '',
      category: '',
      type: 'savings',
      description: '',
    });
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setNewGoal(goal);
    setOpen(true);
  };

  const getStatusColor = (goal) => {
    const progress = calculateProgress(goal);
    const today = new Date();
    const deadline = new Date(goal.deadline);
    const totalDays = (deadline - new Date(goal.startDate)) / (1000 * 60 * 60 * 24);
    const daysLeft = (deadline - today) / (1000 * 60 * 60 * 24);
    const timeProgress = ((totalDays - daysLeft) / totalDays) * 100;

    if (goal.type === 'savings') {
      if (progress >= goal.targetAmount) return 'success';
      if (timeProgress > 100) return 'error';
      if (timeProgress > progress / goal.targetAmount * 100) return 'warning';
      return 'primary';
    } else {
      if (progress <= goal.targetAmount) return 'success';
      if (timeProgress > 100) return 'error';
      if (progress > goal.targetAmount) return 'warning';
      return 'primary';
    }
  };

  const formatDeadline = (deadline) => {
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Expired';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 30) return `${days} days left`;
    if (days < 365) return `${Math.ceil(days / 30)} months left`;
    return `${Math.ceil(days / 365)} years left`;
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Financial Goals</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingGoal(null);
            setOpen(true);
          }}
        >
          Add Goal
        </Button>
      </Box>

      <Grid container spacing={3}>
        {goals.map((goal) => {
          const progress = calculateProgress(goal);
          const progressPercent = goal.type === 'savings'
            ? (progress / goal.targetAmount) * 100
            : (progress / goal.targetAmount) * 100;

          return (
            <Grid item xs={12} sm={6} md={4} key={goal.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" gutterBottom>
                      {goal.name}
                    </Typography>
                    <Box>
                      <IconButton size="small" onClick={() => handleEdit(goal)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => deleteGoal(goal.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {goal.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip
                        size="small"
                        label={goal.type === 'savings' ? 'Savings Goal' : 'Spending Limit'}
                        color={goal.type === 'savings' ? 'primary' : 'secondary'}
                      />
                      {goal.category && (
                        <Chip size="small" label={goal.category} variant="outlined" />
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">
                        ${progress.toLocaleString()} of ${goal.targetAmount.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {progressPercent.toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(progressPercent, 100)}
                      color={getStatusColor(goal)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    {formatDeadline(goal.deadline)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingGoal ? 'Edit Goal' : 'Add New Goal'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Goal Name"
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newGoal.type}
                  label="Type"
                  onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
                >
                  <MenuItem value="savings">Savings Goal</MenuItem>
                  <MenuItem value="spending">Spending Limit</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Target Amount"
                type="number"
                value={newGoal.targetAmount}
                onChange={(e) => setNewGoal({ ...newGoal, targetAmount: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Category"
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Deadline"
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {editingGoal ? 'Save Changes' : 'Add Goal'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </Paper>
  );
}