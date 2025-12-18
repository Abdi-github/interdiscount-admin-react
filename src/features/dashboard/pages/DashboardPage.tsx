import { useState } from 'react';
import { Box, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../../shared/components/PageHeader';
import { StatsCards } from '../components/StatsCards';
import { RevenueChart } from '../components/RevenueChart';
import { RecentOrdersTable } from '../components/RecentOrdersTable';
import {
  useGetDashboardStatsQuery,
  useGetDashboardRevenueQuery,
  useGetRecentOrdersQuery,
} from '../dashboard.api';
import { useGetTopProductsQuery, useGetTopStoresQuery } from '../../analytics/analytics.api';
import { TopProductsChart } from '../../analytics/components/TopProductsChart';
import { TopStoresChart } from '../../analytics/components/TopStoresChart';
import type { RevenuePeriod } from '../dashboard.types';
import dayjs from 'dayjs';

const PERIOD_DAYS: Record<RevenuePeriod, number> = {
  week: 7,
  month: 30,
  year: 365,
};

export function DashboardPage() {
  const { t } = useTranslation('dashboard');
  const [period, setPeriod] = useState<RevenuePeriod>('month');
  // TODO: Implement dashboard data refresh intervals

  const from = dayjs().subtract(PERIOD_DAYS[period], 'day').format('YYYY-MM-DD');
  const to = dayjs().format('YYYY-MM-DD');

  const { data: statsData, isLoading: statsLoading } = useGetDashboardStatsQuery();
  const { data: revenueData, isLoading: revenueLoading } = useGetDashboardRevenueQuery({ from, to });
  const { data: ordersData, isLoading: ordersLoading } = useGetRecentOrdersQuery();
  const { data: topProductsData, isLoading: topProductsLoading } = useGetTopProductsQuery({ from, to, limit: 5 });
  const { data: topStoresData, isLoading: topStoresLoading } = useGetTopStoresQuery({ from, to, limit: 5 });

  return (
    <Box>
      <PageHeader title={t('title')} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StatsCards stats={statsData?.data} isLoading={statsLoading} />
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <RevenueChart
              data={revenueData?.data}
              isLoading={revenueLoading}
              period={period}
              onPeriodChange={setPeriod}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TopProductsChart data={topProductsData?.data} isLoading={topProductsLoading} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TopStoresChart data={topStoresData?.data} isLoading={topStoresLoading} />
          </Grid>
          <Grid item xs={12}>
            <RecentOrdersTable orders={ordersData?.data} isLoading={ordersLoading} />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
