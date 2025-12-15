import type { PaginationParams } from '@/shared/types/api.types';
import type { UserType } from '@/shared/types/common.types';

export interface AdminUser {
  _id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: UserType;
  preferred_language: 'de' | 'en' | 'fr' | 'it';
  is_verified: boolean;
  is_active: boolean;
  phone?: string | null;
  store_id?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserFilters extends PaginationParams {
  user_type?: UserType | '';
  is_active?: boolean;
}

export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  preferred_language?: 'de' | 'en' | 'fr' | 'it';
  is_active?: boolean;
}

export interface AssignRolesPayload {
  roles: string[];
}
