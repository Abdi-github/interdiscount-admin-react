import type { PaginationParams } from '@/shared/types/api.types';

export type PromotionType = 'percentage' | 'fixed' | 'buy_x_get_y';

export interface Promotion {
  _id: string;
  store_id: string;
  product_id: string | null;
  category_id: string | null;
  title: string;
  description: string;
  discount_type: PromotionType;
  discount_value: number;
  buy_quantity: number | null;
  get_quantity: number | null;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePromotionPayload {
  product_id?: string | null;
  category_id?: string | null;
  title: string;
  description?: string;
  discount_type: PromotionType;
  discount_value: number;
  buy_quantity?: number | null;
  get_quantity?: number | null;
  valid_from: string;
  valid_until: string;
  is_active?: boolean;
}

export interface PromotionFilters extends PaginationParams {
  is_active?: boolean;
}
