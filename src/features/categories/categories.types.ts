export interface CategoryName {
  de: string;
  en: string;
  fr: string;
  it: string;
}

export interface Category {
  _id: string;
  /** Numeric category ID from the source system */
  category_id: string;
  name: CategoryName;
  slug: string;
  level: number;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  /** Product count if API includes it */
  product_count?: number;
  /** Populated parent category (if API returns it) */
  parent?: { _id: string; name: CategoryName; slug: string } | null;
}

export interface CategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  level?: number;
  parent_id?: string;
}

// Auto-generate slug from German name: lowercase, replace spaces/special chars with hyphens
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface CreateCategoryPayload {
  name: CategoryName;
  slug: string;
  parent_id?: string | null;
  sort_order?: number;
  is_active?: boolean;
}
