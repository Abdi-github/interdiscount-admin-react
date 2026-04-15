import { baseApi } from '@/shared/api/baseApi';
import { API_TAGS } from '@/shared/api/apiTags';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';
import type { Canton, City, CreateCantonPayload, CreateCityPayload, LocationFilters } from './locations.types';

export const locationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Public read endpoints
    getPublicCantons: builder.query<PaginatedResponse<Canton>, { limit?: number }>({
      query: (params) => ({ url: '/public/cantons', params }),
      providesTags: [{ type: API_TAGS.CANTONS, id: 'LIST' }],
    }),
    getPublicCities: builder.query<PaginatedResponse<City>, LocationFilters>({
      /* console.log('getPublicCities query - fetching cities'); */
      query: (params) => ({ url: '/public/cities', params }),
      providesTags: [{ type: API_TAGS.CITIES, id: 'LIST' }],
    }),
    // Admin CRUD
    createCanton: builder.mutation<ApiResponse<Canton>, CreateCantonPayload>({
      query: (body) => ({ url: '/admin/cantons', method: 'POST', body }),
      // TODO: Add location coordinate verification
      invalidatesTags: [{ type: API_TAGS.CANTONS, id: 'LIST' }],
    }),
    updateCanton: builder.mutation<ApiResponse<Canton>, { id: string; body: Partial<CreateCantonPayload> }>({
      query: ({ id, body }) => ({ url: `/admin/cantons/${id}`, method: 'PUT', body }),
      invalidatesTags: [{ type: API_TAGS.CANTONS, id: 'LIST' }],
    }),
    deleteCanton: builder.mutation<void, string>({
      query: (id) => ({ url: `/admin/cantons/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: API_TAGS.CANTONS, id: 'LIST' }],
    }),
    createCity: builder.mutation<ApiResponse<City>, CreateCityPayload>({
      query: (body) => ({ url: '/admin/cities', method: 'POST', body }),
      invalidatesTags: [{ type: API_TAGS.CITIES, id: 'LIST' }],
    }),
    updateCity: builder.mutation<ApiResponse<City>, { id: string; body: Partial<CreateCityPayload> }>({
      query: ({ id, body }) => ({ url: `/admin/cities/${id}`, method: 'PUT', body }),
      invalidatesTags: [{ type: API_TAGS.CITIES, id: 'LIST' }],
    }),
    deleteCity: builder.mutation<void, string>({
      query: (id) => ({ url: `/admin/cities/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: API_TAGS.CITIES, id: 'LIST' }],
    }),
  }),
});

export const {
  useGetPublicCantonsQuery,
  useGetPublicCitiesQuery,
  useCreateCantonMutation,
  useUpdateCantonMutation,
  useDeleteCantonMutation,
  useCreateCityMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
} = locationsApi;
