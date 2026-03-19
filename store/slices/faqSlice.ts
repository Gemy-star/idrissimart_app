import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../config/api.config';
import apiClient from '../../services/apiClient';

// Types
export interface FaqCategory {
  id: number;
  name: string;
  name_ar: string;
  icon: string;
  order: number;
  is_active: boolean;
}

export interface Faq {
  id: number;
  category: FaqCategory;
  question: string;
  question_ar: string;
  answer: string;
  answer_ar: string;
  order: number;
  is_active: boolean;
  is_popular: boolean;
}

export interface SafetyTip {
  id: number;
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  icon_class: string;
  order: number;
  is_active: boolean;
}

export interface FaqFilters {
  category?: number;
  search?: string;
}

interface FaqState {
  categories: FaqCategory[];
  faqs: Faq[];
  safetyTips: SafetyTip[];
  loading: boolean;
  error: string | null;
}

const initialState: FaqState = {
  categories: [],
  faqs: [],
  safetyTips: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchFaqCategories = createAsyncThunk(
  'faq/fetchFaqCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.FAQ.CATEGORIES);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch FAQ categories');
    }
  }
);

export const fetchFaqs = createAsyncThunk(
  'faq/fetchFaqs',
  async (filters: FaqFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.FAQ.LIST, { params: filters });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch FAQs');
    }
  }
);

export const fetchSafetyTips = createAsyncThunk(
  'faq/fetchSafetyTips',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SAFETY.TIPS);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch safety tips');
    }
  }
);

// Slice
const faqSlice = createSlice({
  name: 'faq',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch FAQ categories
    builder.addCase(fetchFaqCategories.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFaqCategories.fulfilled, (state, action) => {
      state.loading = false;
      state.categories = action.payload.results || action.payload;
    });
    builder.addCase(fetchFaqCategories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch FAQs
    builder.addCase(fetchFaqs.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFaqs.fulfilled, (state, action) => {
      state.loading = false;
      state.faqs = action.payload.results || action.payload;
    });
    builder.addCase(fetchFaqs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch safety tips
    builder.addCase(fetchSafetyTips.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSafetyTips.fulfilled, (state, action) => {
      state.loading = false;
      state.safetyTips = action.payload.results || action.payload;
    });
    builder.addCase(fetchSafetyTips.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = faqSlice.actions;
export default faqSlice.reducer;
