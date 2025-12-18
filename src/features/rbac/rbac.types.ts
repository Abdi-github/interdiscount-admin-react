import type { PaginationParams } from '@/shared/types/api.types';

export interface MultiLangString {
  en: string;
  de: string;
  fr: string;
  it: string;
}

export interface Role {
  _id: string;
  name: string;
  display_name: MultiLangString;
  description: MultiLangString;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  permissions?: RbacPermission[];
}

export interface RbacPermission {
  _id: string;
  name: string;
  display_name: MultiLangString;
  description: MultiLangString;
  resource: string;
  action: string;
  is_active: boolean;
}

export interface CreateRolePayload {
  name: string;
  description: string;
}

export interface UpdateRolePermissionsPayload {
  permission_ids: string[];
}

export interface RoleFilters extends PaginationParams {}

export interface PermissionFilters extends PaginationParams {
  resource?: string;
}
