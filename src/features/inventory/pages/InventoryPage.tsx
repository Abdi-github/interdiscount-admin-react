import { useState } from 'react';
import {
  Box, Button, Chip, IconButton, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Stack, Avatar,
} from '@mui/material';
import { Edit, WarningAmber } from '@mui/icons-material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useForm, Controller } from 'react-hook-form';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTableToolbar } from '@/shared/components/DataTableToolbar';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useNotification } from '@/shared/hooks/useNotification';
import { useGetInventoryQuery, useUpdateInventoryMutation } from '../inventory.api';
import { useTranslation } from 'react-i18next';
import type { StoreInventoryItem, InventoryUpdatePayload } from '../inventory.types';

export function InventoryPage() {
  const { t } = useTranslation('inventory');
  const { t: tc } = useTranslation('common');
  const { success, error } = useNotification();
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 24 });
  const [editItem, setEditItem] = useState<StoreInventoryItem | null>(null);
  const debouncedSearch = useDebounce(search, 300);
  // TODO: Implement automated low-stock alerts

  const { data, isLoading } = useGetInventoryQuery({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: debouncedSearch || undefined,
    low_stock: lowStockOnly || undefined,
  });

  const [updateInventory, { isLoading: isUpdating }] = useUpdateInventoryMutation();

  const { control, handleSubmit, reset } = useForm<InventoryUpdatePayload>({
    defaultValues: { quantity: 0, min_stock: 0, max_stock: 0, location_in_store: '' },
  });

  const openEdit = (item: StoreInventoryItem) => {
    setEditItem(item);
    reset({
      quantity: item.quantity,
      min_stock: item.min_stock,
      max_stock: item.max_stock,
      location_in_store: item.location_in_store,
    });
  };

  const handleUpdate = async (values: InventoryUpdatePayload) => {
    if (!editItem) return;
    const productId = typeof editItem.product_id === 'object'
      ? (editItem.product_id as { _id: string })._id
      : editItem.product_id;
    try {
      await updateInventory({ productId, body: values }).unwrap();
      success(t('messages.updated'));
      setEditItem(null);
    } catch {
      error(tc('errors.generic'));
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'image',
      headerName: '',
      width: 56,
      sortable: false,
      renderCell: ({ row }) => {
        const p = typeof row.product_id === 'object' ? row.product_id : null;
        return (
          <Avatar
            src={p?.images?.[0]?.src?.xs}
            variant="rounded"
            sx={{ width: 36, height: 36 }}
          />
        );
      },
    },
    {
      field: 'product_name',
      headerName: t('fields.product'),
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }) => {
        const p = typeof row.product_id === 'object' ? row.product_id : null;
        return p?.name_short ?? row.product_id;
      },
    },
    {
      field: 'product_code',
      headerName: t('fields.product'),
      width: 120,
      renderCell: ({ row }) => {
        const p = typeof row.product_id === 'object' ? row.product_id : null;
        return p?.displayed_code ?? '—';
      },
    },
    {
      field: 'quantity',
      headerName: t('fields.quantity'),
      width: 110,
      renderCell: ({ row }) => {
        const isLow = row.quantity <= row.min_stock;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {isLow && <WarningAmber fontSize="small" color="warning" />}
            <Chip
              label={row.quantity}
              size="small"
              color={isLow ? 'warning' : row.quantity === 0 ? 'error' : 'default'}
            />
          </Box>
        );
      },
    },
    { field: 'reserved', headerName: t('fields.reserved'), width: 110, type: 'number' },
    { field: 'min_stock', headerName: t('fields.min_stock'), width: 80, type: 'number' },
    { field: 'max_stock', headerName: t('fields.max_stock'), width: 80, type: 'number' },
    { field: 'location_in_store', headerName: t('fields.location'), width: 120 },
    {
      field: 'actions',
      headerName: '',
      width: 60,
      sortable: false,
      renderCell: ({ row }) => (
          <Tooltip title={tc('actions.edit')}>
          <IconButton size="small" onClick={() => openEdit(row)}>
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const rows = (data?.data ?? []).map((item) => ({ ...item, id: item._id }));

  return (
    <Box>
      <PageHeader
        title={t('title')}
        subtitle={data?.pagination ? t('total', { count: data.pagination.total }) : undefined}
        actions={
          <Button
            variant={lowStockOnly ? 'contained' : 'outlined'}
            color="warning"
            startIcon={<WarningAmber />}
            onClick={() => setLowStockOnly(!lowStockOnly)}
          >
            {t('alerts.low_stock')}
          </Button>
        }
      />
      <DataTableToolbar searchValue={search} onSearchChange={setSearch} />
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
        localeText={{ noRowsLabel: tc('no_data') }}
        sx={{ border: 'none' }}
      />

      <Dialog open={!!editItem} onClose={() => setEditItem(null)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(handleUpdate)}>
          <DialogTitle>{t('actions.update_stock')}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Controller name="quantity" control={control}
                render={({ field }) => <TextField {...field} label={t('fields.quantity')} type="number" fullWidth onChange={(e) => field.onChange(Number(e.target.value))} />}
              />
              <Controller name="min_stock" control={control}
                render={({ field }) => <TextField {...field} label={t('fields.min_stock')} type="number" fullWidth onChange={(e) => field.onChange(Number(e.target.value))} />}
              />
              <Controller name="max_stock" control={control}
                render={({ field }) => <TextField {...field} label={t('fields.max_stock')} type="number" fullWidth onChange={(e) => field.onChange(Number(e.target.value))} />}
              />
              <Controller name="location_in_store" control={control}
                render={({ field }) => <TextField {...field} label={t('fields.location')} fullWidth />}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditItem(null)}>{tc('actions.cancel')}</Button>
            <Button type="submit" variant="contained" disabled={isUpdating}>{tc('actions.save')}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
