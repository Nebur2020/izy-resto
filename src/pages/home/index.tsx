import { useCallback } from 'react';
import { useSettings } from '../../hooks';
import {
  LandingGrid,
  LandingMinimal,
  LandingModern,
} from '../../components/landing';
import PizzaTheme from '../../features/themes/PizzaTheme/PizzaTheme';
import { useUserLimit } from '../../context/UserLimitContext';
import { Modal } from '../../components/ui/Modal';
import { useTranslation } from 'react-i18next';

export const Home = () => {
  const { accessAllowed, error } = useUserLimit();
  const { settings } = useSettings();
  const { t } = useTranslation();

  const getLandingComponent = useCallback(() => {
    switch (settings?.activeTheme.key) {
      case 'minimal':
        return <LandingMinimal />;
      case 'grid':
        return <LandingGrid />;
      case 'pizza':
        return <PizzaTheme />;
      default:
        return <LandingModern />;
    }
  }, [settings]);

  if (error) {
    return <div>{error}</div>;
  }

  if (accessAllowed === false) {
    return (
      <Modal
        isOpen={!accessAllowed}
        modalTitle={t('common:rate-limit-max-users-per-day')}
      >
        <div className="p-4 w-full h-[50vh] flex flex-col justify-center items-center">
          <p className="text-center text-black">
            {t('common:rate-limit-max-users-per-day-description')}
          </p>
        </div>
      </Modal>
    );
  }

  return getLandingComponent();
};
