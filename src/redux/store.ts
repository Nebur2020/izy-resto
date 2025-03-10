import { configureStore } from '@reduxjs/toolkit';
import { menuItemApi } from './services/menu.service';
import { categoryApi } from './services/category.service';

export const store = configureStore({
  reducer: {
    [menuItemApi.reducerPath]: menuItemApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
  },
  middleware: getDefaultMiddleware => {
    return getDefaultMiddleware()
      .concat(menuItemApi.middleware)
      .concat(categoryApi.middleware);
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
