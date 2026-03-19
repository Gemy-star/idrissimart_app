import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../config/api.config';
import apiClient from '../../services/apiClient';

// Types
export interface HomeSlider {
  id: number;
  title: string;
  title_ar: string;
  subtitle: string;
  subtitle_ar: string;
  description: string;
  description_ar: string;
  image: string;
  button_text: string;
  button_text_ar: string;
  button_url: string;
  country: number | null;
  background_color: string;
  text_color: string;
  is_active: boolean;
  order: number;
}

export interface WhyChooseUsFeature {
  id: number;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  icon: string;
  order: number;
  is_active: boolean;
}

interface HomeState {
  sliders: HomeSlider[];
  whyChooseUs: WhyChooseUsFeature[];
  loading: boolean;
  error: string | null;
}

const initialState: HomeState = {
  sliders: [],
  whyChooseUs: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchHomeSliders = createAsyncThunk(
  'home/fetchHomeSliders',
  async (country?: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.HOME.SLIDERS, {
        params: country ? { country } : undefined,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch home sliders');
    }
  }
);

export const fetchWhyChooseUs = createAsyncThunk(
  'home/fetchWhyChooseUs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.HOME.WHY_CHOOSE_US);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch why choose us');
    }
  }
);

// Slice
const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch home sliders
    builder.addCase(fetchHomeSliders.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchHomeSliders.fulfilled, (state, action) => {
      state.loading = false;
      state.sliders = action.payload.results || action.payload;
    });
    builder.addCase(fetchHomeSliders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch why choose us
    builder.addCase(fetchWhyChooseUs.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchWhyChooseUs.fulfilled, (state, action) => {
      state.loading = false;
      state.whyChooseUs = action.payload.results || action.payload;
    });
    builder.addCase(fetchWhyChooseUs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = homeSlice.actions;
export default homeSlice.reducer;
