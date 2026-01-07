import { useState } from 'react';
import { Box, Grid, Card, CardContent, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../../shared/components/PageHeader';
import { DateRangePicker } from '../components/DateRangePicker';
import { RevenueChart } from '../components/RevenueChart';
import { TopProductsChart } from '../components/TopProductsChart';
import { TopStoresChart } from '../components/TopStoresChart';
import { TopCategoriesChart } from '../components/TopCategoriesChart';
import { UserGrowthChart } from '../components/UserGrowthChart';
import {
  useGetRevenueSeriesQuery,
  useGetTopProductsQuery,
  useGetTopStoresQuery,
  useGetTopCategoriesQuery,
  useGetUserGrowthQuery,
  useGetPlatformStatsQuery,
} from '../analytics.api';
import { formatCHF } from '../../../shared/utils/formatters';

export function AnalyticsPage() {
  const { t } = useTranslation('analytics');
  const { t: tc } = useTranslation('common');
  const [from, setFrom] = useState(dayjs().subtract(30, 'day').format('YYYY-MM-DD'));
  const [to, setTo] = useState(dayjs().format('YYYY-MM-DD'));

  const { data: statsData, isLoading: statsLoading } = useGetPlatformStatsQuery({ from, to });
  const { data: revenueData, isLoading: revenueLoading } = useGetRevenueSeriesQuery({ from, to });
  const { data: topProductsData, isLoading: productsLoading } = useGetTopProductsQuery({ from, to, limit: 10 });
  const { data: topStoresData, isLoading: storesLoading } = useGetTopStoresQuery({ from, to, limit: 10 });
  const { data: topCategoriesData, isLoading: categoriesLoading } = useGetTopCategoriesQuery({ from, to, limit: 10 });
  const { data: userGrowthData, isLoading: userGrowthLoading } = useGetUserGrowthQuery({ from, to });

  const stats = statsData?.data?.overview;

  const summaryCards = [
    { label: t('metrics.orders'), value: stats?.total_orders ?? 0 },
    { label: t('metrics.revenue'), value: formatCHF(stats?.total_revenue ?? 0) },
    { label: t('metrics.avg_order_value'), value: formatCHF(stats?.avg_order_value ?? 0) },
    { label: t('metrics.new_users'), value: stats?.new_users_period ?? 0 },
    { label: tc('status.completed'), value: statsData?.data?.order_status_breakdown?.DELIVERED ?? 0 },
    { label: tc('status.cancelled'), value: statsData?.data?.order_status_breakdown?.CANCELLED ?? 0 },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <PageHeader title={t('title')} />
        <DateRangePicker
          from={from}
          to={to}
          onChange={(f, t) => { setFrom(f); setTo(t); }}
        />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Summary cards */}
        <Grid container spacing={3}>
          {summaryCards.map((card) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={card.label}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {card.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {statsLoading ? '...' : card.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Revenue timeline */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <RevenueChart data={revenueData?.data} isLoading={revenueLoading} />
          </Grid>
        </Grid>

        {/* Top products + top stores */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TopProductsChart data={topProductsData?.data} isLoading={productsLoading} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TopStoresChart data={topStoresData?.data} isLoading={storesLoading} />
          </Grid>
        </Grid>

        {/* Top categories + user growth */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TopCategoriesChart data={topCategoriesData?.data} isLoading={categoriesLoading} />
          </Grid>
          <Grid item xs={12} md={6}>
            <UserGrowthChart data={userGrowthData?.data} isLoading={userGrowthLoading} />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
