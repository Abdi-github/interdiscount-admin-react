import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, TextField, MenuItem, Stack, Tooltip, IconButton,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/shared/components/PageHeader';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { formatCHF, formatDateTime } from '@/shared/utils/formatters';
import { useGetOrdersQuery } from '../orders.api';
import { OrderStatusChip, PaymentStatusChip } from '../components/OrderStatusChip';
import type { OrderStatus, PaymentStatus } from '../orders.types';

export function OrdersListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('orders');
  const { t: tc } = useTranslation('common');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | ''>('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 25 });
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useGetOrdersQuery({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    payment_status: paymentFilter || undefined,
  });

  const statusOptions = [
    { value: '' as const, label: tc('status.all', 'All') },
    { value: 'PLACED' as OrderStatus, label: t('status.PLACED') },
    { value: 'CONFIRMED' as OrderStatus, label: t('status.CONFIRMED') },
    { value: 'PROCESSING' as OrderStatus, label: t('status.PROCESSING') },
    { value: 'SHIPPED' as OrderStatus, label: t('status.SHIPPED') },
    { value: 'DELIVERED' as OrderStatus, label: t('status.DELIVERED') },
    { value: 'READY_FOR_PICKUP' as OrderStatus, label: t('status.READY_FOR_PICKUP') },
    { value: 'PICKED_UP' as OrderStatus, label: t('status.PICKED_UP') },
    { value: 'CANCELLED' as OrderStatus, label: t('status.CANCELLED') },
    { value: 'RETURNED' as OrderStatus, label: t('status.RETURNED') },
    { value: 'PICKUP_EXPIRED' as OrderStatus, label: t('status.PICKUP_EXPIRED') },
  ];

  const paymentOptions = [
    { value: '' as const, label: tc('status.all', 'All') },
    { value: 'PENDING' as PaymentStatus, label: t('payment_status.PENDING') },
    { value: 'PAID' as PaymentStatus, label: t('payment_status.PAID') },
    { value: 'FAILED' as PaymentStatus, label: t('payment_status.FAILED') },
    { value: 'REFUNDED' as PaymentStatus, label: t('payment_status.REFUNDED') },
  ];

  const columns: GridColDef[] = [
    {
      field: 'order_number',
      headerName: t('fields.order_number'),
      width: 160,
      renderCell: ({ value }) => (
        <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}>
          {value}
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: t('fields.status'),
      width: 170,
      renderCell: ({ value }) => <OrderStatusChip status={value} />,
    },
    {
      field: 'payment_status',
      headerName: t('fields.payment_status'),
      width: 140,
      renderCell: ({ value }) => <PaymentStatusChip status={value} />,
    },
    {
      field: 'total',
      headerName: t('fields.total'),
      width: 120,
      align: 'right',
      headerAlign: 'right',
      renderCell: ({ value }) => (
        <Box component="span" sx={{ fontWeight: 600 }}>{formatCHF(value)}</Box>
      ),
    },
    {
      field: 'is_store_pickup',
      headerName: t('pickup'),
      width: 100,
      renderCell: ({ value }) => value ? tc('status.active', 'Ja') : '—',
    },
    {
      field: 'payment_method',
      headerName: t('fields.payment_method'),
      width: 120,
      renderCell: ({ value }) => {
        const labels: Record<string, string> = { card: 'Card', twint: 'TWINT', postfinance: 'PostFinance', invoice: 'Invoice' };
        return labels[value] ?? value;
      },
    },
    {
      field: 'created_at',
      headerName: t('fields.date'),
      width: 150,
      renderCell: ({ value }) => formatDateTime(value),
    },
    {
      field: 'actions',
      headerName: '',
      width: 60,
      sortable: false,
      renderCell: ({ row }) => (
        <Tooltip title={tc('actions.view')}>
          <IconButton size="small" onClick={() => navigate(`/orders/${row._id}`)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const rows = (data?.data ?? []).map((o) => ({ ...o, id: o._id }));

  return (
    <Box>
      <PageHeader
        title={t('title')}
        subtitle={data ? t('total', { count: data.pagination.total }) : undefined}
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder={tc('actions.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 220 }}
        />
        <TextField
          select
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
          sx={{ minWidth: 180 }}
        >
          {statusOptions.map((o) => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value as PaymentStatus | '')}
          sx={{ minWidth: 160 }}
        >
          {paymentOptions.map((o) => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </TextField>
        {(statusFilter || paymentFilter || search) && (
          <Button size="small" onClick={() => { setStatusFilter(''); setPaymentFilter(''); setSearch(''); }}>
            {tc('actions.reset')}
          </Button>
        )}
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
        localeText={{ noRowsLabel: tc('no_data') }}
        sx={{ border: 'none', bgcolor: 'background.paper', borderRadius: 1 }}
      />
    </Box>
  );
}
