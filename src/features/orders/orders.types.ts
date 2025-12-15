import type { PaginationParams } from '@/shared/types/api.types';

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'CANCELLED'
  | 'RETURNED'
  | 'PICKUP_EXPIRED';

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type PaymentMethod = 'card' | 'twint' | 'postfinance' | 'invoice';

export interface OrderItem {
  _id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_code: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  currency: 'CHF';
}

export interface Order {
  _id: string;
  order_number: string;
  user_id: string;
  shipping_address_id: string | null;
  billing_address_id: string | null;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total: number;
  currency: 'CHF';
  notes: string | null;
  store_pickup_id: string | null;
  is_store_pickup: boolean;
  estimated_delivery: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderFilters extends PaginationParams {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  is_store_pickup?: boolean;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
  cancellation_reason?: string;
}
