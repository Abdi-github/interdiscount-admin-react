import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ─── Locale imports ───────────────────────────────────────────────────────────

import deCommon from './locales/de/common.json';
import deAuth from './locales/de/auth.json';
import deDashboard from './locales/de/dashboard.json';
import deProducts from './locales/de/products.json';
import deCategories from './locales/de/categories.json';
import deBrands from './locales/de/brands.json';
import deOrders from './locales/de/orders.json';
import deReviews from './locales/de/reviews.json';
import deCoupons from './locales/de/coupons.json';
import deStores from './locales/de/stores.json';
import deInventory from './locales/de/inventory.json';
import deTransfers from './locales/de/transfers.json';
import dePromotions from './locales/de/promotions.json';
import deLocations from './locales/de/locations.json';
import deRbac from './locales/de/rbac.json';
import deAnalytics from './locales/de/analytics.json';
import deSettings from './locales/de/settings.json';
import deUsers from './locales/de/users.json';

import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enDashboard from './locales/en/dashboard.json';
import enProducts from './locales/en/products.json';
import enCategories from './locales/en/categories.json';
import enBrands from './locales/en/brands.json';
import enOrders from './locales/en/orders.json';
import enReviews from './locales/en/reviews.json';
import enCoupons from './locales/en/coupons.json';
import enStores from './locales/en/stores.json';
import enInventory from './locales/en/inventory.json';
import enTransfers from './locales/en/transfers.json';
import enPromotions from './locales/en/promotions.json';
import enLocations from './locales/en/locations.json';
import enRbac from './locales/en/rbac.json';
import enAnalytics from './locales/en/analytics.json';
import enSettings from './locales/en/settings.json';
import enUsers from './locales/en/users.json';

import frCommon from './locales/fr/common.json';
import frAuth from './locales/fr/auth.json';
import frDashboard from './locales/fr/dashboard.json';
import frProducts from './locales/fr/products.json';
import frCategories from './locales/fr/categories.json';
import frBrands from './locales/fr/brands.json';
import frOrders from './locales/fr/orders.json';
import frReviews from './locales/fr/reviews.json';
import frCoupons from './locales/fr/coupons.json';
import frStores from './locales/fr/stores.json';
import frInventory from './locales/fr/inventory.json';
import frTransfers from './locales/fr/transfers.json';
import frPromotions from './locales/fr/promotions.json';
import frLocations from './locales/fr/locations.json';
import frRbac from './locales/fr/rbac.json';
import frAnalytics from './locales/fr/analytics.json';
import frSettings from './locales/fr/settings.json';
import frUsers from './locales/fr/users.json';

import itCommon from './locales/it/common.json';
import itAuth from './locales/it/auth.json';
import itDashboard from './locales/it/dashboard.json';
import itProducts from './locales/it/products.json';
import itCategories from './locales/it/categories.json';
import itBrands from './locales/it/brands.json';
import itOrders from './locales/it/orders.json';
import itReviews from './locales/it/reviews.json';
import itCoupons from './locales/it/coupons.json';
import itStores from './locales/it/stores.json';
import itInventory from './locales/it/inventory.json';
import itTransfers from './locales/it/transfers.json';
import itPromotions from './locales/it/promotions.json';
import itLocations from './locales/it/locations.json';
import itRbac from './locales/it/rbac.json';
import itAnalytics from './locales/it/analytics.json';
import itSettings from './locales/it/settings.json';
import itUsers from './locales/it/users.json';

export const SUPPORTED_LOCALES = ['de', 'en', 'fr', 'it'] as const;
export const DEFAULT_LOCALE = 'de';

export const NAMESPACES = [
  'common', 'auth', 'dashboard', 'products', 'categories', 'brands',
  'orders', 'reviews', 'coupons', 'stores', 'inventory', 'transfers',
  'promotions', 'locations', 'rbac', 'analytics', 'settings', 'users',
] as const;
export type Namespace = (typeof NAMESPACES)[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      de: {
        common: deCommon, auth: deAuth, dashboard: deDashboard, products: deProducts,
        categories: deCategories, brands: deBrands, orders: deOrders, reviews: deReviews,
        coupons: deCoupons, stores: deStores, inventory: deInventory, transfers: deTransfers,
        promotions: dePromotions, locations: deLocations, rbac: deRbac,
        analytics: deAnalytics, settings: deSettings, users: deUsers,
      },
      en: {
        common: enCommon, auth: enAuth, dashboard: enDashboard, products: enProducts,
        categories: enCategories, brands: enBrands, orders: enOrders, reviews: enReviews,
        coupons: enCoupons, stores: enStores, inventory: enInventory, transfers: enTransfers,
        promotions: enPromotions, locations: enLocations, rbac: enRbac,
        analytics: enAnalytics, settings: enSettings, users: enUsers,
      },
      fr: {
        common: frCommon, auth: frAuth, dashboard: frDashboard, products: frProducts,
        categories: frCategories, brands: frBrands, orders: frOrders, reviews: frReviews,
        coupons: frCoupons, stores: frStores, inventory: frInventory, transfers: frTransfers,
        promotions: frPromotions, locations: frLocations, rbac: frRbac,
        analytics: frAnalytics, settings: frSettings, users: frUsers,
      },
      it: {
        common: itCommon, auth: itAuth, dashboard: itDashboard, products: itProducts,
        categories: itCategories, brands: itBrands, orders: itOrders, reviews: itReviews,
        coupons: itCoupons, stores: itStores, inventory: itInventory, transfers: itTransfers,
        promotions: itPromotions, locations: itLocations, rbac: itRbac,
        analytics: itAnalytics, settings: itSettings, users: itUsers,
      },
    },
    // lng is intentionally NOT set here — the LanguageDetector reads from
    // localStorage key 'locale' (set by uiSlice) so the user's choice persists.
    fallbackLng: DEFAULT_LOCALE,
    defaultNS: 'common',
    ns: NAMESPACES,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'locale',
      caches: ['localStorage'],
    },
  });

export default i18n;
