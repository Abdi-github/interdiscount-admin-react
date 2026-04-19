import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Typography,
  Chip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoginMutation } from '../auth.api';
import { setCredentials } from '@/shared/state/authSlice';
import { useAppDispatch } from '@/app/hooks';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '@/shared/hooks/useNotification';

const schema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(1, 'Passwort ist erforderlich'),
});

type LoginFormValues = z.infer<typeof schema>;

const DEMO_ACCOUNTS = [
  { role: 'Super Admin', email: 'admin.de@interdiscount-clone.ch', password: 'Password123!', color: '#d32f2f' as const },
  { role: 'Platform Admin', email: 'moderator.de@interdiscount-clone.ch', password: 'Password123!', color: '#e65100' as const },
  { role: 'Store Manager', email: 'manager.de@interdiscount-clone.ch', password: 'Password123!', color: '#2e7d32' as const },
  { role: 'Store Staff', email: 'staff.de@interdiscount-clone.ch', password: 'Password123!', color: '#1565c0' as const },
  { role: 'Support Agent', email: 'support.de@interdiscount-clone.ch', password: 'Password123!', color: '#6a1b9a' as const },
] as const;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { success } = useNotification();
  const { t } = useTranslation('auth');
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(schema) });

  const fillDemoAccount = (account: typeof DEMO_ACCOUNTS[number]) => {
    setValue('email', account.email, { shouldValidate: true });
    setValue('password', account.password, { shouldValidate: true });
    setServerError(null);
  };

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const result = await login(values).unwrap();
      dispatch(
        setCredentials({
          user: result.data.user,
          access_token: result.data.tokens.access_token,
          refresh_token: result.data.tokens.refresh_token,
        })
      );
      success(t('login.welcome'));
      const userType = result.data.user.user_type;
      const isStoreRole = userType === 'store_manager' || userType === 'warehouse_staff';
      navigate(isStoreRole ? '/store-dashboard' : '/dashboard', { replace: true });
    } catch (err: unknown) {
      const apiErr = err as { data?: { error?: { message?: string }; message?: string } };
      setServerError(
        apiErr?.data?.error?.message ?? apiErr?.data?.message ?? 'Anmeldung fehlgeschlagen'
      );
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {serverError}
        </Alert>
      )}

      <TextField
        label="E-Mail-Adresse"
        type="email"
        fullWidth
        autoFocus
        autoComplete="email"
        size="medium"
        error={!!errors.email}
        helperText={errors.email?.message}
        sx={{ mb: 2 }}
        {...register('email')}
      />

      <TextField
        label="Passwort"
        type={showPassword ? 'text' : 'password'}
        fullWidth
        autoComplete="current-password"
        size="medium"
        error={!!errors.password}
        helperText={errors.password?.message}
        sx={{ mb: 3 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword((s) => !s)}
                edge="end"
                size="small"
                aria-label="Passwort anzeigen"
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        {...register('password')}
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : null}
      >
        {isLoading ? 'Anmelden…' : 'Anmelden'}
      </Button>

      <Divider sx={{ my: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Demo Accounts
        </Typography>
      </Divider>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
        {DEMO_ACCOUNTS.map((account) => (
          <Chip
            key={account.role}
            label={account.role}
            onClick={() => fillDemoAccount(account)}
            sx={{
              bgcolor: account.color,
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.75rem',
              '&:hover': { bgcolor: account.color, opacity: 0.85 },
              cursor: 'pointer',
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
