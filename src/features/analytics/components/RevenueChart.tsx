import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  Skeleton,
  useTheme,
} from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { useTranslation } from 'react-i18next';
import type { RevenueDataPoint } from '../analytics.types';
import { formatCHFCompact } from '../../../shared/utils/formatters';
import dayjs from 'dayjs';

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  const { t } = useTranslation('analytics');
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 1.5,
        }}
      >
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="body2" fontWeight={600}>{formatCHFCompact(payload[0]?.value ?? 0)}</Typography>
        <Typography variant="caption" color="text.secondary">{payload[1]?.value ?? 0} {t('metrics.orders')}</Typography>
      </Box>
    );
  }
  return null;
}

interface RevenueChartProps {
  data: RevenueDataPoint[] | undefined;
  isLoading: boolean;
  title?: string;
}

export function RevenueChart({ data, isLoading, title }: RevenueChartProps) {
  const theme = useTheme();
  const { t } = useTranslation('analytics');
  const resolvedTitle = title ?? t('charts.revenue_trend');

  const chartData = (data ?? []).map((d) => ({
    ...d,
    label: dayjs(d.date).format('DD.MM'),
  }));

  return (
    <Card>
      <CardHeader title={resolvedTitle} />
      <CardContent>
        {isLoading ? (
          <Skeleton variant="rectangular" height={300} />
        ) : chartData.length === 0 ? (
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">{t('no_data_period')}</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="analyticsRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => formatCHFCompact(v)} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Umsatz" stroke={theme.palette.primary.main} strokeWidth={2} fill="url(#analyticsRevenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
