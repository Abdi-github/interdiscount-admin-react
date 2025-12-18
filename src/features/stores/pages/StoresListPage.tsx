import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Chip, IconButton, Tooltip, Switch,
} from '@mui/material';
import { Add, Edit, Visibility } from '@mui/icons-material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTableToolbar } from '@/shared/components/DataTableToolbar';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useNotification } from '@/shared/hooks/useNotification';
import { useGetStoresQuery, useUpdateStoreStatusMutation } from '../stores.api';

export function StoresListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('stores');
  const { t: tc } = useTranslation('common');
  const { success, error } = useNotification();
  const [search, setSearch] = useState('');
  // TODO: Implement store performance metrics
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 24 });
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useGetStoresQuery({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: debouncedSearch || undefined,
  });

  const [updateStatus] = useUpdateStoreStatusMutation();

  const handleStatusToggle = async (id: string, currentValue: boolean) => {
    try {
      await updateStatus({ id, is_active: !currentValue }).unwrap();
      success(t('messages.status_updated'));
    } catch {
      error(tc('errors.generic'));
    }
  };

  const columns: GridColDef[] = [
    { field: 'store_id', headerName: t('fields.store_id'), width: 100 },
    { field: 'name', headerName: tc('labels.name'), flex: 1, minWidth: 180 },
    {
      field: 'city',
      headerName: t('fields.city'),
      width: 150,
      renderCell: ({ row }) => {
        const city = row.city_id;
        if (typeof city === 'object' && city !== null) {
          const n = city.name;
          return typeof n === 'object' ? n.de : n;
        }
        return city;
      },
    },
    {
      field: 'canton',
      headerName: t('fields.canton'),
      width: 100,
      renderCell: ({ row }) => {
        const canton = row.canton_id;
        if (typeof canton === 'object' && canton !== null) {
          return canton.code;
        }
        return canton;
      },
    },
    {
      field: 'format',
      headerName: t('fields.format'),
      width: 140,
      renderCell: ({ value }) => (
        <Chip
          label={typeof value === 'string' ? value.replace(/_/g, ' ') : value}
          size="small"
          variant="outlined"
        />
      ),
    },
    { field: 'phone', headerName: t('fields.phone'), width: 140 },
    {
      field: 'is_active',
      headerName: t('fields.is_active'),
      width: 90,
      renderCell: ({ row }) => (
        <Switch
          checked={row.is_active}
          size="small"
          onChange={() => handleStatusToggle(row._id, row.is_active)}
        />
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 100,
      sortable: false,
      renderCell: ({ row }) => (
        <Box>
          <Tooltip title={tc('actions.view')}>
            <IconButton size="small" onClick={() => navigate(`/stores/${row._id}`)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={tc('actions.edit')}>
            <IconButton size="small" onClick={() => navigate(`/stores/${row._id}`)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const rows = (data?.data ?? []).map((s) => ({ ...s, id: s._id }));

  return (
    <Box>
      <PageHeader
        title={t('title')}
        subtitle={data?.pagination ? t('total', { count: data.pagination.total }) : undefined}
        actions={
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/stores/create')}>
            {t('create')}
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
        autoHeight        localeText={{ noRowsLabel: tc('no_data') }}        sx={{ border: 'none' }}
      />
    </Box>
  );
}
