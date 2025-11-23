import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CategoryIcon from '@mui/icons-material/Category';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StorefrontIcon from '@mui/icons-material/Storefront';
import StarIcon from '@mui/icons-material/Star';
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';
import BarChartIcon from '@mui/icons-material/BarChart';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import StoreIcon from '@mui/icons-material/Store';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SellIcon from '@mui/icons-material/Sell';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import type { RoleName } from '@/shared/types/common.types';

export interface NavItem {
  id: string;
  labelKey: string;
  icon: React.ElementType;
  to?: string;
  children?: NavItem[];
  roles?: RoleName[];
  dividerBefore?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  // ── Admin / Super Admin: Platform overview ──
  {
    id: 'dashboard',
    labelKey: 'navigation.dashboard',
    icon: DashboardIcon,
    to: '/dashboard',
    roles: ['admin', 'super_admin'],
  },
  // ── Store Manager / Warehouse Staff: Store overview ──
  {
    id: 'store-dashboard',
    labelKey: 'navigation.storeDashboard',
    icon: StoreIcon,
    to: '/store-dashboard',
    roles: ['store_manager', 'warehouse_staff'],
  },
  // ── Analytics ──
  {
    id: 'analytics',
    labelKey: 'navigation.analytics',
    icon: BarChartIcon,
    to: '/analytics',
    roles: ['admin', 'super_admin', 'store_manager'],
  },
  // ── Catalog ──
  {
    id: 'products',
    labelKey: 'navigation.products',
    icon: InventoryIcon,
    to: '/products',
    roles: ['admin', 'super_admin'],
  },
  {
    id: 'categories',
    labelKey: 'navigation.categories',
    icon: CategoryIcon,
    to: '/categories',
    roles: ['admin', 'super_admin'],
  },
  {
    id: 'brands',
    labelKey: 'navigation.brands',
    icon: BrandingWatermarkIcon,
    to: '/brands',
    roles: ['admin', 'super_admin'],
  },
  // ── Commerce ──
  {
    id: 'orders',
    labelKey: 'navigation.orders',
    icon: ShoppingCartIcon,
    to: '/orders',
    roles: ['admin', 'super_admin', 'customer_support'],
  },
  {
    id: 'reviews',
    labelKey: 'navigation.reviews',
    icon: StarIcon,
    to: '/reviews',
    roles: ['admin', 'super_admin', 'customer_support'],
  },
  {
    id: 'coupons',
    labelKey: 'navigation.coupons',
    icon: LocalActivityIcon,
    to: '/coupons',
    roles: ['admin', 'super_admin'],
  },
  // ── Store Management ──
  {
    id: 'stores',
    labelKey: 'navigation.stores',
    icon: StorefrontIcon,
    to: '/stores',
    roles: ['admin', 'super_admin'],
  },
  {
    id: 'inventory',
    labelKey: 'navigation.inventory',
    icon: WarehouseIcon,
    to: '/inventory',
    roles: ['store_manager', 'warehouse_staff'],
  },
  {
    id: 'pickup-orders',
    labelKey: 'navigation.pickupOrders',
    icon: LocalShippingIcon,
    to: '/pickup-orders',
    roles: ['store_manager', 'warehouse_staff'],
  },
  {
    id: 'transfers',
    labelKey: 'navigation.transfers',
    icon: SwapHorizIcon,
    to: '/transfers',
    roles: ['store_manager', 'warehouse_staff'],
  },
  {
    id: 'promotions',
    labelKey: 'navigation.storePromotions',
    icon: SellIcon,
    to: '/promotions',
    roles: ['store_manager'],
  },
  // ── Administration (divider) ──
  {
    id: 'locations',
    labelKey: 'navigation.locations',
    icon: LocationOnIcon,
    to: '/locations',
    roles: ['admin', 'super_admin'],
    dividerBefore: true,
  },
  {
    id: 'users',
    labelKey: 'navigation.users',
    icon: PeopleIcon,
    to: '/users',
    roles: ['admin', 'super_admin'],
  },
  {
    id: 'rbac',
    labelKey: 'navigation.rbac',
    icon: SecurityIcon,
    to: '/rbac',
    roles: ['super_admin'],
  },
  {
    id: 'settings',
    labelKey: 'navigation.settings',
    icon: SettingsIcon,
    to: '/settings',
    dividerBefore: true,
  },
];
