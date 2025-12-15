import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box, Card, CardContent, CardHeader, Grid, Typography,
  Chip, Button, CircularProgress, Alert, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, OutlinedInput, MenuItem, Checkbox, ListItemText,
  Switch, FormControlLabel,
} from '@mui/material';
import { ArrowBack, Edit } from '@mui/icons-material';
import { PageHeader } from '@/shared/components/PageHeader';
import { useNotification } from '@/shared/hooks/useNotification';
import { formatDate } from '@/shared/utils/formatters';
import { useGetUserQuery, useUpdateUserStatusMutation, useAssignUserRolesMutation } from '../users.api';
import type { UserType } from '@/shared/types/common.types';

export function UserDetailPage() {
  const { t } = useTranslation('users');
  const { t: tc } = useTranslation('common');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useNotification();

  const ALL_ROLES: UserType[] = [
    'super_admin', 'admin', 'store_manager', 'warehouse_staff', 'customer_support', 'customer',
  ];
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  const [selectedRoles, setSelectedRoles] = useState<UserType[]>([]);
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateUserStatusMutation();
  const [assignRoles, { isLoading: assigningRoles }] = useAssignUserRolesMutation();

  const { data: userData, isLoading, isError } = useGetUserQuery(id ?? '', { skip: !id });

  const user = userData?.data;

  const openRoleDialog = () => {
    setSelectedRoles(user ? [user.user_type] : []);
    setRoleDialogOpen(true);
  };

  const handleStatusToggle = async () => {
    if (!user) return;
    try {
      await updateStatus({ id: user._id, is_active: !user.is_active }).unwrap();
      success(t(user.is_active ? 'messages.deactivated' : 'messages.activated'));
    } catch {
      error(t('messages.status_error'));
    }
  };

  const handleRoleSave = async () => {
    if (!user || selectedRoles.length === 0) return;
    try {
      await assignRoles({ id: user._id, body: { roles: selectedRoles } }).unwrap();
      success(t('messages.roles_updated'));
      setRoleDialogOpen(false);
    } catch {
      error(t('messages.save_error'));
    }
  };

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }
  if (isError || !user) {
    return <Alert severity="error">{t('detail.not_found')}</Alert>;
  }

  return (
    <Box>
      <PageHeader
        title={`${user.first_name} ${user.last_name}`}
        subtitle={user.email}
        actions={
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/users')}>{t('detail.back')}</Button>
        }
      />

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title={t('detail.profile_card')} action={
              <Button size="small" startIcon={<Edit />} onClick={openRoleDialog}>{t('detail.change_role')}</Button>
            } />
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">{t('fields.first_name')}</Typography>
                  <Typography variant="body2">{user.first_name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">{t('fields.last_name')}</Typography>
                  <Typography variant="body2">{user.last_name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">{tc('labels.email')}</Typography>
                  <Typography variant="body2">{user.email}</Typography>
                </Box>
                {user.phone && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">{tc('labels.phone')}</Typography>
                    <Typography variant="body2">{user.phone}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">{t('fields.language')}</Typography>
                  <Typography variant="body2">{user.preferred_language?.toUpperCase()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">{t('fields.role')}</Typography>
                  <Chip label={t(`roles.${user.user_type}`, { defaultValue: user.user_type })} size="small" variant="outlined" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">{t('fields.verified')}</Typography>
                  <Chip label={user.is_verified ? tc('labels.yes') : tc('labels.no')} size="small"
                    color={user.is_verified ? 'info' : 'default'} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">{t('fields.status')}</Typography>
                  <FormControlLabel
                    control={
                      <Switch checked={!!user.is_active} onChange={handleStatusToggle}
                        disabled={updatingStatus} size="small" />
                    }
                    label={user.is_active ? t('detail.active') : t('detail.inactive')}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Meta Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title={t('detail.system_card')} />
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">{t('detail.id_label')}</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {user._id}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">{t('detail.created_label')}</Typography>
                  <Typography variant="body2">{formatDate(user.created_at)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">{t('detail.updated_label')}</Typography>
                  <Typography variant="body2">{formatDate(user.updated_at)}</Typography>
                </Box>
                {user.store_id && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">{t('detail.store_label')}</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {typeof user.store_id === 'string' ? user.store_id : JSON.stringify(user.store_id)}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Role Dialog */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('detail.assign_role_title')}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>{t('fields.role')}</InputLabel>
            <Select
              value={selectedRoles[0] ?? ''}
              onChange={(e) => setSelectedRoles([e.target.value as UserType])}
              input={<OutlinedInput label={t('fields.role')} />}
            >
              {ALL_ROLES.map((role) => (
                <MenuItem key={role} value={role}>
                  <Checkbox checked={selectedRoles.includes(role)} />
                  <ListItemText primary={t(`roles.${role}`, { defaultValue: role })} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>{tc('actions.cancel')}</Button>
          <Button variant="contained" onClick={handleRoleSave} disabled={assigningRoles}>
            {tc('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
