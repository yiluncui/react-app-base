import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      lighter: '#e3f2fd',
    },
    success: {
      main: '#2e7d32',
      lighter: '#e8f5e9',
    },
    error: {
      main: '#d32f2f',
      lighter: '#ffebee',
    },
    warning: {
      main: '#ed6c02',
      lighter: '#fff3e0',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          height: '100%',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          '&:last-child': {
            paddingBottom: 16,
          },
        },
      },
    },
  },
});

export default theme;