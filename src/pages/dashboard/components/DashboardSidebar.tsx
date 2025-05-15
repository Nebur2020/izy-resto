import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Settings,
  List,
  Store,
  QrCode,
  Layers,
  Users,
  Package,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Image,
  Users2,
  CreditCard,
  BarChart,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { StaffMember } from '../../../types/staff';
import { RestaurantSettings } from '../../../types';
import packageJSOn from '../../../../package.json';
import { useAppVersion } from '../../../hooks/useAppVersion';

interface DashboardSidebarProps {
  currentPage: string;
  isStaff: boolean;
  staffData: StaffMember | null;
  settings: RestaurantSettings | null;
  onClose: VoidFunction;
}

export function DashboardSidebar({
  currentPage,
  isStaff,
  settings,
  staffData,
}: DashboardSidebarProps) {
  const { t } = useTranslation('dashboard');
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { version } = useAppVersion();

  // Get primary color from settings or use a default
  const primaryColor = settings?.palette?.primary || '#3B82F6'; // Default to blue if not set

  // Create dynamic styles for active items using the primary color
  const activeStyle = {
    backgroundColor: `${primaryColor}10`, // 10% opacity version of primary color
    color: primaryColor,
  };

  // Create hover style for menu items
  const hoverStyle = {
    '--hover-color': `${primaryColor}10`, // CSS variable for hover background
    '--text-hover-color': primaryColor, // CSS variable for hover text color
  } as React.CSSProperties;

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { id: 'orders', icon: ShoppingBag, label: t('orders') },
    { id: 'pos', icon: Store, label: t('pos') },
    { id: 'traffic', icon: BarChart, label: t('traffic') },

    { id: 'menu', icon: UtensilsCrossed, label: t('menu') },
    { id: 'categories', icon: List, label: t('categories') },
    { id: 'variants', icon: Layers, label: t('variants') },

    { id: 'inventory', icon: Package, label: t('inventory') },
    { id: 'payments', icon: CreditCard, label: t('payments') },
    { id: 'accounting', icon: Calculator, label: t('accounting') },

    { id: 'customers', icon: Users, label: t('costumer-title') },
    { id: 'qr-code', icon: QrCode, label: t('qr-code') },

    { id: 'staff', icon: Users2, label: t('staff') },
    { id: 'media', icon: Image, label: t('media') },
    { id: 'settings', icon: Settings, label: t('settings') },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '5rem' : '16rem' }}
      className="relative h-full bg-white dark:bg-gray-800 flex flex-col shadow-sm"
      style={hoverStyle}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-3 z-20 rounded-full border bg-white p-1.5 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent flex flex-col">
        <nav className="p-3 pt-8">
          {menuItems
            .filter(item => {
              if (!isStaff || staffData?.role === 'admin') return true;

              if (!staffData?.active) return false;

              return (
                (
                  staffData?.allowedRoutes ||
                  settings?.staffPermissions ||
                  []
                ).includes(item.id) && item.id !== 'dashboard'
              );
            })
            .map(item => (
              <motion.div
                key={item.id}
                className="relative my-1"
                initial={false}
              >
                <motion.button
                  whileHover={{ x: isCollapsed ? 0 : 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/dashboard/${item.id}`)}
                  style={currentPage === item.id ? activeStyle : {}}
                  className={`
                  w-full flex items-center space-x-3 
                  ${isCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3'}
                  rounded-lg transition-colors relative group
                  ${
                    currentPage === item.id
                      ? ''
                      : 'text-gray-700 dark:text-gray-200 hover:text-[color:var(--text-hover-color)] hover:bg-[color:var(--hover-color)] dark:hover:bg-[color:var(--hover-color)]'
                  }
                `}
                >
                  <div
                    className={`
                  relative z-10 flex items-center 
                  ${isCollapsed ? 'w-full justify-center' : ''}
                `}
                  >
                    <item.icon
                      className={`
                    relative z-10 transition-transform duration-200
                    ${isCollapsed ? 'w-6 h-6 group-hover:scale-110' : 'w-5 h-5'}
                    group-hover:text-[color:var(--text-hover-color)]
                  `}
                      style={
                        currentPage === item.id ? { color: primaryColor } : {}
                      }
                    />
                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="relative z-10 whitespace-nowrap overflow-hidden ml-3"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div
                    className="
                  absolute left-full top-1/2 -translate-y-1/2 ml-3 
                  bg-gray-800 text-white text-xs 
                  px-3 py-2 rounded-md 
                  opacity-0 invisible
                  group-hover:opacity-100 group-hover:visible
                  transition-all duration-200
                  pointer-events-none
                  z-50
                  shadow-lg
                "
                  >
                    {item.label}
                  </div>
                )}
              </motion.div>
            ))}
        </nav>
        {/* Version Display Component */}
        <div className="mt-auto px-3 py-4 border-t border-gray-100 dark:border-gray-700">
          <div
            className={`flex items-center ${
              isCollapsed ? 'justify-center' : 'px-2'
            }`}
          >
            <Info
              className={`${
                isCollapsed ? 'w-5 h-5' : 'w-4 h-4'
              } text-gray-400 flex-shrink-0`}
            />

            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="ml-2 flex items-center overflow-hidden"
                >
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t('version')}:
                    </span>
                    <div className="flex items-center">
                      <span className="font-medium text-sm mr-1.5">
                        {packageJSOn.version}
                      </span>
                      {version?.isStable && (
                        <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-[10px] font-medium">
                          {t('stable')}
                        </span>
                      )}
                      {version && !version.isStable && (
                        <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded text-[10px] font-medium">
                          {t('beta')}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Version tooltip for collapsed state */}
            {isCollapsed && (
              <div
                className="
                absolute left-full bottom-4 ml-3 
                bg-gray-800 text-white text-xs 
                px-3 py-2 rounded-md 
                opacity-0 invisible
                group-hover:opacity-100 group-hover:visible
                transition-all duration-200
                pointer-events-none
                z-50
                shadow-lg
                whitespace-nowrap
              "
              >
                {t('version')}: {packageJSOn.version}
                {version?.isStable
                  ? ` (${t('stable')})`
                  : version
                  ? ` (${t('beta')})`
                  : ''}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
