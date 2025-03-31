import { useState, useEffect } from 'react';
import {
  PizzaThemeConfig,
  defaultConfig,
} from '../../../../pages/dashboard/pages/settings/theme/editor/pizza';
import { settingsService } from '../../../../services';
import { RestaurantSettings } from '../../../../types';

export const useThemeConfig = () => {
  const [config, setConfig] = useState<PizzaThemeConfig | null>(null);
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      setIsConfigLoading(true);
      try {
        const data = await settingsService.getSettings();

        if (!data) throw new Error('No data found');

        if (data) {
          setConfig(data.activeTheme.configuration as PizzaThemeConfig);
          setSettings(data);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching theme config', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));

        setConfig(defaultConfig);
      } finally {
        setIsConfigLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, isConfigLoading, error, settings };
};
