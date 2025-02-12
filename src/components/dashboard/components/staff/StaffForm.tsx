import { useForm } from 'react-hook-form';
import { X, User, Mail, Lock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../../ui/Button';
import { StaffFormData, StaffMember } from '../../../../types/staff';
import { useTranslation } from 'react-i18next';

interface StaffFormProps {
  staff?: StaffMember | null;
  onSave: (data: StaffFormData) => Promise<void>;
  onCancel: () => void;
}

export function StaffForm({ staff, onSave, onCancel }: StaffFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormData>({
    defaultValues: staff
      ? {
          name: staff.name,
          email: staff.email,
          role: staff.role,
        }
      : {
          role: 'staff',
        },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">
            {staff ? t("personal:update-menber") : t("personal:new-personal")}
          </h2>
          <button onClick={onCancel}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-4">
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
                :   t('personal:create-account')}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
