import { useMemo, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function MonthlyTrends() {
  const { transactions } = useFinance();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const years = useMemo(() => {
    const uniqueYears = [...new Set(transactions.map(t => t.date.split('-')[0]))];
    return uniqueYears.sort((a, b) => b - a);
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const month = (i + 1).toString().padStart(2, '0');
      return {
        month: month,
        income: 0,
        expenses: 0,
      };
    });

    transactions.forEach(transaction => {
      const [year, month] = transaction.date.split('-');
      if (year === selectedYear) {
        const monthIndex = parseInt(month) - 1;
        if (transaction.type === 'income') {
          months[monthIndex].income += transaction.amount;
        } else {
          months[monthIndex].expenses += transaction.amount;
        }
      }
    });

    return months;
  }, [transactions, selectedYear]);

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Income',
        data: monthlyData.map(m => m.income),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: monthlyData.map(m => m.expenses),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const totalIncome = monthlyData.reduce((sum, month) => sum + month.income, 0);
  const totalExpenses = monthlyData.reduce((sum, month) => sum + month.expenses, 0);
  const averageIncome = totalIncome / 12;
  const averageExpenses = totalExpenses / 12;

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Monthly Trends</Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Year</InputLabel>
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            label="Year"
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ height: 300, mb: 3 }}>
        <Line data={chartData} options={chartOptions} />
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="success.main" gutterBottom>
            Income Summary
          </Typography>
          <Typography variant="body2">
            Total: ${totalIncome}
          </Typography>
          <Typography variant="body2">
            Monthly Average: ${averageIncome.toFixed(2)}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="error.main" gutterBottom>
            Expenses Summary
          </Typography>
          <Typography variant="body2">
            Total: ${totalExpenses}
          </Typography>
          <Typography variant="body2">
            Monthly Average: ${averageExpenses.toFixed(2)}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}