import { Card, CardHeader, CardContent, Box, Typography, Skeleton, useTheme } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type { TopCategory } from '../analytics.types';
import { useTranslation } from 'react-i18next';
import { formatCHFCompact } from '../../../shared/utils/formatters';

interface TopCategoriesChartProps {
  data: TopCategory[] | undefined;
  isLoading: boolean;
}

export function TopCategoriesChart({ data, isLoading }: TopCategoriesChartProps) {
  const theme = useTheme();
  const { t } = useTranslation('analytics');

  const chartData = (data ?? []).slice(0, 8).map((c) => ({
    name: c.category_name.length > 22 ? c.category_name.substring(0, 22) + '…' : c.category_name,
    revenue: c.revenue,
    orders: c.total_orders,
  }));

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title={t('charts.top_categories')} subheader={t('charts.top_categories_subtitle')} />
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
                width={145}
                tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: number) => [formatCHFCompact(value), t('metrics.revenue')]}
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
                    fill={index === 0 ? '#2e7d32' : '#66bb6a'}
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
