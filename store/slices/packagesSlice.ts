import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../config/api.config';
import apiClient from '../../services/apiClient';

// Types
export interface AdFeature {
  id: number;
  ad: number;
  feature_type: string;
  feature_type_display: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface AdPackage {
  id: number;
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  price: string;
  ad_count: number;
  ad_duration_days: number;
  duration_days: number;
  feature_pinned_price: string;
  feature_urgent_price: string;
  feature_highlighted_price: string;
  feature_contact_for_price: string;
  feature_auto_refresh_price: string;
  feature_add_video_price: string;
  is_active: boolean;
  is_recommended: boolean;
  is_default: boolean;
}

export interface Payment {
  id: number;
  user: any;
  provider: string;
  provider_transaction_id: string | null;
  amount: string;
  currency: string;
  status: string;
  description: string;
  metadata: Record<string, any>;
  offline_payment_receipt: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface UserPackage {
  id: number;
  user: number;
  package: AdPackage;
  payment: number;
  purchase_date: string;
  expiry_date: string;
  ads_remaining: number;
  ads_used: number;
  is_active: boolean;
}

export interface CreatePaymentData {
  provider: string;
  amount: string;
  currency: string;
  description: string;
  metadata?: Record<string, any>;
}

interface PackagesState {
  adFeatures: AdFeature[];
  adPackages: AdPackage[];
  payments: Payment[];
  userPackages: UserPackage[];
  loading: boolean;
  error: string | null;
}

const initialState: PackagesState = {
  adFeatures: [],
  adPackages: [],
  payments: [],
  userPackages: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchAdFeatures = createAsyncThunk(
  'packages/fetchAdFeatures',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PACKAGES.AD_FEATURES);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch ad features');
    }
  }
);

export const fetchAdPackages = createAsyncThunk(
  'packages/fetchAdPackages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PACKAGES.AD_PACKAGES);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch ad packages');
    }
  }
);

export const fetchPayments = createAsyncThunk(
  'packages/fetchPayments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PACKAGES.PAYMENTS);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch payments');
    }
  }
);

export const createPayment = createAsyncThunk(
  'packages/createPayment',
  async (data: CreatePaymentData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PACKAGES.PAYMENTS, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to create payment');
    }
  }
);

export const fetchUserPackages = createAsyncThunk(
  'packages/fetchUserPackages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PACKAGES.USER_PACKAGES);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch user packages');
    }
  }
);

// Slice
const packagesSlice = createSlice({
  name: 'packages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch ad features
    builder.addCase(fetchAdFeatures.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAdFeatures.fulfilled, (state, action) => {
      state.loading = false;
      state.adFeatures = action.payload.results || action.payload;
    });
    builder.addCase(fetchAdFeatures.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch ad packages
    builder.addCase(fetchAdPackages.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAdPackages.fulfilled, (state, action) => {
      state.loading = false;
      state.adPackages = action.payload.results || action.payload;
    });
    builder.addCase(fetchAdPackages.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch payments
    builder.addCase(fetchPayments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPayments.fulfilled, (state, action) => {
      state.loading = false;
      state.payments = action.payload.results || action.payload;
    });
    builder.addCase(fetchPayments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create payment
    builder.addCase(createPayment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createPayment.fulfilled, (state, action) => {
      state.loading = false;
      state.payments.unshift(action.payload);
    });
    builder.addCase(createPayment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch user packages
    builder.addCase(fetchUserPackages.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUserPackages.fulfilled, (state, action) => {
      state.loading = false;
      state.userPackages = action.payload.results || action.payload;
    });
    builder.addCase(fetchUserPackages.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = packagesSlice.actions;
export default packagesSlice.reducer;
