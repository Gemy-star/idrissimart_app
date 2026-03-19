import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../config/api.config';
import apiClient from '../../services/apiClient';

// Types
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  author: any;
  category: any;
  content?: string;
  image?: string;
  published_date: string;
  updated_date?: string;
  views_count: number;
  likes_count: number;
  is_liked: boolean;
  is_published: boolean;
  comments?: any[];
  tags?: string[];
}

export interface BlogCategory {
  id: number;
  name: string;
  name_en: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  is_active: boolean;
  blogs_count: number;
}

interface BlogState {
  posts: BlogPost[];
  categories: BlogCategory[];
  currentPost: BlogPost | null;
  loading: boolean;
  error: string | null;
}

const initialState: BlogState = {
  posts: [],
  categories: [],
  currentPost: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchBlogCategories = createAsyncThunk(
  'blog/fetchBlogCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BLOG.CATEGORIES);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch blog categories');
    }
  }
);

export const fetchBlogPosts = createAsyncThunk(
  'blog/fetchBlogPosts',
  async (params: {
    category?: number;
    author?: number;
    search?: string;
    ordering?: string;
    page?: number;
  } | undefined, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BLOG.POSTS, { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch blog posts');
    }
  }
);

export const fetchBlogPostDetail = createAsyncThunk(
  'blog/fetchBlogPostDetail',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BLOG.POST_DETAIL(id));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch blog post details');
    }
  }
);

export const likeBlogPost = createAsyncThunk(
  'blog/likeBlogPost',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.BLOG.LIKE(id));
      return { id, ...response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to like blog post');
    }
  }
);

export const addBlogComment = createAsyncThunk(
  'blog/addBlogComment',
  async ({ id, body, parent }: { id: number; body: string; parent?: number }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.BLOG.COMMENT(id), { body, parent });
      return { postId: id, comment: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to add comment');
    }
  }
);

// Slice
const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch blog categories
    builder.addCase(fetchBlogCategories.fulfilled, (state, action) => {
      state.categories = action.payload.results || action.payload;
    });
    
    // Fetch blog posts
    builder.addCase(fetchBlogPosts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchBlogPosts.fulfilled, (state, action) => {
      state.loading = false;
      state.posts = action.payload.results || action.payload;
    });
    builder.addCase(fetchBlogPosts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Fetch blog post detail
    builder.addCase(fetchBlogPostDetail.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchBlogPostDetail.fulfilled, (state, action) => {
      state.loading = false;
      state.currentPost = action.payload;
    });
    builder.addCase(fetchBlogPostDetail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Like blog post
    builder.addCase(likeBlogPost.fulfilled, (state, action) => {
      const { id, status, likes_count } = action.payload;
      const updateLikeStatus = (post: BlogPost) => {
        if (post.id === id) {
          post.is_liked = status === 'liked';
          post.likes_count = likes_count;
        }
      };
      
      state.posts.forEach(updateLikeStatus);
      if (state.currentPost && state.currentPost.id === id) {
        state.currentPost.is_liked = status === 'liked';
        state.currentPost.likes_count = likes_count;
      }
    });
    
    // Add blog comment
    builder.addCase(addBlogComment.fulfilled, (state, action) => {
      if (state.currentPost?.id === action.payload.postId) {
        state.currentPost.comments = [...(state.currentPost.comments || []), action.payload.comment];
      }
    });
  },
});

export const { clearError, clearCurrentPost } = blogSlice.actions;
export default blogSlice.reducer;
