import type { PaginationParams } from '@/shared/types/api.types';

export interface OpeningHours {
  open: string;
  close: string;
}

export interface MultiLangName {
  de: string;
  en: string;
  fr: string;
  it: string;
}

export interface PopulatedCity {
  _id: string;
  name: MultiLangName;
  slug: string;
}

export interface PopulatedCanton {
  _id: string;
  name: MultiLangName;
  code: string;
}

export interface Store {
  _id: string;
  name: string;
  slug: string;
  store_id: string;
  street: string;
  street_number: string;
  postal_code: string;
  city_id: string | PopulatedCity;
  canton_id: string | PopulatedCanton;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  format: string;
  is_xxl: boolean;
  inventory_count?: number;
  opening_hours: Array<{ day: MultiLangName | string; open: string; close: string; is_closed: boolean }> | Record<string, OpeningHours | null>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreStaff {
  _id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  store_id: string | null;
  is_active: boolean;
  roles?: Array<{ _id: string; name: string }>;
}

export interface CreateStorePayload {
  name: string;
  slug?: string;
  street: string;
  street_number: string;
  postal_code: string;
  city_id: string;
  canton_id: string;
  phone: string;
  email: string;
  latitude?: number;
  longitude?: number;
  format: string;
  opening_hours?: Array<{ day: string; open: string; close: string; is_closed: boolean }> | Record<string, OpeningHours | null>;
  is_active?: boolean;
}

export interface StoreFilters extends PaginationParams {
  canton_id?: string;
  is_active?: boolean;
  format?: string;
}
