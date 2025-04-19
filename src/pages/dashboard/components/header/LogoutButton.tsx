import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../components/ui/Button';

interface LogoutButtonProps {
  onLogout: () => void;
}

export function LogoutButton({ onLogout }: LogoutButtonProps) {
  const { t } = useTranslation();

  return (
    <Button variant="secondary" size="sm" onClick={onLogout}>
      <LogOut className="w-4 h-4 mr-2" />
      {t('common:logout')}
    </Button>
  );
}
