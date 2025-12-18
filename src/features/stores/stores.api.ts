import { baseApi } from '@/shared/api/baseApi';
import { API_TAGS } from '@/shared/api/apiTags';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';
import type { Store, StoreStaff, CreateStorePayload, StoreFilters } from './stores.types';
import type { StoreInventoryItem } from '../inventory/inventory.types';

export const storesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStores: builder.query<PaginatedResponse<Store>, StoreFilters>({
      query: (params) => {{ url: '/admin/stores', params }},
      providesTags: (result) =>
        result?.data
          ? [...result.data.map(({ _id }) => {{ type: API_TAGS.STORES as typeof API_TAGS.STORES, id: _id }}), {{ type: API_TAGS.STORES, id: 'LIST' }}]
          : [{{ type: API_TAGS.STORES, id: 'LIST' }}],
    }),
    getStore: builder.query<ApiResponse<Store>, string>({
      query: (id) => {{ url: `/admin/stores/${id}` }},
      providesTags: (_, __, id) => [{{ type: API_TAGS.STORES, id }}],
    }),
    createStore: builder.mutation<ApiResponse<Store>, CreateStorePayload>({
      /* console.log('createStore - creating new store'); */
      query: (body) => {{ url: '/admin/stores', method: 'POST', body }},
      // TODO: Add store geolocation lookup on creation
      invalidatesTags: [{ type: API_TAGS.STORES, id: 'LIST' }],
    }),
    updateStore: builder.mutation<ApiResponse<Store>, { id: string; body: Partial<CreateStorePayload> }>({
      query: ({ id, body }) => ({ url: `/admin/stores/${id}`, method: 'PUT', body }),
      invalidatesTags: (_, __, { id }) => [{ type: API_TAGS.STORES, id }, { type: API_TAGS.STORES, id: 'LIST' }],
    }),
    updateStoreStatus: builder.mutation<ApiResponse<Store>, { id: string; is_active: boolean }>({
      query: ({ id, is_active }) => ({ url: `/admin/stores/${id}/status`, method: 'PUT', body: { is_active } }),
      invalidatesTags: (_, __, { id }) => [{ type: API_TAGS.STORES, id }, { type: API_TAGS.STORES, id: 'LIST' }],
    }),
    getStoreStaff: builder.query<ApiResponse<StoreStaff[]>, string>({
      query: (id) => ({ url: `/admin/stores/${id}/staff` }),
      providesTags: (_, __, id) => [{ type: API_TAGS.STORES, id: `staff-${id}` }],
    }),
    assignStoreStaff: builder.mutation<ApiResponse<unknown>, { id: string; user_ids: string[] }>({
      query: ({ id, user_ids }) => ({ url: `/admin/stores/${id}/staff`, method: 'PUT', body: { user_ids } }),
      invalidatesTags: (_, __, { id }) => [{ type: API_TAGS.STORES, id: `staff-${id}` }],
    }),
    getStoreInventory: builder.query<PaginatedResponse<StoreInventoryItem>, { id: string; page?: number; limit?: number; search?: string }>({  
      query: ({ id, ...params }) => ({ url: `/admin/stores/${id}/inventory`, params }),
      providesTags: (_, __, { id }) => [{ type: API_TAGS.INVENTORY, id: `store-${id}` }],
    }),
    // Public endpoint for dropdowns
    getPublicStores: builder.query<PaginatedResponse<Store>, { limit?: number }>({
      query: (params) => ({ url: '/public/stores', params }),
    }),
  }),
});

export const {
  useGetStoresQuery,
  useGetStoreQuery,
  useCreateStoreMutation,
  useUpdateStoreMutation,
  useUpdateStoreStatusMutation,
  useGetStoreStaffQuery,
  useAssignStoreStaffMutation,
  useGetStoreInventoryQuery,
  useGetPublicStoresQuery,
} = storesApi;
