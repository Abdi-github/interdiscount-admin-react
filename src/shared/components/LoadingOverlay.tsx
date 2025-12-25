import { Backdrop, CircularProgress, Typography, Box } from '@mui/material';

interface LoadingOverlayProps {
  open: boolean;
  message?: string;
}

export function LoadingOverlay({ open, message }: LoadingOverlayProps) {
  return (
    <Backdrop
      open={open}
      sx={{ zIndex: (theme) => theme.zIndex.modal + 1, color: '#fff', flexDirection: 'column', gap: 2 }}
    >
      <CircularProgress color="inherit" />
      {message && (
        <Typography variant="body1" color="inherit">
          {message}
        </Typography>
      )}
    </Backdrop>
  );
}

// ─── Inline variant ───────────────────────────────────────────────────────────

export function InlineLoader() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress />
    </Box>
  );
}
