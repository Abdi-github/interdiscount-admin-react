import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';

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
          textAlign: 'center',
          gap: 2,
        }}
      >
        <Typography
          variant="h1"
          sx={{ fontSize: '6rem', fontWeight: 900, color: 'primary.main', lineHeight: 1 }}
        >
          404
        </Typography>
        <Typography variant="h5" fontWeight={700}>
          Seite nicht gefunden
        </Typography>
        <Typography color="text.secondary">
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
          >
            Zurück
          </Button>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={() => navigate('/')}
          >
            Zur Startseite
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
