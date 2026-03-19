# EAS Configuration Summary

## ✅ What Has Been Configured

### 1. EAS Build Configuration
- **File**: [eas.json](eas.json)
- **Build Profiles**: 4 profiles configured
  - `development` - Internal testing with dev tools
  - `preview` - QA and stakeholder distribution
  - `production` - Production builds for stores
  - `production-aab` - Android App Bundle for Play Store

### 2. App Configuration
- **File**: [app.json](app.json)
- **Updates**:
  - App name: "Idrissimart"
  - Slug: "idrissimart-app"
  - Bundle IDs configured:
    - iOS: `com.idrissimart.app`
    - Android: `com.idrissimart.app`
  - Permissions configured for camera, location, storage
  - Splash screen with brand colors
  - Asset bundle patterns set

### 3. NPM Scripts
- **File**: [package.json](package.json)
- **Build Commands**:
  ```bash
  npm run build:android         # Production Android
  npm run build:ios             # Production iOS
  npm run build:all             # Both platforms
  npm run build:android:preview # Preview Android
  npm run build:ios:preview     # Preview iOS
  npm run build:android:dev     # Development Android
  npm run build:ios:dev         # Development iOS
  npm run submit:android        # Submit to Play Store
  npm run submit:ios            # Submit to App Store
  ```

### 4. Documentation Created
- [EAS_BUILD_GUIDE.md](EAS_BUILD_GUIDE.md) - Complete guide (500+ lines)
- [EAS_QUICK_REFERENCE.txt](EAS_QUICK_REFERENCE.txt) - Quick command reference
- [eas_preflight_check.sh](eas_preflight_check.sh) - Pre-build validation script

### 5. Security
- **File**: [.gitignore](.gitignore)
- **Added**:
  - `google-service-account.json`
  - `*.keystore`, `*.jks`
  - `apple-*.json`
  - `AuthKey_*.p8`
  - Other credential files

## 🚀 Next Steps

### Before Your First Build

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Initialize EAS Project**
   ```bash
   eas init
   ```
   This will:
   - Create a project in your Expo account
   - Generate a unique project ID
   - Update `app.json` automatically

4. **Update app.json**
   Replace these placeholders:
   - `"owner": "your-expo-account-name"` → Your Expo username
   - `"projectId": "YOUR_PROJECT_ID_HERE"` → Auto-filled by `eas init`

5. **Run Pre-flight Check**
   ```bash
   ./eas_preflight_check.sh
   ```
   This validates your configuration before building.

### First Build (Development)

```bash
# Build for testing on devices
npm run build:android:dev
npm run build:ios:dev
```

### First Build (Preview - QA)

```bash
# Build preview for internal distribution
npm run build:android:preview
npm run build:ios:preview
```

### Production Build

```bash
# Build for app stores
npm run build:android
npm run build:ios

# Or both at once
npm run build:all
```

## 📱 Platform-Specific Setup

### Android

**For First Build:**
- EAS will ask: "Generate a new Android Keystore?"
- Answer: **Yes**
- EAS will handle everything automatically

**For Google Play Store:**
1. Create Google Play Developer account ($25 one-time)
2. Create app in Play Console
3. Set up service account (see [EAS_BUILD_GUIDE.md](EAS_BUILD_GUIDE.md))
4. Download `google-service-account.json`
5. Update `eas.json` with correct path

### iOS

**For First Build:**
- You'll need an Apple Developer account ($99/year)
- EAS will guide you through certificate setup
- Choose "Automatic" for easiest setup

**For App Store:**
1. Create app in App Store Connect
2. Get API key or use Apple ID credentials
3. Update `eas.json` with your details

## 🔧 Build Profile Details

### Development Profile
```json
{
  "developmentClient": true,
  "distribution": "internal",
  "ios": {
    "simulator": true,
    "bundleIdentifier": "com.idrissimart.app.dev"
  },
  "android": {
    "buildType": "apk"
  }
}
```
- **Purpose**: Testing on devices/simulators
- **iOS**: Runs on simulator
- **Android**: APK output
- **Credentials**: Not required

