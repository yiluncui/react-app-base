import { useState, useMemo } from 'react';
import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  MenuItem,
  TableSortLabel,
  TablePagination,
  Grid,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { loadCategories } from '../utils/categories';

export default function TransactionList({ transactions, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [orderBy, setOrderBy] = useState('date');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const categories = loadCategories();

  const filteredAndSortedTransactions = useMemo(() => {
    return transactions
      .filter(transaction => {
        const matchesSearch = 
          transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
        const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
        return matchesSearch && matchesType && matchesCategory;
      })
      .sort((a, b) => {
        const isAsc = order === 'asc';
        if (orderBy === 'date') {
          return isAsc 
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date);
        }
        if (orderBy === 'amount') {
          return isAsc ? a.amount - b.amount : b.amount - a.amount;
        }
        return isAsc
          ? a[orderBy].localeCompare(b[orderBy])
          : b[orderBy].localeCompare(a[orderBy]);
      });
  }, [transactions, searchTerm, typeFilter, categoryFilter, orderBy, order]);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (!transactions.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body1" color="textSecondary" align="center">
          No transactions yet. Add one to get started!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            select
            label="Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            size="small"
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="income">Income</MenuItem>
            <MenuItem value="expense">Expense</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            select
            label="Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            size="small"
          >
            <MenuItem value="all">All Categories</MenuItem>
            {typeFilter !== 'income' && categories.expense.map(cat => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
            {typeFilter !== 'expense' && categories.income.map(cat => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'date'}
                  direction={orderBy === 'date' ? order : 'asc'}
                  onClick={() => handleSort('date')}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'type'}
                  direction={orderBy === 'type' ? order : 'asc'}
                  onClick={() => handleSort('type')}
                >
                  Type
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'category'}
                  direction={orderBy === 'category' ? order : 'asc'}
                  onClick={() => handleSort('category')}
                >
                  Category
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'description'}
                  direction={orderBy === 'description' ? order : 'asc'}
                  onClick={() => handleSort('description')}
                >
                  Description
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'amount'}
                  direction={orderBy === 'amount' ? order : 'asc'}
                  onClick={() => handleSort('amount')}
                >
                  Amount
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedTransactions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>{transaction.type}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell 
                    align="right"
                    sx={{ color: transaction.type === 'income' ? 'success.main' : 'error.main' }}
                  >
                    ${transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => onDelete(transaction.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAndSortedTransactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
}