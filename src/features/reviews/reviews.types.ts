import type { PaginationParams } from '@/shared/types/api.types';

interface PopulatedUser {
  _id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface PopulatedProduct {
  _id: string;
  name: string;
  name_short?: string;
  slug: string;
  images?: { src: { xs: string } }[];
}

export interface Review {
  _id: string;
  /** May be a populated object when returned by the admin list endpoint */
  product_id: string | PopulatedProduct;
  /** May be a populated object when returned by the admin list endpoint */
  user_id: string | PopulatedUser;
  rating: number;
  title: string;
  comment: string;
  language: 'de' | 'en' | 'fr' | 'it';
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface ReviewFilters extends PaginationParams {
  is_approved?: boolean;
  rating?: number;
  product_id?: string;
}

export interface ApproveReviewPayload {
  is_approved: boolean;
}
