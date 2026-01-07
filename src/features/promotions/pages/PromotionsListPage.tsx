import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Chip, IconButton, Tooltip, Switch,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { PageHeader } from '@/shared/components/PageHeader';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useNotification } from '@/shared/hooks/useNotification';
import { useGetPromotionsQuery, useDeletePromotionMutation } from '../promotions.api';
import { useTranslation } from 'react-i18next';
import type { Promotion } from '../promotions.types';

export function PromotionsListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('promotions');
  const { t: tc } = useTranslation('common');
  const { success, error } = useNotification();
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 24 });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const typeLabels: Record<string, string> = {
    percentage: t('type.PERCENTAGE'),
    fixed: t('type.FIXED_AMOUNT'),
    buy_x_get_y: t('type.BUY_X_GET_Y'),
  };

  const { data, isLoading } = useGetPromotionsQuery({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
  });

  const [deletePromotion, { isLoading: isDeleting }] = useDeletePromotionMutation();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePromotion(deleteId).unwrap();
      success(t('messages.deleted'));
      setDeleteId(null);
    } catch {
      error(tc('errors.generic'));
    }
  };

  const columns: GridColDef[] = [
    { field: 'title', headerName: t('fields.name'), flex: 1, minWidth: 180 },
    {
      field: 'discount_type',
      headerName: t('fields.type'),
      width: 160,
      renderCell: ({ value }) => (
        <Chip label={typeLabels[value] ?? value} size="small" variant="outlined" />
      ),
    },
    {
      field: 'discount_value',
      headerName: t('fields.value'),
      width: 100,
      renderCell: ({ row }) =>
        row.discount_type === 'percentage' ? `${row.discount_value}%` : row.discount_type === 'fixed' ? `CHF ${row.discount_value}` : `${row.buy_quantity}+${row.get_quantity}`,
    },
    {
      field: 'valid_from',
      headerName: t('fields.start_date'),
      width: 120,
      renderCell: ({ value }) => new Date(value).toLocaleDateString('de-CH'),
    },
    {
      field: 'valid_until',
      headerName: t('fields.end_date'),
      width: 120,
      renderCell: ({ value }) => new Date(value).toLocaleDateString('de-CH'),
    },
    {
      field: 'is_active',
      headerName: t('fields.is_active'),
      width: 80,
      renderCell: ({ value }) => <Switch checked={value} size="small" disabled />,
    },
    {
      field: 'actions',
      headerName: '',
      width: 100,
      sortable: false,
      renderCell: ({ row }: { row: Promotion & { id: string } }) => (
        <Box>
          <Tooltip title={tc('actions.edit')}>
            <IconButton size="small" onClick={() => navigate(`/promotions/${row._id}/edit`, { state: { promotion: row } })}>
              <Edit fontSize="small" />
            </IconButton>
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

  const rows = (data?.data ?? []).map((p) => ({ ...p, id: p._id }));

  return (
    <Box>
      <PageHeader
        title={t('title')}
        subtitle={data?.pagination ? t('total', { count: data.pagination.total }) : undefined}
        actions={
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/promotions/create')}>
            {t('create')}
          </Button>
        }
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

      <ConfirmDialog
        open={!!deleteId}
        title={tc('confirm.deleteTitle')}
        message={tc('confirm.deleteMessage')}
        destructive
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}
