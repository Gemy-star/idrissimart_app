import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../config/api.config';
import apiClient from '../../services/apiClient';

// Types
export interface WishlistItem {
  id: number;
  ad: any;
  added_at: string;
}

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchWishlistItems = createAsyncThunk(
  'wishlist/fetchWishlistItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WISHLIST.ITEMS);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch wishlist items');
    }
  }
);

// Slice
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addToWishlist: (state, action) => {
      const exists = state.items.find(item => item.ad.id === action.payload.ad.id);
      if (!exists) {
        state.items.push(action.payload);
      }
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter(item => item.ad.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch wishlist items
    builder.addCase(fetchWishlistItems.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchWishlistItems.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchWishlistItems.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError, addToWishlist, removeFromWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
