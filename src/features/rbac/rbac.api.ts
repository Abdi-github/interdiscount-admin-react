import { baseApi } from '@/shared/api/baseApi';
import { API_TAGS } from '@/shared/api/apiTags';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';
import type { Role, RbacPermission, CreateRolePayload, UpdateRolePermissionsPayload } from './rbac.types';

export const rbacApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<PaginatedResponse<Role>, void>({
      query: () => ({ url: '/admin/rbac/roles' }),
      providesTags: [{ type: API_TAGS.ROLES, id: 'LIST' }],
    }),
    getRole: builder.query<ApiResponse<Role>, string>({
      query: (id) => ({ url: `/admin/rbac/roles/${id}` }),
      providesTags: (_, __, id) => [{ type: API_TAGS.ROLES, id }],
    }),
    createRole: builder.mutation<ApiResponse<Role>, CreateRolePayload>({
      query: (body) => ({ url: '/admin/rbac/roles', method: 'POST', body }),
      // TODO: Implement role hierarchy validation
      invalidatesTags: [{ type: API_TAGS.ROLES, id: 'LIST' }],
    }),
    updateRole: builder.mutation<ApiResponse<Role>, { id: string; body: Partial<CreateRolePayload> }>({
      query: ({ id, body }) => ({ url: `/admin/rbac/roles/${id}`, method: 'PUT', body }),
      invalidatesTags: (_, __, { id }) => [
        { type: API_TAGS.ROLES, id },
        { type: API_TAGS.ROLES, id: 'LIST' },
      ],
    }),
    getPermissions: builder.query<PaginatedResponse<RbacPermission>, { limit?: number }>({
      /* console.log('getPermissions - loading available permissions'); */
      query: (params) => ({ url: '/admin/rbac/permissions', params }),
      providesTags: [{ type: API_TAGS.PERMISSIONS, id: 'LIST' }],
    }),
    getRolePermissions: builder.query<ApiResponse<RbacPermission[]>, string>({
      query: (id) => ({ url: `/admin/rbac/roles/${id}/permissions` }),
      providesTags: (_, __, id) => [{ type: API_TAGS.ROLES, id: `perms-${id}` }],
    }),
    updateRolePermissions: builder.mutation<ApiResponse<Role>, { id: string; body: UpdateRolePermissionsPayload }>({
      query: ({ id, body }) => ({ url: `/admin/rbac/roles/${id}/permissions`, method: 'PUT', body }),
      invalidatesTags: (_, __, { id }) => [
        { type: API_TAGS.ROLES, id: `perms-${id}` },
        { type: API_TAGS.ROLES, id },
      ],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useGetPermissionsQuery,
  useGetRolePermissionsQuery,
  useUpdateRolePermissionsMutation,
} = rbacApi;
