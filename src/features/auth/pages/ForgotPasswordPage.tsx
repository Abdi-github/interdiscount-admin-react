import { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Alert, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForgotPasswordMutation } from '../auth.api';

const schema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
});

type ForgotPasswordValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      await forgotPassword(values).unwrap();
      setSent(true);
    } catch {
      setSent(true); // Still show success to prevent email enumeration
    }
  };

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
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>
            Passwort zurücksetzen
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Geben Sie Ihre E-Mail-Adresse ein
          </Typography>
        </Box>

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 4 }}>
            {sent ? (
              <Alert severity="success">
                Falls Ihre E-Mail-Adresse bekannt ist, erhalten Sie eine Nachricht.
              </Alert>
            ) : (
              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <TextField
                  label="E-Mail-Adresse"
                  type="email"
                  fullWidth
                  size="medium"
                  autoFocus
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{ mb: 3 }}
                  {...register('email')}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={isLoading}
                >
                  {isLoading ? 'Senden…' : 'Link senden'}
                </Button>
              </Box>
            )}

            <Box sx={{ mt: 2.5, textAlign: 'center' }}>
              <Link component={RouterLink} to="/auth/login" underline="hover" variant="body2">
                Zurück zur Anmeldung
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
