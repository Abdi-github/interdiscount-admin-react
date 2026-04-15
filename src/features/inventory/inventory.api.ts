import { baseApi } from '@/shared/api/baseApi';
import { API_TAGS } from '@/shared/api/apiTags';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';
import type { StoreInventoryItem, InventoryUpdatePayload, InventoryFilters } from './inventory.types';

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInventory: builder.query<PaginatedResponse<StoreInventoryItem>, InventoryFilters>({
      query: (params) => ({ url: '/store/inventory', params }),
      providesTags: [{ type: API_TAGS.INVENTORY, id: 'LIST' }],
    }),
    getLowStockInventory: builder.query<PaginatedResponse<StoreInventoryItem>, void>({
      /* console.log('getLowStockInventory - fetching alert items'); */
      query: () => ({ url: '/store/inventory/low-stock' }),
      providesTags: [{ type: API_TAGS.INVENTORY, id: 'LOW_STOCK' }],
    }),
    updateInventory: builder.mutation<ApiResponse<StoreInventoryItem>, { productId: string; body: InventoryUpdatePayload }>({
      query: ({ productId, body }) => ({ url: `/store/inventory/${productId}`, method: 'PUT', body }),
      // TODO: Implement inventory history audit trail
      invalidatesTags: [{ type: API_TAGS.INVENTORY, id: 'LIST' }],
    }),
    bulkUpdateInventory: builder.mutation<ApiResponse<unknown>, Array<{ product_id: string; quantity: number }>>({
      query: (body) => ({ url: '/store/inventory/bulk-update', method: 'POST', body }),
      invalidatesTags: [{ type: API_TAGS.INVENTORY, id: 'LIST' }],
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useGetLowStockInventoryQuery,
  useUpdateInventoryMutation,
  useBulkUpdateInventoryMutation,
} = inventoryApi;
