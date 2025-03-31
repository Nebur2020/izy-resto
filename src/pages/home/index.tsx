import { useCallback } from 'react';
import { useSettings } from '../../hooks';
import {
  LandingGrid,
  LandingMinimal,
  LandingModern,
} from '../../components/landing';
import PizzaTheme from '../../features/themes/PizzaTheme/PizzaTheme';
import FoodTheme from '../../features/themes/FoodTheme/FoodTheme';

export const Home = () => {
  const { settings } = useSettings();

  const getLandingComponent = useCallback(() => {
    switch (settings?.activeTheme.key) {
      case 'minimal':
        return <LandingMinimal />;
      case 'grid':
        return <LandingGrid />;
      case 'pizza':
        return <PizzaTheme />;
      case 'food':
        return <FoodTheme />;
      default:
        return <LandingModern />;
    }
  }, [settings]);

  return getLandingComponent();
};
