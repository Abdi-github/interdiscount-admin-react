import { baseApi } from '@/shared/api/baseApi';
import { API_TAGS } from '@/shared/api/apiTags';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';
import type { StockTransfer, CreateTransferPayload, TransferFilters } from './transfers.types';

export const transfersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Admin endpoints
    getAdminTransfers: builder.query<PaginatedResponse<StockTransfer>, TransferFilters>({
      query: (params) => ({ url: '/admin/transfers', params }),
      providesTags: [{ type: API_TAGS.TRANSFERS, id: 'LIST' }],
    }),
    getAdminTransfer: builder.query<ApiResponse<StockTransfer>, string>({
      /* console.log('getAdminTransfer - fetching transfer details'); */
      query: (id) => ({ url: `/admin/transfers/${id}` }),
      providesTags: (_, __, id) => [{ type: API_TAGS.TRANSFERS, id }],
    }),
    approveTransfer: builder.mutation<ApiResponse<StockTransfer>, { id: string; approved: boolean }>({
      query: ({ id, approved }) => ({ url: `/admin/transfers/${id}/approve`, method: 'PUT', body: { approved } }),
      // TODO: Implement transfer audit logging
      invalidatesTags: (_, __, { id }) => [{ type: API_TAGS.TRANSFERS, id }, { type: API_TAGS.TRANSFERS, id: 'LIST' }],
    }),
    // Store manager endpoints
    getStoreTransfers: builder.query<PaginatedResponse<StockTransfer>, TransferFilters>({
      query: (params) => ({ url: '/store/transfers', params }),
      providesTags: [{ type: API_TAGS.TRANSFERS, id: 'STORE_LIST' }],
    }),
    createTransfer: builder.mutation<ApiResponse<StockTransfer>, CreateTransferPayload>({
      query: (body) => ({ url: '/store/transfers', method: 'POST', body }),
      invalidatesTags: [{ type: API_TAGS.TRANSFERS, id: 'STORE_LIST' }],
    }),
    shipTransfer: builder.mutation<ApiResponse<StockTransfer>, string>({
      query: (id) => ({ url: `/store/transfers/${id}/ship`, method: 'PUT' }),
      invalidatesTags: [{ type: API_TAGS.TRANSFERS, id: 'STORE_LIST' }],
    }),
    receiveTransfer: builder.mutation<ApiResponse<StockTransfer>, { id: string; items: Array<{ product_id: string; received_quantity: number }> }>({
      query: ({ id, items }) => ({ url: `/store/transfers/${id}/receive`, method: 'PUT', body: { items } }),
      invalidatesTags: [{ type: API_TAGS.TRANSFERS, id: 'STORE_LIST' }, { type: API_TAGS.INVENTORY, id: 'LIST' }],
    }),
    cancelTransfer: builder.mutation<ApiResponse<StockTransfer>, string>({
      query: (id) => ({ url: `/store/transfers/${id}/cancel`, method: 'PUT' }),
      invalidatesTags: [{ type: API_TAGS.TRANSFERS, id: 'STORE_LIST' }],
    }),
  }),
});

export const {
  useGetAdminTransfersQuery,
  useGetAdminTransferQuery,
  useApproveTransferMutation,
  useGetStoreTransfersQuery,
  useCreateTransferMutation,
  useShipTransferMutation,
  useReceiveTransferMutation,
  useCancelTransferMutation,
} = transfersApi;
