import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../config/api.config';
import apiClient from '../../services/apiClient';

// Types
export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  replied_at: string | null;
}

export interface CreateContactMessageData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

interface ContactState {
  messages: ContactMessage[];
  loading: boolean;
  submitSuccess: boolean;
  error: string | null;
}

const initialState: ContactState = {
  messages: [],
  loading: false,
  submitSuccess: false,
  error: null,
};

// Async thunks
export const createContactMessage = createAsyncThunk(
  'contact/createContactMessage',
  async (data: CreateContactMessageData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CONTACT.MESSAGES, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to send contact message');
    }
  }
);

export const fetchContactMessages = createAsyncThunk(
  'contact/fetchContactMessages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CONTACT.MESSAGES);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch contact messages');
    }
  }
);

// Slice
const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSubmitSuccess: (state) => {
      state.submitSuccess = false;
    },
  },
  extraReducers: (builder) => {
    // Create contact message
    builder.addCase(createContactMessage.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.submitSuccess = false;
    });
    builder.addCase(createContactMessage.fulfilled, (state) => {
      state.loading = false;
      state.submitSuccess = true;
    });
    builder.addCase(createContactMessage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch contact messages
    builder.addCase(fetchContactMessages.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchContactMessages.fulfilled, (state, action) => {
      state.loading = false;
      state.messages = action.payload.results || action.payload;
    });
    builder.addCase(fetchContactMessages.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError, clearSubmitSuccess } = contactSlice.actions;
export default contactSlice.reducer;
