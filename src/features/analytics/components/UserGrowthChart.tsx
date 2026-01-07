import { Card, CardHeader, CardContent, Box, Typography, Skeleton, useTheme } from '@mui/material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { UserGrowthDataPoint } from '../analytics.types';
import { useTranslation } from 'react-i18next';

interface UserGrowthChartProps {
  data: UserGrowthDataPoint[] | undefined;
  isLoading: boolean;
}

export function UserGrowthChart({ data, isLoading }: UserGrowthChartProps) {
  const theme = useTheme();
  const { t } = useTranslation('analytics');

  const newUsersLabel = t('new_users');
  const chartData = (data ?? []).map((d) => ({
    date: new Date(d.date).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' }),
    [newUsersLabel]: d.new_users,
  }));

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title={t('charts.user_growth')} subheader={t('charts.user_growth_subtitle')} />
      <CardContent>
        {isLoading ? (
          <Skeleton variant="rectangular" height={300} />
        ) : chartData.length === 0 ? (
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">{t('no_data')}</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorNewUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                axisLine={false}
                tickLine={false}
                width={35}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey={newUsersLabel}
                stroke={theme.palette.primary.main}
                fill="url(#colorNewUsers)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
