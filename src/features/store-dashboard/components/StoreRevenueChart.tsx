import {
  Card,
  CardContent,
  CardHeader,
  Box,
  ToggleButton,
  ToggleButtonGroup,
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
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useGetStoreRevenueQuery } from '../store-dashboard.api';
import { formatCHFCompact } from '../../../shared/utils/formatters';

type Period = '7d' | '30d' | '90d';

interface CustomTooltipProps extends TooltipProps<number, string> {}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  const { t } = useTranslation('dashboard');
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
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {formatCHFCompact(payload[0]?.value ?? 0)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {payload[1]?.value} {t('charts.orders')}
        </Typography>
      </Box>
    );
  }
  return null;
}

export function StoreRevenueChart() {
  const theme = useTheme();
  const { t } = useTranslation('dashboard');
  const [period, setPeriod] = useState<Period>('30d');

  const periodDays: Record<Period, number> = { '7d': 7, '30d': 30, '90d': 90 };
  const from = dayjs().subtract(periodDays[period], 'day').format('YYYY-MM-DD');
  const to = dayjs().format('YYYY-MM-DD');

  const { data, isLoading } = useGetStoreRevenueQuery({ from, to });

  const chartData = (data?.data ?? []).map((d) => ({
    ...d,
    label: dayjs(d.date).format('DD.MM'),
  }));

  return (
    <Card>
      <CardHeader
        title={t('store.revenue_chart')}
        action={
          <ToggleButtonGroup
            value={period}
            exclusive
            size="small"
            onChange={(_, v) => v && setPeriod(v)}
          >
            <ToggleButton value="7d">{t('charts.period_week')}</ToggleButton>
            <ToggleButton value="30d">{t('charts.period_month')}</ToggleButton>
            <ToggleButton value="90d">{t('charts.period_year')}</ToggleButton>
          </ToggleButtonGroup>
        }
      />
      <CardContent>
        {isLoading ? (
          <Skeleton variant="rectangular" height={240} />
        ) : chartData.length === 0 ? (
          <Box sx={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">{t('charts.no_data')}</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="storeRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => formatCHFCompact(v)} tick={{ fontSize: 11 }} width={70} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={theme.palette.primary.main}
                fill="url(#storeRevenueGrad)"
                strokeWidth={2}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="orders"
                stroke={theme.palette.info.main}
                fill="none"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
