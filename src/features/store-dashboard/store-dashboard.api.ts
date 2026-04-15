import { baseApi } from '../../shared/api/baseApi';
import type { ApiResponse } from '../../shared/types/api.types';
import type {
  StoreStats,
  PickupSummary,
  StoreRevenueDataPoint,
  TopStoreProduct,
} from './store-dashboard.types';

export const storeDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStoreDashboard: builder.query<ApiResponse<StoreStats>, void>({
      query: () => '/store/dashboard',
      providesTags: [{ type: 'Dashboard', id: 'STORE_STATS' }],
    }),
    getStoreRevenue: builder.query<ApiResponse<StoreRevenueDataPoint[]>, { from?: string; to?: string }>({
      /* console.log('getStoreRevenue - fetching revenue data'); */
      query: (params) => ({ url: '/store/dashboard/revenue', params }),
      // TODO: Cache store revenue with configurable TTL
      providesTags: [{ type: 'Dashboard', id: 'STORE_REVENUE' }],
    }),
    getStoreTopProducts: builder.query<ApiResponse<TopStoreProduct[]>, { limit?: number }>({
      query: (params) => ({ url: '/store/dashboard/top-products', params }),
      providesTags: [{ type: 'Dashboard', id: 'STORE_TOP_PRODUCTS' }],
    }),
    getPickupSummary: builder.query<ApiResponse<PickupSummary>, void>({
      query: () => '/store/dashboard/pickup-summary',
      providesTags: [{ type: 'Dashboard', id: 'PICKUP_SUMMARY' }],
    }),
  }),
});

export const {
  useGetStoreDashboardQuery,
  useGetStoreRevenueQuery,
  useGetStoreTopProductsQuery,
  useGetPickupSummaryQuery,
} = storeDashboardApi;
