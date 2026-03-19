# Idrissimart - React Native Marketplace App

A modern mobile marketplace application built with React Native, TypeScript, and Expo. Idrissimart enables users to buy and sell items, chat directly with sellers, manage wishlists, and discover deals in their local area. Built with production-ready architecture including Redux Toolkit state management, JWT authentication, and comprehensive API integration with a Django backend.

## 📱 Features

### Core Marketplace Features
- **📦 Buy & Sell Ads**: Post and browse classified ads with images, pricing, and detailed descriptions
- **💬 Direct Chat**: Built-in messaging system to negotiate with buyers and sellers
- **❤️ Wishlist**: Save favorite items and get notifications when prices drop
- **🏷️ Categories & Filters**: Browse by category, location, price range, and condition
- **📍 Location-Based**: Find items near you with location services integration
- **⭐ Reviews & Ratings**: Rate sellers and read reviews before purchasing
- **🔔 Real-Time Notifications**: Get instant alerts for messages, ad updates, and favorites
- **📰 Blog & Articles**: Stay informed with marketplace tips and featured content

### Technical Features
- **🔐 Authentication**: Secure JWT-based login with automatic token refresh
- **📱 First-Time Onboarding**: Beautiful 5-slide walkthrough for new users
- **🌍 Multi-language Support**: Arabic (RTL) and English with i18next integration
- **🎨 Custom Theming**: Purple (#4b315e) & Orange (#ff6001) brand colors
- **💾 Redux Toolkit**: 8 specialized slices (auth, ads, categories, countries, chat, wishlist, notifications, blog)
- **🔄 Offline Support**: AsyncStorage for token persistence and app state
- **📡 Smart API Client**: Axios with interceptors, automatic retries, and error handling
- **🔧 Platform Detection**: Auto-configured API URLs for iOS/Android emulators and production
- **🚀 EAS Build**: Ready for App Store and Play Store deployment
- **📊 TypeScript**: Full type safety across the entire codebase

## 🏗️ Architecture

### Project Structure
```
idrissimart_app/
├── app/                          # File-based routing (Expo Router)
│   ├── (tabs)/                  # Tab navigation group
│   │   ├── _layout.tsx         # Tab navigation configuration
│   │   └── index.tsx           # Home screen
│   ├── _layout.tsx              # Root layout with providers
│   └── +not-found.tsx          # 404 error screen
├── store/                        # Redux Toolkit store
│   ├── index.ts                # Store configuration
│   ├── hooks.ts                # Typed Redux hooks
│   └── slices/                 # Feature slices
│       ├── authSlice.ts        # Authentication & user management
│       ├── adsSlice.ts         # Classified ads CRUD operations
│       ├── categoriesSlice.ts  # Product categories
│       ├── countriesSlice.ts   # Countries, cities, areas
│       ├── chatSlice.ts        # Messaging system
│       ├── wishlistSlice.ts    # Saved favorites
│       ├── notificationsSlice.ts # Push notifications
│       └── blogSlice.ts        # Blog posts & articles
├── services/                     # API & external services
│   └── apiClient.ts            # Axios client with interceptors
├── config/                       # Configuration files
│   ├── api.config.ts           # API endpoints & environment URLs
│   └── environment.ts          # Environment utilities
├── contexts/                     # React Context providers
│   ├── LanguageContext.tsx     # i18n state management
│   ├── ThemeContext.tsx        # App theming
│   ├── SidebarContext.tsx      # Navigation state
│   ├── LoadingContext.tsx      # Global loading states
│   └── OnboardingContext.tsx   # First-time user experience
├── components/                   # Reusable components
│   ├── header/                 # App header
│   ├── sidebar/                # Navigation sidebar
│   ├── onboarding/             # Onboarding screens
│   │   ├── OnboardingScreen.tsx
│   │   └── OnboardingWrapper.tsx
│   └── examples/               # Example implementations
│       ├── FeaturedAdsExample.tsx
│       ├── LoginExample.tsx
│       └── ResetOnboardingExample.tsx
├── hooks/                        # Custom React hooks
│   ├── useApi.ts               # API request hook
│   ├── useTypography.ts        # Font management
│   └── useFrameworkReady.ts    # App initialization
├── constants/                    # App constants
│   ├── Colors.ts               # Color theme
│   ├── Spacing.ts              # Layout spacing
│   └── Typography.ts           # Font styles
├── locales/                      # Internationalization
│   ├── en.json                 # English translations
│   └── ar.json                 # Arabic translations
├── assets/                       # Static assets
│   ├── logos/                  # App icons and logos
│   └── fonts/                  # Custom fonts
├── eas.json                      # EAS Build configuration
├── app.json                      # Expo configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

### Core Architecture Patterns

#### **Redux Toolkit State Management**

The app uses Redux Toolkit for predictable state management with 8 specialized slices:

**1. Authentication Slice** (`authSlice.ts`)
```typescript
// Features:
- login({ username, password })          // Login with JWT token
- register({ userData })                 // User registration
- logout()                               // Clear auth state
- fetchCurrentUser()                     // Get profile with caching
- updateProfile({ userData })            // Update user info
```

**2. Ads Slice** (`adsSlice.ts`)
```typescript
// Features:
- fetchAds({ category, location, price }) // Browse with filters
- fetchAdDetails({ id })                  // Get single ad
- createAd({ formData })                  // Post new ad
- updateAd({ id, data })                  // Edit ad
- deleteAd({ id })                        // Remove ad
- toggleFavorite({ adId })                // Add/remove favorite
- addReview({ adId, rating, comment })    // Rate seller
- fetchFeaturedAds()                      // Premium listings
- fetchUrgentAds()                        // Time-sensitive
- fetchRecentAds()                        // Latest posts
```

**3. Chat Slice** (`chatSlice.ts`)
```typescript
// Features:
- fetchConversations()                    // List all chats
- fetchMessages({ conversationId })       // Get chat history
- sendMessage({ to, content, adId })      // Send message
- markAsRead({ conversationId })          // Update read status
- deleteConversation({ id })              // Remove chat
```

**4. Categories & Filters**
- `categoriesSlice.ts` - Product categories and subcategories
- `countriesSlice.ts` - Location data (countries, cities, areas)

**5. User Features**
- `wishlistSlice.ts` - Saved favorites and alerts
- `notificationsSlice.ts` - Push notifications and badges
- `blogSlice.ts` - Articles and marketplace tips

#### **API Client Architecture**

**Axios Client with Interceptors** (`services/apiClient.ts`)
```typescript
// Request Interceptor
- Auto-inject JWT token from AsyncStorage
- Add default headers
- Log requests in development

// Response Interceptor
- Handle 401 errors with automatic token refresh
- Queue failed requests during refresh
- Retry failed requests after new token
- Centralized error handling
```

**Environment-Based Configuration** (`config/api.config.ts`)
```typescript
const API_URLS = {
  LOCAL: Platform.select({
    android: 'http://10.0.2.2:5454/api',  // Android emulator
    ios: 'http://localhost:5454/api',      // iOS simulator
  }),
  PRODUCTION: 'https://idrissimart.com/api',
};

// Automatically switches based on __DEV__ flag
const BASE_URL = __DEV__ ? API_URLS.LOCAL : API_URLS.PRODUCTION;
```

#### **Component Architecture**

**Provider Hierarchy** (in `app/_layout.tsx`)
```typescript
<Provider store={store}>              // Redux state
  <ThemeProvider>                     // App theming
    <LanguageProvider>                // i18n
      <OnboardingProvider>            // First-time UX
        <SidebarProvider>             // Navigation
          <LoadingProvider>           // Loading states
            <OnboardingWrapper>       // Show onboarding if first launch
              <App />                 // Main app
            </OnboardingWrapper>
          </LoadingProvider>
        </SidebarProvider>
      </OnboardingProvider>
    </LanguageProvider>
  </ThemeProvider>
</Provider>
```

**Type-Safe Redux Hooks**
```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';

// In your component
const dispatch = useAppDispatch();
const { featuredAds, loading } = useAppSelector(state => state.ads);

// Dispatch async thunk
dispatch(fetchFeaturedAds());
```

#### **Onboarding Flow**

**First Launch Detection** (`contexts/OnboardingContext.tsx`)
- Checks AsyncStorage for `@app/has_seen_onboarding`
- Shows 5-slide introduction on first launch
- Automatically hides on subsequent launches
- Can be reset for testing

**Onboarding Slides** (`components/onboarding/OnboardingScreen.tsx`)
1. Welcome to Idrissimart
2. Buy & Sell Easily
3. Chat Directly
4. Stay Informed
5. Safe & Secure

## 🚀 Getting Started

### Prerequisites

**Required:**
- **Node.js** v18 or higher
- **npm** or **yarn** package manager
- **Expo CLI** (will be installed automatically)
- **EAS CLI** for building: `npm install -g eas-cli`

**For iOS Development (macOS only):**
- **Xcode** (latest version from App Store)
- **Xcode Command Line Tools**: `xcode-select --install`
- **CocoaPods**: `sudo gem install cocoapods`

**For Android Development:**
- **Android Studio** with Android SDK
- **ANDROID_HOME** environment variable configured
- At least one **Android Virtual Device (AVD)** created

**Backend API:**
- **Django backend** running on `localhost:5454` (development)
- Or access to production API at `https://idrissimart.com/api`

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd idrissimart_app
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment (if needed)**
```bash
# Run automated environment check
./setup_dev_environment.sh
```

4. **Configure Expo/EAS (for building)**
```bash
# Login to Expo
eas login

# Initialize EAS project
eas init

# Update app.json with your Expo username
# Edit "owner" field in app.json
```

### Running the Application

#### Quick Start - Emulator Setup

**For iOS (macOS only):**
```bash
# 1. Start iOS Simulator
npm run emulator:ios

# 2. Run the app (in a new terminal)
npm run ios
```

**For Android:**
```bash
# 1. Start Android Emulator
npm run emulator:android

# 2. Run the app (in a new terminal)
npm run android
```

**Or use the automated setup:**
```bash
# Run the complete environment setup check
./setup_dev_environment.sh
```

#### Development Mode
```bash
# Start Expo development server (choose platform interactively)
npm start

# Or directly launch on specific platform:
npm run android      # Run on Android emulator/device
npm run ios          # Run on iOS simulator/device
npm run web          # Run in web browser
```

#### Available Commands
| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server with platform picker |
| `npm run android` | Launch on Android emulator/device |
| `npm run ios` | Launch on iOS simulator/device |
| `npm run web` | Launch in web browser |
| `npm run emulator:android` | Start Android emulator |
| `npm run emulator:ios` | Start iOS simulator |

#### 📱 Emulator Setup Details

**Complete setup guide:** See [EMULATOR_SETUP.md](EMULATOR_SETUP.md) for:
- Prerequisites installation (Xcode, Android Studio)
- Environment variable configuration
- AVD (Android Virtual Device) creation
- Troubleshooting common issues
- Physical device testing

**Quick Reference:** See [EMULATOR_QUICK_START.txt](EMULATOR_QUICK_START.txt) for command reference

#### Production Build

**Using EAS Build (Recommended):**

```bash
# First-time setup
npm install -g eas-cli
eas login
eas init

# Run pre-flight checks
./eas_preflight_check.sh

# Build for stores
npm run build:android        # Android APK
npm run build:ios            # iOS IPA
npm run build:all            # Both platforms

# Submit to stores
npm run submit:android       # Google Play Store
npm run submit:ios           # Apple App Store
```

**Build Profiles:**
- `development` - Internal testing with dev tools
- `preview` - QA and stakeholder testing
- `production` - Store-ready builds
- `production-aab` - Android App Bundle for Play Store

**Complete EAS Guide:** See [EAS_BUILD_GUIDE.md](EAS_BUILD_GUIDE.md) for:
- Step-by-step setup instructions
- Build profile configuration
- Store submission process
- Troubleshooting guide
- OTA updates with EAS Update

**Quick Reference:** [EAS_QUICK_REFERENCE.txt](EAS_QUICK_REFERENCE.txt)

## 🌐 API Integration

### Backend API Overview

Idrissimart uses a **Django REST Framework** backend with the following endpoints:

#### Authentication Endpoints
```
POST   /auth/login/                    # Login (returns JWT tokens)
POST   /auth/register/                 # User registration
POST   /auth/logout/                   # Logout
POST   /auth/refresh/                  # Refresh access token
GET    /auth/user/                     # Get current user
PUT    /auth/user/                     # Update profile
```

#### Ads Endpoints
```
GET    /ads/                           # List all ads (with filters)
POST   /ads/                           # Create new ad
GET    /ads/{id}/                      # Get ad details
PUT    /ads/{id}/                      # Update ad
DELETE /ads/{id}/                      # Delete ad
POST   /ads/{id}/favorite/             # Toggle favorite
POST   /ads/{id}/review/               # Add review
GET    /ads/featured/                  # Featured ads
GET    /ads/urgent/                    # Urgent ads
GET    /ads/recent/                    # Recent ads
```

#### Chat Endpoints
```
GET    /chat/conversations/            # List conversations
POST   /chat/conversations/            # Start conversation
GET    /chat/conversations/{id}/       # Get messages
POST   /chat/messages/                 # Send message
PUT    /chat/conversations/{id}/read/  # Mark as read
```

#### Additional Endpoints
```
GET    /categories/                    # Product categories
GET    /countries/                     # Countries/cities/areas
GET    /wishlist/                      # User's wishlist
GET    /notifications/                 # User notifications
GET    /blog/posts/                    # Blog articles
```

### Environment Configuration

The app **automatically** detects the environment and platform:

**Development Mode** (`__DEV__ = true`)
- **iOS Simulator**: `http://localhost:5454/api`
- **Android Emulator**: `http://10.0.2.2:5454/api` (special Android host IP)

**Production Mode** (`__DEV__ = false`)
- **All Platforms**: `https://idrissimart.com/api`

**Configuration File**: [config/api.config.ts](config/api.config.ts)
```typescript
const API_URLS = {
  LOCAL: Platform.select({
    android: 'http://10.0.2.2:5454/api',  // Android emulator
    ios: 'http://localhost:5454/api',      // iOS simulator
    default: 'http://localhost:5454/api',
  }),
  PRODUCTION: 'https://idrissimart.com/api',
};

export const API_CONFIG = {
  BASE_URL: __DEV__ ? API_URLS.LOCAL : API_URLS.PRODUCTION,
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};
```

### Authentication Flow

1. **Login** → Receives `access` and `refresh` tokens
2. **Store Tokens** → Saved in AsyncStorage
3. **Auto-Inject** → Request interceptor adds Bearer token
4. **Token Refresh** → Response interceptor handles 401 errors
5. **Retry Failed** → Queues and retries requests after refresh

### API Client Features

✅ **Automatic Token Management**
- Injects JWT token in Authorization header
- Refreshes expired tokens automatically
- Queues failed requests during refresh

✅ **Error Handling**
- Network errors with retry logic
- 401/403 authentication errors
- Validation errors with field-level messages

✅ **Request/Response Logging**
- Console logs in development mode
- Redacts sensitive data in production

✅ **TypeScript Support**
- Full type safety for all endpoints
- Auto-completion in IDE
- Compile-time error checking

### Documentation
- **[REDUX_API_GUIDE.md](REDUX_API_GUIDE.md)** - Complete Redux integration guide (60+ pages)
- **[API_ENVIRONMENT.md](config/API_ENVIRONMENT.md)** - Environment setup and troubleshooting
- **[API_QUICK_REFERENCE.tsx](API_QUICK_REFERENCE.tsx)** - All endpoints with examples
- **[INTEGRATION_COMPLETE.md](INTEGRATION_COMPLETE.md)** - Integration checklist

### Testing Physical Devices

When testing on real phones (not emulators), update the API URL:

**1. Find Your Computer's Local IP**
```bash
# macOS/Linux
ifconfig | grep "inet "

# Look for: 192.168.x.x or 10.0.x.x
```

**2. Update API Configuration**

Edit [config/api.config.ts](config/api.config.ts):
```typescript
const API_URLS = {
  LOCAL: Platform.select({
    android: 'http://192.168.1.100:5454/api',  // Your computer's IP
    ios: 'http://192.168.1.100:5454/api',       // Same IP
  }),
  // ...
};
```

**3. Start Backend on All Interfaces**
```bash
# Django - Listen on all interfaces
python manage.py runserver 0.0.0.0:5454

# Not 127.0.0.1 - that only works for local connections!
```

**4. Check Firewall**
- Allow incoming connections on port 5454
- Ensure phone and computer are on same WiFi network

## 🌍 Internationalization (i18n)

### Supported Languages
- **🇬🇧 English (en)**: Default language, LTR layout
- **🇸🇦 Arabic (ar)**: Full RTL support with proper text rendering

### Language Files

**English** ([locales/en.json](locales/en.json))
```json
{
  "welcome": "Welcome to Idrissimart",
  "buy_sell": "Buy & Sell Easily",
  "categories": "Browse Categories",
  "my_ads": "My Listings",
  "messages": "Messages",
  "favorites": "Saved Items",
  "post_ad": "Post an Ad",
  "search_placeholder": "Search for items...",
  // ... 100+ more keys
}
```

**Arabic** ([locales/ar.json](locales/ar.json))
```json
{
  "welcome": "مرحبًا في إدريسي مارت",
  "buy_sell": "اشتري وبيع بسهولة",
  "categories": "تصفح الفئات",
  "my_ads": "إعلاناتي",
  "messages": "الرسائل",
  "favorites": "المفضلة",
  "post_ad": "نشر إعلان",
  // ... matching translations
}
```

### RTL Support

**Automatic Layout Switching**
```typescript
import { I18nManager } from 'react-native';

// When switching to Arabic
if (language === 'ar') {
  I18nManager.forceRTL(true);
} else {
  I18nManager.forceRTL(false);
}
```

**Features:**
- Text alignment switches automatically
- Layout direction flips (RTL/LTR)
- Icons mirror appropriately
- Proper Arabic text rendering
- Numbers display correctly in Arabic

### Adding New Languages

**1. Create Translation File**
```bash
# Create new language file
touch locales/fr.json
```

**2. Add Translations**
```json
{
  "welcome": "Bienvenue sur Idrissimart",
  "buy_sell": "Acheter et vendre facilement",
  // ... all keys
}
```

**3. Update i18n Configuration**
```typescript
// In your i18n setup
import en from './locales/en.json';
import ar from './locales/ar.json';
import fr from './locales/fr.json';  // Add new import

i18n.init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
    fr: { translation: fr },  // Register new language
  },
  // ...
});
```

### Usage in Components

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  
  return (
    <View>
      <Text>{t('welcome')}</Text>
      <Text>{t('buy_sell')}</Text>
      
      {/* With variables */}
      <Text>{t('items_count', { count: 42 })}</Text>
      
      {/* Current language */}
      <Text>Language: {i18n.language}</Text>
    </View>
  );
}
```

## 🧭 Navigation Structure

### File-Based Routing with Expo Router

```
Routes:
├── /                    # Home screen (Browse ads)
├── /categories          # Category browser
├── /ad/[id]             # Ad details page
├── /profile             # User profile
├── /messages            # Chat inbox
├── /favorites           # Wishlist
├── /post-ad             # Create new ad
├── /settings            # App settings
└── /+not-found          # 404 error page
```

### Navigation Features

**Deep Linking**
```typescript
// Open specific ad from URL
idrissimart://ad/123

