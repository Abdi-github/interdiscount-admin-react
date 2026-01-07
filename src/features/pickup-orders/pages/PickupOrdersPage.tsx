import { useState } from 'react';
import {
  Box, Chip, IconButton, Tooltip, Menu, MenuItem as MuiMenuItem,
  TextField, Stack,
} from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { PageHeader } from '@/shared/components/PageHeader';
import { formatCHF } from '@/shared/utils/formatters';
import { useNotification } from '@/shared/hooks/useNotification';
import { useTranslation } from 'react-i18next';
import {
  useGetPickupOrdersQuery,
  useConfirmPickupOrderMutation,
  useMarkPickupReadyMutation,
  useMarkPickupCollectedMutation,
  useCancelPickupOrderMutation,
} from '../pickup-orders.api';
import type { PickupOrder } from '../pickup-orders.types';

const STATUS_COLORS: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  PLACED: 'info',
  CONFIRMED: 'info',
  READY_FOR_PICKUP: 'warning',
  PICKED_UP: 'success',
  CANCELLED: 'error',
  PICKUP_EXPIRED: 'error',
};

function PickupActions({ row }: { row: PickupOrder & { id: string } }) {
  /* console.log('PickupActions - rendering actions for pickup order'); */
  // TODO: Add bulk action operations for multiple pickups
  const { t } = useTranslation('orders');
  const { t: tc } = useTranslation('common');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { success, error } = useNotification();
  const [confirm] = useConfirmPickupOrderMutation();
  const [ready] = useMarkPickupReadyMutation();
  const [collected] = useMarkPickupCollectedMutation();
  const [cancel] = useCancelPickupOrderMutation();

  const handleAction = async (action: () => Promise<unknown>, label: string) => {
    try {
      await action();
      success(label);
    } catch {
      error(tc('errors.generic'));
    }
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title={tc('actions.view')}>
        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
          <MoreVert fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
        {row.status === 'PLACED' && (
          <MuiMenuItem onClick={() => handleAction(() => confirm(row._id).unwrap(), t('status.CONFIRMED'))}>
            {t('status.CONFIRMED')}
          </MuiMenuItem>
        )}
        {row.status === 'CONFIRMED' && (
          <MuiMenuItem onClick={() => handleAction(() => ready(row._id).unwrap(), t('status.READY_FOR_PICKUP'))}>
            {t('status.READY_FOR_PICKUP')}
          </MuiMenuItem>
        )}
        {row.status === 'READY_FOR_PICKUP' && (
          <MuiMenuItem onClick={() => handleAction(() => collected(row._id).unwrap(), t('status.PICKED_UP'))}>
            {t('status.PICKED_UP')}
          </MuiMenuItem>
        )}
        {!['PICKED_UP', 'CANCELLED', 'PICKUP_EXPIRED'].includes(row.status) && (
          <MuiMenuItem onClick={() => handleAction(() => cancel(row._id).unwrap(), t('status.CANCELLED'))} sx={{ color: 'error.main' }}>
            {tc('actions.cancel')}
          </MuiMenuItem>
        )}
      </Menu>
    </>
  );
}

export function PickupOrdersPage() {
  const { t } = useTranslation('orders');
  const { t: tc } = useTranslation('common');
  const [statusFilter, setStatusFilter] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 24 });

  const { data, isLoading } = useGetPickupOrdersQuery({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    status: statusFilter || undefined,
  });

  const columns: GridColDef[] = [
    { field: 'order_number', headerName: t('fields.order_number'), width: 150 },
    {
      field: 'user',
      headerName: t('fields.customer'),
      flex: 1,
      minWidth: 160,
      renderCell: ({ row }) => {
        const u = typeof row.user_id === 'object' ? row.user_id : null;
        return u ? `${u.first_name} ${u.last_name}` : row.user_id;
      },
    },
    {
      field: 'status',
      headerName: t('fields.status'),
      width: 160,
      renderCell: ({ value }) => (
        <Chip label={value} size="small" color={STATUS_COLORS[value] ?? 'default'} />
      ),
    },
    {
      field: 'total',
      headerName: t('fields.total'),
      width: 120,
      renderCell: ({ value }) => formatCHF(value as number),
    },
    {
      field: 'created_at',
      headerName: t('fields.date'),
      width: 140,
      renderCell: ({ value }) => new Date(value).toLocaleDateString('de-CH'),
    },
    {
      field: 'actions',
      headerName: '',
      width: 60,
      sortable: false,
      renderCell: ({ row }) => <PickupActions row={row} />,
    },
  ];

  const rows = (data?.data ?? []).map((o) => ({ ...o, id: o._id }));

  return (
    <Box>
      <PageHeader
        title={tc('navigation.pickupOrders')}
        subtitle={data?.pagination ? t('total', { count: data.pagination.total }) : undefined}
      />
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          select size="small" label={t('fields.status')} value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MuiMenuItem value="">{tc('actions.filter')}</MuiMenuItem>
          {(['PLACED','CONFIRMED','READY_FOR_PICKUP','PICKED_UP','CANCELLED'] as const).map((s) => (
            <MuiMenuItem key={s} value={s}>{t(`status.${s}`)}</MuiMenuItem>
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
    </Box>
  );
}
