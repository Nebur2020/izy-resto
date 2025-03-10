import { configureStore } from '@reduxjs/toolkit';
import { menuItemApi } from './services/menu.service';

export const store = configureStore({
  reducer: {
    [menuItemApi.reducerPath]: menuItemApi.reducer,
  },
  middleware: getDefaultMiddleware => {
    return getDefaultMiddleware().concat(menuItemApi.middleware);
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
