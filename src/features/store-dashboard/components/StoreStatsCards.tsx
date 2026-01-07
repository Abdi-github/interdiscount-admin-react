import { Grid, Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import {
  ShoppingCart,
  Euro,
  Inventory,
  LocalShipping,
} from '@mui/icons-material';
import type { StoreStats } from '../store-dashboard.types';
import { formatCHF } from '../../../shared/utils/formatters';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: `${color}18`,
              color,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

interface StoreStatsCardsProps {
  stats: StoreStats | undefined;
  isLoading: boolean;
}

export function StoreStatsCards({ stats, isLoading }: StoreStatsCardsProps) {
  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="80%" height={40} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  const cards: StatCardProps[] = [
    {
      title: 'Umsatz',
      value: formatCHF(stats?.today_revenue ?? 0),
      icon: <Euro />,
      color: '#2e7d32',
    },
    {
      title: 'Bestellungen heute',
      value: stats?.today_orders ?? 0,
      icon: <ShoppingCart />,
      color: '#1565c0',
      subtitle: `${stats?.pending_pickups ?? 0} ausstehend`,
    },
    {
      title: 'Abholung bereit',
      value: stats?.ready_pickups ?? 0,
      icon: <LocalShipping />,
      color: '#e65100',
    },
    {
      title: 'Inventar',
      value: stats?.total_products ?? 0,
      icon: <Inventory />,
      color: '#6a1b9a',
      subtitle: `${stats?.low_stock_count ?? 0} niedriger Bestand`,
    },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} md={3} key={card.title}>
          <StatCard {...card} />
        </Grid>
      ))}
    </Grid>
  );
}
