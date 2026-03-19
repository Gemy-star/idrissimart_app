import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../config/api.config';
import apiClient from '../../services/apiClient';

// Types
export interface Ad {
  id: number;
  title: string;
  slug: string;
  description?: string;
  category: any;
  user: any;
  price: number;
  is_negotiable: boolean;
  primary_image?: string;
  images?: Array<{ id: number; image: string; order: number }>;
  city: string;
  country: number;
  address?: string;
  status: 'active' | 'pending' | 'expired' | 'sold';
  is_highlighted: boolean;
  is_urgent: boolean;
  is_pinned: boolean;
  is_favorited: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  expires_at: string;
  custom_fields?: Record<string, any>;
  rating?: number;
  rating_count?: number;
  reviews?: any[];
}

interface AdsState {
  ads: Ad[];
  featuredAds: Ad[];
  urgentAds: Ad[];
  recentAds: Ad[];
  myAds: Ad[];
  currentAd: Ad | null;
  loading: boolean;
  error: string | null;
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
  };
}

const initialState: AdsState = {
  ads: [],
  featuredAds: [],
  urgentAds: [],
  recentAds: [],
  myAds: [],
  currentAd: null,
  loading: false,
  error: null,
  pagination: {
    count: 0,
    next: null,
    previous: null,
  },
};

// Async thunks
export const fetchAds = createAsyncThunk(
  'ads/fetchAds',
  async (params: {
    category?: number;
    country?: number;
    city?: string;
    min_price?: number;
    max_price?: number;
    search?: string;
    page?: number;
    ordering?: string;
  } | undefined, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADS.LIST, { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch ads');
    }
  }
);

export const fetchAdDetail = createAsyncThunk(
  'ads/fetchAdDetail',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADS.DETAIL(id));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch ad details');
    }
  }
);

export const createAd = createAsyncThunk(
  'ads/createAd',
  async (adData: FormData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ADS.CREATE, adData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to create ad');
    }
  }
);

export const updateAd = createAsyncThunk(
  'ads/updateAd',
  async ({ id, adData }: { id: number; adData: FormData | Partial<Ad> }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.ADS.UPDATE(id), adData, {
        headers: adData instanceof FormData 
          ? { 'Content-Type': 'multipart/form-data' }
          : { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to update ad');
    }
  }
);

export const deleteAd = createAsyncThunk(
  'ads/deleteAd',
  async (id: number, { rejectWithValue }) => {
    try {
      await apiClient.delete(API_ENDPOINTS.ADS.DELETE(id));
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to delete ad');
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'ads/toggleFavorite',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ADS.TOGGLE_FAVORITE(id));
      return { id, ...response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to toggle favorite');
    }
  }
);

export const addReview = createAsyncThunk(
  'ads/addReview',
  async ({ id, rating, comment }: { id: number; rating: number; comment: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ADS.REVIEW(id), { rating, comment });
      return { adId: id, review: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to add review');
    }
  }
);

export const fetchFeaturedAds = createAsyncThunk(
  'ads/fetchFeaturedAds',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADS.FEATURED);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch featured ads');
    }
  }
);

export const fetchUrgentAds = createAsyncThunk(
  'ads/fetchUrgentAds',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADS.URGENT);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch urgent ads');
    }
  }
);

export const fetchRecentAds = createAsyncThunk(
  'ads/fetchRecentAds',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADS.RECENT);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch recent ads');
    }
  }
);

export const fetchMyAds = createAsyncThunk(
  'ads/fetchMyAds',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADS.MY_ADS);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch my ads');
    }
  }
);

// Slice
const adsSlice = createSlice({
  name: 'ads',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAd: (state) => {
      state.currentAd = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch ads
    builder.addCase(fetchAds.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAds.fulfilled, (state, action) => {
      state.loading = false;
      state.ads = action.payload.results || action.payload;
      state.pagination = {
        count: action.payload.count || 0,
        next: action.payload.next || null,
        previous: action.payload.previous || null,
      };
    });
    builder.addCase(fetchAds.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Fetch ad detail
    builder.addCase(fetchAdDetail.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAdDetail.fulfilled, (state, action) => {
      state.loading = false;
      state.currentAd = action.payload;
    });
    builder.addCase(fetchAdDetail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Create ad
    builder.addCase(createAd.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createAd.fulfilled, (state, action) => {
      state.loading = false;
      state.ads.unshift(action.payload);
    });
    builder.addCase(createAd.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Update ad
    builder.addCase(updateAd.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateAd.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.ads.findIndex(ad => ad.id === action.payload.id);
      if (index !== -1) {
        state.ads[index] = action.payload;
      }
      if (state.currentAd?.id === action.payload.id) {
        state.currentAd = action.payload;
      }
    });
    builder.addCase(updateAd.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Delete ad
    builder.addCase(deleteAd.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteAd.fulfilled, (state, action) => {
      state.loading = false;
      state.ads = state.ads.filter(ad => ad.id !== action.payload);
      state.myAds = state.myAds.filter(ad => ad.id !== action.payload);
    });
    builder.addCase(deleteAd.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Toggle favorite
    builder.addCase(toggleFavorite.fulfilled, (state, action) => {
      const { id, status } = action.payload;
      const updateFavoriteStatus = (ad: Ad) => {
        if (ad.id === id) {
          ad.is_favorited = status === 'added';
        }
      };
      
      state.ads.forEach(updateFavoriteStatus);
      state.featuredAds.forEach(updateFavoriteStatus);
      state.recentAds.forEach(updateFavoriteStatus);
      if (state.currentAd && state.currentAd.id === id) {
        state.currentAd.is_favorited = status === 'added';
      }
    });
    
    // Featured ads
    builder.addCase(fetchFeaturedAds.fulfilled, (state, action) => {
      state.featuredAds = action.payload;
    });
    
    // Urgent ads
    builder.addCase(fetchUrgentAds.fulfilled, (state, action) => {
      state.urgentAds = action.payload;
    });
    
    // Recent ads
    builder.addCase(fetchRecentAds.fulfilled, (state, action) => {
      state.recentAds = action.payload;
    });
    
    // My ads
    builder.addCase(fetchMyAds.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchMyAds.fulfilled, (state, action) => {
      state.loading = false;
      state.myAds = action.payload.results || action.payload;
    });
    builder.addCase(fetchMyAds.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError, clearCurrentAd } = adsSlice.actions;
export default adsSlice.reducer;
