# Home Screen Implementation Guide

## Overview

The Idrissimart home screen is a modern, fully-featured marketplace homepage that displays dynamic content from the backend API. It includes hero sections, sliders, statistics, categories, featured ads, latest ads, and blog posts.

## Architecture

### Components Structure

```
components/home/
├── index.ts                 # Barrel export for all components
├── HeroSection.tsx          # Hero banner with CTA
├── SliderSection.tsx        # Image slider/carousel
├── StatsSection.tsx        # Statistics grid (4 stats)
├── WhyChooseSection.tsx    # Features grid
├── CategoriesSection.tsx   # Category browser
├── AdsSection.tsx          # Reusable ads display (latest/featured)
└── BlogsSection.tsx        # Latest blog posts
```

### Main Screen

- **File**: `app/(tabs)/index.tsx`
- **Fetches**: Single API call to `/api/home/`
- **Features**:
  - Pull-to-refresh
  - Loading state with spinner
  - Error handling with retry
  - Conditional rendering based on API flags

## API Integration

### Endpoint

```
GET /api/home/
```

### Query Parameters

| Parameter            | Type   | Default | Description                          |
|----------------------|--------|---------|--------------------------------------|
| `country`            | string | EG      | Country code to filter content       |
| `latest_ads_limit`   | int    | 20      | Max number of latest ads             |
| `featured_ads_limit` | int    | 20      | Max number of featured ads           |
| `blogs_limit`        | int    | 10      | Max number of blog posts             |

### Response Structure

```typescript
{
  home_page: HomePage;           // Hero, stats, settings
  sliders: Slider[];             // Carousel items
  categories_by_section: CategorySection[];
  latest_ads: Ad[];
  featured_ads: Ad[];
  latest_blogs: BlogPost[];
}
```

### API Service Method

```typescript
import { api } from '@/services/api';

// Fetch home data
api.getHomeData(country, latest_ads_limit, featured_ads_limit, blogs_limit);
```

## Component Features

### 1. HeroSection

**Props:**
- `data: HomePage` - Hero configuration from API
- `onButtonPress?: () => void` - CTA button handler

**Features:**
- Gradient or image background
- Overlay for text readability
- Bilingual support (EN/AR)
- Responsive text sizing

### 2. SliderSection

**Props:**
- `sliders: Slider[]` - Array of slider items
- `onSlidePress?: (slider: Slider) => void` - Slide tap handler

**Features:**
- Horizontal scrolling carousel
- Pagination dots
- Auto-sizing based on screen width
- Custom background/text colors per slide

### 3. StatsSection

**Props:**
- `data: HomePage` - Contains stat values and labels

**Features:**
- 2x2 grid layout
- FontAwesome icon support
- Animated numbers (value+)
- Bilingual labels

### 4. WhyChooseSection

**Props:**
- `data: HomePage` - Features list

**Features:**
- Dynamic feature cards
- Icon support (FontAwesome)
- Order-based sorting
- Active/inactive filtering

### 5. CategoriesSection

**Props:**
- `sections: CategorySection[]` - Categories grouped by type
- `showTitle?: boolean` - Show section header
- `onCategoryPress?: (id: number) => void` - Category tap handler

**Features:**
- Horizontal scrolling per section
- Category images or icon placeholders
- Ad count display
- Multiple section types support

### 6. AdsSection

**Props:**
- `title: string` - Section title
- `ads: Ad[]` - Ads to display
- `onAdPress?: (ad: Ad) => void` - Ad tap handler
- `onViewAll?: () => void` - "View All" handler

**Features:**
- Horizontal scrolling
- Featured/Urgent badges
- Favorite button
- Price with negotiable indicator
- Category and location info
- View count

### 7. BlogsSection

**Props:**
- `blogs: BlogPost[]` - Blog posts
- `onBlogPress?: (blog: BlogPost) => void` - Blog tap handler
- `onViewAll?: () => void` - "View All" handler

**Features:**
- Horizontal scrolling
- Category badge with custom color
- Author info with avatar
- Published date formatting
- Like and view counts

## Styling & Theme

All components use the centralized theme system:

```typescript
import { useTheme } from '@/contexts/ThemeContext';
const { colors } = useTheme();
```

**Theme Colors:**
- `primary`: `#4b315e` (Purple)
- `secondary`: `#ff6001` (Orange)
- `background`: `#f5f7fa` (Light gray)
- `surface`: `#f5f5f5` (Card background)
- `text`: Dynamic based on theme mode
- `fontSecondary`: Muted text color

