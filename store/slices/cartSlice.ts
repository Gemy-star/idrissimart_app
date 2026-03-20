import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../config/api.config';
import apiClient from '../../services/apiClient';

export interface CartItem {
  id: number;
  ad: any;
  quantity: number;
  added_at: string;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = { items: [], loading: false, error: null };

export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CART.ITEMS);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch cart');
    }
  }
);

export const addToCartThunk = createAsyncThunk(
  'cart/add',
  async ({ adId, quantity = 1 }: { adId: number; quantity?: number }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CART.ADD, { ad: adId, quantity });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to add to cart');
    }
  }
);

export const removeFromCartThunk = createAsyncThunk(
  'cart/remove',
  async (itemId: number, { rejectWithValue }) => {
    try {
      await apiClient.delete(API_ENDPOINTS.CART.ITEM(itemId));
      return itemId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to remove from cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => { state.items = []; },
    clearCartError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = Array.isArray(action.payload)
          ? action.payload
          : action.payload.results ?? [];
      })
      .addCase(addToCartThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCartThunk.fulfilled, (state, action) => {
        state.loading = false;
        const exists = state.items.find(i => i.id === action.payload.id);
        if (!exists) state.items.push(action.payload);
      })
      .addCase(addToCartThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(removeFromCartThunk.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i.id !== action.payload);
      });
  },
});

export const { clearCart, clearCartError } = cartSlice.actions;
export default cartSlice.reducer;
