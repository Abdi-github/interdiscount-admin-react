import { useState } from 'react';
import { Box, Chip, Avatar, Typography, TextField, InputAdornment } from '@mui/material';
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { useGetStoreInventoryQuery } from '../stores.api';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { StoreInventoryItem } from '@/features/inventory/inventory.types';

interface StoreInventoryTableProps {
  storeId: string;
}

export function StoreInventoryTable({ storeId }: StoreInventoryTableProps) {
  const { t } = useTranslation('stores');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });

  const { data, isLoading } = useGetStoreInventoryQuery({
    id: storeId,
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: debouncedSearch || undefined,
  });

  const getProduct = (item: StoreInventoryItem) => {
    if (typeof item.product_id === 'object' && item.product_id !== null) return item.product_id;
    return null;
  };

  const getStockStatus = (item: StoreInventoryItem) => {
    if (item.quantity === 0) return 'out_of_stock';
    if (item.quantity <= item.min_stock) return 'low_stock';
    return 'available';
  };

  const columns: GridColDef[] = [
    {
      field: 'image',
      headerName: '',
      width: 56,
      sortable: false,
      renderCell: ({ row }) => {
        const product = getProduct(row);
        const imgSrc = product?.images?.[0]?.src?.xs;
        return <Avatar src={imgSrc} variant="rounded" sx={{ width: 36, height: 36 }} />;
      },
    },
    {
      field: 'product_name',
      headerName: t('inventory_section.col_product'),
      flex: 1,
      minWidth: 200,
      sortable: false,
      renderCell: ({ row }) => {
        const product = getProduct(row);
        return (
          <Box>
            <Typography variant="body2" noWrap>
              {product?.name ?? (typeof row.product_id === 'string' ? row.product_id : '—')}
            </Typography>
            {product?.name_short && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {product.name_short}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: 'code',
      headerName: t('inventory_section.col_code'),
      width: 120,
      sortable: false,
      renderCell: ({ row }) => {
        const product = getProduct(row);
        return <Typography variant="body2">{product?.displayed_code ?? '—'}</Typography>;
      },
    },
    {
      field: 'quantity',
      headerName: t('inventory_section.col_qty'),
      width: 90,
      type: 'number',
    },
    {
      field: 'reserved',
      headerName: t('inventory_section.col_reserved'),
      width: 100,
      type: 'number',
    },
    {
      field: 'available',
      headerName: t('inventory_section.col_available'),
      width: 100,
      sortable: false,
      renderCell: ({ row }) => (
        <Typography variant="body2">{Math.max(0, row.quantity - row.reserved)}</Typography>
      ),
    },
    {
      field: 'min_stock',
      headerName: t('inventory_section.col_min'),
      width: 80,
      type: 'number',
    },
    {
      field: 'location_in_store',
      headerName: t('inventory_section.col_location'),
      width: 120,
    },
    {
      field: 'status',
      headerName: t('inventory_section.col_status'),
      width: 130,
      sortable: false,
      renderCell: ({ row }) => {
        const status = getStockStatus(row);
        const colorMap = {
          available: 'success',
          low_stock: 'warning',
          out_of_stock: 'error',
        } as const;
        return (
          <Chip
            label={t(`inventory_section.${status}`)}
            size="small"
            color={colorMap[status]}
          />
        );
      },
    },
  ];

  const rows = (data?.data ?? []).map((item) => ({ ...item, id: item._id }));

  return (
    <Box>
      <TextField
        size="small"
        placeholder={t('inventory_section.col_product') + '…'}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, width: 280 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
      <DataGrid
        rows={rows}
        columns={columns}
        rowCount={data?.pagination?.total ?? 0}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        paginationMode="server"
        loading={isLoading}
        pageSizeOptions={[10, 20, 50]}
        autoHeight
        disableRowSelectionOnClick
        sx={{ border: 'none' }}
        localeText={{ noRowsLabel: t('inventory_section.empty') }}
      />
    </Box>
  );
}
