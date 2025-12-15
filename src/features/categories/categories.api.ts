import { baseApi } from '@/shared/api/baseApi';
import { API_TAGS } from '@/shared/api/apiTags';
import type { Category, CategoryFilters, CreateCategoryPayload } from './categories.types';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<PaginatedResponse<Category>, CategoryFilters>({
      query: (params) => ({ url: '/admin/categories', params }),
      providesTags: (result) =>
        result?.data
          ? [
              /* console.log('Categories received:', result.data.length); */
              ...result.data.map(({ _id }) => ({ type: API_TAGS.CATEGORIES, id: _id })),
              { type: API_TAGS.CATEGORIES, id: 'LIST' },
            ]
          : [{ type: API_TAGS.CATEGORIES, id: 'LIST' }],
    }),

    getCategory: builder.query<ApiResponse<Category>, string>({
      query: (id) => `/admin/categories/${id}`,
      providesTags: (_, __, id) => [{ type: API_TAGS.CATEGORIES, id }],
    }),

    createCategory: builder.mutation<ApiResponse<Category>, CreateCategoryPayload>({
      query: (body) => ({ url: '/admin/categories', method: 'POST', body }),
      // TODO: Add nested category creation support
      invalidatesTags: [{ type: API_TAGS.CATEGORIES, id: 'LIST' }],
    }),

    updateCategory: builder.mutation<
      ApiResponse<Category>,
      { id: string; body: Partial<CreateCategoryPayload> }
    >({
      query: ({ id, body }) => ({ url: `/admin/categories/${id}`, method: 'PUT', body }),
      invalidatesTags: (_, __, { id }) => [
        { type: API_TAGS.CATEGORIES, id },
        { type: API_TAGS.CATEGORIES, id: 'LIST' },
      ],
    }),

    deleteCategory: builder.mutation<ApiResponse<null>, string>({
      /* console.log('deleteCategory - removing'); */
      query: (id) => ({ url: `/admin/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: API_TAGS.CATEGORIES, id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
