import { Card, CardHeader, CardContent, Box, Typography, LinearProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { PickupSummary } from '../store-dashboard.types';

interface PickupSummaryCardProps {
  summary: PickupSummary | undefined;
  isLoading: boolean;
}

interface PickupRow {
  label: string;
  value: number;
  color: string;
}

export function PickupSummaryCard({ summary, isLoading }: PickupSummaryCardProps) {
  const { t } = useTranslation('dashboard');
  if (isLoading || !summary) {
    return (
      <Card>
        <CardHeader title={t('store.pickup_status')} />
        <CardContent>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  const totalPickups =
    (summary.pending ?? 0) +
    (summary.confirmed ?? 0) +
    (summary.ready ?? 0) +
    (summary.overdue ?? 0) +
    (summary.completed_today ?? 0);
  const total = totalPickups || 1;

  const rows: PickupRow[] = [
    { label: t('store.pickup_pending'), value: summary.pending ?? 0, color: '#90a4ae' },
    { label: t('store.pickup_confirmed'), value: summary.confirmed ?? 0, color: '#42a5f5' },
    { label: t('store.pickup_ready_label'), value: summary.ready ?? 0, color: '#ffa726' },
    { label: t('store.pickup_overdue'), value: summary.overdue ?? 0, color: '#ef5350' },
    { label: t('store.pickup_collected'), value: summary.completed_today ?? 0, color: '#66bb6a' },
  ];

  return (
    <Card>
      <CardHeader
        title={t('store.pickup_status')}
        subheader={t('store.pickups_total', { count: totalPickups })}
      />
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {rows.map((row) => (
            <Box key={row.label}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">{row.label}</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {row.value}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(row.value / total) * 100}
                sx={{
                  height: 6,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  '& .MuiLinearProgress-bar': { bgcolor: row.color, borderRadius: 1 },
                }}
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
