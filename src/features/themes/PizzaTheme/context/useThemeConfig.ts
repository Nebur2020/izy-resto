import { useState, useEffect } from 'react';
import {
  PizzaThemeConfig,
  defaultConfig,
} from '../../../../pages/dashboard/pages/settings/theme/editor/pizza';
import { settingsService } from '../../../../services';
import { RestaurantSettings } from '../../../../types';

// This hook would typically fetch the theme config from an API or database
export const useThemeConfig = () => {
  const [config, setConfig] = useState<PizzaThemeConfig | null>(null);
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      setIsConfigLoading(true);
      try {
        // In a real application, this would be an API call
        // For example:
        // const response = await fetch('/api/theme-config');
        // const data = await response.json();

        // For demonstration purposes, we'll simulate an API call with a timeout
        const data = await settingsService.getSettings();

        if (!data) throw new Error('No data found');

        // Use the default config for now
        // In a real app, you'd use data from the API response
        if (data) {
          setConfig(data.activeTheme.configuration as PizzaThemeConfig);
          setSettings(data);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching theme config', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));

        // Fallback to default config on error
        setConfig(defaultConfig);
      } finally {
        setIsConfigLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, isConfigLoading, error, settings };
};
