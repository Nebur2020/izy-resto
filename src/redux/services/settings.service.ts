import {
  createApi,
  fakeBaseQuery,
} from '@reduxjs/toolkit/query/react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { DEFAULT_SETTINGS } from '../../constants/defaultSettings';
import { RestaurantSettings } from '../../types/settings';

export const settingsApi = createApi({
  reducerPath: 'settingsApi',
  baseQuery: fakeBaseQuery(),
  endpoints: builder => ({
    getSettings: builder.query<RestaurantSettings, void>({
      async queryFn() {
        try {
          const docRef = doc(db, 'settings', 'restaurant');
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const settings = {
              ...DEFAULT_SETTINGS,
              ...docSnap.data(),
            } as RestaurantSettings;
            return { data: settings };
          }

          return { data: DEFAULT_SETTINGS };
        } catch (error: any) {
          console.error('Error fetching settings:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              message: 'Failed to fetch settings',
              error: error.message,
            },
          };
        }
      },
    }),

    updateSettings: builder.mutation<void, Partial<RestaurantSettings>>({
      async queryFn(settings) {
        try {
          const docRef = doc(db, 'settings', 'restaurant');
          await setDoc(docRef, settings, { merge: true });
          return { data: undefined };
        } catch (error: any) {
          console.error('Error updating settings:', error);
          return {
            error: {
              status: 'UPDATE_ERROR',
              message: 'Failed to update settings',
              error: error.message,
            },
          };
        }
      },
    }),

    initializeDefaultSettings: builder.mutation<void, void>({
      async queryFn() {
        try {
          const docRef = doc(db, 'settings', 'restaurant');
          const docSnap = await getDoc(docRef);

          if (!docSnap.exists()) {
            await setDoc(docRef, DEFAULT_SETTINGS);
          }

          return { data: undefined };
        } catch (error: any) {
          console.error('Error initializing default settings:', error);
          return {
            error: {
              status: 'INIT_ERROR',
              message: 'Failed to initialize default settings',
              error: error.message,
            },
          };
        }
      },
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useInitializeDefaultSettingsMutation,
} = settingsApi;
