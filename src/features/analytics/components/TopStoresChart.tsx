import { Card, CardHeader, CardContent, Box, Typography, Skeleton, useTheme } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type { TopStore } from '../analytics.types';
import { useTranslation } from 'react-i18next';
import { formatCHFCompact } from '../../../shared/utils/formatters';

interface TopStoresChartProps {
  data: TopStore[] | undefined;
  isLoading: boolean;
}

export function TopStoresChart({ data, isLoading }: TopStoresChartProps) {
  const theme = useTheme();
  const { t } = useTranslation('analytics');

  const chartData = (data ?? []).slice(0, 8).map((s) => ({
    name: s.store_name.length > 18 ? s.store_name.substring(0, 18) + '…' : s.store_name,
    revenue: s.revenue,
    orders: s.total_orders,
  }));

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title={t('charts.top_stores')} subheader={t('charts.top_stores_subtitle')} />
      <CardContent>
        {isLoading ? (
          <Skeleton variant="rectangular" height={300} />
        ) : chartData.length === 0 ? (
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">{t('no_data')}</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(v) => formatCHFCompact(v)}
                tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={130}
                tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === 'revenue' ? formatCHFCompact(value) : value,
                  name === 'revenue' ? t('metrics.revenue') : t('metrics.orders'),
                ]}
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                {chartData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={index === 0 ? '#1565c0' : '#42a5f5'}
                    opacity={1 - index * 0.07}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