// Open category
idrissimart://categories/electronics

// Open chat
idrissimart://messages/conversation/456
```

**Programmatic Navigation**
```typescript
import { useRouter } from 'expo-router';

function MyComponent() {
  const router = useRouter();
  
  const viewAd = (adId: number) => {
    router.push(`/ad/${adId}`);
  };
  
  const goBack = () => {
    router.back();
  };
}
```

**Tab Navigation**
- Home - Browse marketplace
- Categories - Filter by category
- Post - Create new listing
- Messages - Chat with users
- Profile - Account management

## 🧭 TypeScript Configuration

### Strict Type Checking

The project uses strict TypeScript configuration for maximum safety:

```json
// tsconfig.json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Type Definitions

**Redux State Types**
```typescript
// Inferred from slices
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

**API Response Types**
```typescript
// Example: Ad type
interface Ad {
  id: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  is_negotiable: boolean;
  category: Category;
  user: User;
  images: Image[];
  location: Location;
  created_at: string;
  views_count: number;
  is_featured: boolean;
  is_urgent: boolean;
}

// All API types defined in store/slices/
```

### Path Aliases

```typescript
// Instead of: import { Colors } from '../../../constants/Colors'
import { Colors } from '@/constants/Colors';

// Available aliases:
'@/*'           // Root level
'@/components'  // Components
'@/constants'   // Constants
'@/store'       // Redux store
'@/services'    // API services
'@/config'      // Configuration
```

## 🧪 Testing

### Development Testing

**On Emulators:**
```bash
# Start emulator and run app
npm run emulator:android && npm run android
npm run emulator:ios && npm run ios
```

**Type Checking:**
```bash
# Run TypeScript compiler
npx tsc --noEmit

