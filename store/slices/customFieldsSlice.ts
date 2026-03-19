import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../config/api.config';
import apiClient from '../../services/apiClient';

// Types
export interface CustomFieldOption {
  id: number;
  label_ar: string;
  label_en: string;
  value: string;
  order: number;
  is_active: boolean;
}

export interface CustomField {
  id: number;
  name: string;
  label_ar: string;
  label_en: string;
  field_type: string;
  is_required: boolean;
  help_text?: string;
  placeholder?: string;
  default_value?: string;
  min_length?: number | null;
  max_length?: number | null;
  min_value?: number | null;
  max_value?: number | null;
  validation_regex?: string;
  is_active: boolean;
  options: CustomFieldOption[];
}

interface CustomFieldsState {
  fields: CustomField[];
  fieldsByCategory: Record<number, CustomField[]>;
  loading: boolean;
  error: string | null;
}

const initialState: CustomFieldsState = {
  fields: [],
  fieldsByCategory: {},
  loading: false,
  error: null,
};

// Async thunks
export const fetchCustomFields = createAsyncThunk(
  'customFields/fetchCustomFields',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CUSTOM_FIELDS.LIST);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch custom fields');
    }
  }
);

export const fetchCustomFieldsByCategory = createAsyncThunk(
  'customFields/fetchCustomFieldsByCategory',
  async (categoryId: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CUSTOM_FIELDS.BY_CATEGORY, {
        params: { category_id: categoryId },
      });
      return { categoryId, fields: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch custom fields by category');
    }
  }
);

// Slice
const customFieldsSlice = createSlice({
  name: 'customFields',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch custom fields
    builder.addCase(fetchCustomFields.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCustomFields.fulfilled, (state, action) => {
      state.loading = false;
      state.fields = action.payload.results || action.payload;
    });
    builder.addCase(fetchCustomFields.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch custom fields by category
    builder.addCase(fetchCustomFieldsByCategory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCustomFieldsByCategory.fulfilled, (state, action) => {
      state.loading = false;
      const { categoryId, fields } = action.payload;
      state.fieldsByCategory[categoryId] = Array.isArray(fields) ? fields : fields.results || [];
    });
    builder.addCase(fetchCustomFieldsByCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = customFieldsSlice.actions;
export default customFieldsSlice.reducer;
