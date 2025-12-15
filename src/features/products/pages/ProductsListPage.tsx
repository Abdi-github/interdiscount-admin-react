import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Chip,
  Stack,
} from '@mui/material';
import { type GridPaginationModel, type GridSortModel } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTableToolbar } from '@/shared/components/DataTableToolbar';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useGetProductsQuery } from '../products.api';
import { ProductTable } from '../components/ProductTable';
import type { ProductStatus } from '../products.types';

export function ProductsListPage() {
  /* console.log('ProductsListPage - loading product catalog'); */
  const navigate = useNavigate();
  const { t } = useTranslation('products');
  const { t: tc } = useTranslation('common');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | ''>('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 24,
  });
  // TODO: Implement bulk product editing
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const debouncedSearch = useDebounce(search, 300);

  const sortField = sortModel[0]?.field;
  const sortOrder = sortModel[0]?.sort ?? undefined;

  const { data, isLoading } = useGetProductsQuery({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    sort_by: sortField || undefined,
    sort_order: sortOrder || undefined,
  });

  const handleSortChange = (model: GridSortModel) => {
    setSortModel(model);
    setPaginationModel((m) => ({ ...m, page: 0 }));
  };

  const statusOptions = [
    { value: '' as const, label: tc('status.all', 'Alle Status') },
    { value: 'PUBLISHED' as ProductStatus, label: t('status.PUBLISHED') },
    { value: 'DRAFT' as ProductStatus, label: t('status.DRAFT') },
    { value: 'ARCHIVED' as ProductStatus, label: t('status.ARCHIVED') },
    { value: 'INACTIVE' as ProductStatus, label: t('status.INACTIVE') },
  ];

  return (
    <Box>
      <PageHeader
        title={t('title')}
        subtitle={t('total', { count: data?.pagination?.total ?? 0 })}
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/products/create')}
          >
            {t('create')}
          </Button>
        }
      />

      <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center" flexWrap="wrap">
        <DataTableToolbar
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPaginationModel((m) => ({ ...m, page: 0 }));
          }}
        />
        <TextField
          select
          size="small"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as ProductStatus | '');
            setPaginationModel((m) => ({ ...m, page: 0 }));
          }}
          sx={{ minWidth: 160 }}
          label={tc('actions.filter')}
        >
          {statusOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
        {statusFilter && (
          <Chip
            label={statusOptions.find((o) => o.value === statusFilter)?.label}
            onDelete={() => setStatusFilter('')}
            size="small"
          />
        )}
      </Stack>

      <ProductTable
        data={data?.data ?? []}
        total={data?.pagination?.total ?? 0}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        sortModel={sortModel}
        onSortModelChange={handleSortChange}
        isLoading={isLoading}
        onView={(id) => navigate(`/products/${id}`)}
        onEdit={(id) => navigate(`/products/${id}/edit`)}
      />
    </Box>
  );
}
