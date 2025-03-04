import { useCallback } from 'react';
import { useSettings } from '../../hooks';
import {
  LandingGrid,
  LandingMinimal,
  LandingModern,
} from '../../components/landing';
import PizzaTheme from '../../features/themes/PizzaTheme/PizzaTheme';

export const Home = () => {
  const { settings } = useSettings();
  const getLandingComponent = useCallback(() => {
    switch (settings?.activeLanding) {
      case 'minimal':
        return <LandingMinimal />;
      case 'grid':
        return <LandingGrid />;
      case 'pizzaTheme':
        return <PizzaTheme />;
      default:
        return <LandingModern />;
    }
  }, [settings]);

  return getLandingComponent();
};
