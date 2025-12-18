import { useState } from 'react';
import {
  Box, Button, Chip, IconButton, MenuItem, Stack, TextField,
  Tooltip, Typography, Rating, Dialog, DialogTitle, DialogContent,
  DialogActions, Avatar,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { PageHeader } from '@/shared/components/PageHeader';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useNotification } from '@/shared/hooks/useNotification';
import { formatDate } from '@/shared/utils/formatters';
import { useTranslation } from 'react-i18next';
import { useGetReviewsQuery, useApproveReviewMutation, useDeleteReviewMutation } from '../reviews.api';
import type { Review } from '../reviews.types';

export function ReviewsPage() {
  const { t } = useTranslation('reviews');
  const { t: tc } = useTranslation('common');
  const { success, error } = useNotification();
  const [approvalFilter, setApprovalFilter] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 25 });
  const [detailReview, setDetailReview] = useState<Review | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const isApproved = approvalFilter === 'approved' ? true : approvalFilter === 'rejected' ? false : approvalFilter === 'pending' ? false : undefined;

  const APPROVAL_OPTIONS = [
    { value: '', label: t('title') },
    { value: 'pending', label: t('status.pending') },
    { value: 'approved', label: t('status.approved') },
    { value: 'rejected', label: t('status.rejected') },
  ];

  const { data, isLoading } = useGetReviewsQuery({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    is_approved: isApproved,
  });

  const [approveReview, { isLoading: isApproving }] = useApproveReviewMutation();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

  const handleApprove = async (id: string, approved: boolean) => {
    try {
      await approveReview({ id, body: { is_approved: approved } }).unwrap();
      success(approved ? t('messages.approved') : t('messages.rejected'));
    } catch {
      error(tc('errors.generic'));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteReview(deleteTarget).unwrap();
      success(t('messages.deleted'));
      setDeleteTarget(null);
    } catch {
      error(tc('errors.generic'));
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'rating',
      headerName: 'Bewertung',
      width: 140,
      renderCell: ({ value }) => <Rating value={value} readOnly size="small" />,
    },
    {
      field: 'product_name',
      headerName: 'Produkt',
      flex: 1,
      minWidth: 160,
      sortable: false,
      renderCell: ({ row }) => {
        const prod = row.product_id;
        const isObj = prod && typeof prod === 'object';
        const imgSrc = isObj ? prod.images?.[0]?.src?.xs : undefined;
        const label = isObj ? (prod.name_short ?? prod.name) : String(prod ?? '');
        return (
          <Stack direction="row" alignItems="center" spacing={1}>
            {imgSrc && <Avatar src={imgSrc} variant="rounded" sx={{ width: 28, height: 28 }} />}
            <Typography variant="body2" noWrap>{label}</Typography>
          </Stack>
        );
      },
    },
    {
      field: 'user_name',
      headerName: t('fields.user'),
      width: 160,
      sortable: false,
      renderCell: ({ row }) => {
        const u = row.user_id;
        const label = u && typeof u === 'object'
          ? `${u.first_name} ${u.last_name}`
          : String(u ?? '');
        return <Typography variant="body2">{label}</Typography>;
      },
    },
    {
      field: 'comment',
      headerName: t('fields.comment'),
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }) => (
        <Typography variant="body2" color="text.secondary" noWrap title={row.comment}>
          {row.comment}
        </Typography>
      ),
    },
    {
      field: 'is_approved',
      headerName: t('fields.status'),
      width: 120,
      renderCell: ({ value }) => (
        <Chip
          size="small"
          label={value ? t('status.approved') : t('status.pending')}
          color={value ? 'success' : 'warning'}
        />
      ),
    },
    {
      field: 'created_at',
      headerName: t('fields.date'),
      width: 110,
      renderCell: ({ value }) => formatDate(value),
    },
    {
      field: 'actions',
      headerName: 'Aktionen',
      width: 140,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={tc('actions.view')}>
            <IconButton size="small" onClick={() => setDetailReview(row as Review)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {!row.is_approved && (
            <Tooltip title={t('actions.approve')}>
              <IconButton size="small" color="success" onClick={() => handleApprove(row._id, true)} disabled={isApproving}>
                <CheckCircleOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {row.is_approved && (
            <Tooltip title={t('actions.reject')}>
              <IconButton size="small" color="warning" onClick={() => handleApprove(row._id, false)} disabled={isApproving}>
                <CancelOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={tc('actions.delete')}>
            <IconButton size="small" color="error" onClick={() => setDeleteTarget(row._id)}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const rows = (data?.data ?? []).map((r) => ({ ...r, id: r._id }));

  return (
    <Box>
      <PageHeader
        title={t('title')}
        subtitle={data ? t('total', { count: data.pagination.total }) : undefined}
      />

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          select
          size="small"
          value={approvalFilter}
          onChange={(e) => { setApprovalFilter(e.target.value); setPaginationModel((p) => ({ ...p, page: 0 })); }}
          sx={{ minWidth: 180 }}
        >
          {APPROVAL_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
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
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
        autoHeight
        sx={{ border: 'none', bgcolor: 'background.paper', borderRadius: 1 }}
      />

      {/* ── Detail dialog ── */}
      <Dialog open={!!detailReview} onClose={() => setDetailReview(null)} maxWidth="sm" fullWidth>
        {detailReview && (
          <>
            <DialogTitle>
              {(() => {
                const u = detailReview.user_id;
                const name = u && typeof u === 'object'
                  ? `${u.first_name} ${u.last_name}`
                  : tc('labels.name');
                return `${t('review')} - ${name}`;
              })()}
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                <Rating value={detailReview.rating} readOnly />
                {detailReview.title && (
                  <Typography variant="subtitle1" fontWeight={600}>{detailReview.title}</Typography>
                )}
                <Typography variant="body2">{detailReview.comment}</Typography>
                <Stack direction="row" spacing={1}>
                  <Chip size="small" label={detailReview.is_approved ? t('status.approved') : t('status.pending')} color={detailReview.is_approved ? 'success' : 'warning'} />
                  {detailReview.is_verified_purchase && <Chip size="small" label={t('fields.user')} color="info" variant="outlined" />}
                </Stack>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
              <Button onClick={() => setDetailReview(null)}>{tc('actions.close')}</Button>
              {!detailReview.is_approved && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => { handleApprove(detailReview._id, true); setDetailReview(null); }}
                >
                  {t('actions.approve')}
                </Button>
              )}
              {detailReview.is_approved && (
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() => { handleApprove(detailReview._id, false); setDetailReview(null); }}
                >
                  {t('actions.reject')}
                </Button>
              )}
              <Button
                variant="outlined"
                color="error"
                onClick={() => { setDeleteTarget(detailReview._id); setDetailReview(null); }}
              >
                {tc('actions.delete')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title={tc('confirm.deleteTitle')}
        message={tc('confirm.deleteMessage')}
        destructive
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
