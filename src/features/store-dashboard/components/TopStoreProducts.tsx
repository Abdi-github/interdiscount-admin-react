import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  Avatar,
  LinearProgress,
  Skeleton,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGetStoreTopProductsQuery } from '../store-dashboard.api';
import { formatCHF } from '../../../shared/utils/formatters';

export function TopStoreProducts() {
  const { t } = useTranslation('dashboard');
  const { data, isLoading } = useGetStoreTopProductsQuery({ limit: 5 });

  const products = data?.data ?? [];
  const maxRevenue = Math.max(...products.map((p) => p.revenue), 1);

  return (
    <Card>
      <CardHeader title={t('store.top_products')} />
      <CardContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
            ))}
          </Box>
        ) : products.length === 0 ? (
          <Typography color="text.secondary">{t('no_data')}</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {products.map((p, idx) => (
              <Box key={p.product_id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: 'primary.main',
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={500} noWrap>
                      {p.product_name}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">
                        {p.quantity_sold} {t('store.col_qty_sold')}
                      </Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {formatCHF(p.revenue)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(p.revenue / maxRevenue) * 100}
                  sx={{
                    height: 4,
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                    ml: '44px',
                    '& .MuiLinearProgress-bar': { bgcolor: 'primary.main', borderRadius: 1 },
                  }}
                />
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
