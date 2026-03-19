import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../config/api.config';
import apiClient from '../../services/apiClient';

// Types
export interface ChatMessage {
  id: number;
  room: number;
  sender: any;
  message: string;
  attachment?: string;
  created_at: string;
  is_read: boolean;
  read_at?: string;
}

export interface ChatRoom {
  id: number;
  room_type: string;
  publisher: any;
  client: any;
  ad?: any;
  ad_title?: string;
  last_message?: {
    message: string;
    sender: string;
    created_at: string;
  };
  unread_count: number;
  messages?: ChatMessage[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface ChatState {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  rooms: [],
  currentRoom: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchChatRooms = createAsyncThunk(
  'chat/fetchChatRooms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CHAT.ROOMS);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch chat rooms');
    }
  }
);

export const fetchChatRoomDetail = createAsyncThunk(
  'chat/fetchChatRoomDetail',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CHAT.ROOM_DETAIL(id));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch chat room details');
    }
  }
);

export const createOrGetChatRoom = createAsyncThunk(
  'chat/createOrGetChatRoom',
  async (adId: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CHAT.CREATE_OR_GET, { ad_id: adId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to create/get chat room');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ roomId, message, attachment }: { roomId: number; message: string; attachment?: File }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('message', message);
      if (attachment) {
        formData.append('attachment', attachment);
      }
      
      const response = await apiClient.post(API_ENDPOINTS.CHAT.SEND_MESSAGE(roomId), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to send message');
    }
  }
);

export const markChatAsRead = createAsyncThunk(
  'chat/markChatAsRead',
  async (roomId: number, { rejectWithValue }) => {
    try {
      await apiClient.post(API_ENDPOINTS.CHAT.MARK_READ(roomId));
      return roomId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to mark chat as read');
    }
  }
);

// Slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addMessageToRoom: (state, action) => {
      if (state.currentRoom && state.currentRoom.id === action.payload.room) {
        if (state.currentRoom.messages) {
          state.currentRoom.messages = [...state.currentRoom.messages, action.payload];
        } else {
          state.currentRoom.messages = [action.payload];
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch chat rooms
    builder.addCase(fetchChatRooms.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchChatRooms.fulfilled, (state, action) => {
      state.loading = false;
      state.rooms = action.payload.results || action.payload;
    });
    builder.addCase(fetchChatRooms.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Fetch chat room detail
    builder.addCase(fetchChatRoomDetail.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchChatRoomDetail.fulfilled, (state, action) => {
      state.loading = false;
      state.currentRoom = action.payload;
    });
    builder.addCase(fetchChatRoomDetail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Create or get chat room
    builder.addCase(createOrGetChatRoom.fulfilled, (state, action) => {
      state.currentRoom = action.payload;
    });
    
    // Send message
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      if (state.currentRoom && state.currentRoom.messages) {
        state.currentRoom.messages = [...state.currentRoom.messages, action.payload];
      } else if (state.currentRoom) {
        state.currentRoom.messages = [action.payload];
      }
    });
    
    // Mark chat as read
    builder.addCase(markChatAsRead.fulfilled, (state, action) => {
      const room = state.rooms.find(r => r.id === action.payload);
      if (room) {
        room.unread_count = 0;
      }
      if (state.currentRoom?.id === action.payload) {
        state.currentRoom.unread_count = 0;
      }
    });
  },
});

export const { clearError, addMessageToRoom } = chatSlice.actions;
export default chatSlice.reducer;
