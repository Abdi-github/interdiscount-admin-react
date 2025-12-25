import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <Container maxWidth="sm">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              gap: 2,
              textAlign: 'center',
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main' }} />
            <Typography variant="h5" fontWeight={700}>
              Etwas ist schiefgelaufen
            </Typography>
            <Typography variant="body2" color="text.secondary" maxWidth={400}>
              {this.state.error?.message ?? 'Ein unerwarteter Fehler ist aufgetreten.'}
            </Typography>
            <Button variant="contained" onClick={this.handleReset}>
              Erneut versuchen
            </Button>
            <Button variant="text" onClick={() => (window.location.href = '/')}>
              Zur Startseite
            </Button>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}
