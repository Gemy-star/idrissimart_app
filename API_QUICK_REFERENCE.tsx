// Quick Reference: Common API Operations

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import * as AdsActions from '@/store/slices/adsSlice';
import * as AuthActions from '@/store/slices/authSlice';
import * as BlogActions from '@/store/slices/blogSlice';
import * as CategoriesActions from '@/store/slices/categoriesSlice';
import * as ChatActions from '@/store/slices/chatSlice';
import * as CountriesActions from '@/store/slices/countriesSlice';
import * as NotificationsActions from '@/store/slices/notificationsSlice';
import * as WishlistActions from '@/store/slices/wishlistSlice';

/**
 * ========================================
 * AUTHENTICATION EXAMPLES
 * ========================================
 */

// Login
export const loginExample = async (dispatch: any) => {
  try {
    const user = await dispatch(AuthActions.login({
      username: 'user@example.com',
      password: 'password123',
    })).unwrap();
    console.log('Logged in:', user);
    return user;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

// Register
export const registerExample = async (dispatch: any) => {
  try {
    const user = await dispatch(AuthActions.register({
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123',
      password_confirm: 'password123',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+1234567890',
      country: 1,
      city: 'New York',
    })).unwrap();
    console.log('Registered:', user);
    return user;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

// Update Profile
export const updateProfileExample = async (dispatch: any) => {
  try {
    const user = await dispatch(AuthActions.updateProfile({
      first_name: 'Jane',
      bio: 'Updated bio',
      city: 'Los Angeles',
    })).unwrap();
    console.log('Profile updated:', user);
    return user;
  } catch (error) {
    console.error('Update failed:', error);
    throw error;
  }
};

// Logout
export const logoutExample = (dispatch: any) => {
  dispatch(AuthActions.logout());
};

/**
 * ========================================
 * ADS EXAMPLES
 * ========================================
 */

// Fetch all ads
export const fetchAllAdsExample = (dispatch: any) => {
  dispatch(AdsActions.fetchAds());
};

// Fetch ads with filters
export const fetchFilteredAdsExample = (dispatch: any) => {
  dispatch(AdsActions.fetchAds({
    category: 1,
    min_price: 100,
    max_price: 1000,
    city: 'New York',
    search: 'iPhone',
    ordering: '-created_at',
  }));
};

// Fetch featured ads
export const fetchFeaturedAdsExample = (dispatch: any) => {
  dispatch(AdsActions.fetchFeaturedAds());
};

// Create new ad
export const createAdExample = async (dispatch: any) => {
  const formData = new FormData();
  formData.append('title', 'iPhone 15 Pro');
  formData.append('category', '2');
  formData.append('description', 'Brand new iPhone');
  formData.append('price', '999.99');
  formData.append('is_negotiable', 'true');
  formData.append('country', '1');
  formData.append('city', 'New York');
  
  try {
    const ad = await dispatch(AdsActions.createAd(formData)).unwrap();
    console.log('Ad created:', ad);
    return ad;
  } catch (error) {
    console.error('Failed to create ad:', error);
    throw error;
  }
};

// Toggle favorite
export const toggleFavoriteExample = async (dispatch: any, adId: number) => {
  try {
    const result = await dispatch(AdsActions.toggleFavorite(adId)).unwrap();
    console.log('Favorite toggled:', result);
    return result;
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
    throw error;
  }
};

// Add review
export const addReviewExample = async (dispatch: any, adId: number) => {
  try {
    const review = await dispatch(AdsActions.addReview({
      id: adId,
      rating: 5,
      comment: 'Great product!',
    })).unwrap();
    console.log('Review added:', review);
    return review;
  } catch (error) {
    console.error('Failed to add review:', error);
    throw error;
  }
};

/**
 * ========================================
 * CATEGORIES EXAMPLES
 * ========================================
 */

// Fetch all categories
export const fetchCategoriesExample = (dispatch: any) => {
  dispatch(CategoriesActions.fetchCategories());
};

// Fetch root categories
export const fetchRootCategoriesExample = (dispatch: any) => {
  dispatch(CategoriesActions.fetchRootCategories('classified_ads'));
};

// Fetch category details
export const fetchCategoryDetailExample = (dispatch: any, categoryId: number) => {
  dispatch(CategoriesActions.fetchCategoryDetail(categoryId));
};

/**
 * ========================================
 * COUNTRIES EXAMPLES
 * ========================================
 */

// Fetch all countries
export const fetchCountriesExample = (dispatch: any) => {
  dispatch(CountriesActions.fetchCountries());
};

/**
 * ========================================
 * CHAT EXAMPLES
 * ========================================
 */

// Fetch chat rooms
export const fetchChatRoomsExample = (dispatch: any) => {
  dispatch(ChatActions.fetchChatRooms());
};

// Create or get chat room for an ad
export const startChatExample = async (dispatch: any, adId: number) => {
  try {
    const room = await dispatch(ChatActions.createOrGetChatRoom(adId)).unwrap();
    console.log('Chat room:', room);
    return room;
  } catch (error) {
    console.error('Failed to create chat room:', error);
    throw error;
  }
};

// Send message
export const sendMessageExample = async (dispatch: any, roomId: number, message: string) => {
  try {
    const sentMessage = await dispatch(ChatActions.sendMessage({
      roomId,
      message,
    })).unwrap();
    console.log('Message sent:', sentMessage);
    return sentMessage;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
};

/**
 * ========================================
 * WISHLIST EXAMPLES
 * ========================================
 */

// Fetch wishlist
export const fetchWishlistExample = (dispatch: any) => {
  dispatch(WishlistActions.fetchWishlistItems());
};

/**
 * ========================================
 * NOTIFICATIONS EXAMPLES
 * ========================================
 */

// Fetch notifications
export const fetchNotificationsExample = (dispatch: any) => {
  dispatch(NotificationsActions.fetchNotifications(undefined));
};

// Fetch unread count
export const fetchUnreadCountExample = (dispatch: any) => {
  dispatch(NotificationsActions.fetchUnreadCount());
};

// Mark notification as read
export const markNotificationReadExample = (dispatch: any, notificationId: number) => {
  dispatch(NotificationsActions.markNotificationAsRead(notificationId));
};

// Mark all notifications as read
export const markAllNotificationsReadExample = (dispatch: any) => {
  dispatch(NotificationsActions.markAllNotificationsAsRead());
};

/**
 * ========================================
 * BLOG EXAMPLES
 * ========================================
 */

// Fetch blog posts
export const fetchBlogPostsExample = (dispatch: any) => {
  dispatch(BlogActions.fetchBlogPosts(undefined));
};

// Fetch blog post detail
export const fetchBlogPostDetailExample = (dispatch: any, postId: number) => {
  dispatch(BlogActions.fetchBlogPostDetail(postId));
};

// Like blog post
export const likeBlogPostExample = (dispatch: any, postId: number) => {
  dispatch(BlogActions.likeBlogPost(postId));
};

// Add comment to blog post
export const addBlogCommentExample = async (dispatch: any, postId: number, comment: string) => {
  try {
    const result = await dispatch(BlogActions.addBlogComment({
      id: postId,
      body: comment,
    })).unwrap();
    console.log('Comment added:', result);
    return result;
  } catch (error) {
    console.error('Failed to add comment:', error);
    throw error;
  }
};

/**
 * ========================================
 * USING STATE IN COMPONENTS
 * ========================================
 */

export const ComponentExample = () => {
  const dispatch = useAppDispatch();
  
  // Access auth state
  const { user, isAuthenticated, loading: authLoading } = useAppSelector(state => state.auth);
  
  // Access ads state
  const { ads, featuredAds, loading: adsLoading } = useAppSelector(state => state.ads);
  
  // Access categories state
  const { categories, rootCategories } = useAppSelector(state => state.categories);
  
  // Access countries state
  const { countries } = useAppSelector(state => state.countries);
  
  // Access chat state
  const { rooms, currentRoom } = useAppSelector(state => state.chat);
  
  // Access wishlist state
  const { items: wishlistItems } = useAppSelector(state => state.wishlist);
  
  // Access notifications state
  const { notifications, unreadCount } = useAppSelector(state => state.notifications);
  
  // Access blog state
  const { posts, categories: blogCategories } = useAppSelector(state => state.blog);
  
  // Example: Fetch data on mount
  React.useEffect(() => {
    dispatch(AdsActions.fetchFeaturedAds());
    dispatch(CategoriesActions.fetchRootCategories('classified_ads'));
    dispatch(CountriesActions.fetchCountries());
    
    if (isAuthenticated) {
      dispatch(NotificationsActions.fetchUnreadCount());
      dispatch(WishlistActions.fetchWishlistItems());
    }
  }, [dispatch, isAuthenticated]);
  
  return null; // Your UI here
};
