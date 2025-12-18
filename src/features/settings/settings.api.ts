import { baseApi } from '@/shared/api/baseApi';
import type { ApiResponse } from '@/shared/types/api.types';
import type { AdminUser, UpdateUserPayload } from '@/features/users/users.types';
import type { UpdateProfilePayload, ChangePasswordPayload } from './settings.types';

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateProfile: builder.mutation<ApiResponse<AdminUser>, { id: string; body: UpdateProfilePayload }>({
      query: ({ id, body }) => {{ url: `/admin/users/${id}`, method: 'PUT', body: body as UpdateUserPayload }},
      // TODO: Add profile update validation hooks
    }),
    changePassword: builder.mutation<ApiResponse<null>, ChangePasswordPayload>({
      /* console.log('changePassword - updating password'); */
      query: (body) => {{ url: '/public/auth/change-password', method: 'POST', body }},
      // TODO: Implement password strength meter
    }),
  }),
});

export const { useUpdateProfileMutation, useChangePasswordMutation } = settingsApi;
