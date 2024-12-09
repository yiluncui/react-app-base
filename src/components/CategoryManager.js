import { useState } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Tab,
  Tabs,
  Box,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useFinance } from '../context/FinanceContext';

export default function CategoryManager() {
  const { categories, addCategory } = useFinance();
  const [open, setOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [selectedType, setSelectedType] = useState('expense');
  const [tabValue, setTabValue] = useState(0);

  const handleAdd = () => {
    if (newCategory.trim()) {
      addCategory(selectedType, newCategory.trim());
      setNewCategory('');
      setOpen(false);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Categories
        <IconButton color="primary" onClick={() => setOpen(true)}>
          <AddIcon />
        </IconButton>
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Expense Categories" />
          <Tab label="Income Categories" />
        </Tabs>
      </Box>

      <List>
        {categories[tabValue === 0 ? 'expense' : 'income'].map((category) => (
          <ListItem
            key={category}
            secondaryAction={
              <IconButton edge="end" disabled>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText primary={category} />
          </ListItem>
        ))}
      </List>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <Tabs
            value={selectedType === 'expense' ? 0 : 1}
            onChange={(_, newValue) => setSelectedType(newValue === 0 ? 'expense' : 'income')}
            sx={{ mb: 2 }}
          >
            <Tab label="Expense" />
            <Tab label="Income" />
          </Tabs>
          <TextField
            fullWidth
            label="Category Name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}