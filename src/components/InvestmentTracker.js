import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Tooltip,
  LinearProgress,
  InputAdornment,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { alpha } from '@mui/material/styles';

const investmentTypes = [
  { value: 'stocks', label: 'Stocks', color: '#2196f3' },
  { value: 'bonds', label: 'Bonds', color: '#4caf50' },
  { value: 'crypto', label: 'Cryptocurrency', color: '#ff9800' },
  { value: 'realestate', label: 'Real Estate', color: '#9c27b0' },
  { value: 'commodities', label: 'Commodities', color: '#795548' },
  { value: 'mutual_funds', label: 'Mutual Funds', color: '#607d8b' },
];

const defaultInvestments = [
  {
    id: 1,
    name: 'S&P 500 ETF',
    type: 'stocks',
    initialAmount: 10000,
    currentAmount: 12500,
    purchaseDate: '2023-01-01',
    notes: 'Long-term investment in market index',
  },
  {
    id: 2,
    name: 'Bitcoin',
    type: 'crypto',
    initialAmount: 5000,
    currentAmount: 7500,
    purchaseDate: '2023-06-01',
    notes: 'Cryptocurrency investment',
  },
];

export default function InvestmentTracker() {
  const [investments, setInvestments] = useState(defaultInvestments);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [newInvestment, setNewInvestment] = useState({
    name: '',
    type: 'stocks',
    initialAmount: '',
    currentAmount: '',
    purchaseDate: '',
    notes: '',
  });

  const calculateTotalValue = () => {
    return investments.reduce((sum, inv) => sum + inv.currentAmount, 0);
  };

  const calculateTotalReturn = () => {
    const totalInitial = investments.reduce((sum, inv) => sum + inv.initialAmount, 0);
    const totalCurrent = calculateTotalValue();
    return ((totalCurrent - totalInitial) / totalInitial) * 100;
  };

  const calculateInvestmentReturn = (investment) => {
    return ((investment.currentAmount - investment.initialAmount) / investment.initialAmount) * 100;
  };

  const handleOpenDialog = (investment = null) => {
    if (investment) {
      setSelectedInvestment(investment);
      setNewInvestment(investment);
    } else {
      setSelectedInvestment(null);
      setNewInvestment({
        name: '',
        type: 'stocks',
        initialAmount: '',
        currentAmount: '',
        purchaseDate: '',
        notes: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (selectedInvestment) {
      setInvestments(prev =>
        prev.map(inv => (inv.id === selectedInvestment.id ? { ...newInvestment, id: inv.id } : inv))
      );
    } else {
      setInvestments(prev => [
        ...prev,
        {
          ...newInvestment,
          id: Math.max(0, ...prev.map(inv => inv.id)) + 1,
        },
      ]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id) => {
    setInvestments(prev => prev.filter(inv => inv.id !== id));
  };

  const InvestmentCard = ({ investment }) => {
    const returnRate = calculateInvestmentReturn(investment);
    const investmentType = investmentTypes.find(t => t.value === investment.type);
    const isPositive = returnRate >= 0;

    return (
      <Paper
        elevation={1}
        sx={{
          p: 3,
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(investmentType.color, 0.1),
                color: investmentType.color,
                mr: 2,
              }}
            >
              <ShowChartIcon />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6">{investment.name}</Typography>
              <Chip
                size="small"
                label={investmentType.label}
                sx={{ bgcolor: alpha(investmentType.color, 0.1), color: investmentType.color }}
              />
            </Box>
            <Box>
              <IconButton
                size="small"
                onClick={() => handleOpenDialog(investment)}
                sx={{ color: 'text.secondary' }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleDelete(investment.id)}
                sx={{ color: 'text.secondary' }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Current Value
              </Typography>
              <Typography variant="h5" sx={{ mb: 1 }}>
                ${investment.currentAmount.toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Initial Investment
              </Typography>
              <Typography variant="h5" sx={{ mb: 1 }}>
                ${investment.initialAmount.toLocaleString()}
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Return
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: isPositive ? 'success.main' : 'error.main',
                }}
              >
                {isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {returnRate.toFixed(2)}%
                </Typography>
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={50 + (returnRate / 2)}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(isPositive ? 'success.main' : 'error.main', 0.1),
                '& .MuiLinearProgress-bar': {
                  bgcolor: isPositive ? 'success.main' : 'error.main',
                  borderRadius: 3,
                },
              }}
            />
          </Box>

          {investment.notes && (
            <Typography variant="body2" color="text.secondary">
              {investment.notes}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 150,
            height: 150,
            background: investmentType.color,
            opacity: 0.05,
            borderRadius: '50%',
          }}
        />
      </Paper>
    );
  };

  const totalValue = calculateTotalValue();
  const totalReturn = calculateTotalReturn();

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ flex: 1, color: 'text.secondary' }}>
          Investment Portfolio
        </Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          variant="contained"
        >
          Add Investment
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              bgcolor: alpha('#2196f3', 0.05),
            }}
          >
            <Typography variant="h6" gutterBottom>
              Total Portfolio Value
            </Typography>
            <Typography variant="h3" sx={{ color: 'primary.main' }}>
              ${totalValue.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              bgcolor: alpha(totalReturn >= 0 ? '#4caf50' : '#f44336', 0.05),
            }}
          >
            <Typography variant="h6" gutterBottom>
              Total Return
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {totalReturn >= 0 ? <TrendingUpIcon color="success" /> : <TrendingDownIcon color="error" />}
              <Typography
                variant="h3"
                sx={{
                  color: totalReturn >= 0 ? 'success.main' : 'error.main',
                }}
              >
                {totalReturn.toFixed(2)}%
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {investments.map(investment => (
          <Grid item xs={12} md={6} key={investment.id}>
            <InvestmentCard investment={investment} />
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedInvestment ? 'Edit Investment' : 'Add New Investment'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Investment Name"
              value={newInvestment.name}
              onChange={(e) => setNewInvestment(prev => ({ ...prev, name: e.target.value }))}
            />

            <FormControl fullWidth>
              <InputLabel>Investment Type</InputLabel>
              <Select
                value={newInvestment.type}
                label="Investment Type"
                onChange={(e) => setNewInvestment(prev => ({ ...prev, type: e.target.value }))}
              >
                {investmentTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Initial Amount"
                  type="number"
                  value={newInvestment.initialAmount}
                  onChange={(e) => setNewInvestment(prev => ({ ...prev, initialAmount: parseFloat(e.target.value) }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current Amount"
                  type="number"
                  value={newInvestment.currentAmount}
                  onChange={(e) => setNewInvestment(prev => ({ ...prev, currentAmount: parseFloat(e.target.value) }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Purchase Date"
              type="date"
              value={newInvestment.purchaseDate}
              onChange={(e) => setNewInvestment(prev => ({ ...prev, purchaseDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={newInvestment.notes}
              onChange={(e) => setNewInvestment(prev => ({ ...prev, notes: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!newInvestment.name || !newInvestment.initialAmount || !newInvestment.currentAmount}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}