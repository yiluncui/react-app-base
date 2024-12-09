import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  CircularProgress,
  Chip,
  InputAdornment,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TimelineIcon from '@mui/icons-material/Timeline';
import PieChartIcon from '@mui/icons-material/PieChart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

ChartJS.register(
  ArcElement,
  ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

const assetTypes = [
  { value: 'stock', label: 'Stocks' },
  { value: 'etf', label: 'ETFs' },
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'bond', label: 'Bonds' },
  { value: 'mutual_fund', label: 'Mutual Funds' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'commodity', label: 'Commodities' },
  { value: 'cash', label: 'Cash' },
];

const riskLevels = [
  { value: 'very_low', label: 'Very Low' },
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
  { value: 'very_high', label: 'Very High' },
];

const InvestmentPortfolio = () => {
  const [investments, setInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [openDialog, setOpenDialog] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [newItem, setNewItem] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentTab, setCurrentTab] = useState(0);
  const [dateRange, setDateRange] = useState('1y');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load investments and transactions
    const savedInvestments = localStorage.getItem('investments');
    if (savedInvestments) {
      setInvestments(JSON.parse(savedInvestments));
    }

    const savedTransactions = localStorage.getItem('investmentTransactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  const portfolioStats = useMemo(() => {
    const totalValue = investments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
    const totalCost = investments.reduce((sum, inv) => sum + (inv.totalCost || 0), 0);
    const totalGain = totalValue - totalCost;
    const totalReturn = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

    const assetAllocation = investments.reduce((acc, inv) => {
      acc[inv.type] = (acc[inv.type] || 0) + (inv.currentValue || 0);
      return acc;
    }, {});

    const riskAllocation = investments.reduce((acc, inv) => {
      acc[inv.riskLevel] = (acc[inv.riskLevel] || 0) + (inv.currentValue || 0);
      return acc;
    }, {});

    // Calculate historical performance
    const performanceData = {};
    transactions.forEach(t => {
      const date = t.date.substring(0, 7); // YYYY-MM
      if (!performanceData[date]) {
        performanceData[date] = { value: 0, cost: 0 };
      }
      if (t.type === 'buy') {
        performanceData[date].cost += t.amount * t.price;
        performanceData[date].value += t.amount * t.price;
      } else if (t.type === 'sell') {
        performanceData[date].cost -= t.amount * t.originalPrice;
        performanceData[date].value += t.amount * t.price;
      }
    });

    return {
      totalValue,
      totalCost,
      totalGain,
      totalReturn,
      assetAllocation,
      riskAllocation,
      performanceData,
    };
  }, [investments, transactions]);

  const handleAddInvestment = () => {
    if (!newItem.symbol || !newItem.type || !newItem.amount) return;

    const investment = {
      id: Date.now(),
      symbol: newItem.symbol.toUpperCase(),
      name: newItem.name || newItem.symbol.toUpperCase(),
      type: newItem.type,
      amount: parseFloat(newItem.amount),
      price: parseFloat(newItem.price),
      currentValue: parseFloat(newItem.amount) * parseFloat(newItem.price),
      totalCost: parseFloat(newItem.amount) * parseFloat(newItem.price),
      riskLevel: newItem.riskLevel || 'moderate',
      purchaseDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString(),
    };

    const transaction = {
      id: Date.now(),
      investmentId: investment.id,
      type: 'buy',
      symbol: investment.symbol,
      amount: investment.amount,
      price: investment.price,
      originalPrice: investment.price,
      date: investment.purchaseDate,
      total: investment.totalCost,
    };

    const updatedInvestments = [...investments, investment];
    const updatedTransactions = [...transactions, transaction];

    setInvestments(updatedInvestments);
    setTransactions(updatedTransactions);
    localStorage.setItem('investments', JSON.stringify(updatedInvestments));
    localStorage.setItem('investmentTransactions', JSON.stringify(updatedTransactions));

    handleCloseDialog();
    showSnackbar('Investment added successfully');
  };

  const handleAddTransaction = () => {
    if (!newItem.type || !newItem.amount || !newItem.price || !newItem.investmentId) return;

    const investment = investments.find(i => i.id === newItem.investmentId);
    if (!investment) return;

    const transaction = {
      id: Date.now(),
      investmentId: newItem.investmentId,
      type: newItem.type,
      symbol: investment.symbol,
      amount: parseFloat(newItem.amount),
      price: parseFloat(newItem.price),
      originalPrice: investment.price,
      date: new Date().toISOString().split('T')[0],
      total: parseFloat(newItem.amount) * parseFloat(newItem.price),
    };

    // Update investment
    const updatedInvestments = investments.map(inv => {
      if (inv.id === newItem.investmentId) {
        const newAmount = newItem.type === 'buy' 
          ? inv.amount + parseFloat(newItem.amount)
          : inv.amount - parseFloat(newItem.amount);

        const newCost = newItem.type === 'buy'
          ? inv.totalCost + (parseFloat(newItem.amount) * parseFloat(newItem.price))
          : inv.totalCost - (parseFloat(newItem.amount) * inv.price);

        return {
          ...inv,
          amount: newAmount,
          totalCost: newCost,
          currentValue: newAmount * parseFloat(newItem.price),
          price: parseFloat(newItem.price),
          lastUpdated: new Date().toISOString(),
        };
      }
      return inv;
    });

    const updatedTransactions = [...transactions, transaction];

    setInvestments(updatedInvestments);
    setTransactions(updatedTransactions);
    localStorage.setItem('investments', JSON.stringify(updatedInvestments));
    localStorage.setItem('investmentTransactions', JSON.stringify(updatedTransactions));

    handleCloseDialog();
    showSnackbar('Transaction added successfully');
  };

  const handleUpdatePrices = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to update prices
      const updatedInvestments = investments.map(inv => ({
        ...inv,
        price: inv.price * (1 + (Math.random() * 0.1 - 0.05)), // Random price change ±5%
        lastUpdated: new Date().toISOString(),
      }));

      updatedInvestments.forEach(inv => {
        inv.currentValue = inv.amount * inv.price;
      });

      setInvestments(updatedInvestments);
      localStorage.setItem('investments', JSON.stringify(updatedInvestments));
      showSnackbar('Prices updated successfully');
    } catch (error) {
      showSnackbar('Error updating prices', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInvestment = (investmentId) => {
    const updatedInvestments = investments.filter(inv => inv.id !== investmentId);
    const updatedTransactions = transactions.filter(t => t.investmentId !== investmentId);

    setInvestments(updatedInvestments);
    setTransactions(updatedTransactions);
    localStorage.setItem('investments', JSON.stringify(updatedInvestments));
    localStorage.setItem('investmentTransactions', JSON.stringify(updatedTransactions));

    showSnackbar('Investment deleted successfully');
  };

  const handleOpenDialog = (type, item = null) => {
    setOpenDialog(type);
    setEditItem(item);
    if (item) {
      setNewItem({ ...item });
    } else {
      setNewItem({});
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog('');
    setEditItem(null);
    setNewItem({});
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const renderPerformanceChart = () => {
    const dates = Object.keys(portfolioStats.performanceData).sort();
    const values = dates.map(date => portfolioStats.performanceData[date].value);
    const costs = dates.map(date => portfolioStats.performanceData[date].cost);

    const data = {
      labels: dates,
      datasets: [
        {
          label: 'Portfolio Value',
          data: values,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
        {
          label: 'Cost Basis',
          data: costs,
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1,
        },
      ],
    };

    return (
      <Line
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Portfolio Performance',
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        }}
      />
    );
  };

  const renderAllocationChart = () => {
    const data = {
      labels: Object.keys(portfolioStats.assetAllocation).map(
        type => assetTypes.find(t => t.value === type)?.label || type
      ),
      datasets: [
        {
          data: Object.values(portfolioStats.assetAllocation),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
            '#00D8B6',
            '#FF8A80',
          ],
        },
      ],
    };

    return (
      <Pie
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Asset Allocation',
            },
          },
        }}
      />
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Investment Portfolio</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleUpdatePrices}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <TimelineIcon />}
          >
            Update Prices
          </Button>
          <Button
            variant="outlined"
            startIcon={<CompareArrowsIcon />}
            onClick={() => handleOpenDialog('transaction')}
          >
            Add Transaction
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('investment')}
          >
            Add Investment
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography color="text.secondary" gutterBottom>
              Total Value
            </Typography>
            <Typography variant="h4">
              ${portfolioStats.totalValue.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography color="text.secondary" gutterBottom>
              Total Cost
            </Typography>
            <Typography variant="h4">
              ${portfolioStats.totalCost.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography color="text.secondary" gutterBottom>
              Total Gain/Loss
            </Typography>
            <Typography
              variant="h4"
              color={portfolioStats.totalGain >= 0 ? 'success.main' : 'error.main'}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              ${Math.abs(portfolioStats.totalGain).toFixed(2)}
              {portfolioStats.totalGain >= 0 ? (
                <TrendingUpIcon sx={{ ml: 1 }} />
              ) : (
                <TrendingDownIcon sx={{ ml: 1 }} />
              )}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography color="text.secondary" gutterBottom>
              Total Return
            </Typography>
            <Typography
              variant="h4"
              color={portfolioStats.totalReturn >= 0 ? 'success.main' : 'error.main'}
            >
              {portfolioStats.totalReturn.toFixed(2)}%
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)}>
          <Tab icon={<ReceiptIcon />} label="Holdings" />
          <Tab icon={<TimelineIcon />} label="Performance" />
          <Tab icon={<PieChartIcon />} label="Allocation" />
        </Tabs>
      </Box>

      <TabPanel value={currentTab} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Symbol</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Current Value</TableCell>
                <TableCell align="right">Cost Basis</TableCell>
                <TableCell align="right">Gain/Loss</TableCell>
                <TableCell align="right">Return</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {investments.map((investment) => {
                const gain = investment.currentValue - investment.totalCost;
                const returnPct = (gain / investment.totalCost) * 100;

                return (
                  <TableRow key={investment.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle2">{investment.symbol}</Typography>
                        <Chip
                          label={investment.riskLevel}
                          size="small"
                          sx={{ ml: 1 }}
                          color={
                            investment.riskLevel === 'very_high' || investment.riskLevel === 'high'
                              ? 'error'
                              : investment.riskLevel === 'moderate'
                              ? 'warning'
                              : 'success'
                          }
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      {assetTypes.find(t => t.value === investment.type)?.label}
                    </TableCell>
                    <TableCell align="right">{investment.amount}</TableCell>
                    <TableCell align="right">${investment.price.toFixed(2)}</TableCell>
                    <TableCell align="right">${investment.currentValue.toFixed(2)}</TableCell>
                    <TableCell align="right">${investment.totalCost.toFixed(2)}</TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: gain >= 0 ? 'success.main' : 'error.main' }}
                    >
                      ${gain.toFixed(2)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: returnPct >= 0 ? 'success.main' : 'error.main' }}
                    >
                      {returnPct.toFixed(2)}%
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteInvestment(investment.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ height: 400 }}>
            {renderPerformanceChart()}
          </Box>
        </Paper>
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Asset Allocation
              </Typography>
              <Box sx={{ height: 400 }}>
                {renderAllocationChart()}
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Risk Allocation
              </Typography>
              <Box sx={{ height: 400 }}>
                <Pie
                  data={{
                    labels: Object.keys(portfolioStats.riskAllocation).map(
                      risk => riskLevels.find(r => r.value === risk)?.label || risk
                    ),
                    datasets: [
                      {
                        data: Object.values(portfolioStats.riskAllocation),
                        backgroundColor: [
                          '#4CAF50',
                          '#8BC34A',
                          '#FFC107',
                          '#FF9800',
                          '#F44336',
                        ],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      title: {
                        display: true,
                        text: 'Risk Distribution',
                      },
                    },
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Add Investment Dialog */}
      <Dialog
        open={openDialog === 'investment'}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Investment</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Symbol"
              value={newItem.symbol || ''}
              onChange={(e) => setNewItem({ ...newItem, symbol: e.target.value })}
              fullWidth
            />

            <TextField
              label="Name (Optional)"
              value={newItem.name || ''}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Asset Type</InputLabel>
              <Select
                value={newItem.type || ''}
                label="Asset Type"
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
              >
                {assetTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Risk Level</InputLabel>
              <Select
                value={newItem.riskLevel || 'moderate'}
                label="Risk Level"
                onChange={(e) => setNewItem({ ...newItem, riskLevel: e.target.value })}
              >
                {riskLevels.map((risk) => (
                  <MenuItem key={risk.value} value={risk.value}>
                    {risk.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Amount"
              type="number"
              value={newItem.amount || ''}
              onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
              fullWidth
            />

            <TextField
              label="Price"
              type="number"
              value={newItem.price || ''}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleAddInvestment}
            variant="contained"
            disabled={!newItem.symbol || !newItem.type || !newItem.amount || !newItem.price}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Transaction Dialog */}
      <Dialog
        open={openDialog === 'transaction'}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Transaction</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Investment</InputLabel>
              <Select
                value={newItem.investmentId || ''}
                label="Investment"
                onChange={(e) => setNewItem({ ...newItem, investmentId: e.target.value })}
              >
                {investments.map((inv) => (
                  <MenuItem key={inv.id} value={inv.id}>
                    {inv.symbol} - {inv.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Transaction Type</InputLabel>
              <Select
                value={newItem.type || ''}
                label="Transaction Type"
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
              >
                <MenuItem value="buy">Buy</MenuItem>
                <MenuItem value="sell">Sell</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Amount"
              type="number"
              value={newItem.amount || ''}
              onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
              fullWidth
            />

            <TextField
              label="Price"
              type="number"
              value={newItem.price || ''}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleAddTransaction}
            variant="contained"
            disabled={!newItem.investmentId || !newItem.type || !newItem.amount || !newItem.price}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const TabPanel = ({ children, value, index }) => {
  return value === index && <Box>{children}</Box>;
};

export default InvestmentPortfolio;