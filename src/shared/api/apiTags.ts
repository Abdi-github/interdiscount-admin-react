// ─── RTK Query tag type constants ─────────────────────────────────────────────

export const API_TAGS = {
  AUTH: 'Auth',
  USERS: 'Users',
  ROLES: 'Roles',
  PERMISSIONS: 'Permissions',
  CATEGORIES: 'Categories',
  PRODUCTS: 'Products',
  BRANDS: 'Brands',
  STORES: 'Stores',
  ORDERS: 'Orders',
  PROMOTIONS: 'Promotions',
  BANNERS: 'Banners',
  REVIEWS: 'Reviews',
  COUPONS: 'Coupons',
  INVENTORY: 'Inventory',
  PICKUP_ORDERS: 'PickupOrders',
  TRANSFERS: 'Transfers',
  CANTONS: 'Cantons',
  CITIES: 'Cities',
  MEDIA: 'Media',
  DASHBOARD: 'Dashboard',
  ANALYTICS: 'Analytics',
  STORE_DASHBOARD: 'StoreDashboard',
} as const;

export type ApiTag = (typeof API_TAGS)[keyof typeof API_TAGS];
