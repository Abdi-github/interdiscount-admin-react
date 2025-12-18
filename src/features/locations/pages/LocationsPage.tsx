import { useState } from 'react';
import {
  Box, Tab, Tabs, Button, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Stack,
  FormControlLabel, Switch, IconButton, Tooltip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/shared/components/PageHeader';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useNotification } from '@/shared/hooks/useNotification';
import {
  useGetPublicCantonsQuery,
  useGetPublicCitiesQuery,
  useCreateCantonMutation,
  useUpdateCantonMutation,
  useDeleteCantonMutation,
  useCreateCityMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
} from '../locations.api';
import type { Canton, City, CreateCantonPayload, CreateCityPayload } from '../locations.types';
import { useTranslation } from 'react-i18next';

// ─── Schemas ─────────────────────────────────────────────────────────────────

const cantonSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(4),
  is_active: z.boolean().default(true),
});

const citySchema = z.object({
  name: z.string().min(2),
  canton_id: z.string().min(1),
  is_active: z.boolean().default(true),
});

type CantonFormValues = z.infer<typeof cantonSchema>;
type CityFormValues = z.infer<typeof citySchema>;

// ─── Cantons Tab ─────────────────────────────────────────────────────────────

function CantonsTab() {
  const { t } = useTranslation('locations');
  const { t: tc } = useTranslation('common');
  const { success, error } = useNotification();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCanton, setEditCanton] = useState<Canton | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 24 });

  const { data, isLoading } = useGetPublicCantonsQuery({ limit: 200 });
  const [createCanton, { isLoading: creating }] = useCreateCantonMutation();
  const [updateCanton, { isLoading: updating }] = useUpdateCantonMutation();
  const [deleteCanton, { isLoading: deleting }] = useDeleteCantonMutation();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CantonFormValues>({
    resolver: zodResolver(cantonSchema),
    defaultValues: { name: '', code: '', is_active: true },
  });

  const openCreate = () => {
    setEditCanton(null);
    reset({ name: '', code: '', is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (canton: Canton) => {
    setEditCanton(canton);
    reset({ name: canton.name.de, code: canton.code, is_active: canton.is_active });
    setDialogOpen(true);
  };

  const onSubmit = async (values: CantonFormValues) => {
    const payload: CreateCantonPayload = {
      name: values.name,
      code: values.code.toUpperCase(),
      is_active: values.is_active,
    };
    try {
      if (editCanton) {
        await updateCanton({ id: editCanton._id, body: payload }).unwrap();
        success(t('cantons.messages.updated'));
      } else {
        await createCanton(payload).unwrap();
        success(t('cantons.messages.created'));
      }
      setDialogOpen(false);
    } catch {
      error(tc('errors.generic'));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCanton(deleteId).unwrap();
      success(t('cantons.messages.deleted'));
    } catch {
      error(tc('errors.generic'));
    } finally {
      setDeleteId(null);
    }
  };

  const columns: GridColDef[] = [
    { field: 'code', headerName: t('cantons.fields.code'), width: 80 },
    {
      field: 'name', headerName: t('cantons.fields.name'), flex: 1,
      valueGetter: (_, row: Canton) => row.name?.de ?? '',
    },
    {
      field: 'is_active', headerName: t('cantons.fields.is_active'), width: 100,
      renderCell: ({ value }) => (
        <Chip label={value ? tc('status.active') : tc('status.inactive')} size="small" color={value ? 'success' : 'default'} />
      ),
    },
    {
      field: 'actions', headerName: '', width: 90, sortable: false,
      renderCell: ({ row }: { row: Canton }) => (
        <Box>
          <Tooltip title={tc('actions.edit')}>
            <IconButton size="small" onClick={() => openEdit(row)}><Edit fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title={tc('actions.delete')}>
            <IconButton size="small" color="error" onClick={() => setDeleteId(row._id)}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const rows = (data?.data ?? []).map((c) => ({ ...c, id: c._id }));
  const paginated = rows.slice(
    paginationModel.page * paginationModel.pageSize,
    (paginationModel.page + 1) * paginationModel.pageSize,
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>{t('cantons.create')}</Button>
      </Box>
      <DataGrid
        rows={paginated}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        paginationMode="client"
        loading={isLoading}
        pageSizeOptions={[24, 50]}
        autoHeight
        disableRowSelectionOnClick
        sx={{ border: 'none' }}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editCanton ? t('cantons.edit') : t('cantons.create')}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Controller name="name" control={control}
                render={({ field }) => (
                  <TextField {...field} label={t('cantons.fields.name')} error={!!errors.name}
                    helperText={errors.name?.message} fullWidth />
                )}
              />
              <Controller name="code" control={control}
                render={({ field }) => (
                  <TextField {...field} label={t('cantons.fields.code')} error={!!errors.code}
                    helperText={errors.code?.message} fullWidth inputProps={{ maxLength: 4 }} />
                )}
              />
              <Controller name="is_active" control={control}
                render={({ field }) => (
                  <FormControlLabel control={<Switch checked={field.value} onChange={field.onChange} />}
                    label={tc('status.active')} />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>{tc('actions.cancel')}</Button>
            <Button type="submit" variant="contained" disabled={creating || updating}>{tc('actions.save')}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title={tc('confirm.deleteTitle')}
        message={tc('confirm.deleteMessage')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
        destructive
      />
    </Box>
  );
}

// ─── Cities Tab ───────────────────────────────────────────────────────────────

function CitiesTab() {
  const { t } = useTranslation('locations');
  const { t: tc } = useTranslation('common');
  const { success, error } = useNotification();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCity, setEditCity] = useState<City | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 24 });

  const { data: cantonsData } = useGetPublicCantonsQuery({ limit: 200 });
  const { data, isLoading } = useGetPublicCitiesQuery({ limit: 1000 });
  const [createCity, { isLoading: creating }] = useCreateCityMutation();
  const [updateCity, { isLoading: updating }] = useUpdateCityMutation();
  const [deleteCity, { isLoading: deleting }] = useDeleteCityMutation();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CityFormValues>({
    resolver: zodResolver(citySchema),
    defaultValues: { name: '', canton_id: '', is_active: true },
  });

  const openCreate = () => {
    setEditCity(null);
    reset({ name: '', canton_id: '', is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (city: City) => {
    setEditCity(city);
    const cantonId = typeof city.canton_id === 'object' ? city.canton_id._id : city.canton_id;
    reset({ name: city.name.de, canton_id: cantonId, is_active: city.is_active });
    setDialogOpen(true);
  };

  const onSubmit = async (values: CityFormValues) => {
    const payload: CreateCityPayload = {
      name: values.name,
      canton_id: values.canton_id,
      is_active: values.is_active,
    };
    try {
      if (editCity) {
        await updateCity({ id: editCity._id, body: payload }).unwrap();
        success(t('cities.messages.updated'));
      } else {
        await createCity(payload).unwrap();
        success(t('cities.messages.created'));
      }
      setDialogOpen(false);
    } catch {
      error(tc('errors.generic'));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCity(deleteId).unwrap();
      success(t('cities.messages.deleted'));
    } catch {
      error(tc('errors.generic'));
    } finally {
      setDeleteId(null);
    }
  };

  const cantons = cantonsData?.data ?? [];

  const columns: GridColDef[] = [
    {
      field: 'name', headerName: t('cities.fields.name'), flex: 1,
      valueGetter: (_, row: City) => row.name?.de ?? '',
    },
    {
      field: 'canton_id', headerName: t('cities.fields.canton'), width: 140,
      valueGetter: (_, row: City) => {
        if (typeof row.canton_id === 'object') return `${row.canton_id.code} – ${row.canton_id.name?.de ?? ''}`;
        const c = cantons.find((x) => x._id === row.canton_id);
        return c ? `${c.code} – ${c.name?.de ?? ''}` : row.canton_id as string;
      },
    },
    {
      field: 'is_active', headerName: t('cities.fields.is_active'), width: 100,
      renderCell: ({ value }) => (
        <Chip label={value ? tc('status.active') : tc('status.inactive')} size="small" color={value ? 'success' : 'default'} />
      ),
    },
    {
      field: 'actions', headerName: '', width: 90, sortable: false,
      renderCell: ({ row }: { row: City }) => (
        <Box>
          <Tooltip title={tc('actions.edit')}>
            <IconButton size="small" onClick={() => openEdit(row)}><Edit fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title={tc('actions.delete')}>
            <IconButton size="small" color="error" onClick={() => setDeleteId(row._id)}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const rows = (data?.data ?? []).map((c) => ({ ...c, id: c._id }));
  const paginated = rows.slice(
    paginationModel.page * paginationModel.pageSize,
    (paginationModel.page + 1) * paginationModel.pageSize,
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>{t('cities.create')}</Button>
      </Box>
      <DataGrid
        rows={paginated}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        paginationMode="client"
        loading={isLoading}
        pageSizeOptions={[24, 50]}
        autoHeight
        disableRowSelectionOnClick
        sx={{ border: 'none' }}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editCity ? t('cities.edit') : t('cities.create')}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Controller name="name" control={control}
                render={({ field }) => (
                  <TextField {...field} label={t('cities.fields.name')} error={!!errors.name}
                    helperText={errors.name?.message} fullWidth />
                )}
              />
              <Controller name="canton_id" control={control}
                render={({ field }) => (
                  <TextField {...field} select label={t('cities.fields.canton')} error={!!errors.canton_id}
                    helperText={errors.canton_id?.message} fullWidth SelectProps={{ native: true }}>
                    <option value="">--</option>
                    {cantons.map((c) => (
                      <option key={c._id} value={c._id}>{c.code} – {c.name?.de}</option>
                    ))}
                  </TextField>
                )}
              />
              <Controller name="is_active" control={control}
                render={({ field }) => (
                  <FormControlLabel control={<Switch checked={field.value} onChange={field.onChange} />}
                    label={tc('status.active')} />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>{tc('actions.cancel')}</Button>
            <Button type="submit" variant="contained" disabled={creating || updating}>{tc('actions.save')}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title={tc('confirm.deleteTitle')}
        message={tc('confirm.deleteMessage')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
        destructive
      />
    </Box>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function LocationsPage() {
  const [tab, setTab] = useState(0);
  const { t } = useTranslation('locations');

  return (
    <Box>
      <PageHeader title={t('title')} />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label={t('cantons.title')} />
        <Tab label={t('cities.title')} />
      </Tabs>
      {tab === 0 && <CantonsTab />}
      {tab === 1 && <CitiesTab />}
    </Box>
  );
}
