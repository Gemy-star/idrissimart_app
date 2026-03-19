import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../config/api.config';
import apiClient from '../../services/apiClient';

// Types
export interface Category {
  id: number;
  name: string;
  name_ar: string;
  slug: string;
  slug_ar: string;
  section_type: string;
  icon?: string;
  image?: string;
  parent: number | null;
  subcategories?: Category[];
  subcategories_count: number;
  ads_count: number;
  allow_cart: boolean;
  custom_fields?: any[];
}

interface CategoriesState {
  categories: Category[];
  rootCategories: Category[];
  currentCategory: Category | null;
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  rootCategories: [],
  currentCategory: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (params: {
    section_type?: string;
    parent?: number;
    country?: number;
    search?: string;
  } | undefined, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.LIST, { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch categories');
    }
  }
);

export const fetchCategoryDetail = createAsyncThunk(
  'categories/fetchCategoryDetail',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.DETAIL(id));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch category details');
    }
  }
);

export const fetchRootCategories = createAsyncThunk(
  'categories/fetchRootCategories',
  async (section_type: string | undefined, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.ROOT, {
        params: { section_type },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch root categories');
    }
  }
);

// Slice
const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch categories
    builder.addCase(fetchCategories.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.loading = false;
      state.categories = action.payload.results || action.payload;
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Fetch category detail
    builder.addCase(fetchCategoryDetail.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCategoryDetail.fulfilled, (state, action) => {
      state.loading = false;
      state.currentCategory = action.payload;
    });
    builder.addCase(fetchCategoryDetail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Fetch root categories
    builder.addCase(fetchRootCategories.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchRootCategories.fulfilled, (state, action) => {
      state.loading = false;
      state.rootCategories = action.payload;
    });
    builder.addCase(fetchRootCategories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError, clearCurrentCategory } = categoriesSlice.actions;
export default categoriesSlice.reducer;
