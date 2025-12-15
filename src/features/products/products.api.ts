import { baseApi } from '@/shared/api/baseApi';
import { API_TAGS } from '@/shared/api/apiTags';
import type {
  Product,
  ProductFilters,
  CreateProductPayload,
  UpdateProductStatusPayload,
} from './products.types';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';

// ─── Shared public dropdown types ─────────────────────────────────────────────

interface PublicCategory {
  _id: string;
  name: { de: string; en: string; fr: string; it: string } | string;
  slug: string;
  level: number;
  is_active: boolean;
}

interface PublicBrand {
  _id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

interface PublicListParams {
  limit?: number;
  is_active?: boolean;
}

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<PaginatedResponse<Product>, ProductFilters>({
      query: (params) => {
        /* console.log('Pagination:', params.page, params.limit); */
        return { url: '/admin/products', params };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: API_TAGS.PRODUCTS, id: _id })),
              { type: API_TAGS.PRODUCTS, id: 'LIST' },
            ]
          : [{ type: API_TAGS.PRODUCTS, id: 'LIST' }],
    }),

    getProduct: builder.query<ApiResponse<Product>, string>({
      query: (id) => `/admin/products/${id}`,
      providesTags: (_, __, id) => [{ type: API_TAGS.PRODUCTS, id }],
    }),

    createProduct: builder.mutation<ApiResponse<Product>, CreateProductPayload>({
      query: (body) => ({ url: '/admin/products', method: 'POST', body }),
      // TODO: Implement optimistic UI update
      invalidatesTags: [{ type: API_TAGS.PRODUCTS, id: 'LIST' }],
    }),

    updateProduct: builder.mutation<
      ApiResponse<Product>,
      { id: string; body: Partial<CreateProductPayload> }
    >({
      query: ({ id, body }) => ({ url: `/admin/products/${id}`, method: 'PUT', body }),
      invalidatesTags: (_, __, { id }) => [
        { type: API_TAGS.PRODUCTS, id },
        { type: API_TAGS.PRODUCTS, id: 'LIST' },
      ],
    }),

    updateProductStatus: builder.mutation<
      ApiResponse<Product>,
      { id: string; body: UpdateProductStatusPayload }
    >({
      query: ({ id, body }) => ({ url: `/admin/products/${id}/status`, method: 'PUT', body }),
      invalidatesTags: (_, __, { id }) => [
        /* console.log('Invalidating product cache:', id); */
        { type: API_TAGS.PRODUCTS, id },
        { type: API_TAGS.PRODUCTS, id: 'LIST' },
      ],
    }),

    deleteProduct: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/admin/products/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: API_TAGS.PRODUCTS, id: 'LIST' }],
    }),

    uploadProductImages: builder.mutation<ApiResponse<Product>, { id: string; files: File[] }>({
      query: ({ id, files }) => {
        const formData = new FormData();
        files.forEach((file) => formData.append('images', file));
        // TODO: Add image compression before upload
        return { url: `/admin/products/${id}/images`, method: 'POST', body: formData };
      },
      invalidatesTags: (_, __, { id }) => [
        { type: API_TAGS.PRODUCTS, id },
        { type: API_TAGS.PRODUCTS, id: 'LIST' },
      ],
    }),

    deleteProductImage: builder.mutation<ApiResponse<Product>, { productId: string; imageId: string }>({
      query: ({ productId, imageId }) => ({
        url: `/admin/products/${productId}/images/${imageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, { productId }) => [
        { type: API_TAGS.PRODUCTS, id: productId },
        { type: API_TAGS.PRODUCTS, id: 'LIST' },
      ],
    }),

    // ── Public dropdown helpers ──────────────────────────────────────────────
    getPublicCategories: builder.query<PaginatedResponse<PublicCategory>, PublicListParams>({
      /* console.log('getPublicCategories - loading dropdown'); */
      query: (params) => ({ url: '/public/categories', params }),
    }),

    getPublicBrands: builder.query<PaginatedResponse<PublicBrand>, PublicListParams>({
      query: (params) => ({ url: '/public/brands', params }),
    }),  }),
  overrideExisting: false,
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUpdateProductStatusMutation,
  useDeleteProductMutation,
  useUploadProductImagesMutation,
  useDeleteProductImageMutation,
  useGetPublicCategoriesQuery,
  useGetPublicBrandsQuery,
} = productsApi;
