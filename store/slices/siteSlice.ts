import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../config/api.config';
import apiClient from '../../services/apiClient';

// Types
export interface SiteConfig {
  id: number;
  meta_keywords: string;
  meta_keywords_ar: string;
  footer_text: string;
  footer_text_ar: string;
  copyright_text: string;
  logo: string;
  logo_light: string;
  logo_dark: string;
  logo_mini: string;
  require_email_verification: boolean;
  require_phone_verification: boolean;
  require_verification_for_services: boolean;
  allow_online_payment: boolean;
  allow_offline_payment: boolean;
}

export interface AboutSection {
  id: number;
  tab_title: string;
  tab_title_ar: string;
  icon: string;
  content: string;
  content_ar: string;
  order: number;
  is_active: boolean;
}

export interface AboutPage {
  id: number;
  content: string;
  content_ar: string;
  sections: AboutSection[];
}

export interface ContactPage {
  id: number;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  enable_contact_form: boolean;
  notification_email: string;
  show_phone: boolean;
  show_address: boolean;
  show_office_hours: boolean;
  show_map: boolean;
  office_hours: string;
  office_hours_ar: string;
  map_embed_code: string;
}

export interface StaticPage {
  id: number;
  content: string;
  content_ar: string;
}

interface SiteState {
  config: SiteConfig | null;
  aboutPage: AboutPage | null;
  contactPage: ContactPage | null;
  termsPage: StaticPage | null;
  privacyPage: StaticPage | null;
  loading: boolean;
  error: string | null;
}

const initialState: SiteState = {
  config: null,
  aboutPage: null,
  contactPage: null,
  termsPage: null,
  privacyPage: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchSiteConfig = createAsyncThunk(
  'site/fetchSiteConfig',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SITE.CONFIG);
      const results = response.data.results || response.data;
      return Array.isArray(results) ? results[0] : results;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch site config');
    }
  }
);

export const fetchAboutPage = createAsyncThunk(
  'site/fetchAboutPage',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SITE.ABOUT);
      const results = response.data.results || response.data;
      return Array.isArray(results) ? results[0] : results;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch about page');
    }
  }
);

export const fetchContactPage = createAsyncThunk(
  'site/fetchContactPage',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SITE.CONTACT);
      const results = response.data.results || response.data;
      return Array.isArray(results) ? results[0] : results;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch contact page');
    }
  }
);

export const fetchTermsPage = createAsyncThunk(
  'site/fetchTermsPage',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SITE.TERMS);
      const results = response.data.results || response.data;
      return Array.isArray(results) ? results[0] : results;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch terms page');
    }
  }
);

export const fetchPrivacyPage = createAsyncThunk(
  'site/fetchPrivacyPage',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SITE.PRIVACY);
      const results = response.data.results || response.data;
      return Array.isArray(results) ? results[0] : results;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch privacy page');
    }
  }
);

// Slice
const siteSlice = createSlice({
  name: 'site',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch site config
    builder.addCase(fetchSiteConfig.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSiteConfig.fulfilled, (state, action) => {
      state.loading = false;
      state.config = action.payload;
    });
    builder.addCase(fetchSiteConfig.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch about page
    builder.addCase(fetchAboutPage.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAboutPage.fulfilled, (state, action) => {
      state.loading = false;
      state.aboutPage = action.payload;
    });
    builder.addCase(fetchAboutPage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch contact page
    builder.addCase(fetchContactPage.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchContactPage.fulfilled, (state, action) => {
      state.loading = false;
      state.contactPage = action.payload;
    });
    builder.addCase(fetchContactPage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch terms page
    builder.addCase(fetchTermsPage.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTermsPage.fulfilled, (state, action) => {
      state.loading = false;
      state.termsPage = action.payload;
    });
    builder.addCase(fetchTermsPage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch privacy page
    builder.addCase(fetchPrivacyPage.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPrivacyPage.fulfilled, (state, action) => {
      state.loading = false;
      state.privacyPage = action.payload;
    });
    builder.addCase(fetchPrivacyPage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = siteSlice.actions;
export default siteSlice.reducer;
