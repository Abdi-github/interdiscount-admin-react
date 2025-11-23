import { useMemo, useEffect, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { SnackbarProvider } from 'notistack';
import { useTranslation } from 'react-i18next';
import { store } from './store';
import { useAppSelector } from './hooks';
import { selectColorMode, selectLocale } from '@/shared/state/uiSlice';
import { lightTheme, darkTheme } from '@/styles/theme';
import 'dayjs/locale/de';

// ─── Theme-aware inner wrapper ────────────────────────────────────────────────

function ThemeWrapper({ children }: { children: ReactNode }) {
  const colorMode = useAppSelector(selectColorMode);
  const locale = useAppSelector(selectLocale);
  const theme = useMemo(() => (colorMode === 'dark' ? darkTheme : lightTheme), [colorMode]);
  const { i18n } = useTranslation();

  // Sync Redux locale → i18next whenever the stored preference changes
  useEffect(() => {
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale, i18n]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="de">
        <SnackbarProvider
          maxSnack={4}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          autoHideDuration={4000}
        >
          {children}
        </SnackbarProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

// ─── Root providers ───────────────────────────────────────────────────────────

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
      <ThemeWrapper>{children}</ThemeWrapper>
    </Provider>
  );
}
