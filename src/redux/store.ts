import { configureStore } from '@reduxjs/toolkit';
import { menuItemApi } from './services/menu.service';
import { categoryApi } from './services/category.service';
import { transactionApi } from './services/accounting.service';
import { inventoryApi } from './services/inventory.service';
import { variantApi } from './services/variant.service';
import { staffApi } from './services/staff.service';
import { mediaApi } from './services/media.service';
import { orderApi } from './services/order.service';

export const store = configureStore({
  reducer: {
    [menuItemApi.reducerPath]: menuItemApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [transactionApi.reducerPath]: transactionApi.reducer,
    [inventoryApi.reducerPath]: inventoryApi.reducer,
    [variantApi.reducerPath]: variantApi.reducer,
    [staffApi.reducerPath]: staffApi.reducer,
    [mediaApi.reducerPath]: mediaApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
  },
  middleware: getDefaultMiddleware => {
    return getDefaultMiddleware()
      .concat(menuItemApi.middleware)
      .concat(categoryApi.middleware)
      .concat(transactionApi.middleware)
      .concat(inventoryApi.middleware)
      .concat(variantApi.middleware)
      .concat(staffApi.middleware)
      .concat(mediaApi.middleware)
      .concat(orderApi.middleware);
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
