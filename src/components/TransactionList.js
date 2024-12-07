import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function TransactionList({ transactions, onDelete }) {
  return (
    <Paper elevation={2} sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
      <List>
        {transactions.map((transaction) => (
          <ListItem key={transaction.id}>
            <ListItemText
              primary={
                <Typography>
                  {transaction.category} - {transaction.description}
                </Typography>
              }
              secondary={
                <>
                  <Typography component="span" variant="body2" color="text.primary">
                    ${transaction.amount.toFixed(2)}
                  </Typography>
                  {' — '}{transaction.date}
                </>
              }
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => onDelete(transaction.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}