import { Box, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../../shared/components/PageHeader';
import { StoreStatsCards } from '../components/StoreStatsCards';
import { PickupSummaryCard } from '../components/PickupSummaryCard';
import { StoreRevenueChart } from '../components/StoreRevenueChart';
import { TopStoreProducts } from '../components/TopStoreProducts';
import {
  useGetStoreDashboardQuery,
  useGetPickupSummaryQuery,
} from '../store-dashboard.api';

export function StoreDashboardPage() {
  const { t } = useTranslation('common');
  const { data: statsData, isLoading: statsLoading } = useGetStoreDashboardQuery();
  const { data: pickupData, isLoading: pickupLoading } = useGetPickupSummaryQuery();

  return (
    <Box>
      <PageHeader title={t('navigation.storeDashboard')} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StoreStatsCards stats={statsData?.data} isLoading={statsLoading} />

        <StoreRevenueChart />

        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <PickupSummaryCard summary={pickupData?.data} isLoading={pickupLoading} />
          </Grid>
          <Grid item xs={12} md={7}>
            <TopStoreProducts />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

