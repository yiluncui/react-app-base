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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function TransactionList({ transactions, onDelete }) {
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
    <TableContainer component={Paper} sx={{ m: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Description</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((transaction) => (
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
    </TableContainer>
  );
}