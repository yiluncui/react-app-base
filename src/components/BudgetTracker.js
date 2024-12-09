import { useFinance } from '../context/FinanceContext';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useState } from 'react';

export default function BudgetTracker() {
  const { transactions, budgets, updateBudget } = useFinance();
  const [editingCategory, setEditingCategory] = useState(null);
  const [editAmount, setEditAmount] = useState('');

  const getSpentAmount = (category) => {
    return transactions
      .filter((t) => t.type === 'expense' && t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleSave = () => {
    updateBudget(editingCategory, parseFloat(editAmount));
    setEditingCategory(null);
    setEditAmount('');
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Budget Tracker
      </Typography>

      <List>
        {Object.entries(budgets).map(([category, budget]) => {
          const spent = getSpentAmount(category);
          const progress = (spent / budget) * 100;

          return (
            <ListItem
              key={category}
              secondaryAction={
                <IconButton edge="end" onClick={() => {
                  setEditingCategory(category);
                  setEditAmount(budget.toString());
                }}>
                  <EditIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={category}
                secondary={
                  <>
                    <Typography variant="body2">
                      ${spent} of ${budget} ({Math.round(progress)}%)
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(progress, 100)}
                      color={progress > 100 ? 'error' : 'primary'}
                      sx={{ mt: 1 }}
                    />
                  </>
                }
              />
            </ListItem>
          );
        })}
      </List>

      <Dialog open={!!editingCategory} onClose={() => setEditingCategory(null)}>
        <DialogTitle>Edit Budget for {editingCategory}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Budget Amount"
            type="number"
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingCategory(null)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}