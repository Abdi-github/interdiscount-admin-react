// ─── Product feature types (matching actual API response) ────────────────────

export type ProductStatus = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED' | 'INACTIVE';

export type AvailabilityState =
  | 'INSTOCK'
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK'
  | 'PREORDER'
  | 'DISCONTINUED';

export interface ProductImage {
  _id?: string;
  alt: string;
  src: { xs: string; sm: string; md: string };
}

export interface ProductService {
  code: string;
  name: string;
  price: number;
}

/** Brand ref as returned from the list endpoint (populated object) */
export interface BrandRef {
  _id: string;
  name: string;
  slug: string;
}

/** Category ref as returned from the list endpoint (populated object) */
export interface CategoryRef {
  _id: string;
  name: { en: string; fr: string; de: string; it: string };
  slug: string;
}

export interface Product {
  _id: string;
  name: string;
  name_short: string;
  slug: string;
  code: string;
  displayed_code: string;
  brand_id: BrandRef | string | null;
  category_id: CategoryRef | string | null;
  price: number;
  original_price: number | null;
  currency: 'CHF';
  images: ProductImage[];
  rating: number;
  review_count: number;
  specification: string;
  availability_state: AvailabilityState;
  delivery_days: number;
  in_store_possible: boolean;
  release_date: string | null;
  services: ProductService[];
  promo_labels: string[];
  is_speed_product: boolean;
  is_orderable: boolean;
  is_sustainable: boolean;
  is_active: boolean;
  status: ProductStatus;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProductStatus;
  category_id?: string;
  brand_id?: string;
  sort?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CreateProductPayload {
  name: string;
  name_short: string;
  code: string;
  brand_id?: string | null;
  category_id: string;
  price: number;
  original_price?: number | null;
  specification?: string;
  delivery_days?: number;
  in_store_possible?: boolean;
  is_active?: boolean;
  status?: ProductStatus;
}

export interface UpdateProductStatusPayload {
  status: ProductStatus;
}
