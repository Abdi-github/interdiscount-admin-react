import { baseApi } from '@/shared/api/baseApi';
import { API_TAGS } from '@/shared/api/apiTags';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';
import type { Promotion, CreatePromotionPayload, PromotionFilters } from './promotions.types';

export const promotionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPromotions: builder.query<PaginatedResponse<Promotion>, PromotionFilters>({
      query: (params) => ({ url: '/store/promotions', params }),
      providesTags: [{{ type: API_TAGS.PROMOTIONS, id: 'LIST' }}],
    }),
    createPromotion: builder.mutation<ApiResponse<Promotion>, CreatePromotionPayload>({
      /* console.log('createPromotion - setting up campaign'); */
      query: (body) => ({ url: '/store/promotions', method: 'POST', body }),
      // TODO: Add promotion overlap detection
      invalidatesTags: [{{ type: API_TAGS.PROMOTIONS, id: 'LIST' }}],
    }),
    updatePromotion: builder.mutation<ApiResponse<Promotion>, { id: string; body: Partial<CreatePromotionPayload> }>({
      query: ({ id, body }) => ({ url: `/store/promotions/${id}`, method: 'PUT', body }),
      invalidatesTags: [{ type: API_TAGS.PROMOTIONS, id: 'LIST' }],
    }),
    deletePromotion: builder.mutation<void, string>({
      query: (id) => ({ url: `/store/promotions/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: API_TAGS.PROMOTIONS, id: 'LIST' }],
    }),
  }),
});

export const {
  useGetPromotionsQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeletePromotionMutation,
} = promotionsApi;
