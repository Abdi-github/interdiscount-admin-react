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
  MenuItem,
  TextField,
  Tooltip,
  Stack,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTableToolbar } from '@/shared/components/DataTableToolbar';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useNotification } from '@/shared/hooks/useNotification';
import { useDebounce } from '@/shared/hooks/useDebounce';
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '../categories.api';
import type { Category, CreateCategoryPayload } from '../categories.types';
import { useTranslation } from 'react-i18next';

// ─── Category Form ────────────────────────────────────────────────────────────

const categorySchema = z.object({
  name_de: z.string().min(1),
  name_en: z.string().min(1),
  name_fr: z.string().min(1),
  name_it: z.string().min(1),
  parent_id: z.string().nullable().optional(),
  sort_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormDialogProps {
  open: boolean;
  onClose: () => void;
  editCategory?: Category | null;
}

function CategoryFormDialog({ open, onClose, editCategory }: CategoryFormDialogProps) {
  const { t } = useTranslation('categories');
  const { t: tc } = useTranslation('common');
  const { success, error } = useNotification();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const isLoading = isCreating || isUpdating;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name_de: editCategory?.name?.de ?? '',
      name_en: editCategory?.name?.en ?? '',
      name_fr: editCategory?.name?.fr ?? '',
      name_it: editCategory?.name?.it ?? '',
      parent_id: editCategory?.parent_id ?? null,
      sort_order: editCategory?.sort_order ?? 0,
      is_active: editCategory?.is_active ?? true,
    },
  });

  const onSubmit = async (values: CategoryFormValues) => {
    const slug = values.name_de
      .toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const payload: CreateCategoryPayload = {
      name: { de: values.name_de, en: values.name_en, fr: values.name_fr, it: values.name_it },
      slug: editCategory?.slug ?? slug,
      parent_id: values.parent_id || null,
      sort_order: values.sort_order ?? 0,
      is_active: values.is_active ?? true,
    };
    try {
      if (editCategory) {
        await updateCategory({ id: editCategory._id, body: payload }).unwrap();
        success(t('messages.updated'));
      } else {
        await createCategory(payload).unwrap();
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
        <DialogTitle>{editCategory ? t('edit') : t('create')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <Controller name="name_de" control={control}
            render={({ field }) => <TextField {...field} label="Name (Deutsch) *" fullWidth error={!!errors.name_de} helperText={errors.name_de?.message} />}
          />
          <Controller name="name_en" control={control}
            render={({ field }) => <TextField {...field} label="Name (English) *" fullWidth error={!!errors.name_en} helperText={errors.name_en?.message} />}
          />
          <Stack direction="row" spacing={2}>
            <Controller name="name_fr" control={control}
              render={({ field }) => <TextField {...field} label="Nom (Français) *" fullWidth error={!!errors.name_fr} helperText={errors.name_fr?.message} />}
            />
            <Controller name="name_it" control={control}
              render={({ field }) => <TextField {...field} label="Nome (Italiano) *" fullWidth error={!!errors.name_it} helperText={errors.name_it?.message} />}
            />
          </Stack>
          <Controller name="sort_order" control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('fields.sort_order')}
                type="number"
                fullWidth
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>{tc('actions.cancel')}</Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {editCategory ? tc('actions.save') : tc('actions.create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// ─── CategoriesPage ───────────────────────────────────────────────────────────

const LEVEL_OPTIONS = [
  { value: '', label: '' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
];

export function CategoriesPage() {
  const { t } = useTranslation('categories');
  const { t: tc } = useTranslation('common');
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 24 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const { success, error } = useNotification();
  const debouncedSearch = useDebounce(search, 300);
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const { data, isLoading } = useGetCategoriesQuery({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: debouncedSearch || undefined,
    level: levelFilter ? Number(levelFilter) : undefined,
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget._id).unwrap();
      success(t('messages.deleted'));
    } catch {
      error(tc('errors.generic'));
    }
    setDeleteTarget(null);
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: t('fields.name'),
      flex: 1,
      minWidth: 200,
      valueGetter: (_v: unknown, row: Category) => row.name?.de ?? '—',
    },
    {
      field: 'name_en',
      headerName: t('fields.name') + ' (EN)',
      width: 160,
      valueGetter: (_v: unknown, row: Category) => row.name?.en ?? '—',
    },
    { field: 'slug', headerName: t('fields.slug'), width: 180 },
    {
      field: 'level',
      headerName: 'Level',
      width: 80,
      type: 'number',
      renderCell: (params) => {
        const value = params.value as number;
        return <Chip label={`L${value}`} size="small" variant="outlined" />;
      },
    },
    {
      field: 'sort_order',
      headerName: t('fields.sort_order'),
      width: 70,
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
      renderCell: ({ row }: { row: Category }) => (
        <Box>
          <Tooltip title={tc('actions.edit')}>
            <IconButton size="small" onClick={() => { setEditCategory(row); setDialogOpen(true); }}>
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

  const rows = (data?.data ?? []).map((c) => ({ ...c, id: c._id }));

  return (
    <Box>
      <PageHeader
        title={t('title')}
        subtitle={t('total', { count: data?.pagination?.total ?? 0 })}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditCategory(null); setDialogOpen(true); }}>
            {t('create')}
          </Button>
        }
      />

      <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center">
        <DataTableToolbar
          searchValue={search}
          onSearchChange={(v) => { setSearch(v); setPaginationModel((m) => ({ ...m, page: 0 })); }}
        />
        <TextField
          select
          size="small"
          value={levelFilter}
          onChange={(e) => { setLevelFilter(e.target.value); setPaginationModel((m) => ({ ...m, page: 0 })); }}
          sx={{ minWidth: 130 }}
          label="Level"
        >
          {LEVEL_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.value ? `Level ${opt.label}` : tc('actions.filter')}</MenuItem>
          ))}
        </TextField>
      </Stack>

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

      <CategoryFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editCategory={editCategory}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={tc('confirm.deleteTitle')}
        message={tc('confirm.deleteMessage')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={isDeleting}
        destructive
      />
    </Box>
  );
}
