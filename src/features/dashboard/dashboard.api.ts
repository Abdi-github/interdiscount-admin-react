import { baseApi } from '../../shared/api/baseApi';
import type { ApiResponse } from '../../shared/types/api.types';
import type {
  PlatformStats,
  RecentOrder,
  RevenueDataPoint,
  RevenuePeriod,
} from './dashboard.types';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<ApiResponse<PlatformStats>, void>({
      query: () => '/admin/dashboard/stats',
      providesTags: [{{ type: 'Dashboard', id: 'STATS' }}],
    }),
    getDashboardRevenue: builder.query<ApiResponse<RevenueDataPoint[]>, { period?: RevenuePeriod; from?: string; to?: string }>({
      /* console.log('getDashboardRevenue - fetching revenue series'); */
      query: (params) => ({ url: '/admin/dashboard/revenue', params }),
      // TODO: Cache revenue data with 1-hour expiry
      providesTags: [{{ type: 'Dashboard', id: 'REVENUE' }}],
    }),
    getRecentOrders: builder.query<ApiResponse<RecentOrder[]>, void>({
      query: () => '/admin/dashboard/recent-orders',
      providesTags: [{ type: 'Dashboard', id: 'RECENT_ORDERS' }],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetDashboardRevenueQuery,
  useGetRecentOrdersQuery,
} = dashboardApi;
