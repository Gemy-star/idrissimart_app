# Redux & API Integration Guide

This app uses **Redux Toolkit** for state management and **Axios** for API communication with the Idrissimart backend.

## 📁 Project Structure

```
├── config/
│   └── api.config.ts          # API endpoints and configuration
├── services/
│   ├── api.ts                 # Original API service
│   └── apiClient.ts           # Axios instance with interceptors
├── store/
│   ├── index.ts               # Redux store configuration
│   ├── hooks.ts               # Typed Redux hooks
│   └── slices/
│       ├── authSlice.ts       # Authentication state
│       ├── adsSlice.ts        # Classified ads state
│       ├── categoriesSlice.ts # Categories state
│       ├── countriesSlice.ts  # Countries state
│       ├── chatSlice.ts       # Chat/messaging state
│       ├── wishlistSlice.ts   # Wishlist state
│       ├── notificationsSlice.ts # Notifications state
│       └── blogSlice.ts       # Blog posts state
```

## 🚀 Quick Start

### 1. API Configuration (Automatic)

The API automatically switches between environments:

- **Development**: `http://localhost:5454/api` (iOS) or `http://10.0.2.2:5454/api` (Android)
- **Production**: `https://idrissimart.com/api`

Configuration is in [config/api.config.ts](config/api.config.ts). See [config/API_ENVIRONMENT.md](config/API_ENVIRONMENT.md) for detailed setup.

**For physical device testing**, update the local URL to your computer's IP address:

```typescript
// config/api.config.ts
LOCAL: 'http://192.168.1.100:5454/api' // Replace with your IP
```

### 2. Using Redux in Components

Import the typed hooks:

```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
```

## 📚 Usage Examples

### Authentication

```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login, register, logout, fetchCurrentUser } from '@/store/slices/authSlice';

function LoginScreen() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading, error } = useAppSelector(state => state.auth);

  const handleLogin = async () => {
    try {
      await dispatch(login({ 
        username: 'user@example.com', 
        password: 'password123' 
      })).unwrap();
      // Login successful
    } catch (err) {
      // Handle error
      console.error('Login failed:', err);
    }
  };

  const handleRegister = async () => {
    await dispatch(register({
      username: 'newuser',
      email: 'user@example.com',
      password: 'password123',
      password_confirm: 'password123',
      first_name: 'John',
      last_name: 'Doe',
    })).unwrap();
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    // Your UI here
  );
}
```

### Fetching and Displaying Ads

```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAds, fetchFeaturedAds, toggleFavorite } from '@/store/slices/adsSlice';
import { useEffect } from 'react';

function AdsScreen() {
  const dispatch = useAppDispatch();
  const { ads, loading, error } = useAppSelector(state => state.ads);

  useEffect(() => {
    // Fetch all ads
    dispatch(fetchAds());
    
    // Or fetch with filters
    dispatch(fetchAds({
      category: 1,
      min_price: 100,
      max_price: 1000,
      city: 'New York',
      search: 'iPhone',
    }));
    
    // Fetch featured ads
    dispatch(fetchFeaturedAds());
  }, [dispatch]);

  const handleToggleFavorite = (adId: number) => {
    dispatch(toggleFavorite(adId));
  };

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <FlatList
      data={ads}
      renderItem={({ item }) => (
        <AdCard ad={item} onToggleFavorite={() => handleToggleFavorite(item.id)} />
      )}
      keyExtractor={item => item.id.toString()}
    />
  );
}
```

### Creating a New Ad

```typescript
import { createAd } from '@/store/slices/adsSlice';

function CreateAdScreen() {
  const dispatch = useAppDispatch();

  const handleCreateAd = async () => {
    const formData = new FormData();
    formData.append('title', 'iPhone 15 Pro');
    formData.append('category', '2');
    formData.append('description', 'Brand new iPhone');
    formData.append('price', '999.99');
    formData.append('is_negotiable', 'true');
    formData.append('country', '1');
    formData.append('city', 'New York');
    
    // Add images
    formData.append('images', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });

    try {
      await dispatch(createAd(formData)).unwrap();
      // Ad created successfully
    } catch (err) {
      console.error('Failed to create ad:', err);
    }
  };
}
```

### Working with Categories

```typescript
import { fetchRootCategories, fetchCategoryDetail } from '@/store/slices/categoriesSlice';

function CategoriesScreen() {
  const dispatch = useAppDispatch();
  const { rootCategories, loading } = useAppSelector(state => state.categories);

  useEffect(() => {
    dispatch(fetchRootCategories('classified_ads'));
  }, [dispatch]);

  const handleCategoryPress = (categoryId: number) => {
    dispatch(fetchCategoryDetail(categoryId));
  };
}
```

### Chat / Messaging

```typescript
import { 
  fetchChatRooms, 
  createOrGetChatRoom, 
  sendMessage, 
  markChatAsRead 
} from '@/store/slices/chatSlice';

function ChatScreen() {
  const dispatch = useAppDispatch();
  const { rooms, currentRoom } = useAppSelector(state => state.chat);

  useEffect(() => {
    dispatch(fetchChatRooms());
  }, [dispatch]);

  const handleStartChat = async (adId: number) => {
    const room = await dispatch(createOrGetChatRoom(adId)).unwrap();
    // Navigate to chat room
  };

  const handleSendMessage = async (roomId: number, message: string) => {
    await dispatch(sendMessage({ roomId, message }));
  };

  const handleMarkAsRead = (roomId: number) => {
    dispatch(markChatAsRead(roomId));
  };
}
```

### Notifications

