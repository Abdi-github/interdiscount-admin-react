import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTableToolbar } from '@/shared/components/DataTableToolbar';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useNotification } from '@/shared/hooks/useNotification';
import { useDebounce } from '@/shared/hooks/useDebounce';
import {
  useGetBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} from '../brands.api';
import type { Brand, CreateBrandPayload } from '../brands.types';

// ─── Brand Form ───────────────────────────────────────────────────────────────

const brandSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich').max(100),
  logo_url: z.string().url('Ungültige URL').nullable().or(z.literal('')).optional(),
  is_active: z.boolean().optional(),
});

type BrandFormValues = z.infer<typeof brandSchema>;

interface BrandFormDialogProps {
  open: boolean;
  onClose: () => void;
  editBrand?: Brand | null;
}

function BrandFormDialog({ open, onClose, editBrand }: BrandFormDialogProps) {
  const { t } = useTranslation('brands');
  const { t: tc } = useTranslation('common');
  const { success, error } = useNotification();
  const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation();
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();
  const isLoading = isCreating || isUpdating;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: { name: editBrand?.name ?? '', logo_url: editBrand?.logo_url ?? '', is_active: editBrand?.is_active ?? true },
  });

  const onSubmit = async (values: BrandFormValues) => {
    const slug = values.name
      .toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const payload: CreateBrandPayload = {
      name: values.name,
      slug: editBrand?.slug ?? slug,
      logo_url: values.logo_url || null,
      is_active: values.is_active ?? true,
    };
    try {
      if (editBrand) {
        await updateBrand({ id: editBrand._id, body: payload }).unwrap();
        success(t('messages.updated'));
      } else {
        await createBrand(payload).unwrap();
        success(t('messages.created'));
      }
      reset();
      onClose();
    } catch {
      error(tc('errors.generic'));
    }
  };

  const handleClose = () => { reset(); onClose(); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{editBrand ? t('edit') : t('create')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Name"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
          <Controller
            name="logo_url"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                label="Logo URL (optional)"
                fullWidth
                error={!!errors.logo_url}
                helperText={errors.logo_url?.message}
              />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>{tc('actions.cancel')}</Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {editBrand ? tc('actions.save') : tc('actions.create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// ─── BrandsPage ───────────────────────────────────────────────────────────────

export function BrandsPage() {
  const { t } = useTranslation('brands');
  const { t: tc } = useTranslation('common');
  const [search, setSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 24 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editBrand, setEditBrand] = useState<Brand | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);

  const { success, error } = useNotification();
  const debouncedSearch = useDebounce(search, 300);
  const [deleteBrand, { isLoading: isDeleting }] = useDeleteBrandMutation();

  const { data, isLoading } = useGetBrandsQuery({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: debouncedSearch || undefined,
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBrand(deleteTarget._id).unwrap();
      success(t('messages.deleted'));
    } catch {
      error(tc('errors.generic'));
    }
    setDeleteTarget(null);
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: t('fields.name'), flex: 1, minWidth: 180 },
    { field: 'slug', headerName: t('fields.slug'), width: 160 },
    {
      field: 'product_count',
      headerName: tc('labels.quantity'),
      width: 100,
      type: 'number',
    },
    {
      field: 'is_active',
      headerName: t('fields.is_active'),
      width: 110,
      renderCell: (params) => {
        const value = params.value as boolean;
        return <Chip label={value ? tc('status.active') : tc('status.inactive')} color={value ? 'success' : 'default'} size="small" />;
      },
    },
    {
      field: 'actions',
      headerName: '',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: ({ row }: { row: Brand }) => (
        <Box>
          <Tooltip title={tc('actions.edit')}>
            <IconButton size="small" onClick={() => { setEditBrand(row); setDialogOpen(true); }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={tc('actions.delete')}>
            <IconButton size="small" color="error" onClick={() => setDeleteTarget(row)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const rows = (data?.data ?? []).map((b) => ({ ...b, id: b._id }));

  return (
    <Box>
      <PageHeader
        title={t('title')}
        subtitle={t('total', { count: data?.pagination?.total ?? 0 })}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditBrand(null); setDialogOpen(true); }}>
            {t('create')}
          </Button>
        }
      />
      <DataTableToolbar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPaginationModel((m) => ({ ...m, page: 0 })); }}
      />
      <DataGrid
        rows={rows}
        columns={columns}
        rowCount={data?.pagination?.total ?? 0}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        paginationMode="server"
        loading={isLoading}
        pageSizeOptions={[10, 24, 50]}
        disableRowSelectionOnClick
        autoHeight
        sx={{ border: 'none' }}
      />

      <BrandFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editBrand={editBrand}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={tc('confirm.deleteTitle')}
        message={deleteTarget?.name ? `${tc('confirm.deleteMessage')}` : tc('confirm.deleteMessage')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={isDeleting}
        destructive
      />
    </Box>
  );
}