## Internationalization

All text supports English/Arabic:

```typescript
import { useLanguage } from '@/contexts/LanguageContext';
const { language, t } = useLanguage();
const isArabic = language === 'ar';

const title = isArabic ? data.hero_title_ar : data.hero_title;
```

## Usage Example

```typescript
import { useApi } from '@/hooks/useApi';
import { api } from '@/services/api';
import { HeroSection, AdsSection } from '@/components/home';

export default function HomeScreen() {
  const { data, loading, error, refetch } = useApi(
    () => api.getHomeData('EG', 20, 20, 10),
    []
  );

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}>
      {data?.home_page && <HeroSection data={data.home_page} />}
      {data?.latest_ads && <AdsSection title="Latest Ads" ads={data.latest_ads} />}
    </ScrollView>
  );
}
```

## Navigation Integration

To integrate navigation handlers:

```typescript
import { useRouter } from 'expo-router';

const router = useRouter();

<AdsSection
  ads={data.latest_ads}
  onAdPress={(ad) => router.push(`/ad/${ad.id}`)}
  onViewAll={() => router.push('/ads')}
/>

<BlogsSection
  blogs={data.latest_blogs}
  onBlogPress={(blog) => router.push(`/blog/${blog.slug}`)}
/>

<CategoriesSection
  sections={data.categories_by_section}
  onCategoryPress={(id) => router.push(`/category/${id}`)}
/>
```

## Performance Optimization

### Tips:
1. **Memoize callbacks** with `useCallback`
2. **Optimize images** with appropriate resizeMode
3. **Use horizontal list virtualization** for many items
4. **Implement image lazy loading** for off-screen content
5. **Cache API responses** with React Query or SWR

### Example with useCallback:

```typescript
const handleAdPress = useCallback((ad: Ad) => {
  router.push(`/ad/${ad.id}`);
}, [router]);

<AdsSection ads={data.latest_ads} onAdPress={handleAdPress} />
```

## Customization

### Changing Colors

Edit `constants/Colors.ts`:

```typescript
export const Colors = {
  light: {
    primary: '#your-color',
    secondary: '#your-color',
    // ...
  }
};
```

### Modifying Layout

Each component's styles are self-contained in their StyleSheet:

```typescript
// In HeroSection.tsx
const styles = StyleSheet.create({
  container: {
    height: 320, // Change hero height
  },
  // ...
});
```

### Adding New Sections

1. Create component in `components/home/`
2. Export from `components/home/index.ts`
3. Import and use in `app/(tabs)/index.tsx`

## Testing

### Manual Testing Checklist

- [ ] Hero CTA button navigates correctly
- [ ] Sliders swipe smoothly with pagination
- [ ] Stats display correct values
- [ ] Category images load and are tappable
- [ ] Ads show badges (featured/urgent) correctly
- [ ] Favorite button toggles state
- [ ] Pull-to-refresh works
- [ ] Loading state shows spinner
- [ ] Error state shows retry option
- [ ] Arabic text displays with RTL layout
- [ ] Navigation handlers work for all sections

### Backend Requirements

Ensure your Django backend serves the `/api/home/` endpoint with the correct structure. Reference the API documentation provided for the exact response format.

## Troubleshooting

### Images not loading
- Check CORS headers on your backend
- Verify image URLs are absolute (include domain)
- Check network inspector for 404s

### API request fails
- Verify backend is running on correct port
- Check `config/environment.ts` has correct URLs
- For Android: Use `10.0.2.2` instead of `localhost`
- For iOS: Use `localhost` or your machine's IP

### Styles not applying
- Clear Expo cache: `npx expo start -c`
- Check theme context is properly wrapped in `_layout.tsx`

### RTL not working
- Ensure `LanguageContext` sets `I18nManager.forceRTL()`
- Restart app after language change for full RTL effect

## Next Steps

1. **Implement navigation** routes for ads, categories, blogs
2. **Add authentication** checks for favorite buttons
3. **Implement search** functionality in hero section
4. **Add filters** for categories and ads
5. **Optimize images** with progressive loading
6. **Add analytics** tracking for user interactions
7. **Implement caching** for offline support
8. **Add skeleton screens** for better loading UX

## Resources

- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [React Native Performance](https://reactnative.dev/docs/performance)
- [FontAwesome Icons](https://fontawesome.com/icons)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) for animations

---

**Created**: March 2026  
**Version**: 1.0  
**Status**: Production Ready
