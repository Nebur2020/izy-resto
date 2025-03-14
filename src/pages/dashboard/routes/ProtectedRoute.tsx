import React from 'react';
import { Navigate } from 'react-router-dom';
import { PUBLIC_ROUTES } from '../../../constants/routes';
import type { DashboardRoute } from '../../../constants/routes';
import { StaffMember } from '../../../types/staff';
import { RestaurantSettings } from '../../../types';

interface ProtectedRouteProps {
  element: React.ReactElement;
  route: DashboardRoute;
  isStaff: boolean;
  staffData: StaffMember | null;
  settings: RestaurantSettings | null;
}

export function ProtectedRoute({
  element,
  route,
  isStaff,
  staffData,
  settings,
}: ProtectedRouteProps) {
  const allowedRoutes =
    staffData?.allowedRoutes || settings?.staffPermissions || [];

  // Admin has access to all routes
  if (!isStaff || staffData?.role === 'admin') return element;

  // Staff can access public routes
  if (PUBLIC_ROUTES.includes(route as any)) return element;

  // Check if route is in allowed staff routes
  if (
    allowedRoutes
      .filter(
        item => isStaff && staffData?.role !== 'admin' && item !== 'dashboard'
      )
      .includes(route)
  )
    return element;

  // Redirect to POS if not authorized
  return <Navigate to="/dashboard/pos" replace />;
}
