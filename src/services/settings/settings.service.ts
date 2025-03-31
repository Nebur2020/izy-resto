import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { FirebaseError } from '../../lib/firebase/utils/errorHandling';
import { DEFAULT_SETTINGS } from '../../constants/defaultSettings';
import { RestaurantSettings } from '../../types/settings';

class SettingsService {
  private collection = 'settings';
  private document = 'restaurant';

  async getSettings(): Promise<RestaurantSettings> {
    try {
      const docRef = doc(db, this.collection, this.document);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Merge with default settings to ensure all fields exist
        return {
          ...DEFAULT_SETTINGS,
          ...docSnap.data(),
        } as RestaurantSettings;
      }

      // If no settings exist, return defaults
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Return defaults on error to ensure app continues working
      return DEFAULT_SETTINGS;
    }
  }

  async updateSettings(settings: Partial<RestaurantSettings>): Promise<void> {
    try {
      const docRef = doc(db, this.collection, this.document);
      await setDoc(docRef, settings, { merge: true });
    } catch (error) {
      console.error('Error updating settings:', error);
      throw new FirebaseError(
        'Failed to update settings',
        'write/update',
        'settings'
      );
    }
  }

  async initializeDefaultSettings(): Promise<void> {
    try {
      const docRef = doc(db, this.collection, this.document);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error('Error initializing default settings:', error);
    }
  }

  async checkUserLimit(): Promise<{ allowed: boolean }> {
    const today = new Date().toISOString().split('T')[0];

    const settings = await this.getSettings();
    const maxUsersPerDay = settings.rateLimits.maxUsersPerDay;

    const usersTodayDoc = await getDoc(doc(db, 'dailyUsers', today));
    let usersToday = 0;
    if (usersTodayDoc.exists()) {
      usersToday = usersTodayDoc.data().count;
    }

    if (usersToday >= maxUsersPerDay) {
      return { allowed: false };
    } else {
      await setDoc(
        doc(db, 'dailyUsers', today),
        {
          count: usersToday + 1,
        },
        { merge: true }
      );

      return { allowed: true };
    }
  }
}

export const settingsService = new SettingsService();