# Check for errors
get_errors  # In VS Code
```

**Linting:**
```bash
# Run ESLint
npm run lint
```

### Testing Features

**Test User Flows:**
1. **Registration & Login**
   - Register new account
   - Login with credentials
   - Profile updates
   - Logout

2. **Browse & Search**
   - View featured ads
   - Filter by category
   - Search by keywords
   - Sort by price/date

3. **Post Ads**
   - Create new ad
   - Upload images
   - Set price and location
   - Edit/delete ads

4. **Messaging**
   - Start conversation
   - Send messages
   - Receive notifications
   - Mark as read

5. **Wishlist**
   - Add to favorites
   - Remove favorites
   - Get price alerts

### Resetting Test Data

**Reset Onboarding:**
```typescript
import { useOnboarding } from '@/contexts/OnboardingContext';

const { resetOnboarding } = useOnboarding();
await resetOnboarding();
```

**Clear AsyncStorage:**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

await AsyncStorage.clear();
```

**Logout:**
```typescript
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';

const dispatch = useAppDispatch();
dispatch(logout());
```

## 📦 Building for Distribution

### Using EAS Build (Recommended)

EAS (Expo Application Services) is the modern way to build React Native apps. It's already configured in this project.

**Quick Start:**
```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login to Expo
eas login

# 3. Initialize project
eas init

# 4. Run pre-flight check
./eas_preflight_check.sh

# 5. Build for testing
npm run build:android:preview
npm run build:ios:preview

# 6. Build for production
npm run build:android
npm run build:ios

# 7. Submit to stores
npm run submit:android
npm run submit:ios
```

