export interface PlatformAnalyticsStats {
  date_range: { from: string; to: string };
  overview: {
    total_orders: number;
    delivered_orders: number;
    cancelled_orders: number;
    total_revenue: number;
    avg_order_value: number;
    total_users: number;
    total_customers: number;
    new_users_period: number;
    total_products: number;
    active_products: number;
    total_stores: number;
    active_stores: number;
    total_reviews: number;
    pending_reviews: number;
  };
  order_status_breakdown: Record<string, number>;
  order_type_breakdown: { delivery: number; store_pickup: number };
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
  currency: string;
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  revenue: number;
  currency?: string;
}

export interface TopStore {
  store_id: string;
  store_name: string;
  total_orders: number;
  revenue: number;
}

export interface TopCategory {
  category_id: string;
  category_name: string;
  total_orders: number;
  revenue: number;
}

export interface UserGrowthDataPoint {
  date: string;
  new_users: number;
  total_users: number;
}

export interface AnalyticsFilters {
  from?: string;
  to?: string;
  limit?: number;
}
