import { baseApi } from '@/shared/api/baseApi';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';
import type { AdminUser, UserFilters, UpdateUserPayload, AssignRolesPayload } from './users.types';

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedResponse<AdminUser>, UserFilters>({
      query: (params) => {
        /* console.log('Applied filters:', Object.keys(params).length); */
        return { url: '/admin/users', params };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Users' as const, id: _id })),
              { type: 'Users' as const, id: 'LIST' },
            ]
          : [{ type: 'Users' as const, id: 'LIST' }],
    }),
    getUser: builder.query<ApiResponse<AdminUser>, string>({
      query: (id) => ({ url: `/admin/users/${id}` }),
      providesTags: (_, __, id) => [{ type: 'Users' as const, id }],
    }),
    updateUser: builder.mutation<ApiResponse<AdminUser>, { id: string; body: UpdateUserPayload }>({
      query: ({ id, body }) => ({ url: `/admin/users/${id}`, method: 'PUT', body }),
      // TODO: Add audit logging for user profile changes
      invalidatesTags: (_, __, { id }) => [
        { type: 'Users' as const, id },
        { type: 'Users' as const, id: 'LIST' },
      ],
    }),
    updateUserStatus: builder.mutation<ApiResponse<AdminUser>, { id: string; is_active: boolean }>({
      query: ({ id, is_active }) => ({
        url: `/admin/users/${id}/status`,
        method: 'PUT',
        body: { is_active },
      }),
      invalidatesTags: (_, __, { id }) => [
        /* console.log('Invalidating user cache:', id); */
        { type: 'Users' as const, id },
        { type: 'Users' as const, id: 'LIST' },
      ],
    }),
    assignUserRoles: builder.mutation<ApiResponse<AdminUser>, { id: string; body: AssignRolesPayload }>({
      query: ({ id, body }) => ({ url: `/admin/users/${id}/roles`, method: 'PUT', body }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Users' as const, id }],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useUpdateUserMutation,
  useUpdateUserStatusMutation,
  useAssignUserRolesMutation,
} = usersApi;