**Build Profiles** (configured in [eas.json](eas.json)):

| Profile | Purpose | Platform | Output |
|---------|---------|----------|--------|
| `development` | Local testing with dev tools | iOS/Android | Simulator/APK |
| `preview` | QA testing, stakeholders | iOS/Android | TestFlight/APK |
| `production` | App Store release | iOS/Android | IPA/APK |
| `production-aab` | Play Store release | Android | AAB |

**Platform-Specific Setup:**

**Android:**
- EAS generates keystore automatically (first build)
- For Play Store: Need Google service account JSON
- APK for testing, AAB for store submission

**iOS:**
- Requires Apple Developer account ($99/year)
- EAS manages certificates automatically
- Builds for TestFlight and App Store

### Over-The-Air (OTA) Updates

For JavaScript-only changes (no native code):

```bash
# Update development channel
eas update --branch development --message "Bug fixes"

# Update production
eas update --branch production --message "v1.0.1"
```

Users get updates automatically on next app launch - no store submission needed!

### Build Commands

```bash
# Preview builds (for testing)
npm run build:android:preview    # Android APK
npm run build:ios:preview        # iOS TestFlight
npm run build:all:preview        # Both platforms

# Production builds (for stores)
npm run build:android            # Android APK
npm run build:ios                # iOS IPA
npm run build:all                # Both platforms

# Android App Bundle (required for Play Store)
eas build --platform android --profile production-aab

# Check build status
eas build:list
eas build:view
```

