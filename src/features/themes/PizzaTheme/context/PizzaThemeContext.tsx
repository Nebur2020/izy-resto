import React, { createContext, useContext } from 'react';
import {
  PizzaThemeConfig,
  defaultConfig,
} from '../../../../pages/dashboard/pages/settings/theme/editor/pizza';

// Create the theme context with default values
const PizzaThemeContext = createContext<PizzaThemeConfig>(defaultConfig);

// Provider component
export const PizzaThemeProvider = ({
  children,
  value = defaultConfig,
}: {
  children: React.ReactNode;
  value?: PizzaThemeConfig;
}) => {
  return (
    <PizzaThemeContext.Provider value={value}>
      {children}
    </PizzaThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const usePizzaTheme = () => {
  const context = useContext(PizzaThemeContext);
  if (context === undefined) {
    throw new Error('usePizzaTheme must be used within a PizzaThemeProvider');
  }
  return context;
};
