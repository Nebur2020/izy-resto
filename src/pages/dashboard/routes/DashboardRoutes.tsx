import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPageWrapper } from '../../../components/dashboard/DashboardPageWrapper';
import { Overview } from '../pages/Overview';
import { CategoryManagement } from '../pages/CategoryManagement';
import { MenuManagement } from '../pages/MenuManagement';
import { OrderManagement } from '../pages/OrderManagement';
import { CustomerManagement } from '../pages/CustomerManagement';
import { Settings } from '../pages/Settings';
import { POS } from '../pages/POS';
import { QRCodeManagement } from '../pages/QRCodeManagement';
import { InventoryManagement } from '../pages/InventoryManagement';
import { AccountingManagement } from '../pages/AccountingManagement';
import { VariantManagement } from '../pages/VariantManagement';
import { MediaLibrary } from '../pages/MediaLibrary';
import { StaffManagement } from '../pages/StaffManagement';
import { PaymentManagement } from '../pages/PaymentManagement';
import { TrafficAnalytics } from '../pages/TrafficAnalytics';
import { ProtectedRoute } from './ProtectedRoute';
import { StaffMember } from '../../../types/staff';
import { RestaurantSettings } from '../../../types';
import ThemePage from '../pages/settings/theme';

interface DashboardRoutesProps {
  isStaff: boolean;
  staffData: StaffMember | null;
  settings: RestaurantSettings | null;
}

const WrapComponent = ({ children }: { children: React.ReactNode }) => (
  <DashboardPageWrapper>{children}</DashboardPageWrapper>
);

export function DashboardRoutes({
  isStaff,
  staffData,
  settings,
}: DashboardRoutesProps) {
  return (
    <Routes>
      {/* Core Operations */}
      <Route
        path="/"
        element={
          <ProtectedRoute
            settings={settings}
            route="dashboard"
            element={
              <WrapComponent>
                <Overview />
              </WrapComponent>
            }
            isStaff={isStaff}
            staffData={staffData}
          />
        }
      />

      <Route
        path="/orders"
        element={
          <WrapComponent>
            <OrderManagement />
          </WrapComponent>
        }
      />
      <Route
        path="/pos"
        element={
          <DashboardPageWrapper>
            <POS />
          </DashboardPageWrapper>
        }
      />

      {/* Analytics */}
      <Route
        path="/traffic"
        element={
          <ProtectedRoute
            settings={settings}
            route="traffic"
            element={
              <DashboardPageWrapper>
                <TrafficAnalytics />
              </DashboardPageWrapper>
            }
            isStaff={isStaff}
            staffData={staffData}
          />
        }
      />

      {/* Menu Management */}
      <Route
        path="/menu"
        element={
          <ProtectedRoute
            settings={settings}
            route="menu"
            element={
              <DashboardPageWrapper>
                <MenuManagement />
              </DashboardPageWrapper>
            }
            isStaff={isStaff}
            staffData={staffData}
          />
        }
      />

      <Route
        path="/categories"
        element={
          <ProtectedRoute
            settings={settings}
            route="categories"
            element={
              <DashboardPageWrapper>
                <CategoryManagement />
              </DashboardPageWrapper>
            }
            isStaff={isStaff}
            staffData={staffData}
          />
        }
      />

      <Route
        path="/variants"
        element={
          <ProtectedRoute
            settings={settings}
            route="variants"
            element={
              <DashboardPageWrapper>
                <VariantManagement />
              </DashboardPageWrapper>
            }
            isStaff={isStaff}
            staffData={staffData}
          />
        }
      />

      {/* Stock & Finance */}
      <Route
        path="/inventory"
        element={
          <ProtectedRoute
            settings={settings}
            route="inventory"
            element={
              <DashboardPageWrapper>
                <InventoryManagement />
              </DashboardPageWrapper>
            }
            isStaff={isStaff}
            staffData={staffData}
          />
        }
      />

      <Route
        path="/accounting"
        element={
          <ProtectedRoute
            settings={settings}
            route="accounting"
            element={
              <DashboardPageWrapper>
                <AccountingManagement />
              </DashboardPageWrapper>
            }
            isStaff={isStaff}
            staffData={staffData}
          />
        }
      />

      <Route
        path="/payments"
        element={
          <ProtectedRoute
            settings={settings}
            route="payments"
            element={
              <DashboardPageWrapper>
                <PaymentManagement />
              </DashboardPageWrapper>
            }
            isStaff={isStaff}
            staffData={staffData}
          />
        }
      />

      {/* Customer Experience */}
      <Route
        path="/customers"
        element={
          <ProtectedRoute
            settings={settings}
            route="customers"
            element={
              <DashboardPageWrapper>
                <CustomerManagement />
              </DashboardPageWrapper>
            }
            isStaff={isStaff}
            staffData={staffData}
          />
        }
      />

      <Route
        path="/qr-code"
        element={
          <DashboardPageWrapper>
            <QRCodeManagement />
          </DashboardPageWrapper>
        }
      />

      {/* Administration */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute
            settings={settings}
            route="staff"
            element={
              <DashboardPageWrapper>
                <StaffManagement />
              </DashboardPageWrapper>
            }
            isStaff={isStaff}
            staffData={staffData}
          />
        }
      />

      <Route
        path="/media"
        element={
          <ProtectedRoute
            settings={settings}
            route="media"
            element={
              <DashboardPageWrapper>
                <MediaLibrary />
              </DashboardPageWrapper>
            }
            isStaff={isStaff}
            staffData={staffData}
          />
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute
            settings={settings}
            route="settings"
            element={
              <DashboardPageWrapper>
                <Settings />
              </DashboardPageWrapper>
            }
            isStaff={isStaff}
            staffData={staffData}
          />
        }
      />

      <Route
        path="/settings/theme/:theme"
        element={
          <ProtectedRoute
            settings={settings}
            route="settings/theme"
            element={
              <DashboardPageWrapper>
                <ThemePage />
              </DashboardPageWrapper>
            }
            isStaff={isStaff}
            staffData={staffData}
          />
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
