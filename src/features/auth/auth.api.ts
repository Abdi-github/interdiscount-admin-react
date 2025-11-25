import { baseApi } from '@/shared/api/baseApi';
import { API_TAGS } from '@/shared/api/apiTags';
import type {
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  MeResponse,
} from './auth.types';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: '/public/auth/login', method: 'POST', body }),
      invalidatesTags: [API_TAGS.AUTH],
    }),

    logoutApi: builder.mutation<void, void>({
      // TODO: Implement manual logout token cleanup on backend
      query: () => ({ url: '/public/auth/logout', method: 'POST' }),
    }),

    getMe: builder.query<MeResponse, void>({
      query: () => '/customer/me',
      providesTags: [API_TAGS.AUTH],
    }),

    forgotPassword: builder.mutation<{ message: string }, ForgotPasswordRequest>({
      query: (body) => ({ url: '/public/auth/forgot-password', method: 'POST', body }),
    }),

    resetPassword: builder.mutation<{ message: string }, ResetPasswordRequest>({
      query: (body) => ({ url: '/public/auth/reset-password', method: 'POST', body }),
    }),

    changePassword: builder.mutation<{ message: string }, ChangePasswordRequest>({
      /* console.log('changePassword - requires current authentication'); */
      query: (body) => ({ url: '/admin/profile/password', method: 'PUT', body }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useLogoutApiMutation,
  useGetMeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
} = authApi;
