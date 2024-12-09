import { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Box,
  Chip,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

export default function TransactionList() {
  const { transactions, categories, addTransaction, deleteTransaction } = useFinance();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || transaction.type === selectedType;
      const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory;
      const matchesDateRange = (!dateRange.start || transaction.date >= dateRange.start) &&
        (!dateRange.end || transaction.date <= dateRange.end);
      
      return matchesSearch && matchesType && matchesCategory && matchesDateRange;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, searchTerm, selectedType, selectedCategory, dateRange]);

  const handleAdd = () => {
    addTransaction(newTransaction);
    setOpen(false);
    setNewTransaction({
      type: 'expense',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedCategory('all');
    setDateRange({ start: '', end: '' });
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Transactions</Typography>
        <IconButton color="primary" onClick={() => setOpen(true)}>
          <AddIcon />
        </IconButton>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="Search transactions"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Type</InputLabel>
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              label="Type"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="all">All</MenuItem>
              {selectedType === 'all' ? (
                [...categories.income, ...categories.expense].map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))
              ) : (
                categories[selectedType === 'income' ? 'income' : 'expense'].map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            label="From"
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            label="To"
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      {(searchTerm || selectedType !== 'all' || selectedCategory !== 'all' || dateRange.start || dateRange.end) && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Active filters:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {searchTerm && (
              <Chip label={`Search: ${searchTerm}`} onDelete={() => setSearchTerm('')} size="small" />
            )}
            {selectedType !== 'all' && (
              <Chip label={`Type: ${selectedType}`} onDelete={() => setSelectedType('all')} size="small" />
            )}
            {selectedCategory !== 'all' && (
              <Chip label={`Category: ${selectedCategory}`} onDelete={() => setSelectedCategory('all')} size="small" />
            )}
            {dateRange.start && (
              <Chip label={`From: ${dateRange.start}`} onDelete={() => setDateRange(prev => ({ ...prev, start: '' }))} size="small" />
            )}
            {dateRange.end && (
              <Chip label={`To: ${dateRange.end}`} onDelete={() => setDateRange(prev => ({ ...prev, end: '' }))} size="small" />
            )}
            <Button size="small" onClick={clearFilters}>Clear all</Button>
          </Box>
        </Box>
      )}

      {filteredTransactions.length > 0 ? (
        <>
          <Box sx={{ mb: 2, display: 'flex', gap: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </Typography>
            <Typography variant="body2" color="success.main">
              Income: ${filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)}
            </Typography>
            <Typography variant="body2" color="error.main">
              Expenses: ${filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)}
            </Typography>
          </Box>
          <List>
            {filteredTransactions.map((transaction) => (
          <ListItem
            key={transaction.id}
            secondaryAction={
              <IconButton edge="end" onClick={() => deleteTransaction(transaction.id)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={`${transaction.description} - ${transaction.category}`}
              secondary={
                <>
                  <Typography component="span" color={transaction.type === 'income' ? 'success.main' : 'error.main'}>
                    ${transaction.amount}
                  </Typography>
                  {' - '}
                  {transaction.date}
                </>
              }
            />
          </ListItem>
            ))}
          </List>
        </>
      ) : (
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No transactions found matching your filters.
          </Typography>
          {(searchTerm || selectedType !== 'all' || selectedCategory !== 'all' || dateRange.start || dateRange.end) && (
            <Button size="small" onClick={clearFilters} sx={{ mt: 1 }}>
              Clear filters
            </Button>
          )}
        </Box>
      )}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Transaction</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select
              value={newTransaction.type}
              onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value, category: '' })}
              label="Type"
            >
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={newTransaction.category}
              onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
              label="Category"
            >
              {categories[newTransaction.type].map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            label="Amount"
            type="number"
            value={newTransaction.amount}
            onChange={(e) => setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) })}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Description"
            value={newTransaction.description}
            onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Date"
            type="date"
            value={newTransaction.date}
            onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
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