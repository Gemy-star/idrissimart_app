# 📱 Running on Android & iOS Emulators

Complete guide to run the Idrissimart app on both Android and iOS emulators.

## 🚀 Quick Start

### For iOS (macOS only)

```bash
# 1. Start iOS Simulator
npm run emulator:ios

# 2. Run the app (in a new terminal)
npm run ios
```

### For Android

```bash
# 1. Start Android Emulator
npm run emulator:android

# 2. Run the app (in a new terminal)
npm run android
```

---

## 📋 Prerequisites

### iOS Development (macOS only)

✅ **Install Xcode**
- Download from Mac App Store
- Open Xcode and accept license agreements
- Install Command Line Tools:
  ```bash
  xcode-select --install
  ```

✅ **Verify Installation**
```bash
xcrun simctl list devices
```

### Android Development (All Platforms)

✅ **Install Android Studio**
- Download from [developer.android.com](https://developer.android.com/studio)
- During installation, make sure these are checked:
  - Android SDK
  - Android SDK Platform
  - Android Virtual Device (AVD)

✅ **Set Environment Variables**

Add to your `~/.zshrc` or `~/.bash_profile`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Apply changes:
```bash
source ~/.zshrc  # or source ~/.bash_profile
```

✅ **Create an AVD (Android Virtual Device)**
1. Open Android Studio
2. Go to **Tools > Device Manager**
3. Click **Create Device**
4. Choose a phone (e.g., Pixel 6)
5. Download and select a system image (e.g., API 33/34)
6. Name it and finish

✅ **Verify Installation**
```bash
emulator -list-avds
```

---

## 🎯 Available NPM Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server (choose platform) |
| `npm run android` | Start on Android emulator |
| `npm run ios` | Start on iOS simulator |
| `npm run web` | Start in web browser |
| `npm run emulator:android` | Launch Android emulator |
| `npm run emulator:ios` | Launch iOS simulator |

---

## 🔧 Platform-Specific Configuration

### API URLs (Already Configured)

The app automatically uses the correct API URL for each platform:

**iOS Simulator:**
```
http://localhost:5454/api
```

**Android Emulator:**
```
http://10.0.2.2:5454/api
```

**Production:**
```
https://idrissimart.com/api
```

This is handled automatically in [config/api.config.ts](config/api.config.ts) using `Platform.select()`.

---

## 🐛 Troubleshooting

### iOS Issues

**❌ "xcrun: error: unable to find utility "simctl"**
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcode-select --install
```

**❌ Simulator opens but app doesn't install**
```bash
# Clear Expo cache
expo start -c

# Or clear Metro bundler cache
npm start -- --reset-cache
```

**❌ Network request failed**
- Make sure your Django backend is running on `http://localhost:5454`
- Check the console logs to see which API URL is being used

### Android Issues

**❌ "ANDROID_HOME is not set"**

Add to `~/.zshrc`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
```

Then restart terminal or run:
```bash
source ~/.zshrc
```

**❌ "No Android Virtual Devices found"**
1. Open Android Studio
2. Tools > Device Manager
3. Create a new Virtual Device
4. Select a device definition (e.g., Pixel 6)
5. Download a system image (API 33 recommended)

**❌ Emulator is slow**
In Android Studio AVD settings:
- Enable hardware acceleration (HAXM/KVM)
- Allocate more RAM (2048 MB minimum)
- Enable "Hardware - GLES 2.0" for graphics

**❌ "Connection to http://10.0.2.2:5454 failed"**
- Ensure your Django server is running on `0.0.0.0:5454` (not 127.0.0.1)
- Start Django with:
  ```bash
  python manage.py runserver 0.0.0.0:5454
  ```

**❌ App builds but crashes on launch**
```bash
# Clear all caches
cd android && ./gradlew clean && cd ..
expo start -c

# Rebuild
npm run android
```

### Both Platforms

**❌ Metro bundler issues**
```bash
# Kill all Node processes
killall node

# Clear watchman (if installed)
watchman watch-del-all

# Clear Expo cache and restart
expo start -c
```

**❌ "Unable to resolve module"**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Clear cache and restart
npm start -- --reset-cache
```

---

## 📱 Testing on Physical Devices

### iOS Physical Device

1. Connect your iPhone via USB
2. Trust your computer on the device
3. Run:
   ```bash
   npm run ios
   ```
4. In Xcode, select your device from the target dropdown
5. Update API URL in [config/api.config.ts](config/api.config.ts) to your computer's local IP:
   ```typescript
   const LOCAL_URL = Platform.select({
     android: 'http://10.0.2.2:5454/api',
     ios: __DEV__ ? 'http://192.168.1.X:5454/api' : 'http://localhost:5454/api',
   });
   ```

### Android Physical Device

1. Enable Developer Options on your Android device:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
2. Enable USB Debugging in Developer Options
3. Connect via USB and authorize the computer
4. Run:
   ```bash
   npm run android
   ```
5. Update API URL to your computer's local IP (see above)

**Find your local IP:**
```bash
# macOS/Linux
ifconfig | grep "inet "

# Look for something like: 192.168.1.X
```

---

## 🏗️ Building for Production

### Android APK

```bash
# Build APK
eas build --platform android

# Or use Expo's build service
expo build:android
```

### iOS IPA

```bash
# Build IPA (requires Mac and Apple Developer account)
eas build --platform ios

# Or use Expo's build service
expo build:ios
```

---

## 🎨 Development Workflow

**Recommended Setup:**

1. **Terminal 1:** Start your backend
   ```bash
   python manage.py runserver 0.0.0.0:5454
   ```

2. **Terminal 2:** Start the emulator
   ```bash
   npm run emulator:android
   # or
   npm run emulator:ios
   ```

3. **Terminal 3:** Start Expo dev server
   ```bash
   npm start
   # Then press 'a' for Android or 'i' for iOS
   ```

---

## 📚 Useful Commands

```bash
# List all iOS simulators
xcrun simctl list devices

# List all Android AVDs
emulator -list-avds

# Check if Android emulator is running
adb devices

# Restart ADB server (Android)
adb kill-server
adb start-server

# Open Simulator app (iOS)
open -a Simulator

# Reload app in emulator
# iOS: Cmd+R in simulator
# Android: Press 'r' in terminal or shake device (Ctrl+M)

# Open developer menu
# iOS: Cmd+D in simulator
# Android: Cmd+M (Mac) or Ctrl+M (Windows/Linux)
```

---

## ✅ Verification Checklist

Before starting development, verify:

- [ ] Xcode installed (for iOS)
- [ ] Android Studio installed (for Android)
- [ ] ANDROID_HOME environment variable set
- [ ] At least one iOS simulator available
- [ ] At least one Android AVD created
- [ ] Expo CLI working (`expo --version`)
- [ ] Backend server accessible at localhost:5454
- [ ] All npm dependencies installed (`npm install`)

---

## 🔗 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Setup](https://reactnative.dev/docs/environment-setup)
- [Android Studio Setup](https://developer.android.com/studio/install)
- [Xcode Setup](https://developer.apple.com/xcode/)

---

**🎉 You're all set! Start building amazing apps for iOS and Android!**
