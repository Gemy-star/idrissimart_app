# 🚀 EAS Build & Deployment Guide

Complete guide for building and deploying Idrissimart app using Expo Application Services (EAS).

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Build Profiles](#build-profiles)
- [Building](#building)
- [Submission to Stores](#submission-to-stores)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login to Expo Account
```bash
eas login
```

If you don't have an Expo account:
```bash
eas register
```

### 3. Configure Your Project

**Update app.json** with your Expo username:
```json
{
  "expo": {
    "owner": "your-expo-username"
  }
}
```

**Get your Project ID:**
```bash
eas init
```

This will:
- Create a project in your Expo account
- Generate a project ID
- Update `app.json` with the project ID

---

## ⚙️ Initial Setup

### 1. Configure EAS Project

```bash
# Initialize EAS in your project
eas init

# Configure your project
eas build:configure
```

### 2. Update Configuration Files

**app.json** - Update these fields:
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-actual-project-id"
      }
    },
    "owner": "your-expo-username"
  }
}
```

**eas.json** - Already configured with build profiles!

---

## 📱 Build Profiles

We have 4 build profiles configured in [eas.json](eas.json):

### 1. **Development** 
- For testing on devices/simulators
- Includes development tools
- No credentials required
- Creates simulator builds (iOS) or APK (Android)

```bash
npm run build:android:dev
npm run build:ios:dev
```

### 2. **Preview**
- Internal distribution
- For QA testing and stakeholders
- Real app experience without store submission
- Creates APK (Android) or IPA (iOS)

```bash
npm run build:android:preview
npm run build:ios:preview
```

### 3. **Production**
- Store-ready builds
- Optimized and signed
- APK for Android, IPA for iOS

```bash
npm run build:android
npm run build:ios
npm run build:all  # Both platforms
```

### 4. **Production AAB**
- Android App Bundle format
- Required for Google Play Store
- Smaller download size

```bash
eas build --platform android --profile production-aab
```

---

## 🏗️ Building

### Quick Build Commands

| Command | Description |
|---------|-------------|
| `npm run build:android` | Production Android APK |
| `npm run build:ios` | Production iOS IPA |
| `npm run build:all` | Both platforms (production) |
| `npm run build:android:preview` | Preview Android build |
| `npm run build:ios:preview` | Preview iOS build |
| `npm run build:android:dev` | Development Android build |
| `npm run build:ios:dev` | Development iOS build |

### Build Process

#### First-Time Android Build

```bash
# 1. Start the build
npm run build:android

# 2. EAS will ask: "Generate a new Android Keystore?"
#    Answer: Yes

# 3. Wait for build to complete (10-20 minutes)

# 4. Download the APK from the provided URL
```

#### First-Time iOS Build

```bash
# 1. Start the build
npm run build:ios

# 2. You'll need Apple Developer credentials
#    EAS will guide you through the process

# 3. Choose a provisioning profile:
#    - Automatic: EAS manages everything
#    - Manual: Use existing certificates

# 4. Wait for build to complete (15-30 minutes)
```

### Build Status

Check build status:
```bash
eas build:list

# Or view in browser
eas build:view
```

---

## 📦 Submission to Stores

### Google Play Store (Android)

#### Prerequisites
1. Create a Google Play Developer account ($25 one-time fee)
2. Create your app in Google Play Console
3. Generate a Google Service Account JSON key

#### Setup Service Account

1. Go to Google Play Console
2. Setup > API Access > Create Service Account
3. Grant permissions: Release Manager
4. Download JSON key
5. Save as `google-service-account.json` in project root
6. **Add to .gitignore!**

#### Submit to Play Store

```bash
# Build AAB (required for Play Store)
eas build --platform android --profile production-aab

# Submit
npm run submit:android

# Or manually
eas submit --platform android
```

**Update eas.json** with your service account:
```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"  // or "alpha", "beta", "production"
      }
    }
  }
}
```

### Apple App Store (iOS)

#### Prerequisites
1. Apple Developer account ($99/year)
2. App created in App Store Connect
3. App Store Connect API Key (recommended)

#### Setup

1. Go to App Store Connect
2. Create your app
3. Generate API Key:
   - Users and Access > Keys
   - Generate new key with Admin access
   - Download and save securely

#### Submit to App Store

```bash
# Build production IPA
npm run build:ios

# Submit
npm run submit:ios

