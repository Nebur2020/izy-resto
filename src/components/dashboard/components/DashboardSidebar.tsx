import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '../../ui/Button';
import { useDashboardMenu } from '../../../hooks/useDashboardMenu';
import { MenuItem } from './sidebar/MenuItem';

interface DashboardSidebarProps {
  currentPage: string;
  onClose: () => void;
}

export function DashboardSidebar({ currentPage, onClose }: DashboardSidebarProps) {
  const navigate = useNavigate();
  const { visibleMenuItems } = useDashboardMenu();

  return (
    <div className="h-full w-64 bg-white shadow-lg dark:bg-gray-800">
      <div className="flex items-center justify-between p-4 md:hidden">
        <h2 className="font-semibold">Menu</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      <nav className="space-y-1 p-4">
        {visibleMenuItems.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            isActive={currentPage === item.id}
            onClick={() => {
              navigate(`/dashboard/${item.id}`);
              onClose();
            }}
          />
        ))}
      </nav>
    </div>
  );
}