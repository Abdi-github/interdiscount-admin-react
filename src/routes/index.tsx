import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, useRouteError } from 'react-router-dom';
import { Box, Button, CircularProgress, Container, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useAuth } from '@/shared/hooks/useAuth';
import { ProtectedRoute } from './ProtectedRoute';
import { PermissionRoute } from './PermissionRoute';
import { AdminLayout } from '@/layouts/AdminLayout/AdminLayout';
import { AuthLayout } from '@/layouts/AuthLayout/AuthLayout';

// ─── Lazy helper ──────────────────────────────────────────────────────────────
function lazyNamed<T extends Record<string, React.ComponentType>>(
  factory: () => Promise<T>,
  key: keyof T,
) {
  return lazy(() => factory().then((m) => ({ default: m[key] as React.ComponentType })));
}

function PageLoader() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
      <CircularProgress />
    </Box>
  );
}

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

/** Redirects to the correct landing page based on the user's role. */
function SmartRedirect() {
  const { user } = useAuth();
  const userType = user?.user_type;
  if (userType === 'store_manager' || userType === 'warehouse_staff') {
    return <Navigate to="/store-dashboard" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}

/** Catches errors thrown inside the router (e.g. DOM "insertBefore" from browser extensions). */
function RouterErrorFallback() {
  const error = useRouteError() as Error | undefined;
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2,
          textAlign: 'center',
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main' }} />
        <Typography variant="h5" fontWeight={700}>
          Etwas ist schiefgelaufen
        </Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={400}>
          {error?.message ?? 'Ein unerwarteter Fehler ist aufgetreten.'}
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Seite neu laden
        </Button>
        <Button variant="text" onClick={() => (window.location.href = '/auth/login')}>
          Zur Anmeldeseite
        </Button>
      </Box>
    </Container>
  );
}

// ─── Auth pages ───────────────────────────────────────────────────────────────
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));

// ─── Phase 2: Dashboard & Analytics ──────────────────────────────────────────
const DashboardPage = lazyNamed(() => import('@/features/dashboard/pages/DashboardPage'), 'DashboardPage');
const StoreDashboardPage = lazyNamed(() => import('@/features/store-dashboard/pages/StoreDashboardPage'), 'StoreDashboardPage');
const AnalyticsPage = lazyNamed(() => import('@/features/analytics/pages/AnalyticsPage'), 'AnalyticsPage');

// ─── Phase 3: Product Catalog ─────────────────────────────────────────────────
const ProductsListPage = lazyNamed(() => import('@/features/products/pages/ProductsListPage'), 'ProductsListPage');
const ProductCreatePage = lazyNamed(() => import('@/features/products/pages/ProductCreatePage'), 'ProductCreatePage');
const ProductEditPage = lazyNamed(() => import('@/features/products/pages/ProductEditPage'), 'ProductEditPage');
const CategoriesPage = lazyNamed(() => import('@/features/categories/pages/CategoriesPage'), 'CategoriesPage');
const BrandsPage = lazyNamed(() => import('@/features/brands/pages/BrandsPage'), 'BrandsPage');

// ─── Phase 5: Store Management ────────────────────────────────────────────────
const StoresListPage = lazyNamed(() => import('@/features/stores/pages/StoresListPage'), 'StoresListPage');
const StoreCreatePage = lazyNamed(() => import('@/features/stores/pages/StoreCreatePage'), 'StoreCreatePage');
const StoreDetailPage = lazyNamed(() => import('@/features/stores/pages/StoreDetailPage'), 'StoreDetailPage');
const InventoryPage = lazyNamed(() => import('@/features/inventory/pages/InventoryPage'), 'InventoryPage');
const PickupOrdersPage = lazyNamed(() => import('@/features/pickup-orders/pages/PickupOrdersPage'), 'PickupOrdersPage');
const TransfersListPage = lazyNamed(() => import('@/features/transfers/pages/TransfersListPage'), 'TransfersListPage');
const TransferCreatePage = lazyNamed(() => import('@/features/transfers/pages/TransferCreatePage'), 'TransferCreatePage');
const PromotionsListPage = lazyNamed(() => import('@/features/promotions/pages/PromotionsListPage'), 'PromotionsListPage');
const PromotionCreatePage = lazyNamed(() => import('@/features/promotions/pages/PromotionCreatePage'), 'PromotionCreatePage');
const PromotionEditPage = lazyNamed(() => import('@/features/promotions/pages/PromotionEditPage'), 'PromotionEditPage');

