# API Environment Configuration

This document explains how API URLs are configured for different environments in the Idrissimart app.

## 🌍 Environments

The app automatically switches between environments based on the build mode:

### Development (Local)
- **iOS Simulator**: `http://localhost:5454/api`
- **Android Emulator**: `http://10.0.2.2:5454/api`
- **Physical Device**: Update to your computer's IP address (e.g., `http://192.168.1.100:5454/api`)

### Production
- **URL**: `https://idrissimart.com/api`

## 🔧 Configuration Files

### `/config/api.config.ts`
Main API configuration with automatic environment detection:

```typescript
export const API_CONFIG = {
  BASE_URL: getBaseURL(), // Automatically selects based on __DEV__
  LOCAL_URL: 'http://localhost:5454/api',
  PRODUCTION_URL: 'https://idrissimart.com/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  IS_DEV: __DEV__,
};
```

### `/config/environment.ts`
Advanced environment configuration with platform-specific settings.

## 📱 Platform Notes

### Android Emulator
Android emulators cannot use `localhost` or `127.0.0.1` to access the host machine. Use:
- `10.0.2.2` - Points to the host machine's localhost

### iOS Simulator
iOS simulators can use `localhost` directly.

### Physical Devices
When testing on physical devices, update the local URL to your computer's IP address:

1. Find your computer's IP address:
   - **Mac**: System Preferences → Network
   - **Windows**: `ipconfig` in Command Prompt
   - **Linux**: `ifconfig` or `ip addr`

2. Update the URL in `api.config.ts`:
   ```typescript
   LOCAL: 'http://192.168.1.100:5454/api' // Replace with your IP
   ```

3. Make sure your phone and computer are on the same Wi-Fi network.

## 🚀 How It Works

The app uses React Native's `__DEV__` flag to determine the environment:
- `__DEV__ === true` → Development mode → Uses local API
- `__DEV__ === false` → Production mode → Uses production API

### Example Usage

```typescript
import { API_CONFIG } from '@/config/api.config';

console.log(API_CONFIG.BASE_URL);
// Development: http://localhost:5454/api (or 10.0.2.2 on Android)
// Production: https://idrissimart.com/api
```

## 🛠️ Manual Override

If you need to test against a different URL (e.g., staging server), you can manually override:

```typescript
import { setApiBaseURL } from '@/config/api.config';

// Override for testing
setApiBaseURL('https://staging.idrissimart.com/api');
```

## 🔍 Debugging

The app logs the current API configuration on startup. Check your console:

**Development:**
```
🔧 API Configuration: {
  environment: 'DEVELOPMENT',
  platform: 'ios',
  baseURL: 'http://localhost:5454/api'
}
```

**Production:**
```
🚀 API Configuration: {
  environment: 'PRODUCTION',
  baseURL: 'https://idrissimart.com/api'
}
```

## 🏗️ Build Modes

### Development Build
```bash
# Runs in development mode (__DEV__ = true)
npm start
npx expo start
```

### Production Build
```bash
# Creates production build (__DEV__ = false)
eas build --platform ios --profile production
eas build --platform android --profile production
```

## 🔐 Backend Setup

Make sure your local backend is running on port 5454:

```bash
# Django
python manage.py runserver 5454

# Or with specific host binding
python manage.py runserver 0.0.0.0:5454
```

## ⚠️ Important Notes

1. **CORS Settings**: Make sure your local backend allows requests from your device's IP
2. **HTTPS**: Production API should use HTTPS
3. **SSL Certificates**: For production, ensure valid SSL certificates
4. **Firewall**: Check firewall settings if connection fails on physical devices

## 📋 Checklist for Physical Device Testing

- [ ] Backend running on `0.0.0.0:5454`
- [ ] Phone and computer on same Wi-Fi network
- [ ] Updated LOCAL_URL to computer's IP address
- [ ] Backend CORS configured to allow device IP
- [ ] Firewall allows connections on port 5454

## 🆘 Troubleshooting

### "Network request failed" on Android Emulator
- Use `10.0.2.2` instead of `localhost`

### "Network request failed" on Physical Device
- Verify IP address is correct
- Check Wi-Fi connection
- Verify backend is running on `0.0.0.0:5454`
- Check firewall settings

### "Connection refused"
- Ensure backend server is running
- Verify port number (5454)
- Check if another service is using port 5454

### CORS errors
- Add device IP to backend CORS allowed origins
- For Django: Update `CORS_ALLOWED_ORIGINS` in settings

```python
# Django settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5454",
    "http://10.0.2.2:5454",
    "http://192.168.1.100:5454",  # Your computer's IP
]
```

## 📚 Related Files

- `/config/api.config.ts` - Main API configuration
- `/config/environment.ts` - Environment utilities
- `/services/apiClient.ts` - Axios client using API_CONFIG
- `/store/slices/*` - Redux slices using API endpoints

---

**Need help?** Check the main [REDUX_API_GUIDE.md](../REDUX_API_GUIDE.md) for complete API usage documentation.
