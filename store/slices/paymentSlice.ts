import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../config/api.config';
import apiClient from '../../services/apiClient';

// ==================== Types ====================

export interface PaymentMethod {
  code: string;
  label: string;
}

export type PaymentProvider =
  | 'paymob'
  | 'paypal'
  | 'bank_transfer'
  | 'wallet'
  | 'instapay';

export type PaymentContext =
  | 'ad_posting'
  | 'ad_upgrade'
  | 'package_purchase'
  | 'product_purchase';

export type PaymentStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export interface Payment {
  id: number;
  user: { id: number; username: string };
  provider: PaymentProvider;
  provider_transaction_id: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  description: string;
  metadata: Record<string, any>;
  offline_payment_receipt: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface PaymentStatusResponse {
  payment_id: number;
  status: PaymentStatus;
  provider: PaymentProvider;
  amount: string;
  currency: string;
  provider_transaction_id: string;
  created_at: string;
  completed_at: string | null;
}

export interface InitiatePaymentRequest {
  provider: PaymentProvider;
  amount: string;
  currency?: string;
  description?: string;
  context?: PaymentContext;
  metadata?: Record<string, any>;
  // Paymob
  billing_data?: Record<string, string>;
  notification_url?: string;
  redirection_url?: string;
  // PayPal
  return_url?: string;
  cancel_url?: string;
}

export interface InitiatePaymentResponse {
  payment_id: number;
  provider: PaymentProvider;
  status: PaymentStatus;
  // Paymob
  checkout_url?: string;
  // PayPal
  paypal_order_id?: string;
  approval_url?: string;
  // Offline
  message?: string;
}

interface PaymentState {
  methods: PaymentMethod[];
  currentPayment: InitiatePaymentResponse | null;
  paymentStatus: PaymentStatusResponse | null;
  payments: Payment[];
  methodsLoading: boolean;
  initiating: boolean;
  statusLoading: boolean;
  uploading: boolean;
  capturing: boolean;
  listLoading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  methods: [],
  currentPayment: null,
  paymentStatus: null,
  payments: [],
  methodsLoading: false,
  initiating: false,
  statusLoading: false,
  uploading: false,
  capturing: false,
  listLoading: false,
  error: null,
};

// ==================== Thunks ====================

export const fetchPaymentMethods = createAsyncThunk(
  'payment/fetchMethods',
  async (context: PaymentContext = 'ad_posting', { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PAYMENTS.METHODS, {
        params: { context },
      });
      return response.data as PaymentMethod[];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch payment methods'
      );
    }
  }
);

export const initiatePayment = createAsyncThunk(
  'payment/initiate',
  async (data: InitiatePaymentRequest, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.INITIATE, data);
      return response.data as InitiatePaymentResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
          JSON.stringify(error.response?.data) ||
          'Failed to initiate payment'
      );
    }
  }
);

export const getPaymentStatus = createAsyncThunk(
  'payment/getStatus',
  async (paymentId: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.PAYMENTS.STATUS(paymentId)
      );
      return response.data as PaymentStatusResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to get payment status'
      );
    }
  }
);

export const uploadOfflineReceipt = createAsyncThunk(
  'payment/uploadReceipt',
  async (
    { paymentId, imageUri, mimeType }: { paymentId: number; imageUri: string; mimeType: string },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'receipt.jpg';
      formData.append('receipt', {
        uri: imageUri,
        name: filename,
        type: mimeType,
      } as any);

      const response = await apiClient.post(
        API_ENDPOINTS.PAYMENTS.UPLOAD_RECEIPT(paymentId),
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data as Payment;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to upload receipt'
      );
    }
  }
);

export const capturePaypalOrder = createAsyncThunk(
  'payment/capturePaypal',
  async (
    { payment_id, paypal_order_id }: { payment_id: number; paypal_order_id: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.PAYPAL_CAPTURE, {
        payment_id,
        paypal_order_id,
      });
      return response.data as Payment;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to capture PayPal order'
      );
    }
  }
);

export const fetchMyPayments = createAsyncThunk(
  'payment/fetchMyPayments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PAYMENTS.LIST);
      return (response.data.results ?? response.data) as Payment[];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch payments'
      );
    }
  }
);

// ==================== Slice ====================

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearCurrentPayment(state) {
      state.currentPayment = null;
      state.paymentStatus = null;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
    setPaymentStatus(state, action: PayloadAction<PaymentStatusResponse>) {
      state.paymentStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    // fetchPaymentMethods
    builder
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.methodsLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.methodsLoading = false;
        state.methods = action.payload;
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.methodsLoading = false;
        state.error = action.payload as string;
      });

    // initiatePayment
    builder
      .addCase(initiatePayment.pending, (state) => {
        state.initiating = true;
        state.error = null;
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.initiating = false;
        state.currentPayment = action.payload;
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.initiating = false;
        state.error = action.payload as string;
      });

    // getPaymentStatus
    builder
      .addCase(getPaymentStatus.pending, (state) => {
        state.statusLoading = true;
      })
      .addCase(getPaymentStatus.fulfilled, (state, action) => {
        state.statusLoading = false;
        state.paymentStatus = action.payload;
      })
      .addCase(getPaymentStatus.rejected, (state, action) => {
        state.statusLoading = false;
        state.error = action.payload as string;
      });

    // uploadOfflineReceipt
    builder
      .addCase(uploadOfflineReceipt.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadOfflineReceipt.fulfilled, (state) => {
        state.uploading = false;
      })
      .addCase(uploadOfflineReceipt.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload as string;
      });

    // capturePaypalOrder
    builder
      .addCase(capturePaypalOrder.pending, (state) => {
        state.capturing = true;
        state.error = null;
      })
      .addCase(capturePaypalOrder.fulfilled, (state) => {
        state.capturing = false;
      })
      .addCase(capturePaypalOrder.rejected, (state, action) => {
        state.capturing = false;
        state.error = action.payload as string;
      });

    // fetchMyPayments
    builder
      .addCase(fetchMyPayments.pending, (state) => {
        state.listLoading = true;
        state.error = null;
      })
      .addCase(fetchMyPayments.fulfilled, (state, action) => {
        state.listLoading = false;
        state.payments = action.payload;
      })
      .addCase(fetchMyPayments.rejected, (state, action) => {
        state.listLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentPayment, clearError, setPaymentStatus } =
  paymentSlice.actions;
export default paymentSlice.reducer;