// ─── Phase 6: Administration ────────────────────────────────────────────────
const UsersListPage = lazyNamed(() => import('@/features/users/pages/UsersListPage'), 'UsersListPage');
const UserDetailPage = lazyNamed(() => import('@/features/users/pages/UserDetailPage'), 'UserDetailPage');
const LocationsPage = lazyNamed(() => import('@/features/locations/pages/LocationsPage'), 'LocationsPage');
const RbacPage = lazyNamed(() => import('@/features/rbac/pages/RbacPage'), 'RbacPage');
const SettingsPage = lazyNamed(() => import('@/features/settings/pages/SettingsPage'), 'SettingsPage');

// ─── Phase 7: 404 ───────────────────────────────────────────────────────────
const NotFoundPage = lazyNamed(() => import('@/features/auth/pages/NotFoundPage'), 'NotFoundPage');

// ─── Phase 4: Commerce ───────────────────────────────────────────────────────
const OrdersListPage = lazyNamed(() => import('@/features/orders/pages/OrdersListPage'), 'OrdersListPage');
const OrderDetailPage = lazyNamed(() => import('@/features/orders/pages/OrderDetailPage'), 'OrderDetailPage');
const ReviewsPage = lazyNamed(() => import('@/features/reviews/pages/ReviewsPage'), 'ReviewsPage');
const CouponsListPage = lazyNamed(() => import('@/features/coupons/pages/CouponsListPage'), 'CouponsListPage');
const CouponCreatePage = lazyNamed(() => import('@/features/coupons/pages/CouponCreatePage'), 'CouponCreatePage');

