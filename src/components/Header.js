import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

export default function Header() {
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <AccountBalanceIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Personal Finance Tracker
        </Typography>
        {isMobile ? (
          <>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMenu}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={handleClose}>Dashboard</MenuItem>
              <MenuItem onClick={handleClose}>Transactions</MenuItem>
              <MenuItem onClick={handleClose}>Categories</MenuItem>
              <MenuItem onClick={handleClose}>Budgets</MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography
              variant="button"
              component="div"
              sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
            >
              Dashboard
            </Typography>
            <Typography
              variant="button"
              component="div"
              sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
            >
              Transactions
            </Typography>
            <Typography
              variant="button"
              component="div"
              sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
            >
              Categories
            </Typography>
            <Typography
              variant="button"
              component="div"
              sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
            >
              Budgets
            </Typography>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}