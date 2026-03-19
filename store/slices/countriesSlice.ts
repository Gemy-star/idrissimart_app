import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../config/api.config';
import apiClient from '../../services/apiClient';

// Types
export interface Country {
  id: number;
  name: string;
  name_en: string;
  code: string;
  flag_emoji: string;
  phone_code: string;
  currency: string;
  cities: string[];
  is_active: boolean;
  order: number;
}

interface CountriesState {
  countries: Country[];
  currentCountry: Country | null;
  loading: boolean;
  error: string | null;
}

const initialState: CountriesState = {
  countries: [],
  currentCountry: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchCountries = createAsyncThunk(
  'countries/fetchCountries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.COUNTRIES.LIST);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch countries');
    }
  }
);

export const fetchCountryDetail = createAsyncThunk(
  'countries/fetchCountryDetail',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.COUNTRIES.DETAIL(id));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch country details');
    }
  }
);

// Slice
const countriesSlice = createSlice({
  name: 'countries',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch countries
    builder.addCase(fetchCountries.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCountries.fulfilled, (state, action) => {
      state.loading = false;
      state.countries = action.payload.results || action.payload;
    });
    builder.addCase(fetchCountries.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Fetch country detail
    builder.addCase(fetchCountryDetail.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCountryDetail.fulfilled, (state, action) => {
      state.loading = false;
      state.currentCountry = action.payload;
    });
    builder.addCase(fetchCountryDetail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = countriesSlice.actions;
export default countriesSlice.reducer;
