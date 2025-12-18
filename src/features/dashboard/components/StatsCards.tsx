import { Grid, Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import {
  ShoppingCart,
  Euro,
  Inventory,
  Store,
  People,
  RateReview,
} from '@mui/icons-material';
import type { PlatformStats } from '../dashboard.types';
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
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

interface StatsCardsProps {
  stats: PlatformStats | undefined;
  isLoading: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={i} sx={{ display: 'flex' }}>
            <Card sx={{ flex: 1 }}>
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
      title: 'Umsatz gesamt',
      value: formatCHF(stats?.total_revenue ?? 0),
      icon: <Euro />,
      color: '#2e7d32',
    },
    {
      title: 'Bestellungen',
      value: stats?.total_orders ?? 0,
      icon: <ShoppingCart />,
      color: '#1565c0',
    },
    {
      title: 'Produkte',
      value: stats?.total_products ?? 0,
      icon: <Inventory />,
      color: '#6a1b9a',
      subtitle: `${stats?.active_products ?? 0} aktiv`,
    },
    {
      title: 'Filialen',
      value: stats?.total_stores ?? 0,
      icon: <Store />,
      color: '#e65100',
    },
    {
      title: 'Benutzer',
      value: stats?.total_users ?? 0,
      icon: <People />,
      color: '#00695c',
      subtitle: `${stats?.total_customers ?? 0} Kunden`,
    },
    {
      title: 'Bewertungen',
      value: stats?.total_reviews ?? 0,
      icon: <RateReview />,
      color: '#c62828',
      subtitle: `${stats?.pending_reviews ?? 0} ausstehend`,
    },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={card.title} sx={{ display: 'flex' }}>
          <StatCard {...card} />
        </Grid>
      ))}
    </Grid>
  );
}
