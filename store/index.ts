import { configureStore } from '@reduxjs/toolkit';
import adsReducer from './slices/adsSlice';
import authReducer from './slices/authSlice';
import blogReducer from './slices/blogSlice';
import categoriesReducer from './slices/categoriesSlice';
import chatReducer from './slices/chatSlice';
import countriesReducer from './slices/countriesSlice';
import notificationsReducer from './slices/notificationsSlice';
import wishlistReducer from './slices/wishlistSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ads: adsReducer,
    categories: categoriesReducer,
    countries: countriesReducer,
    chat: chatReducer,
    wishlist: wishlistReducer,
    notifications: notificationsReducer,
    blog: blogReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/login/fulfilled', 'auth/register/fulfilled'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