### Preview Profile
```json
{
  "distribution": "internal",
  "ios": {
    "bundleIdentifier": "com.idrissimart.app.preview"
  },
  "android": {
    "buildType": "apk"
  }
}
```
- **Purpose**: QA, stakeholder testing
- **iOS**: TestFlight distribution
- **Android**: APK for direct install
- **Credentials**: Required

### Production Profile
```json
{
  "ios": {
    "bundleIdentifier": "com.idrissimart.app"
  },
  "android": {
    "buildType": "apk"
  }
}
```
- **Purpose**: App Store / Play Store
- **iOS**: IPA for App Store
- **Android**: APK or AAB
- **Credentials**: Required

## 📊 Build Process Timeline

1. **Queue Time**: 0-5 minutes (depends on plan and traffic)
2. **Build Time**:
   - Android: 10-20 minutes
   - iOS: 15-30 minutes
3. **Download**: Available immediately after completion

**First build is slower** - Subsequent builds are cached and faster.

## 💡 Tips & Best Practices

### 1. Use Preview Builds for Testing
```bash
# Don't waste time on production builds for testing
npm run build:android:preview
npm run build:ios:preview
```

### 2. OTA Updates for Quick Fixes
For JavaScript-only changes (no native code):
```bash
eas update --branch production --message "Bug fix"
```
Users get updates on next app restart - no store submission needed!

### 3. Version Management
Update version in `app.json`:
```json
{
  "expo": {
    "version": "1.0.1",  // Increment this
    "ios": {
      "buildNumber": "2"  // Increment this
    },
    "android": {
      "versionCode": 2    // Increment this
    }
  }
}
```

### 4. Monitor Builds
```bash
# View all builds
eas build:list

# View specific build
eas build:view [BUILD_ID]

# Watch build in progress
eas build:view --latest
```

## 🐛 Common Issues & Solutions

### "Project not found"
```bash
# Reinitialize
eas init
```

### "Owner field required"
Update `app.json`:
```json
{
  "expo": {
    "owner": "your-expo-username"
  }
}
```

### "Bundle identifier already exists"
iOS bundle IDs must be unique. Change in `app.json`:
```json
{
  "ios": {
    "bundleIdentifier": "com.yourcompany.yourapp"
  }
}
```

### Build fails with dependency errors
```bash
# Clear and reinstall
rm -rf node_modules
npm install
```

## 📚 Documentation References

### In This Project
- [EAS_BUILD_GUIDE.md](EAS_BUILD_GUIDE.md) - Complete guide with examples
- [EAS_QUICK_REFERENCE.txt](EAS_QUICK_REFERENCE.txt) - Command cheat sheet
- [EMULATOR_SETUP.md](EMULATOR_SETUP.md) - Local development setup
- [REDUX_API_GUIDE.md](REDUX_API_GUIDE.md) - API integration

### Official Docs
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [EAS Submit Docs](https://docs.expo.dev/submit/introduction/)
- [EAS Update Docs](https://docs.expo.dev/eas-update/introduction/)

## ✅ Verification Checklist

Before building, ensure:

- [ ] EAS CLI installed globally
- [ ] Logged in to Expo (`eas whoami`)
- [ ] Project initialized (`eas init`)
- [ ] `app.json` has correct owner field
- [ ] `app.json` has project ID
- [ ] Bundle identifiers are unique
- [ ] `eas.json` exists with build profiles
- [ ] Dependencies installed (`npm install`)
- [ ] No TypeScript errors (`npm run build:web` to verify)
- [ ] Pre-flight check passes (`./eas_preflight_check.sh`)

## 🎉 Ready to Build!

You're all set! Start with a preview build to test:

```bash
# Test the build process
npm run build:android:preview

# Once successful, try production
npm run build:android
```

Good luck! 🚀
