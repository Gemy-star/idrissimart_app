import { configureStore } from '@reduxjs/toolkit';
import adsReducer from './slices/adsSlice';
import authReducer from './slices/authSlice';
import blogReducer from './slices/blogSlice';
import cartReducer from './slices/cartSlice';
import categoriesReducer from './slices/categoriesSlice';
import chatReducer from './slices/chatSlice';
import compareReducer from './slices/compareSlice';
import contactReducer from './slices/contactSlice';
import countriesReducer from './slices/countriesSlice';
import customFieldsReducer from './slices/customFieldsSlice';
import faqReducer from './slices/faqSlice';
import homeReducer from './slices/homeSlice';
import notificationsReducer from './slices/notificationsSlice';
import packagesReducer from './slices/packagesSlice';
import siteReducer from './slices/siteSlice';
import wishlistReducer from './slices/wishlistSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ads: adsReducer,
    categories: categoriesReducer,
    countries: countriesReducer,
    chat: chatReducer,
    contact: contactReducer,
    customFields: customFieldsReducer,
    faq: faqReducer,
    home: homeReducer,
    packages: packagesReducer,
    site: siteReducer,
    wishlist: wishlistReducer,
    notifications: notificationsReducer,
    blog: blogReducer,
    compare: compareReducer,
    cart: cartReducer,
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
