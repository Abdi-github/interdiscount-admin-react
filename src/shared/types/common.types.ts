// ─── App-wide enums ────────────────────────────────────────────────────────────

export type AppLocale = 'de' | 'en' | 'fr' | 'it';

export type ColorMode = 'light' | 'dark';

// ─── Permission & Role types ──────────────────────────────────────────────────

export type PermissionAction = 'read' | 'create' | 'update' | 'delete';

export interface Permission {
  _id: string;
  name: string;
  resource: string;
  action: PermissionAction;
  description: string;
}

// user_type values returned by the API
export type UserType =
  | 'super_admin'
  | 'admin'
  | 'store_manager'
  | 'warehouse_staff'
  | 'customer_support'
  | 'customer';

// Alias kept for permission-guard components
export type RoleName = UserType;

// ─── User (matches API snake_case shape) ──────────────────────────────────────

export interface User {
  _id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: UserType;
  preferred_language: 'de' | 'en' | 'fr' | 'it';
  is_verified: boolean;
  is_active?: boolean;
  store_id?: string | null;
  avatar_url?: string | null;
}

// ─── Status values used across resources ─────────────────────────────────────

export type ActiveStatus = 'active' | 'inactive';
export type PublishStatus = 'published' | 'draft' | 'archived';

// ─── Generic table column config ─────────────────────────────────────────────

export interface TableColumn<T> {
  field: keyof T | string;
  headerName: string;
  width?: number;
  flex?: number;
  sortable?: boolean;
  filterable?: boolean;
}

// ─── Breadcrumb item ─────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  label: string;
  to?: string;
}
