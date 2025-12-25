import { Chip, type ChipProps } from '@mui/material';

type StatusVariant = 'active' | 'inactive' | 'published' | 'draft' | 'archived' |
  'pending' | 'completed' | 'cancelled' | 'refunded';

const STATUS_CONFIG: Record<StatusVariant, { label: string; color: ChipProps['color'] }> = {
  active:    { label: 'Aktiv',         color: 'success' },
  inactive:  { label: 'Inaktiv',       color: 'default' },
  published: { label: 'Veröffentlicht', color: 'success' },
  draft:     { label: 'Entwurf',       color: 'warning' },
  archived:  { label: 'Archiviert',    color: 'default' },
  pending:   { label: 'Ausstehend',    color: 'warning' },
  completed: { label: 'Abgeschlossen', color: 'success' },
  cancelled: { label: 'Storniert',     color: 'error' },
  refunded:  { label: 'Rückerstattet', color: 'info' },
};

interface StatusChipProps {
  status: StatusVariant | string;
  size?: ChipProps['size'];
}

export function StatusChip({ status, size = 'small' }: StatusChipProps) {
  const config = STATUS_CONFIG[status as StatusVariant] ?? {
    label: status,
    color: 'default' as const,
  };
  return (
    <Chip label={config.label} color={config.color} size={size} variant="outlined" />
  );
}