### Documentation

- **[EAS_BUILD_GUIDE.md](EAS_BUILD_GUIDE.md)** - Complete guide (500+ lines)
- **[EAS_QUICK_REFERENCE.txt](EAS_QUICK_REFERENCE.txt)** - Command cheat sheet
- **[EAS_SETUP_SUMMARY.md](EAS_SETUP_SUMMARY.md)** - Setup checklist
- **[EMULATOR_SETUP.md](EMULATOR_SETUP.md)** - Local development setup

### Store Submission

**Google Play Store:**
1. Create Google Play Developer account ($25 one-time)
2. Create app in Play Console
3. Generate service account key
4. Build AAB: `eas build -p android --profile production-aab`
5. Submit: `npm run submit:android`

**Apple App Store:**
1. Create app in App Store Connect
2. Get API key or use Apple ID
3. Build IPA: `npm run build:ios`
4. Submit: `npm run submit:ios`
5. Fill app information and screenshots
6. Submit for review

## 🔮 Advanced Features

### Custom Hooks
```typescript
// hooks/useApi.ts - Type-safe API calls
const { data, loading, error } = useApi<User[]>('/users');

// hooks/useLanguage.ts - Language management
const { t, currentLanguage, changeLanguage } = useLanguage();
```

### Context Providers
```typescript
// Global state management
<LanguageProvider>
  <ApiProvider>
    <App />
  </ApiProvider>
</LanguageProvider>
```

