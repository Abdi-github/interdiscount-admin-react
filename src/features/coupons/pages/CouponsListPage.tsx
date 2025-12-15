import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Chip, Dialog, DialogContent, DialogTitle,
  IconButton, MenuItem, Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { PageHeader } from '@/shared/components/PageHeader';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useNotification } from '@/shared/hooks/useNotification';
import { formatDate, formatCHF } from '@/shared/utils/formatters';
import { useTranslation } from 'react-i18next';
import {
  useGetCouponsQuery,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} from '../coupons.api';
// Note: CouponsListPage - coupon campaign management
// TODO: Implement coupon effectiveness tracking and ROI calculation
import { CouponForm } from '../components/CouponForm';
import type { Coupon, CreateCouponPayload } from '../coupons.types';

export function CouponsListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('coupons');
  const { t: tc } = useTranslation('common');
  const { success, error } = useNotification();

  const ACTIVE_OPTIONS = [
    { value: '', label: t('title') },
    { value: 'true', label: tc('status.active') },
    { value: 'false', label: tc('status.inactive') },
  ];

  const [activeFilter, setActiveFilter] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 25 });
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const isActive = activeFilter === 'true' ? true : activeFilter === 'false' ? false : undefined;

  const { data, isLoading } = useGetCouponsQuery({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    is_active: isActive,
  });

  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
  const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();

  const handleUpdate = async (payload: CreateCouponPayload) => {
    if (!editCoupon) return;
    try {
      await updateCoupon({ id: editCoupon._id, body: payload }).unwrap();
      success(t('messages.updated'));
      setEditCoupon(null);
    } catch {
      error(tc('errors.generic'));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCoupon(deleteTarget).unwrap();
      success(t('messages.deleted'));
      setDeleteTarget(null);
    } catch {
      error(tc('errors.generic'));
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'code',
      headerName: 'Code',
      width: 140,
      renderCell: ({ value }) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: 1 }}>
          {value}
        </Typography>
      ),
    },
    {
      field: 'discount_type',
      headerName: t('fields.type'),
      width: 130,
      renderCell: ({ row }) => (
        <Typography variant="body2" fontWeight={600}>
          {row.discount_type === 'percentage'
            ? `${row.discount_value}%`
            : formatCHF(row.discount_value)}
        </Typography>
      ),
    },
    {
      field: 'minimum_order',
      headerName: t('fields.min_order_amount'),
      width: 160,
      renderCell: ({ value }) => value ? formatCHF(value) : '—',
    },
    {
      field: 'usage',
      headerName: t('fields.uses_count'),
      width: 130,
      renderCell: ({ row }) => (
        <Typography variant="body2">
          {row.used_count}
          {row.max_uses ? ` / ${row.max_uses}` : ''}
        </Typography>
      ),
    },
    {
      field: 'valid_from',
      headerName: t('fields.valid_from'),
      width: 110,
      renderCell: ({ value }) => formatDate(value),
    },
    {
      field: 'valid_until',
      headerName: t('fields.valid_until'),
      width: 110,
      renderCell: ({ value }) => formatDate(value),
    },
    {
      field: 'is_active',
      headerName: t('fields.is_active'),
      width: 100,
      renderCell: ({ value }) => (
        <Chip size="small" label={value ? tc('status.active') : tc('status.inactive')} color={value ? 'success' : 'default'} />
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 90,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={tc('actions.edit')}>
            <IconButton size="small" onClick={() => setEditCoupon(row as Coupon)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={tc('actions.delete')}>
            <IconButton size="small" color="error" onClick={() => setDeleteTarget(row._id)}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const rows = (data?.data ?? []).map((c) => ({ ...c, id: c._id }));

  return (
    <Box>
      <PageHeader
        title={t('title')}
        subtitle={data ? t('total', { count: data.pagination.total }) : undefined}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/coupons/create')}>
            {t('create')}
          </Button>
        }
      />

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          select
          size="small"
          value={activeFilter}
          onChange={(e) => { setActiveFilter(e.target.value); setPaginationModel((p) => ({ ...p, page: 0 })); }}
          sx={{ minWidth: 160 }}
        >
          {ACTIVE_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
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
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
        autoHeight
        sx={{ border: 'none', bgcolor: 'background.paper', borderRadius: 1 }}
      />

      {/* ── Edit dialog ── */}
      <Dialog open={!!editCoupon} onClose={() => setEditCoupon(null)} maxWidth="md" fullWidth>
        <DialogTitle>{t('edit')}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {editCoupon && (
            <CouponForm
              defaultValues={editCoupon}
              onSubmit={handleUpdate}
              isLoading={isUpdating}
              onCancel={() => setEditCoupon(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title={tc('confirm.deleteTitle')}
        message={tc('confirm.deleteMessage')}
        destructive
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
