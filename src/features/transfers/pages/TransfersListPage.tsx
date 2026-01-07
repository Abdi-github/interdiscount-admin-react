import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Chip, IconButton, Tooltip, TextField, Stack, MenuItem as MuiMenuItem,
} from '@mui/material';
import { Add, Visibility } from '@mui/icons-material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { PageHeader } from '@/shared/components/PageHeader';
import { useAuth } from '@/shared/hooks/useAuth';
import { useNotification } from '@/shared/hooks/useNotification';
import { useGetAdminTransfersQuery, useGetStoreTransfersQuery, useApproveTransferMutation } from '../transfers.api';
import type { TransferStatus } from '../transfers.types';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useTranslation } from 'react-i18next';

const STATUS_COLORS: Record<TransferStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  REQUESTED: 'info',
  APPROVED: 'info',
  IN_TRANSIT: 'warning',
  RECEIVED: 'success',
  CANCELLED: 'error',
};

export function TransfersListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('transfers');
  const { t: tc } = useTranslation('common');
  const { isAdmin } = useAuth();
  const { success, error } = useNotification();
  // TODO: Implement transfer timeline visualization

  const [statusFilter, setStatusFilter] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 24 });
  const [approveDialog, setApproveDialog] = useState<{ id: string; approved: boolean } | null>(null);

  const filters = {
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    status: (statusFilter as TransferStatus) || undefined,
  };

  const adminResult = useGetAdminTransfersQuery(filters, { skip: !isAdmin });
  const storeResult = useGetStoreTransfersQuery(filters, { skip: isAdmin });
  const { data, isLoading } = isAdmin ? adminResult : storeResult;

  const [approveTransfer, { isLoading: isApproving }] = useApproveTransferMutation();

  const handleApprove = async () => {
    if (!approveDialog) return;
    try {
      await approveTransfer(approveDialog).unwrap();
      success(approveDialog.approved ? t('messages.approved') : t('messages.cancelled'));
      setApproveDialog(null);
    } catch {
      error(tc('errors.generic'));
    }
  };

  const columns: GridColDef[] = [
    { field: 'transfer_number', headerName: t('fields.transfer_number'), width: 150 },
    {
      field: 'from_store',
      headerName: t('fields.from_store'),
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        const s = typeof row.from_store_id === 'object' ? row.from_store_id : null;
        return s?.name ?? row.from_store_id;
      },
    },
    {
      field: 'to_store',
      headerName: t('fields.to_store'),
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        const s = typeof row.to_store_id === 'object' ? row.to_store_id : null;
        return s?.name ?? row.to_store_id;
      },
    },
    {
      field: 'items',
      headerName: t('fields.items'),
      width: 90,
      renderCell: ({ value }) => value?.length ?? 0,
    },
    {
      field: 'status',
      headerName: t('fields.status'),
      width: 140,
      renderCell: ({ value }) => (
        <Chip label={t(`status.${value}`)} size="small" color={STATUS_COLORS[value as TransferStatus] ?? 'default'} />
      ),
    },
    {
      field: 'created_at',
      headerName: t('fields.date'),
      width: 130,
      renderCell: ({ value }) => new Date(value).toLocaleDateString('de-CH'),
    },
    {
      field: 'actions',
      headerName: '',
      width: isAdmin ? 140 : 60,
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={tc('actions.view')}>
            <IconButton size="small" onClick={() => navigate(`/transfers/${row._id}`)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          {isAdmin && row.status === 'REQUESTED' && (
            <>
              <Button size="small" color="success" onClick={() => setApproveDialog({ id: row._id, approved: true })}>
                {t('actions.approve')}
              </Button>
              <Button size="small" color="error" onClick={() => setApproveDialog({ id: row._id, approved: false })}>
                {t('actions.reject')}
              </Button>
            </>
          )}
        </Box>
      ),
    },
  ];

  const rows = (data?.data ?? []).map((t) => ({ ...t, id: t._id }));

  return (
    <Box>
      <PageHeader
        title={t('title')}
        subtitle={data?.pagination ? t('total', { count: data.pagination.total }) : undefined}
        actions={
          !isAdmin && (
            <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/transfers/create')}>
              {t('create')}
            </Button>
          )
        }
      />
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          select size="small" label={t('fields.status')} value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MuiMenuItem value="">{tc('actions.filter')}</MuiMenuItem>
          {(['REQUESTED','APPROVED','IN_TRANSIT','RECEIVED','CANCELLED'] as const).map((s) => (
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

      <ConfirmDialog
        open={!!approveDialog}
        title={approveDialog?.approved ? t('actions.approve') : t('actions.reject')}
        message={tc('confirm.deleteMessage')}
        destructive={!approveDialog?.approved}
        loading={isApproving}
        onConfirm={handleApprove}
        onCancel={() => setApproveDialog(null)}
      />
    </Box>
  );
}
