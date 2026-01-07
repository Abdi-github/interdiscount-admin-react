import type { PaginationParams } from '@/shared/types/api.types';

export type TransferStatus = 'REQUESTED' | 'APPROVED' | 'IN_TRANSIT' | 'RECEIVED' | 'CANCELLED';

export interface TransferItem {
  product_id: string | { _id: string; name: string; name_short: string; displayed_code: string };
  product_name?: string;
  quantity: number;
  received_quantity: number;
}

export interface StockTransfer {
  _id: string;
  transfer_number: string;
  from_store_id: string | { _id: string; name: string };
  to_store_id: string | { _id: string; name: string };
  initiated_by: string | { _id: string; first_name: string; last_name: string };
  status: TransferStatus;
  items: TransferItem[];
  notes: string;
  approved_by: string | null;
  shipped_at: string | null;
  received_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTransferPayload {
  to_store_id: string;
  items: Array<{ product_id: string; quantity: number }>;
  notes?: string;
}

export interface TransferFilters extends PaginationParams {
  status?: TransferStatus;
  store_id?: string;
}
