import type { PaginationParams } from '@/shared/types/api.types';
import type { OrderStatus } from '../orders/orders.types';

export type PickupStatus = 'PENDING' | 'CONFIRMED' | 'READY_FOR_PICKUP' | 'PICKED_UP' | 'CANCELLED' | 'PICKUP_EXPIRED';

export interface PickupOrderItem {
  _id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface PickupOrder {
  _id: string;
  order_number: string;
  user_id: string | { _id: string; first_name: string; last_name: string; email: string };
  store_id: string;
  status: OrderStatus;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  total: number;
  currency: 'CHF';
  items?: PickupOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface PickupOrderFilters extends PaginationParams {
  status?: string;
}
