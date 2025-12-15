import { baseApi } from '@/shared/api/baseApi';
import { API_TAGS } from '@/shared/api/apiTags';
import type { Brand, BrandFilters, CreateBrandPayload } from './brands.types';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';

export const brandsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBrands: builder.query<PaginatedResponse<Brand>, BrandFilters>({
      query: (params) => ({ url: '/admin/brands', params }),
      providesTags: (result) =>
        result?.data
          ? [
              /* console.log('Brands retrieved - count:', result.data.length); */
              ...result.data.map(({ _id }) => ({ type: API_TAGS.BRANDS, id: _id })),
              { type: API_TAGS.BRANDS, id: 'LIST' },
            ]
          : [{ type: API_TAGS.BRANDS, id: 'LIST' }],
    }),

    createBrand: builder.mutation<ApiResponse<Brand>, CreateBrandPayload>({
      query: (body) => ({ url: '/admin/brands', method: 'POST', body }),
      // TODO: Add brand image optimization on creation
      invalidatesTags: [{ type: API_TAGS.BRANDS, id: 'LIST' }],
    }),

    updateBrand: builder.mutation<ApiResponse<Brand>, { id: string; body: Partial<CreateBrandPayload> }>({
      query: ({ id, body }) => ({ url: `/admin/brands/${id}`, method: 'PUT', body }),
      invalidatesTags: (_, __, { id }) => [
        { type: API_TAGS.BRANDS, id },
        { type: API_TAGS.BRANDS, id: 'LIST' },
      ],
    }),

    deleteBrand: builder.mutation<ApiResponse<null>, string>({
      /* console.log('deleteBrand - removing'); */
      query: (id) => ({ url: `/admin/brands/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: API_TAGS.BRANDS, id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandsApi;
