import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  Typography,
} from '@mui/material';
import { exportData, importData } from '../utils/dataExport';

export default function DataManager({ open, onClose, onDataImported }) {
  const [importStatus, setImportStatus] = useState(null);

  const handleExport = () => {
    exportData();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = importData(e.target.result);
      setImportStatus(result);
      if (result.success) {
        onDataImported();
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Data Management</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Export Data
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Download all your financial data including transactions, categories, budgets, goals, and recurring transactions.
          </Typography>
          <Button
            variant="contained"
            onClick={handleExport}
            sx={{ mb: 3 }}
          >
            Export to JSON
          </Button>

          <Typography variant="h6" gutterBottom>
            Import Data
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Import previously exported data. This will replace all current data.
          </Typography>
          <Button
            variant="contained"
            component="label"
            color="secondary"
          >
            Import from JSON
            <input
              type="file"
              hidden
              accept=".json"
              onChange={handleImport}
            />
          </Button>

          {importStatus && (
            <Alert
              severity={importStatus.success ? 'success' : 'error'}
              sx={{ mt: 2 }}
            >
              {importStatus.message}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}