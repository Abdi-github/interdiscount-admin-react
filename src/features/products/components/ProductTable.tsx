import { Avatar, Box, IconButton, Tooltip, Rating } from '@mui/material';
import { DataGrid, type GridColDef, type GridPaginationModel, type GridSortModel } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useTranslation } from 'react-i18next';
import { ProductStatusChip } from './ProductStatusChip';
import type { Product, BrandRef, CategoryRef } from '../products.types';

interface ProductTableProps {
  data: Product[];
  total: number;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  sortModel: GridSortModel;
  onSortModelChange: (model: GridSortModel) => void;
  isLoading: boolean;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
}

interface ProductRow extends Product {
  id: string;
  _onView: (id: string) => void;
  _onEdit: (id: string) => void;
}

const columns: GridColDef[] = [
  {
    field: 'images',
    headerName: '',
    width: 60,
    sortable: false,
    filterable: false,
    renderCell: ({ row }: { row: Product }) => (
      <Avatar
        src={(row.images?.[0]?.src?.xs) ?? undefined}
        variant="rounded"
        sx={{ width: 40, height: 40, my: 0.5 }}
      />
    ),
  },
  {
    field: 'name_short',
    headerName: 'Produkt',
    flex: 1,
    minWidth: 180,
    renderCell: ({ row }: { row: Product }) => (
      <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {row.name_short}
      </Box>
    ),
  },
  {
    field: 'displayed_code',
    headerName: 'Art.-Nr.',
    width: 110,
    sortable: false,
  },
  {
    field: 'brand_id',
    headerName: 'Marke',
    width: 120,
    sortable: false,
    valueGetter: (_value: unknown, row: Product) =>
      typeof row.brand_id === 'object' && row.brand_id !== null
        ? (row.brand_id as BrandRef).name
        : '—',
  },
  {
    field: 'category_id',
    headerName: 'Kategorie',
    width: 150,
    sortable: false,
    valueGetter: (_value: unknown, row: Product) =>
      typeof row.category_id === 'object' && row.category_id !== null
        ? (row.category_id as CategoryRef).name?.de ?? '—'
        : '—',
  },
  {
    field: 'price',
    headerName: 'Preis',
    width: 110,
    sortable: true,
    renderCell: ({ row }: { row: Product }) =>
      `CHF ${row.price.toLocaleString('de-CH', { minimumFractionDigits: 2 })}`,
  },
  {
    field: 'rating',
    headerName: 'Bewertung',
    width: 130,
    sortable: false,
    renderCell: ({ row }: { row: Product }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Rating value={row.rating} readOnly size="small" precision={0.5} />
        <Box component="span" sx={{ fontSize: 12, color: 'text.secondary' }}>
          ({row.review_count})
        </Box>
      </Box>
    ),
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 130,
    renderCell: ({ row }: { row: Product }) => <ProductStatusChip status={row.status} />,
  },
  {
    field: 'actions',
    headerName: 'Aktionen',
    width: 90,
    sortable: false,
    filterable: false,
    renderCell: ({ row }: { row: ProductRow }) => (
      <Box>
        <Tooltip title="Ansehen">
          <IconButton size="small" onClick={() => row._onView(row._id)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Bearbeiten">
          <IconButton size="small" onClick={() => row._onEdit(row._id)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  },
];

export function ProductTable({
  data,
  total,
  paginationModel,
  onPaginationModelChange,
  sortModel,
  onSortModelChange,
  isLoading,
  onEdit,
  onView,
}: ProductTableProps) {
  const { t: tc } = useTranslation('common');
  const rows: ProductRow[] = data.map((p) => ({ ...p, id: p._id, _onEdit: onEdit, _onView: onView }));

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      rowCount={total}
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
      paginationMode="server"
      sortModel={sortModel}
      onSortModelChange={onSortModelChange}
      sortingMode="server"
      loading={isLoading}
      pageSizeOptions={[10, 24, 50]}
      disableRowSelectionOnClick
      rowHeight={56}
      autoHeight
      localeText={{ noRowsLabel: tc('no_data') }}
      sx={{ border: 'none' }}
    />
  );
}
