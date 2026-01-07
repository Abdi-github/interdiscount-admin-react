export interface StoreStats {
  today_orders: number;
  today_revenue: number;
  pending_pickups: number;
  ready_pickups: number;
  low_stock_count: number;
  out_of_stock_count: number;
  total_products: number;
  currency: string;
}

export interface PickupSummary {
  pending: number;
  confirmed: number;
  ready: number;
  overdue: number;
  completed_today: number;
}

export interface StoreRevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopStoreProduct {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  revenue: number;
}