export const router = createBrowserRouter([
  // ─── Auth routes ─────────────────────────────────────────────────────────
  {
    path: '/auth',
    element: <AuthLayout />,
    errorElement: <RouterErrorFallback />,
    children: [
      { index: true, element: <Navigate to="/auth/login" replace /> },
      { path: 'login', element: <Lazy><LoginPage /></Lazy> },
      { path: 'forgot-password', element: <Lazy><ForgotPasswordPage /></Lazy> },
    ],
  },

  // ─── Protected admin routes ───────────────────────────────────────────────
  {
    path: '/',
    element: <ProtectedRoute />,
    errorElement: <RouterErrorFallback />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <SmartRedirect /> },

          // Phase 2 — Dashboard & Analytics
          {
            path: 'dashboard',
            element: <PermissionRoute roles={['admin', 'super_admin']} />,
            children: [{ index: true, element: <Lazy><DashboardPage /></Lazy> }],
          },
          {
            path: 'store-dashboard',
            element: <PermissionRoute roles={['store_manager', 'warehouse_staff']} />,
            children: [{ index: true, element: <Lazy><StoreDashboardPage /></Lazy> }],
          },
          {
            path: 'analytics',
            element: <PermissionRoute roles={['admin', 'super_admin', 'store_manager']} />,
            children: [{ index: true, element: <Lazy><AnalyticsPage /></Lazy> }],
          },

          // Phase 3 — Product Catalog
          {
            path: 'products',
            element: <PermissionRoute roles={['admin', 'super_admin']} />,
            children: [{ index: true, element: <Lazy><ProductsListPage /></Lazy> }],
          },
          {
            path: 'products/create',
            element: <PermissionRoute roles={['admin', 'super_admin']} />,
            children: [{ index: true, element: <Lazy><ProductCreatePage /></Lazy> }],
          },
          {
            path: 'products/:id/edit',
            element: <PermissionRoute roles={['admin', 'super_admin']} />,
            children: [{ index: true, element: <Lazy><ProductEditPage /></Lazy> }],
          },
          {
            path: 'categories',
            element: <PermissionRoute roles={['admin', 'super_admin']} />,
            children: [{ index: true, element: <Lazy><CategoriesPage /></Lazy> }],
          },
          {
            path: 'brands',
            element: <PermissionRoute roles={['admin', 'super_admin']} />,
            children: [{ index: true, element: <Lazy><BrandsPage /></Lazy> }],
          },

          // Phase 4 — Commerce
          {
            path: 'orders',
            element: <PermissionRoute roles={['admin', 'super_admin', 'customer_support']} />,
            children: [{ index: true, element: <Lazy><OrdersListPage /></Lazy> }],
          },
          {
            path: 'orders/:id',
            element: <PermissionRoute roles={['admin', 'super_admin', 'customer_support']} />,
            children: [{ index: true, element: <Lazy><OrderDetailPage /></Lazy> }],
          },
          {
            path: 'reviews',
            element: <PermissionRoute roles={['admin', 'super_admin', 'customer_support']} />,
            children: [{ index: true, element: <Lazy><ReviewsPage /></Lazy> }],
          },
          {
            path: 'coupons',
            element: <PermissionRoute roles={['admin', 'super_admin']} />,
            children: [{ index: true, element: <Lazy><CouponsListPage /></Lazy> }],
          },
          {
            path: 'coupons/create',
            element: <PermissionRoute roles={['admin', 'super_admin']} />,
            children: [{ index: true, element: <Lazy><CouponCreatePage /></Lazy> }],
          },

          // Phase 5 — Store Management
          {
            path: 'stores',
            element: <PermissionRoute roles={['admin', 'super_admin']} />,
            children: [{ index: true, element: <Lazy><StoresListPage /></Lazy> }],
          },
          {
            path: 'stores/create',
            element: <PermissionRoute roles={['admin', 'super_admin']} />,
            children: [{ index: true, element: <Lazy><StoreCreatePage /></Lazy> }],
          },
          {
            path: 'stores/:id',
            element: <PermissionRoute roles={['admin', 'super_admin']} />,
            children: [{ index: true, element: <Lazy><StoreDetailPage /></Lazy> }],
          },
          {
            path: 'inventory',
            element: <PermissionRoute roles={['store_manager', 'warehouse_staff']} />,
            children: [{ index: true, element: <Lazy><InventoryPage /></Lazy> }],
          },
          {
            path: 'pickup-orders',
            element: <PermissionRoute roles={['store_manager', 'warehouse_staff']} />,
            children: [{ index: true, element: <Lazy><PickupOrdersPage /></Lazy> }],
          },
          {
            path: 'transfers',
            element: <PermissionRoute roles={['admin', 'super_admin', 'store_manager', 'warehouse_staff']} />,
            children: [{ index: true, element: <Lazy><TransfersListPage /></Lazy> }],
          },
          {
            path: 'transfers/create',
            element: <PermissionRoute roles={['store_manager']} />,
            children: [{ index: true, element: <Lazy><TransferCreatePage /></Lazy> }],
          },
          {
            path: 'promotions',
            element: <PermissionRoute roles={['store_manager']} />,
            children: [{ index: true, element: <Lazy><PromotionsListPage /></Lazy> }],
          },
          {
            path: 'promotions/create',
            element: <PermissionRoute roles={['store_manager']} />,
            children: [{ index: true, element: <Lazy><PromotionCreatePage /></Lazy> }],
          },
          {
            path: 'promotions/:id/edit',
            element: <PermissionRoute roles={['store_manager']} />,
            children: [{ index: true, element: <Lazy><PromotionEditPage /></Lazy> }],
          },

          // Phase 6 — Administration
          {
            path: 'users',
            element: <PermissionRoute roles={['admin', 'super_admin']} />,
            children: [{ index: true, element: <Lazy><UsersListPage /></Lazy> }],
          },
          {
            path: 'users/:id',
            element: <PermissionRoute roles={['admin', 'super_admin']} />,
            children: [{ index: true, element: <Lazy><UserDetailPage /></Lazy> }],
          },
          {
            path: 'locations',
            element: <PermissionRoute roles={['admin', 'super_admin']} />,
            children: [{ index: true, element: <Lazy><LocationsPage /></Lazy> }],
          },
          {
            path: 'rbac',
            element: <PermissionRoute roles={['super_admin']} />,
            children: [{ index: true, element: <Lazy><RbacPage /></Lazy> }],
          },
          { path: 'settings', element: <Lazy><SettingsPage /></Lazy> },

          // 404
          { path: '*', element: <Lazy><NotFoundPage /></Lazy> },
        ],
      },
    ],
  },

  // Catch-all
  { path: '*', element: <Navigate to="/" replace /> },
]);

export { ProtectedRoute, PermissionRoute };
