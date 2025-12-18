import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Tab, Tabs, Card, CardContent, CardHeader, Stack,
  TextField, Button, MenuItem, Typography, Alert,
  FormControlLabel, Switch, Divider,
} from '@mui/material';
import { Save, Lock } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/shared/components/PageHeader';
import { useAuth } from '@/shared/hooks/useAuth';
import { useNotification } from '@/shared/hooks/useNotification';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setCredentials, logout } from '@/shared/state/authSlice';
import { setLocale, selectLocale, toggleColorMode, selectColorMode } from '@/shared/state/uiSlice';
import { useUpdateProfileMutation } from '../settings.api';
import type { UpdateProfilePayload } from '../settings.types';
import type { AppLocale } from '@/shared/types/common.types';

// ─── Schemas ─────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  first_name: z.string().min(2, 'validation.min_2'),
  last_name: z.string().min(2, 'validation.min_2'),
  email: z.string().email('validation.email_invalid'),
  phone: z.string().optional(),
  preferred_language: z.enum(['de', 'en', 'fr', 'it']),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab() {
  const { user, accessToken } = useAuth();
  const dispatch = useAppDispatch();
  const { success, error } = useNotification();
  const { t, i18n } = useTranslation('settings');
  const { t: tc } = useTranslation('common');
  const err = (msg?: string) => (msg ? t(msg) : undefined);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const { control, handleSubmit, formState: { errors, isDirty } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      email: user?.email ?? '',
      phone: '',
      preferred_language: user?.preferred_language ?? 'de',
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    const payload: UpdateProfilePayload = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      phone: values.phone || undefined,
      preferred_language: values.preferred_language,
    };
    try {
      const result = await updateProfile({ id: user._id, body: payload }).unwrap();
      if (result.data && accessToken) {
        dispatch(setCredentials({
          user: result.data,
          access_token: accessToken,
          refresh_token: '',
        }));
      }
      // Sync language preference immediately
      dispatch(setLocale(values.preferred_language as AppLocale));
      i18n.changeLanguage(values.preferred_language);
      success(t('profile.messages.updated'));
    } catch {
      error(tc('errors.generic'));
    }
  };

  return (
    <Card>
      <CardHeader title={t('profile.title')} subheader={t('profile.subtitle')} />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ maxWidth: 480 }}>
            <Stack direction="row" spacing={2}>
              <Controller name="first_name" control={control}
                render={({ field }) => (
                  <TextField {...field} label={t('profile.fields.first_name')} error={!!errors.first_name}
                    helperText={err(errors.first_name?.message)} fullWidth />
                )}
              />
              <Controller name="last_name" control={control}
                render={({ field }) => (
                  <TextField {...field} label={t('profile.fields.last_name')} error={!!errors.last_name}
                    helperText={err(errors.last_name?.message)} fullWidth />
                )}
              />
            </Stack>
            <Controller name="email" control={control}
              render={({ field }) => (
                <TextField {...field} label={t('profile.fields.email')} type="email" error={!!errors.email}
                  helperText={err(errors.email?.message)} fullWidth />
              )}
            />
            <Controller name="phone" control={control}
              render={({ field }) => (
                <TextField {...field} label={t('profile.fields.phone')} fullWidth />
              )}
            />
            <Controller name="preferred_language" control={control}
              render={({ field }) => (
                <TextField {...field} select label={t('profile.fields.language')} fullWidth>
                  <MenuItem value="de">Deutsch</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="fr">Français</MenuItem>
                  <MenuItem value="it">Italiano</MenuItem>
                </TextField>
              )}
            />
            <Box>
              <Button type="submit" variant="contained" startIcon={<Save />}
                disabled={isLoading || !isDirty}>
                {t('profile.save_btn')}
              </Button>
            </Box>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Appearance Tab ───────────────────────────────────────────────────────────

function AppearanceTab() {
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation('settings');
  const colorMode = useAppSelector(selectColorMode);
  const currentLocale = useAppSelector(selectLocale);
  const isDark = colorMode === 'dark';

  const handleLanguageChange = (lang: AppLocale) => {
    dispatch(setLocale(lang));
    i18n.changeLanguage(lang);
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 480 }}>
      <Card>
        <CardHeader title={t('appearance.title')} subheader={t('appearance.subtitle')} />
        <CardContent>
          <Stack spacing={3} divider={<Divider />}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t('appearance.color_mode')}
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={isDark}
                    onChange={() => dispatch(toggleColorMode())}
                    color="primary"
                  />
                }
                label={isDark ? t('appearance.dark_mode') : t('appearance.light_mode')}
              />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                {t('appearance.color_mode_hint')}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t('appearance.language_label')}
              </Typography>
              <TextField
                select
                value={currentLocale}
                onChange={(e) => handleLanguageChange(e.target.value as AppLocale)}
                fullWidth
                size="small"
                label={t('profile.fields.language')}
              >
                <MenuItem value="de">🇩🇪 Deutsch</MenuItem>
                <MenuItem value="en">🇬🇧 English</MenuItem>
                <MenuItem value="fr">🇫🇷 Français</MenuItem>
                <MenuItem value="it">🇮🇹 Italiano</MenuItem>
              </TextField>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                {t('appearance.language_hint')}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation('settings');

  const handleResetPassword = () => {
    dispatch(logout());
    navigate('/auth/forgot-password');
  };

  return (
    <Card>
      <CardHeader title={t('security.title')} subheader={t('security.card_subtitle')} />
      <CardContent>
        <Stack spacing={3} sx={{ maxWidth: 480 }}>
          <Alert severity="info">
            {t('security.reset_info')}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            E-Mail: <strong>{user?.email}</strong>
          </Typography>
          <Box>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<Lock />}
              onClick={handleResetPassword}
            >
              {t('security.password_reset')}
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function SettingsPage() {
  const [tab, setTab] = useState(0);
  const { user } = useAuth();
  const { t } = useTranslation('settings');

  return (
    <Box>
      <PageHeader
        title={t('title')}
        subtitle={user ? `${user.first_name} ${user.last_name} · ${user.email}` : ''}
      />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label={t('tabs.profile')} />
        <Tab label={t('tabs.appearance')} />
        <Tab label={t('tabs.security')} />
      </Tabs>
      {tab === 0 && <ProfileTab />}
      {tab === 1 && <AppearanceTab />}
      {tab === 2 && <SecurityTab />}
    </Box>
  );
}
