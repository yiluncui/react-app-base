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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Tooltip,
  Switch,
  FormControlLabel,
  InputAdornment,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RepeatIcon from '@mui/icons-material/Repeat';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { alpha } from '@mui/material/styles';
import { categories } from '../data/transactions';

const frequencies = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const defaultRecurring = [
  {
    id: 1,
    name: 'Rent Payment',
    amount: 1500,
    type: 'expense',
    category: 'Housing',
    frequency: 'monthly',
    nextDue: '2024-01-01',
    reminderDays: 3,
    enabled: true,
    color: '#f44336',
  },
  {
    id: 2,
    name: 'Salary Deposit',
    amount: 5000,
    type: 'income',
    category: 'Salary',
    frequency: 'monthly',
    nextDue: '2024-01-15',
    reminderDays: 0,
    enabled: true,
    color: '#4caf50',
  },
];

export default function RecurringTransactions({ onAddTransaction }) {
  const [recurring, setRecurring] = useState(defaultRecurring);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    amount: '',
    type: 'expense',
    category: '',
    frequency: 'monthly',
    nextDue: '',
    reminderDays: 3,
    enabled: true,
    color: '#2196f3',
  });

  const calculateNextDueDate = (date, frequency) => {
    const nextDate = new Date(date);
    switch (frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'biweekly':
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        return date;
    }
    return nextDate.toISOString().split('T')[0];
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setSelectedItem(item);
      setNewItem(item);
    } else {
      setSelectedItem(null);
      setNewItem({
        name: '',
        amount: '',
        type: 'expense',
        category: '',
        frequency: 'monthly',
        nextDue: '',
        reminderDays: 3,
        enabled: true,
        color: '#2196f3',
      });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (selectedItem) {
      setRecurring(prev =>
        prev.map(item => (item.id === selectedItem.id ? { ...newItem, id: item.id } : item))
      );
    } else {
      setRecurring(prev => [
        ...prev,
        {
          ...newItem,
          id: Math.max(0, ...prev.map(item => item.id)) + 1,
        },
      ]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id) => {
    setRecurring(prev => prev.filter(item => item.id !== id));
  };

  const handleToggle = (id) => {
    setRecurring(prev =>
      prev.map(item =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const handleProcessTransaction = (item) => {
    onAddTransaction({
      type: item.type,
      category: item.category,
      amount: item.amount,
      date: item.nextDue,
      description: `${item.name} (Recurring)`,
    });

    // Update next due date
    setRecurring(prev =>
      prev.map(rec =>
        rec.id === item.id
          ? { ...rec, nextDue: calculateNextDueDate(rec.nextDue, rec.frequency) }
          : rec
      )
    );
  };

  const RecurringItem = ({ item }) => {
    const daysUntilDue = getDaysUntilDue(item.nextDue);
    const isOverdue = daysUntilDue < 0;
    const isDueSoon = daysUntilDue <= item.reminderDays;

    return (
      <Paper
        elevation={1}
        sx={{
          p: 3,
          mb: 2,
          position: 'relative',
          overflow: 'hidden',
          opacity: item.enabled ? 1 : 0.6,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(item.color, 0.1),
                    color: item.color,
                  }}
                >
                  <RepeatIcon />
                </Box>
                <Box>
                  <Typography variant="h6">{item.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      size="small"
                      label={item.frequency}
                      sx={{ bgcolor: alpha(item.color, 0.1), color: item.color }}
                    />
                    <Chip
                      size="small"
                      label={item.category}
                      sx={{ bgcolor: alpha(item.color, 0.1), color: item.color }}
                    />
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: item.type === 'income' ? 'success.main' : 'error.main',
                    fontWeight: 600,
                  }}
                >
                  {item.type === 'income' ? '+' : '-'}${item.amount.toLocaleString()}
                </Typography>

                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={item.enabled}
                        onChange={() => handleToggle(item.id)}
                        color={item.type === 'income' ? 'success' : 'error'}
                      />
                    }
                    label=""
                  />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Tooltip title="Next Due Date">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarTodayIcon sx={{ color: 'text.secondary' }} />
                      <Typography>
                        {new Date(item.nextDue).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Tooltip>

                  {item.reminderDays > 0 && (
                    <Tooltip title="Reminder Days Before">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <NotificationsIcon sx={{ color: 'text.secondary' }} />
                        <Typography>{item.reminderDays} days before</Typography>
                      </Box>
                    </Tooltip>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleProcessTransaction(item)}
                    disabled={!item.enabled}
                    sx={{
                      bgcolor: item.color,
                      '&:hover': {
                        bgcolor: alpha(item.color, 0.8),
                      },
                    }}
                  >
                    Process Now
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(item)}
                    sx={{ color: 'text.secondary' }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(item.id)}
                    sx={{ color: 'text.secondary' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Grid>

            {(isOverdue || isDueSoon) && item.enabled && (
              <Grid item xs={12}>
                <Alert
                  severity={isOverdue ? 'error' : 'warning'}
                  sx={{ mt: 1 }}
                >
                  {isOverdue
                    ? `Overdue by ${Math.abs(daysUntilDue)} days`
                    : `Due in ${daysUntilDue} days`}
                </Alert>
              </Grid>
            )}
          </Grid>
        </Box>

        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 150,
            height: 150,
            background: item.color,
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
          Recurring Transactions
        </Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          variant="contained"
        >
          Add Recurring
        </Button>
      </Box>

      {recurring.map(item => (
        <RecurringItem key={item.id} item={item} />
      ))}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedItem ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={newItem.name}
              onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={newItem.type}
                    label="Type"
                    onChange={(e) => setNewItem(prev => ({ ...prev, type: e.target.value, category: '' }))}
                  >
                    <MenuItem value="income">Income</MenuItem>
                    <MenuItem value="expense">Expense</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newItem.category}
                    label="Category"
                    onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                  >
                    {categories[newItem.type].map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={newItem.amount}
                  onChange={(e) => setNewItem(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Frequency</InputLabel>
                  <Select
                    value={newItem.frequency}
                    label="Frequency"
                    onChange={(e) => setNewItem(prev => ({ ...prev, frequency: e.target.value }))}
                  >
                    {frequencies.map(freq => (
                      <MenuItem key={freq.value} value={freq.value}>{freq.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Next Due Date"
                  type="date"
                  value={newItem.nextDue}
                  onChange={(e) => setNewItem(prev => ({ ...prev, nextDue: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Reminder Days Before"
                  type="number"
                  value={newItem.reminderDays}
                  onChange={(e) => setNewItem(prev => ({ ...prev, reminderDays: parseInt(e.target.value) }))}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Color"
              type="color"
              value={newItem.color}
              onChange={(e) => setNewItem(prev => ({ ...prev, color: e.target.value }))}
              sx={{
                '& input': {
                  height: 50,
                  padding: 1,
                },
              }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={newItem.enabled}
                  onChange={(e) => setNewItem(prev => ({ ...prev, enabled: e.target.checked }))}
                />
              }
              label="Enabled"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!newItem.name || !newItem.amount || !newItem.category || !newItem.nextDue}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}