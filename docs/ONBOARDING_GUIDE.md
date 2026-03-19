# Onboarding Screen Implementation

A first-time user experience flow that introduces users to the Idrissimart app features.

## 📁 Files Created

- **`contexts/OnboardingContext.tsx`** - Context for managing onboarding state
- **`components/onboarding/OnboardingScreen.tsx`** - Main onboarding UI with slides
- **`components/onboarding/OnboardingWrapper.tsx`** - Wrapper to show onboarding or main app
- **`components/onboarding/index.ts`** - Barrel export file

## ✨ Features

✅ **5 Informative Slides**
- Welcome to Idrissimart
- Buy & Sell Easily
- Chat Directly
- Stay Informed
- Safe & Secure

✅ **Smooth UX**
- Horizontal scrolling with pagination
- Animated dot indicators
- Skip button (appears on first 4 slides)
- "Get Started" button on final slide
- Automatic state persistence with AsyncStorage

✅ **Your Brand Colors**
- Uses your custom purple (#4b315e) and orange (#ff6001) theme
- App logo from assets/logos/logo.png
- Consistent with app design system

## 🎨 Onboarding Slides

Each slide includes:
- Large emoji icon with colored background
- Title
- Description text
- Auto-calculated current position indicators

## 🔧 How It Works

1. **First Launch**: User sees onboarding screens
2. **User Interaction**: Can skip or navigate through slides
3. **Completion**: When user clicks "Get Started" or "Skip", state is saved to AsyncStorage
4. **Subsequent Launches**: Onboarding is automatically skipped

## 💾 State Management

The onboarding state is tracked using:
```typescript
AsyncStorage key: '@app/has_seen_onboarding'
Value: 'true' (after completion)
```

## 🎯 Usage

### In Your Components

Access onboarding utilities anywhere in your app:

```typescript
import { useOnboarding } from '@/contexts/OnboardingContext';

function SettingsScreen() {
  const { resetOnboarding, hasSeenOnboarding } = useOnboarding();

  const handleResetOnboarding = async () => {
    await resetOnboarding();
    // Optionally restart app or navigate
  };

  return (
    <View>
      <Text>Has seen onboarding: {hasSeenOnboarding ? 'Yes' : 'No'}</Text>
      <Button title="Reset Onboarding" onPress={handleResetOnboarding} />
    </View>
  );
}
```

### Available Methods

```typescript
interface OnboardingContextType {
  hasSeenOnboarding: boolean;              // Current onboarding status
  setHasSeenOnboarding: (value: boolean) => void;  // Manual state update
  isLoading: boolean;                      // Loading status from AsyncStorage
  completeOnboarding: () => Promise<void>; // Mark onboarding as complete
  resetOnboarding: () => Promise<void>;    // Clear onboarding state (for testing)
}
```

## 🧪 Testing During Development

### Reset Onboarding (Method 1 - Recommended)
Add a debug button in your app that calls:
```typescript
import { useOnboarding } from '@/contexts/OnboardingContext';

const { resetOnboarding } = useOnboarding();
await resetOnboarding();
// Then reload the app
```

### Reset Onboarding (Method 2 - Manual)
Clear AsyncStorage from dev tools or terminal:
```bash
# In Expo dev tools, shake device and choose "Clear AsyncStorage"
# Or use the React Native Debugger
```

### Reset Onboarding (Method 3 - Code)
Temporarily set in OnboardingContext.tsx:
```typescript
// For testing only - remember to remove!
const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
```

## 📱 Platform Compatibility

✅ iOS - Full support
✅ Android - Full support
✅ Responsive design - Adapts to all screen sizes

## 🎨 Customization

### Modify Slides

Edit the `SLIDES` array in [components/onboarding/OnboardingScreen.tsx](components/onboarding/OnboardingScreen.tsx):

```typescript
const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Your Title',
    description: 'Your description',
    icon: '🎉', // Any emoji
    color: Colors.light.primary, // Any color
  },
  // Add more slides...
];
```

### Change Styling

Modify styles in [components/onboarding/OnboardingScreen.tsx](components/onboarding/OnboardingScreen.tsx):
- `styles.title` - Slide title styling
- `styles.description` - Description text styling
- `styles.nextButton` - Button appearance
- `styles.iconContainer` - Icon background

### Skip Feature

To remove the skip button, comment out this section in [OnboardingScreen.tsx](components/onboarding/OnboardingScreen.tsx):
```typescript
{/* Skip Button */}
{currentIndex < SLIDES.length - 1 && (
  <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
    <Text style={styles.skipText}>Skip</Text>
  </TouchableOpacity>
)}
```

## 🔗 Integration

The onboarding is automatically integrated into your app through [app/_layout.tsx](app/_layout.tsx):

```typescript
<OnboardingProvider>
  <OnboardingWrapper>
    {/* Your main app */}
  </OnboardingWrapper>
</OnboardingProvider>
```

## 🚀 Next Steps

Consider adding:
- [ ] Swipe gestures for navigation
- [ ] Video content in slides
- [ ] Permission requests (camera, notifications, location)
- [ ] Account creation flow after onboarding
- [ ] A/B testing different onboarding flows
- [ ] Analytics tracking for slide completion rates

## 🐛 Troubleshooting

**Onboarding shows every time:**
- Check AsyncStorage is working: `AsyncStorage.getItem('@app/has_seen_onboarding')`
- Ensure `completeOnboarding()` is called when user completes flow

**Logo not showing:**
- Verify `assets/logos/logo.png` exists
- Check the require path in OnboardingScreen.tsx

**TypeScript errors:**
- Run `npm install` to ensure all dependencies are installed
- The JSX errors should auto-resolve after file save

## 📦 Dependencies Used

- `@react-native-async-storage/async-storage` - State persistence
- `react-native` - UI components (FlatList, TouchableOpacity, etc.)
- Your existing color constants from `@/constants/Colors`

---

**Ready to launch!** 🎉 Your users will now see a beautiful onboarding experience on their first app launch.
