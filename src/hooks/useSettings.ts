import { useState, useEffect } from 'react';
import { settingsService } from '../services/settings/settings.service';
import { RestaurantSettings } from '../types';
import i18n from '../translations/i18n';

export function useSettings() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await settingsService.getSettings();
      i18n.changeLanguage(data.language);
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: RestaurantSettings) => {
    try {
      setIsUpdating(true);
      await settingsService.updateSettings(newSettings);
      const data = await settingsService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return { settings, isLoading, updateSettings, isUpdating };
}
