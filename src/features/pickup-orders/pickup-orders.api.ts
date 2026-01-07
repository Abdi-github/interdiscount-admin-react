import { baseApi } from '@/shared/api/baseApi';
import { API_TAGS } from '@/shared/api/apiTags';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';
import type { PickupOrder, PickupOrderFilters } from './pickup-orders.types';

export const pickupOrdersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPickupOrders: builder.query<PaginatedResponse<PickupOrder>, PickupOrderFilters>({
      query: (params) => ({ url: '/store/pickup-orders', params }),
      providesTags: [{ type: API_TAGS.PICKUP_ORDERS, id: 'LIST' }],
    }),
    confirmPickupOrder: builder.mutation<ApiResponse<PickupOrder>, string>({
      /* console.log('confirmPickupOrder - confirming pickup'); */
      query: (id) => ({ url: `/store/pickup-orders/${id}/confirm`, method: 'PUT' }),
      // TODO: Add pickup notification to customer
      invalidatesTags: [{ type: API_TAGS.PICKUP_ORDERS, id: 'LIST' }],
    }),
    markPickupReady: builder.mutation<ApiResponse<PickupOrder>, string>({
      query: (id) => ({ url: `/store/pickup-orders/${id}/ready`, method: 'PUT' }),
      invalidatesTags: [{ type: API_TAGS.PICKUP_ORDERS, id: 'LIST' }],
    }),
    markPickupCollected: builder.mutation<ApiResponse<PickupOrder>, string>({
      query: (id) => ({ url: `/store/pickup-orders/${id}/collected`, method: 'PUT' }),
      invalidatesTags: [{ type: API_TAGS.PICKUP_ORDERS, id: 'LIST' }],
    }),
    cancelPickupOrder: builder.mutation<ApiResponse<PickupOrder>, string>({
      query: (id) => ({ url: `/store/pickup-orders/${id}/cancel`, method: 'PUT' }),
      invalidatesTags: [{ type: API_TAGS.PICKUP_ORDERS, id: 'LIST' }],
    }),
  }),
});

export const {
  useGetPickupOrdersQuery,
  useConfirmPickupOrderMutation,
  useMarkPickupReadyMutation,
  useMarkPickupCollectedMutation,
  useCancelPickupOrderMutation,
} = pickupOrdersApi;
