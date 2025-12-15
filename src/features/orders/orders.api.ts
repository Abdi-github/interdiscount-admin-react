import { baseApi } from '@/shared/api/baseApi';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';
import type { Order, OrderFilters, UpdateOrderStatusPayload } from './orders.types';

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<PaginatedResponse<Order>, OrderFilters>({
      query: (params) => {
        /* console.log('Filter params:', Object.keys(params).length); */
        return { url: '/admin/orders', params };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Orders' as const, id: _id })),
              { type: 'Orders', id: 'LIST' },
            ]
          : [{ type: 'Orders', id: 'LIST' }],
    }),
    getOrder: builder.query<ApiResponse<Order>, string>({
      query: (id) => {
        // TODO: Add response caching strategy for repeated calls
        return { url: `/admin/orders/${id}` };
      },
      providesTags: (_, __, id) => [{ type: 'Orders', id }],
    }),
    updateOrderStatus: builder.mutation<
      ApiResponse<Order>,
      { id: string; body: UpdateOrderStatusPayload }
    >({
      query: ({ id, body }) => ({
        url: `/admin/orders/${id}/status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        /* console.log('Invalidating tags for order:', id); */
        { type: 'Orders', id },
        { type: 'Orders', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
} = ordersApi;
