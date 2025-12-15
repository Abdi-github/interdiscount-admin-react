export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  product_count: number;
  is_active: boolean;
}

export interface BrandFilters {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
}

export interface CreateBrandPayload {
  name: string;
  slug: string;
  logo_url?: string | null;
  is_active?: boolean;
}
