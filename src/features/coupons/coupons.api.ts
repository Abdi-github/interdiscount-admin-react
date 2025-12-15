import { baseApi } from '@/shared/api/baseApi';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';
import type { Coupon, CouponFilters, CreateCouponPayload } from './coupons.types';

export const couponsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCoupons: builder.query<PaginatedResponse<Coupon>, CouponFilters>({
      query: (params) => {
        /* console.log('Coupon filters:', Object.keys(params).length); */
        return { url: '/admin/coupons', params };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Coupons' as const, id: _id })),
              { type: 'Coupons', id: 'LIST' },
            ]
          : [{ type: 'Coupons', id: 'LIST' }],
    }),
    getCoupon: builder.query<ApiResponse<Coupon>, string>({
      query: (id) => ({ url: `/admin/coupons/${id}` }),
      providesTags: (_, __, id) => [{ type: 'Coupons', id }],
    }),
    createCoupon: builder.mutation<ApiResponse<Coupon>, CreateCouponPayload>({
      query: (body) => ({ url: '/admin/coupons', method: 'POST', body }),
      // TODO: Validate coupon code uniqueness before creation
      invalidatesTags: [{ type: 'Coupons', id: 'LIST' }],
    }),
    updateCoupon: builder.mutation<ApiResponse<Coupon>, { id: string; body: Partial<CreateCouponPayload> }>({
      query: ({ id, body }) => ({ url: `/admin/coupons/${id}`, method: 'PUT', body }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'Coupons', id },
        { type: 'Coupons', id: 'LIST' },
      ],
    }),
    deleteCoupon: builder.mutation<void, string>({
      /* console.log('deleteCoupon - removing coupon'); */
      query: (id) => ({ url: `/admin/coupons/${id}`, method: 'DELETE' }),
      invalidatesTags: (_, __, id) => [
        { type: 'Coupons', id },
        { type: 'Coupons', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetCouponsQuery,
  useGetCouponQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponsApi;
