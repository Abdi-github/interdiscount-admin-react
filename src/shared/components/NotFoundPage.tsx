import { Box, Button, Container, Typography } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();
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
        <SearchOffIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
        <Typography variant="h4" fontWeight={700}>404</Typography>
        <Typography variant="h6" color="text.secondary">
          Seite nicht gefunden
        </Typography>
        <Typography variant="body2" color="text.disabled" maxWidth={360}>
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Zur Startseite
        </Button>
      </Box>
    </Container>
  );
}
