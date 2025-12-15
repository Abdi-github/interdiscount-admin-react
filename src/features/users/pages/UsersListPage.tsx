import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Chip, IconButton, Tooltip, MenuItem, TextField } from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTableToolbar } from '@/shared/components/DataTableToolbar';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { formatDate } from '@/shared/utils/formatters';
import { useGetUsersQuery } from '../users.api';
import type { AdminUser } from '../users.types';
import type { UserType } from '@/shared/types/common.types';

export function UsersListPage() {
  /* console.log('UsersListPage - loading user management'); */
  const navigate = useNavigate();
  const { t } = useTranslation('users');
  const { t: tc } = useTranslation('common');
  const [search, setSearch] = useState('');
  const [userType, setUserType] = useState<UserType | ''>('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 24 });
  const debouncedSearch = useDebounce(search, 300);
  // TODO: Implement batch user operations and role assignment

  const userTypeLabels: Record<string, string> = {
    super_admin: t('roles.super_admin'),
    admin: t('roles.admin'),
    store_manager: t('roles.store_manager'),
    warehouse_staff: t('roles.warehouse_staff'),
    customer_support: t('roles.customer_support'),
    customer: t('roles.customer'),
  };

  const { data, isLoading } = useGetUsersQuery({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: debouncedSearch || undefined,
    user_type: userType || undefined,
  });

  const columns: GridColDef[] = [
    {
      field: 'name', headerName: t('fields.name'), flex: 1, minWidth: 180,
      valueGetter: (_, row: AdminUser) => `${row.first_name} ${row.last_name}`,
    },
    { field: 'email', headerName: t('fields.email'), flex: 1, minWidth: 220 },
    {
      field: 'user_type', headerName: t('fields.role'), width: 160,
      renderCell: ({ value }) => (
        <Chip label={userTypeLabels[value] ?? value} size="small" variant="outlined" />
      ),
    },
    {
      field: 'is_active', headerName: t('fields.status'), width: 110,
      renderCell: ({ value }) => (
        <Chip label={value ? tc('status.active') : tc('status.inactive')} size="small"
          color={value ? 'success' : 'default'} />
      ),
    },
    {
      field: 'is_verified', headerName: t('fields.verified'), width: 120,
      renderCell: ({ value }) => (
        <Chip label={value ? tc('labels.yes', 'Yes') : tc('labels.no', 'No')} size="small"
          color={value ? 'info' : 'default'} />
      ),
    },
    {
      field: 'created_at', headerName: t('fields.created'), width: 130,
      valueGetter: (_, row: AdminUser) => formatDate(row.created_at),
    },
    {
      field: 'actions', headerName: '', width: 70, sortable: false,
      renderCell: ({ row }: { row: AdminUser }) => (
        <Tooltip title={tc('actions.view')}>
          <IconButton size="small" onClick={() => navigate(`/users/${row._id}`)}>
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const rows = (data?.data ?? []).map((u) => ({ ...u, id: u._id }));

  return (
    <Box>
      <PageHeader
        title={t('title')}
        subtitle={t('total', { count: data?.pagination?.total ?? 0 })}
      />
      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        actions={
          <TextField
            select size="small" label={t('fields.role')} value={userType}
            onChange={(e) => { setUserType(e.target.value as UserType | ''); setPaginationModel((p) => ({ ...p, page: 0 })); }}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">{t('filters.all_types')}</MenuItem>
            {Object.entries(userTypeLabels).map(([val, label]) => (
              <MenuItem key={val} value={val}>{label}</MenuItem>
            ))}
          </TextField>
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
        pageSizeOptions={[24, 50]}
        autoHeight
        disableRowSelectionOnClick
        localeText={{ noRowsLabel: tc('no_data') }}
        sx={{ border: 'none' }}
      />
    </Box>
  );
}
