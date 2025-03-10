import { configureStore } from '@reduxjs/toolkit';
import { menuItemApi } from './services/menu.service';
import { categoryApi } from './services/category.service';
import { transactionApi } from './services/accounting.service';
import { inventoryApi } from './services/inventory.service';

export const store = configureStore({
  reducer: {
    [menuItemApi.reducerPath]: menuItemApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [transactionApi.reducerPath]: transactionApi.reducer,
    [inventoryApi.reducerPath]: inventoryApi.reducer,
  },
  middleware: getDefaultMiddleware => {
    return getDefaultMiddleware()
      .concat(menuItemApi.middleware)
      .concat(categoryApi.middleware)
      .concat(transactionApi.middleware)
      .concat(inventoryApi.middleware);
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
