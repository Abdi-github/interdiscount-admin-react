import { Chip } from '@mui/material';
import type { ProductStatus } from '../products.types';

interface ProductStatusChipProps {
  status: ProductStatus;
}

const STATUS_CONFIG: Record<
  ProductStatus,
  { label: string; color: 'success' | 'warning' | 'default' | 'error' }
> = {
  PUBLISHED: { label: 'Veröffentlicht', color: 'success' },
  DRAFT: { label: 'Entwurf', color: 'warning' },
  ARCHIVED: { label: 'Archiviert', color: 'default' },
  INACTIVE: { label: 'Inaktiv', color: 'error' },
};

export function ProductStatusChip({ status }: ProductStatusChipProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, color: 'default' as const };
  return <Chip label={config.label} color={config.color} size="small" />;
}
