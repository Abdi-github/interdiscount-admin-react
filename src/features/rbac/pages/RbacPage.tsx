import { useState } from 'react';
import {
  Box, Grid, Card, CardContent, CardHeader, List, ListItemButton,
  ListItemText, Typography, Chip, Checkbox, Button, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Divider, CircularProgress, FormControlLabel,
} from '@mui/material';
import { Add, Save } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/shared/components/PageHeader';
import { useNotification } from '@/shared/hooks/useNotification';
import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useGetPermissionsQuery,
  useGetRolePermissionsQuery,
  useUpdateRolePermissionsMutation,
} from '../rbac.api';
import type { Role, RbacPermission } from '../rbac.types';
import { useTranslation } from 'react-i18next';

const roleSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(3),
});
type RoleFormValues = z.infer<typeof roleSchema>;

// Group permissions by resource
function groupByResource(permissions: RbacPermission[]): Record<string, RbacPermission[]> {
  return permissions.reduce<Record<string, RbacPermission[]>>((acc, perm) => {
    if (!acc[perm.resource]) acc[perm.resource] = [];
    acc[perm.resource].push(perm);
    return acc;
  }, {});
}

// ─── Permissions Editor ───────────────────────────────────────────────────────

function PermissionsEditor({ role }: { role: Role }) {
  const { t } = useTranslation('rbac');
  const { t: tc } = useTranslation('common');
  const { success, error } = useNotification();
  const { data: permissionsData, isLoading: loadingPerms } = useGetPermissionsQuery({ limit: 200 });
  const { data: rolePermsData, isLoading: loadingRolePerms } = useGetRolePermissionsQuery(role._id);
  const [updateRolePermissions, { isLoading: saving }] = useUpdateRolePermissionsMutation();

  const allPerms = permissionsData?.data ?? [];
  const rolePermIds = new Set((rolePermsData?.data ?? []).map((p) => p._id));

  const [selected, setSelected] = useState<Set<string>>(() => rolePermIds);

  const toggle = (id: string) => {
    if (role.is_system) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    try {
      await updateRolePermissions({
        id: role._id,
        body: { permission_ids: [...selected] },
      }).unwrap();
      success(t('roles.messages.permissions_saved'));
    } catch {
      error(tc('errors.generic'));
    }
  };

  if (loadingPerms || loadingRolePerms) return <CircularProgress size={24} />;

  const grouped = groupByResource(allPerms);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {t('permissions.selected', { count: selected.size, total: allPerms.length })}
        </Typography>
        {!role.is_system && (
          <Button size="small" variant="contained" startIcon={<Save />}
            onClick={handleSave} disabled={saving}>
            {tc('actions.save')}
          </Button>
        )}
      </Box>
      {role.is_system && (
        <Chip label={t('system_role_warning')} color="warning" size="small" sx={{ mb: 2 }} />
      )}
      <Stack spacing={2}>
        {Object.entries(grouped).map(([resource, perms]) => (
          <Box key={resource}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>
              {resource}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {perms.map((perm) => (
                <FormControlLabel
                  key={perm._id}
                  control={
                    <Checkbox
                      size="small"
                      checked={selected.has(perm._id)}
                      onChange={() => toggle(perm._id)}
                      disabled={role.is_system}
                    />
                  }
                  label={<Typography variant="caption">{perm.display_name?.de ?? perm.name}</Typography>}
                  sx={{ mr: 1 }}
                />
              ))}
            </Box>
            <Divider sx={{ mt: 1 }} />
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function RbacPage() {
  const { t } = useTranslation('rbac');
  const { t: tc } = useTranslation('common');
  const { success, error } = useNotification();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: rolesData, isLoading } = useGetRolesQuery();
  const [createRole, { isLoading: creating }] = useCreateRoleMutation();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: '', description: '' },
  });

  const roles = rolesData?.data ?? [];

  const onCreateRole = async (values: RoleFormValues) => {
    try {
      await createRole(values).unwrap();
      success(t('roles.messages.created'));
      setCreateDialogOpen(false);
      reset();
    } catch {
      error(tc('errors.generic'));
    }
  };

  return (
    <Box>
      <PageHeader
        title={t('title')}
        actions={
          <Button variant="contained" startIcon={<Add />} onClick={() => setCreateDialogOpen(true)}>
            {t('roles.create')}
          </Button>
        }
      />

      <Grid container spacing={3}>
        {/* Roles list */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title={t('roles.title')} subheader={`${roles.length} ${t('roles.role')}`} />
            <CardContent sx={{ p: 0 }}>
              {isLoading ? (
                <Box sx={{ p: 2 }}><CircularProgress size={24} /></Box>
              ) : (
                <List dense>
                  {roles.map((role) => (
                    <ListItemButton
                      key={role._id}
                      selected={selectedRole?._id === role._id}
                      onClick={() => setSelectedRole(role)}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {role.display_name?.de ?? role.name}
                            </Typography>
                            {role.is_system && <Chip label="System" size="small" color="warning" />}
                          </Box>
                        }
                        secondary={role.description?.de ?? ''}
                      />
                    </ListItemButton>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Permissions editor */}
        <Grid item xs={12} md={8}>
          <Card sx={{ minHeight: 400 }}>
            <CardHeader
              title={selectedRole ? `${t('permissions.title')}: ${selectedRole.display_name?.de ?? selectedRole.name}` : t('permissions.title')}
            />
            <CardContent>
              {selectedRole ? (
                <PermissionsEditor role={selectedRole} key={selectedRole._id} />
              ) : (
                <Typography color="text.secondary">{t('permissions.all')}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Create Role Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('roles.create')}</DialogTitle>
        <form onSubmit={handleSubmit(onCreateRole)}>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Controller name="name" control={control}
                render={({ field }) => (
                  <TextField {...field} label={t('roles.fields.name')} error={!!errors.name}
                    helperText={errors.name?.message} fullWidth />
                )}
              />
              <Controller name="description" control={control}
                render={({ field }) => (
                  <TextField {...field} label={t('roles.fields.description')} error={!!errors.description}
                    helperText={errors.description?.message} fullWidth multiline rows={2} />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>{tc('actions.cancel')}</Button>
            <Button type="submit" variant="contained" disabled={creating}>{t('roles.create')}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
