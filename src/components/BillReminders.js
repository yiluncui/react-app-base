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
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Switch,
  Card,
  CardContent,
  CardActions,
  Alert,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { categories } from '../data/mockData';

const frequencies = [
  { value: 'once', label: 'One Time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const BillReminders = ({ onAddTransaction }) => {
  const [reminders, setReminders] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [newReminder, setNewReminder] = useState({
    id: null,
    description: '',
    amount: '',
    category: '',
    dueDate: '',
    frequency: 'monthly',
    reminderDays: 3,
    active: true,
    paid: false,
    lastPaid: null,
  });

  useEffect(() => {
    const savedReminders = localStorage.getItem('billReminders');
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    }
  }, []);

  useEffect(() => {
    // Check for due bills and show browser notifications if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      reminders.forEach(reminder => {
        if (!reminder.active || reminder.paid) return;

        const dueDate = new Date(reminder.dueDate);
        const today = new Date();
        const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

        if (daysUntilDue <= reminder.reminderDays && daysUntilDue >= 0) {
          new Notification('Bill Reminder', {
            body: `${reminder.description} is due in ${daysUntilDue} days (${reminder.dueDate})`,
            icon: '/favicon.ico',
          });
        }
      });
    }
  }, [reminders]);

  const handleRequestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setSnackbar({
          open: true,
          message: 'Notifications enabled successfully',
          severity: 'success',
        });
      }
    }
  };

  const handleOpenDialog = (reminder = null) => {
    if (reminder) {
      setEditingReminder(reminder);
      setNewReminder({ ...reminder });
    } else {
      setEditingReminder(null);
      setNewReminder({
        id: Date.now(),
        description: '',
        amount: '',
        category: '',
        dueDate: '',
        frequency: 'monthly',
        reminderDays: 3,
        active: true,
        paid: false,
        lastPaid: null,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingReminder(null);
    setNewReminder({
      id: null,
      description: '',
      amount: '',
      category: '',
      dueDate: '',
      frequency: 'monthly',
      reminderDays: 3,
      active: true,
      paid: false,
      lastPaid: null,
    });
  };

  const handleSaveReminder = () => {
    if (!newReminder.description || !newReminder.amount || !newReminder.category || !newReminder.dueDate) {
      return;
    }

    const updatedReminders = editingReminder
      ? reminders.map(r => (r.id === editingReminder.id ? { ...newReminder } : r))
      : [...reminders, { ...newReminder }];

    setReminders(updatedReminders);
    localStorage.setItem('billReminders', JSON.stringify(updatedReminders));
    handleCloseDialog();
  };

  const handleDeleteReminder = (reminderId) => {
    const updatedReminders = reminders.filter(r => r.id !== reminderId);
    setReminders(updatedReminders);
    localStorage.setItem('billReminders', JSON.stringify(updatedReminders));
  };

  const handleTogglePaid = (reminderId) => {
    const updatedReminders = reminders.map(reminder => {
      if (reminder.id === reminderId) {
        const paid = !reminder.paid;
        if (paid) {
          // Add transaction when marked as paid
          onAddTransaction({
            id: Date.now(),
            description: reminder.description,
            amount: -Math.abs(parseFloat(reminder.amount)),
            category: reminder.category,
            date: new Date().toISOString().split('T')[0],
          });

          // Update next due date based on frequency
          const nextDueDate = new Date(reminder.dueDate);
          switch (reminder.frequency) {
            case 'weekly':
              nextDueDate.setDate(nextDueDate.getDate() + 7);
              break;
            case 'biweekly':
              nextDueDate.setDate(nextDueDate.getDate() + 14);
              break;
            case 'monthly':
              nextDueDate.setMonth(nextDueDate.getMonth() + 1);
              break;
            case 'quarterly':
              nextDueDate.setMonth(nextDueDate.getMonth() + 3);
              break;
            case 'yearly':
              nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
              break;
          }

          return {
            ...reminder,
            paid: true,
            lastPaid: new Date().toISOString(),
            dueDate: reminder.frequency === 'once' ? reminder.dueDate : nextDueDate.toISOString().split('T')[0],
          };
        }
        return { ...reminder, paid: paid };
      }
      return reminder;
    });

    setReminders(updatedReminders);
    localStorage.setItem('billReminders', JSON.stringify(updatedReminders));
  };

  const getDueStatus = (reminder) => {
    if (reminder.paid) return { label: 'Paid', color: 'success' };
    
    const dueDate = new Date(reminder.dueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return { label: 'Overdue', color: 'error' };
    if (daysUntilDue <= reminder.reminderDays) return { label: 'Due Soon', color: 'warning' };
    return { label: 'Upcoming', color: 'info' };
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Bill Reminders</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<NotificationsIcon />}
            onClick={handleRequestNotificationPermission}
          >
            Enable Notifications
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Bill Reminder
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {reminders.map((reminder) => {
          const status = getDueStatus(reminder);
          const dueDate = new Date(reminder.dueDate);
          const daysUntilDue = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));

          return (
            <Grid item xs={12} md={4} key={reminder.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {reminder.description}
                    </Typography>
                    <Chip
                      label={status.label}
                      color={status.color}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Amount: ${parseFloat(reminder.amount).toFixed(2)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Due: {new Date(reminder.dueDate).toLocaleDateString()}
                    {!reminder.paid && daysUntilDue >= 0 && (
                      <span> ({daysUntilDue} days left)</span>
                    )}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Category: {reminder.category}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Frequency: {frequencies.find(f => f.value === reminder.frequency)?.label}
                  </Typography>

                  {reminder.lastPaid && (
                    <Typography variant="body2" color="text.secondary">
                      Last Paid: {new Date(reminder.lastPaid).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Box>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpenDialog(reminder)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteReminder(reminder.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Button
                    variant={reminder.paid ? "outlined" : "contained"}
                    size="small"
                    onClick={() => handleTogglePaid(reminder.id)}
                    startIcon={reminder.paid ? <CheckCircleIcon /> : null}
                  >
                    {reminder.paid ? 'Paid' : 'Mark as Paid'}
                  </Button>
                </CardActions>
              </Card>
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
          {editingReminder ? 'Edit Bill Reminder' : 'Create Bill Reminder'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Description"
              value={newReminder.description}
              onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
              fullWidth
            />

            <TextField
              label="Amount"
              type="number"
              value={newReminder.amount}
              onChange={(e) => setNewReminder({ ...newReminder, amount: e.target.value })}
              fullWidth
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newReminder.category}
                label="Category"
                onChange={(e) => setNewReminder({ ...newReminder, category: e.target.value })}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Frequency</InputLabel>
              <Select
                value={newReminder.frequency}
                label="Frequency"
                onChange={(e) => setNewReminder({ ...newReminder, frequency: e.target.value })}
              >
                {frequencies.map((freq) => (
                  <MenuItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Due Date"
              type="date"
              value={newReminder.dueDate}
              onChange={(e) => setNewReminder({ ...newReminder, dueDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Remind Days Before"
              type="number"
              value={newReminder.reminderDays}
              onChange={(e) => setNewReminder({ ...newReminder, reminderDays: parseInt(e.target.value) })}
              fullWidth
              helperText="Number of days before due date to show reminder"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveReminder}
            variant="contained"
            disabled={!newReminder.description || !newReminder.amount || !newReminder.category || !newReminder.dueDate}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BillReminders;