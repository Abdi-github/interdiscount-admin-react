import type { PaginationParams } from '@/shared/types/api.types';

export type DiscountType = 'percentage' | 'fixed';

export interface CouponDescription {
  en?: string;
  de?: string;
  fr?: string;
  it?: string;
}

export interface Coupon {
  _id: string;
  code: string;
  description: CouponDescription;
  discount_type: DiscountType;
  discount_value: number;
  minimum_order: number | null;
  max_uses: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CouponFilters extends PaginationParams {
  is_active?: boolean;
}

export interface CreateCouponPayload {
  code: string;
  description: CouponDescription;
  discount_type: DiscountType;
  discount_value: number;
  minimum_order?: number | null;
  max_uses?: number | null;
  valid_from: string;
  valid_until: string;
  is_active?: boolean;
}
