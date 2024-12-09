import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { loadCategories, addCategory, deleteCategory } from '../utils/categories';

export default function CategoryManager({ open, onClose }) {
  const [categories, setCategories] = useState(loadCategories());
  const [newCategory, setNewCategory] = useState('');
  const [activeTab, setActiveTab] = useState('expense');
  const [error, setError] = useState('');

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      setError('Category name cannot be empty');
      return;
    }
    if (categories[activeTab].includes(newCategory.trim())) {
      setError('Category already exists');
      return;
    }
    const updatedCategories = addCategory(activeTab, newCategory.trim());
    setCategories(updatedCategories);
    setNewCategory('');
    setError('');
  };

  const handleDeleteCategory = (category) => {
    const updatedCategories = deleteCategory(activeTab, category);
    setCategories(updatedCategories);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Categories</DialogTitle>
      <DialogContent>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ mb: 2 }}
        >
          <Tab value="expense" label="Expenses" />
          <Tab value="income" label="Income" />
        </Tabs>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="New Category"
            value={newCategory}
            onChange={(e) => {
              setNewCategory(e.target.value);
              setError('');
            }}
            error={!!error}
            helperText={error}
            size="small"
            sx={{ mb: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleAddCategory}
            size="small"
          >
            Add Category
          </Button>
        </Box>

        <List>
          {categories[activeTab].map((category) => (
            <ListItem
              key={category}
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={() => handleDeleteCategory(category)}
                  disabled={category === 'Other'}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText primary={category} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}