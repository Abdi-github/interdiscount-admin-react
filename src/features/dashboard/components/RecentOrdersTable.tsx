import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Typography,
  Box,
  Skeleton,
  Button,
  Avatar,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { RecentOrder } from '../dashboard.types';
import { formatCHF, formatDateTime } from '../../../shared/utils/formatters';

const ORDER_STATUS_COLORS: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  PLACED: 'info',
  CONFIRMED: 'info',
  PROCESSING: 'warning',
  SHIPPED: 'warning',
  DELIVERED: 'success',
  READY_FOR_PICKUP: 'warning',
  PICKED_UP: 'success',
  CANCELLED: 'error',
  RETURNED: 'error',
  PICKUP_EXPIRED: 'error',
  PENDING: 'default',
};

interface RecentOrdersTableProps {
  orders: RecentOrder[] | undefined;
  isLoading: boolean;
}

export function RecentOrdersTable({ orders, isLoading }: RecentOrdersTableProps) {
  const navigate = useNavigate();
  const { t } = useTranslation('dashboard');

  return (
    <Card>
      <CardHeader
        title={t('recent_orders')}
        action={
          <Button
            size="small"
            endIcon={<ArrowForward />}
            onClick={() => navigate('/orders')}
          >
            {t('recent_orders_show_all')}
          </Button>
        }
      />
      <CardContent sx={{ p: 0 }}>
        {isLoading ? (
          <Box sx={{ px: 2, pb: 2 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="text" height={52} />
            ))}
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('recent_orders_col.order')}</TableCell>
                <TableCell>{t('recent_orders_col.customer')}</TableCell>
                <TableCell>{t('recent_orders_col.status')}</TableCell>
                <TableCell align="right">{t('recent_orders_col.amount')}</TableCell>
                <TableCell>{t('recent_orders_col.date')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(orders ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      {t('recent_orders_empty')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                (orders ?? []).map((order) => (
                  <TableRow
                    key={order._id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/orders/${order._id}`)}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {order.order_number}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>
                          {order.customer.first_name[0]}
                          {order.customer.last_name[0]}
                        </Avatar>
                        <Typography variant="body2">
                          {order.customer.first_name} {order.customer.last_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        size="small"
                        color={ORDER_STATUS_COLORS[order.status] ?? 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        {formatCHF(order.total)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(order.created_at)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
