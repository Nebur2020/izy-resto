import { User } from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import { useStaffCheck } from '../../../../hooks/useStaffCheck';
import { useSettings } from '../../../../hooks';

export function UserInfo() {
  const { user } = useAuth();
  const { isStaff, isLoading, staffData } = useStaffCheck();

  const { settings } = useSettings();
  const primaryColor = settings?.palette?.primary;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
      <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      <div className="text-sm">
        <span className="text-gray-600 dark:text-gray-300">{user?.email}</span>
        <span className="mx-2 text-gray-400">|</span>
        {isLoading ? (
          <span className="text-gray-400">Loading...</span>
        ) : (
          <span className="font-medium capitalize" style={{ color: primaryColor }}>
            {isStaff && staffData?.role !== 'admin' ? 'Staff' : 'Admin'}
          </span>
        )}
      </div>
    </div>
  );
}
