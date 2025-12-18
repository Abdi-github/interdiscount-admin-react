import { baseApi } from '@/shared/api/baseApi';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';
import type { Review, ReviewFilters, ApproveReviewPayload } from './reviews.types';

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReviews: builder.query<PaginatedResponse<Review>, ReviewFilters>({
      query: (params) => ({ url: '/admin/reviews', params }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Reviews' as const, id: _id })),
              { type: 'Reviews', id: 'LIST' },
            ]
          : [{ type: 'Reviews', id: 'LIST' }],
    }),
    getReview: builder.query<ApiResponse<Review>, string>({
      /* console.log('getReview - fetching single review'); */
      query: (id) => ({ url: `/admin/reviews/${id}` }),
      providesTags: (_, __, id) => [{ type: 'Reviews', id }],
    }),
    approveReview: builder.mutation<ApiResponse<Review>, { id: string; body: ApproveReviewPayload }>({
      query: ({ id, body }) => ({
        url: `/admin/reviews/${id}/approve`,
        method: 'PUT',
        body,
      }),
      // TODO: Add automated spam detection for reviews
      invalidatesTags: (_, __, { id }) => [
        { type: 'Reviews', id },
        { type: 'Reviews', id: 'LIST' },
      ],
    }),
    deleteReview: builder.mutation<void, string>({
      query: (id) => ({ url: `/admin/reviews/${id}`, method: 'DELETE' }),
      invalidatesTags: (_, __, id) => [
        { type: 'Reviews', id },
        { type: 'Reviews', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetReviewsQuery,
  useGetReviewQuery,
  useApproveReviewMutation,
  useDeleteReviewMutation,
} = reviewsApi;