### Type-Safe Navigation
```typescript
import { useRouter } from 'expo-router';

const router = useRouter();
router.push('/profile'); // Type-checked routes
```

## 🚀 Deployment

### Production Checklist

Before deploying to production:

- [ ] Update version numbers in [app.json](app.json)
  - `version`: "1.0.0" → "1.0.1"
  - `ios.buildNumber`: "1" → "2"
  - `android.versionCode`: 1 → 2

- [ ] Update app name and identifiers
  - `name`: "Idrissimart"
  - `slug`: "idrissimart-app"
  - `owner`: Your Expo username

- [ ] Configure bundle identifiers
  - iOS: `com.idrissimart.app`
  - Android: `com.idrissimart.app`

- [ ] Set production API URL
  - Verify `https://idrissimart.com/api` is accessible
  - Test all endpoints in production

- [ ] Prepare store assets
  - App icon (1024x1024)
  - Screenshots (various device sizes)
  - Privacy policy URL
  - Support URL
  - App description and keywords

- [ ] Test on physical devices
  - iOS device with TestFlight
  - Android device with APK

### Build & Submit Workflow

**Step 1: Build Preview**
```bash
# Test the build process first
npm run build:android:preview
npm run build:ios:preview

# Install and test on devices
# iOS: Use TestFlight
# Android: Install APK directly
```

