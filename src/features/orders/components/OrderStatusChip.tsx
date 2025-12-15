import { Chip } from '@mui/material';
import type { OrderStatus, PaymentStatus } from '../orders.types';

// ─── Order Status ─────────────────────────────────────────────────────────────

const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' }> = {
  PLACED:            { label: 'Aufgegeben',          color: 'primary'   },
  CONFIRMED:         { label: 'Bestätigt',            color: 'info'      },
  PROCESSING:        { label: 'In Bearbeitung',       color: 'warning'   },
  SHIPPED:           { label: 'Versendet',            color: 'info'      },
  DELIVERED:         { label: 'Geliefert',            color: 'success'   },
  READY_FOR_PICKUP:  { label: 'Abholbereit',          color: 'warning'   },
  PICKED_UP:         { label: 'Abgeholt',             color: 'success'   },
  CANCELLED:         { label: 'Storniert',            color: 'error'     },
  RETURNED:          { label: 'Zurückgegeben',        color: 'default'   },
  PICKUP_EXPIRED:    { label: 'Abholung abgelaufen',  color: 'error'     },
};

interface OrderStatusChipProps {
  status: OrderStatus;
  size?: 'small' | 'medium';
}

export function OrderStatusChip({ status, size = 'small' }: OrderStatusChipProps) {
  const config = ORDER_STATUS_CONFIG[status] ?? { label: status, color: 'default' as const };
  return <Chip label={config.label} color={config.color} size={size} />;
}

// ─── Payment Status ───────────────────────────────────────────────────────────

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; color: 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error' }> = {
  PENDING:    { label: 'Ausstehend',    color: 'warning'  },
  PROCESSING: { label: 'Verarbeitung', color: 'info'     },
  PAID:       { label: 'Bezahlt',      color: 'success'  },
  FAILED:     { label: 'Fehlgeschlagen', color: 'error'  },
  REFUNDED:   { label: 'Erstattet',    color: 'default'  },
};

interface PaymentStatusChipProps {
  status: PaymentStatus;
  size?: 'small' | 'medium';
}

export function PaymentStatusChip({ status, size = 'small' }: PaymentStatusChipProps) {
  const config = PAYMENT_STATUS_CONFIG[status] ?? { label: status, color: 'default' as const };
  return <Chip label={config.label} color={config.color} size={size} variant="outlined" />;
}
