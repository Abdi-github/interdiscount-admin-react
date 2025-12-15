import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box, Button, Card, CardContent, CardHeader, CircularProgress,
  Divider, Grid, MenuItem, Stack, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Typography, Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PageHeader } from '@/shared/components/PageHeader';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useNotification } from '@/shared/hooks/useNotification';
import { formatCHF, formatDateTime } from '@/shared/utils/formatters';
import { useGetOrderQuery, useUpdateOrderStatusMutation } from '../orders.api';
import { OrderStatusChip, PaymentStatusChip } from '../components/OrderStatusChip';
import type { OrderStatus } from '../orders.types';

const NEXT_STATUS_OPTIONS: Record<OrderStatus, OrderStatus[]> = {
  PLACED:           ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:        ['PROCESSING', 'CANCELLED'],
  PROCESSING:       ['SHIPPED', 'READY_FOR_PICKUP', 'CANCELLED'],
  SHIPPED:          ['DELIVERED', 'CANCELLED'],
  DELIVERED:        ['RETURNED'],
  READY_FOR_PICKUP: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP:        [],
  CANCELLED:        [],
  RETURNED:         [],
  PICKUP_EXPIRED:   [],
};

export function OrderDetailPage() {
  const { t } = useTranslation('orders');
  const { t: tc } = useTranslation('common');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useNotification();

  const { data: orderData, isLoading } = useGetOrderQuery(id ?? '', { skip: !id });
  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const order = orderData?.data;

  const handleStatusUpdate = async () => {
    if (!id || !selectedStatus) return;
    try {
      await updateStatus({
        id,
        body: {
          status: selectedStatus,
          cancellation_reason: selectedStatus === 'CANCELLED' ? cancellationReason : undefined,
        },
      }).unwrap();
      success(t('messages.status_updated'));
      setConfirmOpen(false);
      setSelectedStatus('');
      setCancellationReason('');
    } catch {
      error(t('messages.status_error'));
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return <Alert severity="error">{t('detail.not_found')}</Alert>;
  }

  const nextOptions = NEXT_STATUS_OPTIONS[order.status] ?? [];

  return (
    <Box>
      <PageHeader
        title={`${t('detail.title_prefix')} ${order.order_number}`}
        subtitle={`${t('detail.created_prefix')} ${formatDateTime(order.created_at)}`}
        actions={
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/orders')} variant="outlined">
            {tc('actions.back')}
          </Button>
        }
      />

      <Grid container spacing={3}>
        {/* ── Status card ── */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title={t('detail.status_card')} />
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">{t('detail.order_status_label')}</Typography>
                  <Box sx={{ mt: 0.5 }}><OrderStatusChip status={order.status} size="medium" /></Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">{t('detail.payment_status_label')}</Typography>
                  <Box sx={{ mt: 0.5 }}><PaymentStatusChip status={order.payment_status} size="medium" /></Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">{t('detail.payment_method_label')}</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {t(`payment_method.${order.payment_method}`, { defaultValue: order.payment_method })}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">{t('detail.order_type_label')}</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {order.is_store_pickup ? t('detail.store_pickup') : t('detail.delivery')}
                  </Typography>
                </Box>
                {order.cancellation_reason && (
                  <Box>
                    <Typography variant="caption" color="error">{t('detail.cancellation_reason')}</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>{order.cancellation_reason}</Typography>
                  </Box>
                )}

                {nextOptions.length > 0 && (
                  <Box sx={{ pt: 1 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>{t('detail.change_status')}</Typography>
                    <TextField
                      select
                      size="small"
                      fullWidth
                      label={t('detail.new_status_label')}
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                    >
                      {nextOptions.map((s) => (
                        <MenuItem key={s} value={s}>{t(`status.${s}`)}</MenuItem>
                      ))}
                    </TextField>
                    {selectedStatus === 'CANCELLED' && (
                      <TextField
                        size="small"
                        fullWidth
                        label={t('detail.cancellation_label')}
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        sx={{ mt: 1 }}
                        multiline
                        rows={2}
                      />
                    )}
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ mt: 1.5 }}
                      disabled={!selectedStatus}
                      onClick={() => setConfirmOpen(true)}
                    >
                      {t('detail.update_btn')}
                    </Button>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Totals card ── */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title={t('detail.totals_card')} />
            <CardContent>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">{t('fields.subtotal')}</Typography>
                  <Typography variant="body2">{formatCHF(order.subtotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">{t('fields.shipping_fee')}</Typography>
                  <Typography variant="body2">{formatCHF(order.shipping_fee)}</Typography>
                </Box>
                {order.discount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="success.main">{t('fields.discount')}</Typography>
                    <Typography variant="body2" color="success.main">-{formatCHF(order.discount)}</Typography>
                  </Box>
                )}
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" fontWeight={700}>{t('fields.total')}</Typography>
                  <Typography variant="subtitle1" fontWeight={700}>{formatCHF(order.total)}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Notes ── */}
        {order.notes && (
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title={t('detail.notes_card')} />
              <CardContent>
                <Typography variant="body2" color="text.secondary">{order.notes}</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* ── Items table ── */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title={t('detail.items_card')} />
            <CardContent sx={{ p: 0 }}>
              {order.items && order.items.length > 0 ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('detail.col_product')}</TableCell>
                      <TableCell>{t('detail.col_article_no')}</TableCell>
                      <TableCell align="right">{t('detail.col_unit_price')}</TableCell>
                      <TableCell align="right">{t('detail.col_quantity')}</TableCell>
                      <TableCell align="right">{t('detail.col_total')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>{item.product_name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                            {item.product_code}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{formatCHF(item.unit_price)}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>{formatCHF(item.total_price)}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Box sx={{ p: 3 }}>
                  <Typography variant="body2" color="text.secondary">{t('detail.no_items')}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={confirmOpen}
        title={t('detail.confirm_title')}
        message={t('detail.confirm_msg', { status: selectedStatus ? t(`status.${selectedStatus}`) : '' })}
        confirmLabel={t('detail.update_btn')}
        loading={isUpdating}
        onConfirm={handleStatusUpdate}
        onCancel={() => setConfirmOpen(false)}
      />
    </Box>
  );
}