# EAS will guide you through:
# - Selecting the build
# - Providing App Store credentials
# - Choosing submission options
```

**Update eas.json** with your Apple details:
```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDE12345"
      }
    }
  }
}
```

---

## 📱 Internal Distribution

### Android - Direct APK

After building preview/production:
```bash
# Get the download URL
eas build:list

# Share the APK link with testers
# They can install directly (enable "Unknown Sources")
```

### iOS - TestFlight

```bash
# Build with preview or production profile
npm run build:ios:preview

# Submit to TestFlight
eas submit --platform ios

# Add testers in App Store Connect
```

### Expo Updates (OTA)

For JavaScript-only changes (no native code):

```bash
# Install eas-update
npm install -g eas-update

# Publish update to development channel
eas update --branch development --message "Bug fixes"

# Publish to preview channel
eas update --branch preview --message "New features"

# Publish to production channel
eas update --branch production --message "v1.0.1 release"
```

Users will get updates automatically on next app restart!

---

## 🔐 Credentials Management

### View Credentials

```bash
# List all credentials
eas credentials

# Android
eas credentials -p android

# iOS
eas credentials -p ios
```

### Reset Credentials

If you need to regenerate:
```bash
# Android keystore
eas credentials -p android

# iOS certificates
eas credentials -p ios
```

---

## 🐛 Troubleshooting

### Build Failed

**Check build logs:**
```bash
eas build:view
```

**Common issues:**

1. **Missing dependencies**
   ```bash
   npm install
   rm -rf node_modules
   npm install
   ```

2. **Version conflicts**
   - Check package.json dependencies
   - Update to compatible versions

3. **Android build fails**
   - Verify `app.json` has correct `package` name
   - Check `android.permissions` array
   - Verify Gradle configuration

4. **iOS build fails**
   - Verify `bundleIdentifier` is unique
   - Check Apple Developer account status
   - Verify provisioning profiles

### Submission Failed

**Android:**
- Verify service account JSON is correct
- Check Google Play Console permissions
- Ensure version code is incremented

**iOS:**
- Verify Apple credentials
- Check App Store Connect app exists
- Ensure bundle ID matches

### Credentials Issues

**Android:**
```bash
# Remove and regenerate keystore
eas credentials -p android
# Choose "Remove Keystore" then rebuild
```

**iOS:**
```bash
# Clear credentials and regenerate
eas credentials -p ios
# Choose "Remove all credentials" then rebuild
```

### Build Timeout

If builds are taking too long:
```json
// eas.json
{
  "build": {
    "production": {
      "ios": {
        "resourceClass": "m-large"  // Upgrade resource class
      }
    }
  }
}
```

---

## 📊 Build Optimization

### Reduce Build Time

1. **Use caching:**
   ```json
   {
     "build": {
       "production": {
         "cache": {
           "key": "my-cache-key"
         }
       }
     }
   }
   ```

2. **Upgrade resource class:**
   - `m-medium` - Default (free tier)
   - `m-large` - Faster, costs credits
   - `m-xlarge` - Fastest, costs more credits

3. **Optimize dependencies:**
   ```bash
   # Remove unused packages
   npm prune
   
   # Update outdated packages
   npm update
   ```

### Reduce App Size

**Android:**
```json
// app.json
{
  "android": {
    "enableProguard": true,
    "enableShrinkResourcesInReleaseBuilds": true
  }
}
```

**iOS:**
```json
// app.json
{
  "ios": {
    "bitcode": false  // Reduces size
  }
}
```

---

## 🔄 CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/eas-build.yml`:

```yaml
name: EAS Build

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
          
      - name: Install dependencies
        run: npm install
        
      - name: Build Android
        run: eas build --platform android --non-interactive --profile preview
        
      - name: Build iOS
        run: eas build --platform ios --non-interactive --profile preview
```

---

## 📚 Additional Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [EAS Update Documentation](https://docs.expo.dev/eas-update/introduction/)
- [App Store Submission Guide](https://docs.expo.dev/submit/ios/)
- [Play Store Submission Guide](https://docs.expo.dev/submit/android/)

---

## 🎯 Quick Reference

```bash
# Setup
eas login
eas init
eas build:configure

# Build
eas build --platform android --profile production
eas build --platform ios --profile production
eas build --platform all

# Submit
eas submit --platform android
eas submit --platform ios

# Update (OTA)
eas update --branch production --message "Update message"

# Status
eas build:list
eas build:view

# Credentials
eas credentials
```

---

**🎉 You're ready to build and deploy your Idrissimart app to the world!**
