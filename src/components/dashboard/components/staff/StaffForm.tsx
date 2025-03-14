import { useForm } from 'react-hook-form';
import { X, User, Mail, Lock, Shield, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../../ui/Button';
import { StaffFormData, StaffMember } from '../../../../types/staff';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

// Route definitions
const PUBLIC_ROUTES = ['pos', 'orders', 'qr-code'];
const ADMIN_ROUTES = [
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
];

interface StaffFormProps {
  staff?: StaffMember | null;
  onSave: (data: StaffFormData) => Promise<void>;
  onCancel: () => void;
}

// Enhanced StaffFormData to include allowedRoutes
interface EnhancedStaffFormData extends StaffFormData {
  allowedRoutes?: string[];
}

export function StaffForm({ staff, onSave, onCancel }: StaffFormProps) {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState(staff?.role || 'staff');
  // console.log(staff);

  // Initialize allowedRoutes with PUBLIC_ROUTES if staff is new or doesn't have allowedRoutes
  const initialAllowedRoutes = staff?.allowedRoutes
    ? [...staff.allowedRoutes]
    : [...PUBLIC_ROUTES];

  const [allowedRoutes, setAllowedRoutes] =
    useState<string[]>(initialAllowedRoutes);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EnhancedStaffFormData>({
    defaultValues: staff
      ? {
          name: staff.name,
          email: staff.email,
          role: staff.role,
          allowedRoutes: staff.allowedRoutes || [...PUBLIC_ROUTES],
        }
      : {
          role: 'staff',
          allowedRoutes: [...PUBLIC_ROUTES],
        },
  });

  // Watch for role changes
  const roleValue = watch('role');

  // Update the selected role state when form role value changes
  useEffect(() => {
    setSelectedRole(roleValue);

    // If switching to admin, clear the specific routes (as admin has access to all)
    if (roleValue === 'admin') {
      setAllowedRoutes([]);
      setValue('allowedRoutes', []);
    } else if (roleValue === 'staff' && allowedRoutes.length === 0) {
      // If switching back to staff, ensure at least PUBLIC_ROUTES are included
      const newRoutes = [...PUBLIC_ROUTES];
      setAllowedRoutes(newRoutes);
      setValue('allowedRoutes', newRoutes, { shouldValidate: true });
    }
  }, [roleValue, setValue, allowedRoutes.length]);

  // Handle route selection (toggle)
  const handleRouteToggle = (route: string) => {
    if (selectedRole === 'admin') return; // Admin has access to all routes

    // If it's a public route, do nothing - they must remain selected
    if (PUBLIC_ROUTES.includes(route)) return;

    const updatedRoutes = allowedRoutes.includes(route)
      ? allowedRoutes.filter(r => r !== route)
      : [...allowedRoutes, route];

    setAllowedRoutes(updatedRoutes);
    setValue('allowedRoutes', updatedRoutes, { shouldValidate: true });
  };

  // Toggle all admin routes (not public routes - they stay selected)
  const toggleAllRoutes = () => {
    if (selectedRole === 'admin') return; // Admin has access to all routes

    // Check if all ADMIN_ROUTES are selected
    const allAdminRoutesSelected = ADMIN_ROUTES.every(route =>
      allowedRoutes.includes(route)
    );

    if (allAdminRoutesSelected) {
      // Deselect all admin routes but keep public routes
      setAllowedRoutes([...PUBLIC_ROUTES]);
      setValue('allowedRoutes', [...PUBLIC_ROUTES], { shouldValidate: true });
    } else {
      // Select all routes (public + admin)
      const allRoutes = [...new Set([...PUBLIC_ROUTES, ...ADMIN_ROUTES])];
      setAllowedRoutes(allRoutes);
      setValue('allowedRoutes', allRoutes, { shouldValidate: true });
    }
  };

  // Handle form submission
  const onSubmitForm = async (data: EnhancedStaffFormData) => {
    try {
      // If admin, they have access to all routes (set null to indicate all access)
      // If staff, ensure all public routes are included and use the selected allowedRoutes
      let finalAllowedRoutes;

      if (data.role === 'admin') {
        finalAllowedRoutes = null; // Admin has access to all routes
      } else {
        // Ensure all PUBLIC_ROUTES are included for staff
        const publicRoutesSet = new Set(PUBLIC_ROUTES);
        const adminRoutesSelected = allowedRoutes.filter(
          r => !publicRoutesSet.has(r)
        );
        finalAllowedRoutes = [...PUBLIC_ROUTES, ...adminRoutesSelected];
      }

      const finalData = {
        ...data,
        allowedRoutes: finalAllowedRoutes,
      };

      // Pass the correct data to the onSave function
      await onSave(finalData);
    } catch (error) {
      console.error('Error saving staff data:', error);
    }
  };

  // Check if a route is a public route
  const isPublicRoute = (route: string) => PUBLIC_ROUTES.includes(route);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">
            {staff ? t('personal:update-menber') : t('personal:new-personal')}
          </h2>
          <button onClick={onCancel}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('personal:personal-name')}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                {...register('name', {
                  required: t('personal:name-required'),
                  minLength: {
                    value: 2,
                    message: t('personal:name-min-length'),
                  },
                })}
                className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
                placeholder="John Doe"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('personal:personal-email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                {...register('email', {
                  required: t('personal:email-required'),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Adresse email invalide',
                  },
                })}
                className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
                placeholder="john@example.com"
                disabled={!!staff}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>
          {!staff && (
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('personal:personal-password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="password"
                  {...register('password', {
                    required: t('personal:password-required'),
                    minLength: {
                      value: 6,
                      message: t('personal:min-password-length'),
                    },
                  })}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('personal:personal-role')}
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                {...register('role')}
                className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 appearance-none"
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Route permissions section - shown only for staff role */}
          {selectedRole === 'staff' && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">
                  {t('personal:access-permissions')}
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleAllRoutes}
                  className="text-xs py-1"
                >
                  {ADMIN_ROUTES.every(route => allowedRoutes.includes(route))
                    ? t('personal:deselect-all')
                    : t('personal:select-all')}
                </Button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                {t('personal:permissions-description')}
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto p-2 border dark:border-gray-700 rounded-lg">
                {/* Public routes - always accessible */}
                <div className="mb-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    {t('personal:always-accessible')}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {PUBLIC_ROUTES.map(route => (
                      <div
                        key={route}
                        className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm"
                      >
                        <Check className="w-4 h-4 mr-2 text-green-500" />
                        <span>{t(`personal:${route}`)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Admin routes - selectable for staff */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    {t('personal:configurable-access')}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {ADMIN_ROUTES.map(route => (
                      <div
                        key={route}
                        className={`
                          flex items-center px-3 py-2 rounded-md text-sm cursor-pointer
                          ${
                            allowedRoutes.includes(route)
                              ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }
                        `}
                        onClick={() => handleRouteToggle(route)}
                      >
                        <div
                          className={`w-4 h-4 mr-2 rounded-sm border ${
                            allowedRoutes.includes(route)
                              ? 'bg-blue-500 border-blue-500 flex items-center justify-center'
                              : 'border-gray-400 dark:border-gray-500'
                          }`}
                        >
                          {allowedRoutes.includes(route) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span>{t(`personal:${route}`)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 mt-6 pt-4 border-t dark:border-gray-700">
            <Button type="button" variant="secondary" onClick={onCancel}>
              {t('common:cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t('common:saving')
                : staff
                ? t('common:update')
                : t('personal:create-account')}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
