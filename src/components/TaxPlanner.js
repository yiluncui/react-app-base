import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  IconButton,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Chip,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import CalculateIcon from '@mui/icons-material/Calculate';
import SavingsIcon from '@mui/icons-material/Savings';
import { alpha } from '@mui/material/styles';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, ChartTooltip, Legend);

const taxBrackets2024 = {
  single: [
    { rate: 0.10, upTo: 11600 },
    { rate: 0.12, upTo: 47150 },
    { rate: 0.22, upTo: 100525 },
    { rate: 0.24, upTo: 191950 },
    { rate: 0.32, upTo: 243725 },
    { rate: 0.35, upTo: 609350 },
    { rate: 0.37, upTo: Infinity },
  ],
  married: [
    { rate: 0.10, upTo: 23200 },
    { rate: 0.12, upTo: 94300 },
    { rate: 0.22, upTo: 201050 },
    { rate: 0.24, upTo: 383900 },
    { rate: 0.32, upTo: 487450 },
    { rate: 0.35, upTo: 731200 },
    { rate: 0.37, upTo: Infinity },
  ],
};

const standardDeduction2024 = {
  single: 14600,
  married: 29200,
};

export default function TaxPlanner({ transactions }) {
  const [filingStatus, setFilingStatus] = useState('single');
  const [income, setIncome] = useState({
    salary: 0,
    investments: 0,
    other: 0,
  });
  const [deductions, setDeductions] = useState({
    mortgage: 0,
    charity: 0,
    medical: 0,
    state: 0,
    other: 0,
  });
  const [useStandardDeduction, setUseStandardDeduction] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);

  useEffect(() => {
    // Calculate income from transactions
    const yearlyIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    setIncome(prev => ({
      ...prev,
      salary: yearlyIncome,
    }));
  }, [transactions]);

  const calculateTotalIncome = () => {
    return Object.values(income).reduce((sum, val) => sum + val, 0);
  };

  const calculateTotalDeductions = () => {
    if (useStandardDeduction) {
      return standardDeduction2024[filingStatus];
    }
    return Object.values(deductions).reduce((sum, val) => sum + val, 0);
  };

  const calculateTaxableIncome = () => {
    return Math.max(0, calculateTotalIncome() - calculateTotalDeductions());
  };

  const calculateTaxByBracket = () => {
    const taxableIncome = calculateTaxableIncome();
    const brackets = taxBrackets2024[filingStatus];
    let remainingIncome = taxableIncome;
    let totalTax = 0;
    let taxByBracket = [];

    for (let i = 0; i < brackets.length; i++) {
      const bracket = brackets[i];
      const prevLimit = i === 0 ? 0 : brackets[i - 1].upTo;
      const bracketSize = bracket.upTo - prevLimit;
      const taxableInBracket = Math.min(remainingIncome, bracketSize);
      
      if (taxableInBracket > 0) {
        const taxInBracket = taxableInBracket * bracket.rate;
        totalTax += taxInBracket;
        taxByBracket.push({
          rate: bracket.rate,
          amount: taxInBracket,
          income: taxableInBracket,
        });
        remainingIncome -= taxableInBracket;
      }

      if (remainingIncome <= 0) break;
    }

    return { totalTax, taxByBracket };
  };

  const { totalTax, taxByBracket } = calculateTaxByBracket();
  const effectiveRate = (totalTax / calculateTotalIncome()) * 100;
  const marginRate = taxBrackets2024[filingStatus].find(
    b => calculateTaxableIncome() <= b.upTo
  ).rate * 100;

  const chartData = {
    labels: taxByBracket.map(t => `${(t.rate * 100).toFixed(1)}% Bracket`),
    datasets: [{
      data: taxByBracket.map(t => t.amount),
      backgroundColor: [
        '#4caf50',
        '#2196f3',
        '#ff9800',
        '#f44336',
        '#9c27b0',
        '#795548',
        '#607d8b',
      ],
      borderWidth: 1,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: '"Inter", "Roboto", sans-serif',
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            return `$${value.toLocaleString()} tax`;
          },
        },
      },
    },
  };

  const handleEditField = (field, category) => {
    setEditingField({ field, category });
    setDialogOpen(true);
  };

  const handleSaveField = (value) => {
    if (editingField.field === 'income') {
      setIncome(prev => ({
        ...prev,
        [editingField.category]: parseFloat(value) || 0,
      }));
    } else {
      setDeductions(prev => ({
        ...prev,
        [editingField.category]: parseFloat(value) || 0,
      }));
    }
    setDialogOpen(false);
  };

  const ValueDisplay = ({ label, value, field, category }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Typography variant="body1" sx={{ flex: 1, color: 'text.secondary' }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="h6">
          ${value.toLocaleString()}
        </Typography>
        <IconButton
          size="small"
          onClick={() => handleEditField(field, category)}
          sx={{ ml: 1 }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ flex: 1, color: 'text.secondary' }}>
          Tax Planning
        </Typography>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Filing Status</InputLabel>
          <Select
            value={filingStatus}
            label="Filing Status"
            onChange={(e) => setFilingStatus(e.target.value)}
            size="small"
          >
            <MenuItem value="single">Single</MenuItem>
            <MenuItem value="married">Married Filing Jointly</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Typography variant="h6" gutterBottom>Income</Typography>
            
            <ValueDisplay
              label="Salary & Wages"
              value={income.salary}
              field="income"
              category="salary"
            />
            <ValueDisplay
              label="Investment Income"
              value={income.investments}
              field="income"
              category="investments"
            />
            <ValueDisplay
              label="Other Income"
              value={income.other}
              field="income"
              category="other"
            />

            <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle1" gutterBottom>
                Total Income
              </Typography>
              <Typography variant="h4" sx={{ color: 'success.main' }}>
                ${calculateTotalIncome().toLocaleString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ flex: 1 }}>Deductions</Typography>
              <Button
                size="small"
                onClick={() => setUseStandardDeduction(!useStandardDeduction)}
                startIcon={<CalculateIcon />}
              >
                {useStandardDeduction ? 'Use Itemized' : 'Use Standard'}
              </Button>
            </Box>

            {useStandardDeduction ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                Using standard deduction of ${standardDeduction2024[filingStatus].toLocaleString()}
              </Alert>
            ) : (
              <>
                <ValueDisplay
                  label="Mortgage Interest"
                  value={deductions.mortgage}
                  field="deductions"
                  category="mortgage"
                />
                <ValueDisplay
                  label="Charitable Contributions"
                  value={deductions.charity}
                  field="deductions"
                  category="charity"
                />
                <ValueDisplay
                  label="Medical Expenses"
                  value={deductions.medical}
                  field="deductions"
                  category="medical"
                />
                <ValueDisplay
                  label="State & Local Taxes"
                  value={deductions.state}
                  field="deductions"
                  category="state"
                />
                <ValueDisplay
                  label="Other Deductions"
                  value={deductions.other}
                  field="deductions"
                  category="other"
                />
              </>
            )}

            <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle1" gutterBottom>
                Total Deductions
              </Typography>
              <Typography variant="h4" sx={{ color: 'primary.main' }}>
                ${calculateTotalDeductions().toLocaleString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Typography variant="h6" gutterBottom>Tax Summary</Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Taxable Income
              </Typography>
              <Typography variant="h4" sx={{ color: 'text.primary' }}>
                ${calculateTaxableIncome().toLocaleString()}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Estimated Tax
              </Typography>
              <Typography variant="h4" sx={{ color: 'error.main' }}>
                ${totalTax.toLocaleString()}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Effective Rate
                </Typography>
                <Chip
                  label={`${effectiveRate.toFixed(1)}%`}
                  color="primary"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Marginal Rate
                </Typography>
                <Chip
                  label={`${marginRate.toFixed(1)}%`}
                  color="secondary"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Typography variant="h6" gutterBottom>Tax Breakdown</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Box sx={{ height: 300 }}>
                  <Doughnut data={chartData} options={chartOptions} />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                {taxByBracket.map((bracket, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {(bracket.rate * 100).toFixed(1)}% Tax Bracket
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Income in bracket:
                      </Typography>
                      <Typography variant="body2">
                        ${bracket.income.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Tax amount:
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'error.main' }}>
                        ${bracket.amount.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          Edit {editingField?.field === 'income' ? 'Income' : 'Deduction'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Amount"
            type="number"
            defaultValue={
              editingField?.field === 'income'
                ? income[editingField?.category]
                : deductions[editingField?.category]
            }
            sx={{ mt: 2 }}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={(e) => handleSaveField(e.target.form[0].value)}
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}