**Step 2: Production Build**
```bash
# Build for stores
npm run build:android  # Or production-aab for Play Store
npm run build:ios

# Wait for builds to complete (15-30 minutes)
eas build:list
```

**Step 3: Submit to Stores**
```bash
# Android (Google Play)
npm run submit:android

# iOS (App Store)
npm run submit:ios
```

**Step 4: OTA Updates**
```bash
# For quick fixes without store submission
eas update --branch production --message "Bug fixes"
```

### Environment Variables

For sensitive data, use EAS Secrets:

```bash
# Set secret
eas secret:create --scope project --name API_KEY --value "your-key"

# Use in code
import Constants from 'expo-constants';

const apiKey = Constants.expoConfig?.extra?.API_KEY;
```

### Monitoring & Analytics

**Error Tracking** (Add Sentry integration)
```bash
npm install @sentry/react-native
```

**Analytics** (Add Firebase or Amplitude)
```bash
# Track user events
analytics.track('ad_viewed', { adId: 123, category: 'Electronics' });
analytics.track('purchase_completed', { amount: 99.99 });
```

### Post-Deployment

1. **Monitor crash reports** in App Store Connect / Play Console
2. **Track user feedback** and ratings
3. **Plan updates** based on user requests
4. **Use OTA updates** for quick fixes
5. **Submit new versions** for major features

## 🤝 Contributing

