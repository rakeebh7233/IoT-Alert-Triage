import { createTheme } from '@mui/material/styles';

export const getTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: { main: '#EFC01A' }, // Gold
    secondary: { main: '#4B8189' }, // Teal
    error: { main: '#F44336' },
    warning: { main: '#FFA726' },
    info: { main: '#29B6F6' },
    success: { main: '#66BB6A' },
    background: {
      default: mode === 'light' ? '#F5F5F5' : '#121212',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none' },
      },
    },
  },
});