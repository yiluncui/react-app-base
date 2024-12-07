import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  Tooltip,
  LinearProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SavingsIcon from '@mui/icons-material/Savings';
import { alpha } from '@mui/material/styles';

const defaultGoals = [
  {
    id: 1,
    name: 'Emergency Fund',
    target: 10000,
    current: 5000,
    deadline: '2024-12-31',
    type: 'savings',
    color: '#4caf50',
  },
  {
    id: 2,
    name: 'New Car',
    target: 25000,
    current: 8000,
    deadline: '2025-06-30',
    type: 'purchase',
    color: '#2196f3',
  },
];

export default function FinancialGoals({ transactions }) {
  const [goals, setGoals] = useState(defaultGoals);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({
    name: '',
    target: '',
    current: '',
    deadline: '',
    type: 'savings',
    color: '#4caf50',
  });

  const handleOpenDialog = (goal = null) => {
    if (goal) {
      setSelectedGoal(goal);
      setNewGoal(goal);
    } else {
      setSelectedGoal(null);
      setNewGoal({
        name: '',
        target: '',
        current: '',
        deadline: '',
        type: 'savings',
        color: '#4caf50',
      });
    }
    setDialogOpen(true);
  };

  const handleSaveGoal = () => {
    if (selectedGoal) {
      setGoals(prev =>
        prev.map(g => (g.id === selectedGoal.id ? { ...newGoal, id: g.id } : g))
      );
    } else {
      setGoals(prev => [
        ...prev,
        {
          ...newGoal,
          id: Math.max(0, ...prev.map(g => g.id)) + 1,
        },
      ]);
    }
    setDialogOpen(false);
  };

  const handleDeleteGoal = (id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const GoalCard = ({ goal }) => {
    const progress = (goal.current / goal.target) * 100;
    const daysLeft = Math.ceil(
      (new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)
    );
    const isCompleted = goal.current >= goal.target;
    const isNearDeadline = daysLeft <= 30 && !isCompleted;

    return (
      <Paper
        elevation={1}
        sx={{
          p: 3,
          height: '100%',
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
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(goal.color, 0.1),
                color: goal.color,
                mr: 2,
              }}
            >
              {goal.type === 'savings' ? <SavingsIcon /> : <EmojiEventsIcon />}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6">{goal.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)} Goal
              </Typography>
            </Box>
            <Box>
              <Tooltip title="Edit Goal">
                <IconButton
                  size="small"
                  onClick={() => handleOpenDialog(goal)}
                  sx={{ color: 'text.secondary' }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Goal">
                <IconButton
                  size="small"
                  onClick={() => handleDeleteGoal(goal.id)}
                  sx={{ color: 'text.secondary' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(progress, 100)}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(goal.color, 0.1),
                '& .MuiLinearProgress-bar': {
                  bgcolor: goal.color,
                  borderRadius: 4,
                },
              }}
            />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="h6" sx={{ color: goal.color }}>
                {progress.toFixed(1)}%
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Amount Saved
              </Typography>
              <Typography variant="h6">
                ${goal.current.toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Target Amount
              </Typography>
              <Typography variant="h6">
                ${goal.target.toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Days Left
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: isNearDeadline ? 'error.main' : 'text.primary',
                }}
              >
                {isCompleted ? 'Completed!' : `${daysLeft} days`}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 150,
            height: 150,
            background: goal.color,
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
          Financial Goals
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
          Add Goal
        </Button>
      </Box>

      <Grid container spacing={3}>
        {goals.map(goal => (
          <Grid item xs={12} md={6} key={goal.id}>
            <GoalCard goal={goal} />
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedGoal ? 'Edit Goal' : 'Add New Goal'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Goal Name"
              value={newGoal.name}
              onChange={(e) => setNewGoal(prev => ({ ...prev, name: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Goal Type</InputLabel>
              <Select
                value={newGoal.type}
                label="Goal Type"
                onChange={(e) => setNewGoal(prev => ({ ...prev, type: e.target.value }))}
              >
                <MenuItem value="savings">Savings</MenuItem>
                <MenuItem value="purchase">Purchase</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Target Amount"
              type="number"
              value={newGoal.target}
              onChange={(e) => setNewGoal(prev => ({ ...prev, target: parseFloat(e.target.value) }))}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            <TextField
              fullWidth
              label="Current Amount"
              type="number"
              value={newGoal.current}
              onChange={(e) => setNewGoal(prev => ({ ...prev, current: parseFloat(e.target.value) }))}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            <TextField
              fullWidth
              label="Target Date"
              type="date"
              value={newGoal.deadline}
              onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Color"
              type="color"
              value={newGoal.color}
              onChange={(e) => setNewGoal(prev => ({ ...prev, color: e.target.value }))}
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
            onClick={handleSaveGoal}
            variant="contained"
            disabled={!newGoal.name || !newGoal.target || !newGoal.deadline}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}