### Development Workflow
1. **Type Safety**: Ensure all new code has proper TypeScript types
2. **Testing**: Add tests for new features
3. **Localization**: Add translations for new text
4. **Code Style**: Follow existing patterns and ESLint rules

### Code Quality
- **TypeScript**: Strict type checking enabled
- **ESLint**: Consistent code formatting
- **Prettier**: Automatic code formatting

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ using React Native, TypeScript, and Expo Router

2. **Install dependencies**
```bash
npm install
```

3. **Install iOS dependencies** (iOS only)
```bash
cd ios && pod install && cd ..
```

### Running the Application

#### Development Mode
```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

#### Production Build
```bash
# Android APK
npm run build:android

# iOS Release
npm run build:ios
```

## 🌐 API Integration

### Current Setup
The app uses JSONPlaceholder API for demonstration:
- **Base URL**: `https://jsonplaceholder.typicode.com`
- **Sample Endpoint**: `/posts/1`

### Customizing API

1. **Update Base URL**
```javascript
const apiService = {
  baseURL: 'https://your-api-domain.com/api/v1',
  // ... rest of the service
};
```

2. **Add Authentication**
```javascript
async get(endpoint, token) {
  const response = await fetch(`${this.baseURL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  // ... rest of the method
}
```

3. **Environment Configuration**
Create environment-specific configs:
```javascript
const config = {
  development: {
    baseURL: 'https://dev-api.yourapp.com',
  },
  production: {
    baseURL: 'https://api.yourapp.com',
  },
};
```

## 🌍 Internationalization (i18n)

### Current Languages
- **English (en)**: Default language
- **Arabic (ar)**: RTL support included

### Adding New Languages

1. **Add translations**
```javascript
const translations = {
  en: { /* existing */ },
  ar: { /* existing */ },
  fr: {
    welcome: 'Bienvenue dans MyApp',
    // ... other translations
  },
};
```

2. **Update language switching logic**
```javascript
const changeLanguage = async () => {
  const languages = ['en', 'ar', 'fr'];
  const currentIndex = languages.indexOf(currentLanguage);
  const nextLanguage = languages[(currentIndex + 1) % languages.length];
  // ... rest of the logic
};
```

### RTL Support
The app automatically handles RTL layout for Arabic:
- Text alignment changes to right
- Layout direction switches to RTL
- Proper text rendering for Arabic script

## 📦 Building for Distribution

### Android

1. **Generate signed APK**
```bash
cd android
./gradlew assembleRelease
```

2. **APK location**: `android/app/build/outputs/apk/release/app-release.apk`

### iOS

1. **Archive in Xcode**
   - Open `ios/MyMultiLangApp.xcworkspace`
   - Product → Archive
   - Distribute App

## 🔧 Customization

### Styling
- All styles are in `StyleSheet.create()` objects
- Easy to customize colors, fonts, and layouts
- Responsive design patterns included

### Adding New Features
1. Create new components in separate files
2. Import and use in `App.js`
3. Follow the existing patterns for state management

### Environment Variables
For sensitive data like API keys:
1. Install `react-native-config`
2. Create `.env` files
3. Access via `Config.API_KEY`

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## 🚀 Deployment

### Play Store (Android)
1. Build signed APK/AAB
2. Upload to Google Play Console
3. Follow Play Store guidelines

### App Store (iOS)
1. Archive in Xcode
2. Upload to App Store Connect
3. Submit for review

## 📱 App Features Walkthrough

1. **Home Screen**: Displays welcome message in current language
2. **Language Toggle**: Button to switch between Arabic and English
3. **API Demo**: Button to fetch sample data from API
4. **Data Display**: Shows fetched data with proper formatting
5. **Loading States**: Visual feedback during API calls
6. **Error Handling**: User-friendly error messages

## 🔮 Future Enhancements

- **Navigation**: Add React Navigation for multiple screens
- **State Management**: Implement Redux or Context API for complex state
- **Offline Support**: Add offline data caching
- **Push Notifications**: Firebase Cloud Messaging integration
- **Analytics**: User behavior tracking
- **Testing**: Unit and integration tests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For questions or issues:
- Create an issue in the repository
- Check existing documentation
- Review React Native official docs

---

Built with ❤️ using React Native