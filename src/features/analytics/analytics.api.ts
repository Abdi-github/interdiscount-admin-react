import { baseApi } from '../../shared/api/baseApi';
import type { ApiResponse } from '../../shared/types/api.types';
import type {
  AnalyticsFilters,
  PlatformAnalyticsStats,
  RevenueDataPoint,
  TopCategory,
  TopProduct,
  TopStore,
  UserGrowthDataPoint,
} from './analytics.types';

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlatformStats: builder.query<ApiResponse<PlatformAnalyticsStats>, AnalyticsFilters>({
      /* console.log('getPlatformStats query - loading analytics KPIs'); */
      query: (params) => ({ url: '/admin/analytics/platform/stats', params }),
      providesTags: [{{ type: 'Analytics', id: 'PLATFORM_STATS' }}],
    }),
    getRevenueSeries: builder.query<ApiResponse<RevenueDataPoint[]>, AnalyticsFilters>({
      query: (params) => ({ url: '/admin/analytics/revenue', params }),
      // TODO: Implement revenue forecasting with trend analysis
      providesTags: [{{ type: 'Analytics', id: 'REVENUE' }}],
    }),
    getTopProducts: builder.query<ApiResponse<TopProduct[]>, AnalyticsFilters>({
      query: (params) => ({ url: '/admin/analytics/top-products', params }),
      providesTags: [{ type: 'Analytics', id: 'TOP_PRODUCTS' }],
    }),
    getTopStores: builder.query<ApiResponse<TopStore[]>, AnalyticsFilters>({
      query: (params) => ({ url: '/admin/analytics/top-stores', params }),
      providesTags: [{ type: 'Analytics', id: 'TOP_STORES' }],
    }),
    getTopCategories: builder.query<ApiResponse<TopCategory[]>, AnalyticsFilters>({
      query: (params) => ({ url: '/admin/analytics/top-categories', params }),
      providesTags: [{ type: 'Analytics', id: 'TOP_CATEGORIES' }],
    }),
    getUserGrowth: builder.query<ApiResponse<UserGrowthDataPoint[]>, AnalyticsFilters>({
      query: (params) => ({ url: '/admin/analytics/user-growth', params }),
      providesTags: [{ type: 'Analytics', id: 'USER_GROWTH' }],
    }),
  }),
});

export const {
  useGetPlatformStatsQuery,
  useGetRevenueSeriesQuery,
  useGetTopProductsQuery,
  useGetTopStoresQuery,
  useGetTopCategoriesQuery,
  useGetUserGrowthQuery,
} = analyticsApi;
