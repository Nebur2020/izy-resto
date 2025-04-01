import React, { createContext, useContext } from 'react';
import {
  FoodThemeConfig,
  foodThemDefaultConfig,
} from '../../../../pages/dashboard/pages/settings/theme/editor/food';

const FoodThemeContext = createContext<FoodThemeConfig>(foodThemDefaultConfig);

export const FoodThemeProvider = ({
  children,
  value = foodThemDefaultConfig,
}: {
  children: React.ReactNode;
  value?: FoodThemeConfig;
}) => {
  return (
    <FoodThemeContext.Provider value={value}>
      {children}
    </FoodThemeContext.Provider>
  );
};

export const useFoodTheme = () => {
  const context = useContext(FoodThemeContext);
  if (context === undefined) {
    throw new Error('usePizzaTheme must be used within a PizzaThemeProvider');
  }
  return context;
};
