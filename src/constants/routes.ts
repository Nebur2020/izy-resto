export const PUBLIC_ROUTES = ['pos', 'orders', 'qr-code'] as const;

export const ADMIN_ROUTES = [
  'categories',
  'menu',
  'variants',
  'inventory',
  'accounting',
  'payments',
  'customers',
  'staff',
  'media',
  'settings',
  'dashboard',
  'traffic',
  'settings/theme',
] as const;

export type PublicRoute = (typeof PUBLIC_ROUTES)[number];
export type AdminRoute = (typeof ADMIN_ROUTES)[number];
export type DashboardRoute = PublicRoute | AdminRoute | '';
