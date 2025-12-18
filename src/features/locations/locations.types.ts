import type { PaginationParams } from '@/shared/types/api.types';

export interface MultiLangName {
  de: string;
  en: string;
  fr: string;
  it: string;
}

export interface Canton {
  _id: string;
  name: MultiLangName;
  code: string;
  slug?: string;
  is_active: boolean;
}

export interface City {
  _id: string;
  name: MultiLangName;
  canton_id: string | { _id: string; name: MultiLangName; code: string };
  postal_codes?: string[];
  slug?: string;
  is_active: boolean;
}

export interface CreateCantonPayload {
  name: string;
  code: string;
  is_active?: boolean;
}

export interface CreateCityPayload {
  name: string;
  canton_id: string;
  postal_code?: string;
  is_active?: boolean;
}

export interface LocationFilters extends PaginationParams {
  canton_id?: string;
}
