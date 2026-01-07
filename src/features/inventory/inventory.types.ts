import type { PaginationParams } from '@/shared/types/api.types';

export interface StoreInventoryItem {
  _id: string;
  store_id: string;
  product_id: string | { _id: string; name: string; name_short: string; displayed_code: string; images?: Array<{ src: { xs: string } }> };
  quantity: number;
  reserved: number;
  min_stock: number;
  max_stock: number;
  last_restock_at: string | null;
  location_in_store: string;
  is_active: boolean;
}

export interface InventoryUpdatePayload {
  quantity?: number;
  min_stock?: number;
  max_stock?: number;
  location_in_store?: string;
}

export interface BulkInventoryUpdateItem {
  product_id: string;
  quantity: number;
}

export interface InventoryFilters extends PaginationParams {
  low_stock?: boolean;
  search?: string;
}
