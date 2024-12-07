import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Paper,
  Box,
  Chip,
  Tooltip,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { alpha } from '@mui/material/styles';

export default function TransactionList({ transactions, onDelete }) {
  if (!transactions.length) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          mt: 2, 
          p: 4, 
          textAlign: 'center',
          bgcolor: 'background.default'
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No transactions to display
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Add your first transaction using the form above
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        mt: 2, 
        maxHeight: 400, 
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#888',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#555',
        },
      }}
    >
      <List disablePadding>
        {transactions.map((transaction, index) => (
          <React.Fragment key={transaction.id}>
            <ListItem
              sx={{
                py: 2,
                px: 3,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mr: 2
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: transaction.type === 'income' 
                      ? alpha('#4caf50', 0.1)
                      : alpha('#f44336', 0.1),
                    color: transaction.type === 'income' 
                      ? 'success.main'
                      : 'error.main'
                  }}
                >
                  {transaction.type === 'income' 
                    ? <AttachMoneyIcon /> 
                    : <ShoppingBagIcon />}
                </Box>
              </Box>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {transaction.description || transaction.category}
                    </Typography>
                    <Chip
                      label={transaction.category}
                      size="small"
                      sx={{
                        ml: 1,
                        bgcolor: transaction.type === 'income' 
                          ? alpha('#4caf50', 0.1)
                          : alpha('#f44336', 0.1),
                        color: transaction.type === 'income' 
                          ? 'success.main'
                          : 'error.main',
                        fontWeight: 500
                      }}
                    />
                  </Box>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    {new Date(transaction.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Typography>
                }
              />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: transaction.type === 'income' 
                      ? 'success.main'
                      : 'error.main',
                    mr: 2
                  }}
                >
                  {transaction.type === 'income' ? '+' : '-'}$
                  {transaction.amount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </Typography>
                <ListItemSecondaryAction>
                  <Tooltip title="Delete transaction">
                    <IconButton
                      edge="end"
                      onClick={() => onDelete(transaction.id)}
                      sx={{
                        color: 'text.secondary',
                        '&:hover': {
                          color: 'error.main',
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </Box>
            </ListItem>
            {index < transactions.length - 1 && (
              <Divider />
            )}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
}