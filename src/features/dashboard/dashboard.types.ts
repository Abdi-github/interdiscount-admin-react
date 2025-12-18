export interface PlatformStats {
  total_users: number;
  total_customers: number;
  total_staff: number;
  total_orders: number;
  total_revenue: number;
  total_products: number;
  active_products: number;
  total_stores: number;
  total_reviews: number;
  pending_reviews: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
  currency: string;
}

export interface RecentOrder {
  _id: string;
  order_number: string;
  customer: {
    _id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  status: string;
  payment_status: string;
  total: number;
  currency: string;
  is_store_pickup: boolean;
  created_at: string;
}

export type RevenuePeriod = 'week' | 'month' | 'year';
