import { Box, Card, CardContent, Typography, Link, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { INTERDISCOUNT_RED } from '@/styles/theme';

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        {/* Brand header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: INTERDISCOUNT_RED,
              color: '#fff',
              width: 52,
              height: 52,
              borderRadius: 2,
              mb: 1.5,
            }}
          >
            <Typography variant="h5" fontWeight={900}>
              i
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight={700}>
            Interdiscount Admin
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Melden Sie sich an, um fortzufahren
          </Typography>
        </Box>

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 4 }}>
            <LoginForm />

            <Divider sx={{ my: 2.5 }} />

            <Typography variant="body2" color="text.secondary" textAlign="center">
              <Link component={RouterLink} to="/auth/forgot-password" underline="hover">
                Passwort vergessen?
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
