import { createTheme, alpha } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

// ─── Brand constants ─────────────────────────────────────────────────────────

export const INTERDISCOUNT_RED = '#d32f2f';
export const INTERDISCOUNT_RED_DARK = '#ef5350';
export const DRAWER_WIDTH = 260;

// ─── Shared overrides ─────────────────────────────────────────────────────────

const sharedComponents: ThemeOptions['components'] = {
  MuiButton: {
    styleOverrides: {
      root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: { borderRadius: 12 },
    },
  },
  MuiPaper: {
    styleOverrides: {
      rounded: { borderRadius: 12 },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      head: { fontWeight: 700 },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: { borderRadius: 6 },
    },
  },
  MuiTextField: {
    defaultProps: { size: 'small' },
  },
  MuiSelect: {
    defaultProps: { size: 'small' },
  },
};

// ─── Light theme ──────────────────────────────────────────────────────────────

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: INTERDISCOUNT_RED },
    secondary: { main: '#1565c0' },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  components: {
    ...sharedComponents,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#212121',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: DRAWER_WIDTH,
          borderRight: '1px solid rgba(0,0,0,0.08)',
        },
      },
    },
  },
});

// ─── Dark theme ───────────────────────────────────────────────────────────────

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: INTERDISCOUNT_RED_DARK },
    secondary: { main: '#42a5f5' },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  components: {
    ...sharedComponents,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          color: '#ffffff',
          boxShadow: `0 1px 3px ${alpha('#000', 0.4)}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: DRAWER_WIDTH,
          backgroundColor: '#1e1e1e',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        },
      },
    },
  },
});