```typescript
import { 
  fetchNotifications, 
  fetchUnreadCount, 
  markNotificationAsRead,
  markAllNotificationsAsRead 
} from '@/store/slices/notificationsSlice';

function NotificationsScreen() {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount } = useAppSelector(state => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
    dispatch(fetchUnreadCount());
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleMarkAsRead = (notificationId: number) => {
    dispatch(markNotificationAsRead(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };
}
```

### Wishlist / Favorites

```typescript
import { fetchWishlistItems } from '@/store/slices/wishlistSlice';
import { toggleFavorite } from '@/store/slices/adsSlice';

function WishlistScreen() {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector(state => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlistItems());
  }, [dispatch]);

  const handleRemoveFromWishlist = (adId: number) => {
    dispatch(toggleFavorite(adId));
  };
}
```

### Blog Posts

```typescript
import { 
  fetchBlogPosts, 
  fetchBlogPostDetail, 
  likeBlogPost,
  addBlogComment 
} from '@/store/slices/blogSlice';

function BlogScreen() {
  const dispatch = useAppDispatch();
  const { posts, currentPost } = useAppSelector(state => state.blog);

  useEffect(() => {
    dispatch(fetchBlogPosts());
  }, [dispatch]);

  const handleLikePost = (postId: number) => {
    dispatch(likeBlogPost(postId));
  };

  const handleAddComment = (postId: number, body: string) => {
    dispatch(addBlogComment({ id: postId, body }));
  };
}
```

## 🔐 Authentication Flow

The app automatically handles:

1. **Token Storage**: Access and refresh tokens are stored in AsyncStorage
2. **Token Refresh**: Expired tokens are automatically refreshed
3. **Request Interceptors**: All authenticated requests include the Bearer token
4. **Response Interceptors**: 401 errors trigger token refresh or logout

## 📡 API Client Features

- **Automatic token management**: Tokens are attached to all requests
- **Token refresh**: Automatically refreshes expired access tokens
- **Request queuing**: Queues failed requests during token refresh
- **Error handling**: Centralized error handling with proper responses
- **AsyncStorage integration**: Persistent storage for auth data

## 🎯 Available Redux Actions

### Auth Actions
- `login(credentials)` - Login user
- `register(userData)` - Register new user
- `logout()` - Logout user
- `fetchCurrentUser()` - Get current user profile
- `updateProfile(profileData)` - Update user profile

### Ads Actions
- `fetchAds(params?)` - Get ads list with filters
- `fetchAdDetail(id)` - Get ad details
- `createAd(formData)` - Create new ad
- `updateAd({ id, adData })` - Update ad
- `deleteAd(id)` - Delete ad
- `toggleFavorite(id)` - Add/remove from favorites
- `addReview({ id, rating, comment })` - Add review to ad
- `fetchFeaturedAds()` - Get featured ads
- `fetchUrgentAds()` - Get urgent ads
- `fetchRecentAds()` - Get recent ads
- `fetchMyAds()` - Get user's ads

### Categories Actions
- `fetchCategories(params?)` - Get categories
- `fetchCategoryDetail(id)` - Get category details
- `fetchRootCategories(sectionType?)` - Get root categories

### Countries Actions
- `fetchCountries()` - Get all countries
- `fetchCountryDetail(id)` - Get country details

### Chat Actions
- `fetchChatRooms()` - Get user's chat rooms
- `fetchChatRoomDetail(id)` - Get chat room messages
- `createOrGetChatRoom(adId)` - Create or get existing chat room
- `sendMessage({ roomId, message, attachment? })` - Send message
- `markChatAsRead(roomId)` - Mark all messages as read

### Wishlist Actions
- `fetchWishlistItems()` - Get wishlist items

### Notifications Actions
- `fetchNotifications(page?)` - Get notifications
- `fetchUnreadCount()` - Get unread count
- `markNotificationAsRead(id)` - Mark notification as read
- `markAllNotificationsAsRead()` - Mark all as read

### Blog Actions
- `fetchBlogCategories()` - Get blog categories
- `fetchBlogPosts(params?)` - Get blog posts
- `fetchBlogPostDetail(id)` - Get blog post details
- `likeBlogPost(id)` - Like/unlike post
- `addBlogComment({ id, body, parent? })` - Add comment

## 🛠️ Error Handling

All async thunks return promises that can be unwrapped:

```typescript
try {
  const result = await dispatch(someAction(params)).unwrap();
  // Success
} catch (error) {
  // Handle error
  console.error('Action failed:', error);
}
```

## 📝 TypeScript Support

All Redux slices are fully typed. Use the exported types:

```typescript
import type { User } from '@/store/slices/authSlice';
import type { Ad } from '@/store/slices/adsSlice';
import type { Category } from '@/store/slices/categoriesSlice';
```

## 🔄 Real-time Updates

For real-time features (chat, notifications), consider implementing WebSocket connections:

```typescript
// Example: Add message from WebSocket
import { addMessageToRoom } from '@/store/slices/chatSlice';
import { addNotification } from '@/store/slices/notificationsSlice';

websocket.on('new_message', (message) => {
  dispatch(addMessageToRoom(message));
});

websocket.on('notification', (notification) => {
  dispatch(addNotification(notification));
});
```

## 📦 Package.json Scripts

The following packages are installed:

- `@reduxjs/toolkit` - Redux Toolkit for state management
- `react-redux` - React bindings for Redux
- `axios` - HTTP client for API requests
- `@react-native-async-storage/async-storage` - AsyncStorage for token persistence

## 🐛 Debugging

Enable Redux DevTools in development:

```typescript
// The store is already configured with devTools enabled in development
```

Check the Redux state in your app:

```typescript
console.log('Current state:', store.getState());
```

## 📚 Additional Resources

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Axios Documentation](https://axios-http.com/)
- [React Redux Hooks](https://react-redux.js.org/api/hooks)
