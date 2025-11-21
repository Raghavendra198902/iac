# IAC Dharma Mobile App

Enterprise mobile application for iOS and Android platforms.

## Technology Stack

- **Framework**: React Native
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **API Client**: Axios
- **Authentication**: JWT + Biometric
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Offline Storage**: AsyncStorage + SQLite

## Features

### Core Features
- ✅ Dashboard with real-time infrastructure status
- ✅ Cost monitoring and alerts
- ✅ Resource inventory viewer
- ✅ Deployment status tracking
- ✅ Push notifications for critical events
- ✅ Biometric authentication
- ✅ Offline mode with sync

### Security Features
- ✅ JWT token management
- ✅ Biometric authentication (Face ID / Touch ID)
- ✅ Certificate pinning
- ✅ Secure storage for credentials
- ✅ Session timeout management

### User Roles
- Admin Dashboard
- Cloud Architect View
- Developer Tools
- FinOps Manager
- Security Officer

## Project Structure

```
mobile-app/
├── android/              # Android native code
├── ios/                  # iOS native code
├── src/
│   ├── api/             # API client and endpoints
│   ├── components/      # Reusable UI components
│   ├── navigation/      # Navigation configuration
│   ├── screens/         # Screen components
│   │   ├── Auth/       # Login, SSO
│   │   ├── Dashboard/  # Main dashboard
│   │   ├── Resources/  # Resource management
│   │   ├── Costs/      # Cost tracking
│   │   ├── Alerts/     # Notifications
│   │   └── Settings/   # App settings
│   ├── store/          # Redux store
│   ├── theme/          # Theming and styles
│   ├── types/          # TypeScript definitions
│   └── utils/          # Utility functions
├── App.tsx
├── package.json
└── tsconfig.json
```

## Setup Instructions

### Prerequisites
```bash
# Install Node.js 18+
node --version

# Install React Native CLI
npm install -g react-native-cli

# Install CocoaPods (for iOS)
sudo gem install cocoapods
```

### Initialize Project
```bash
# Create new React Native project
npx react-native init IACDharmaMobile --template react-native-template-typescript

cd IACDharmaMobile

# Install dependencies
npm install @react-navigation/native @react-navigation/stack
npm install @reduxjs/toolkit react-redux
npm install axios
npm install react-native-biometrics
npm install @react-native-firebase/app @react-native-firebase/messaging
npm install react-native-vector-icons
npm install @react-native-async-storage/async-storage
npm install react-native-keychain
```

### iOS Setup
```bash
cd ios
pod install
cd ..

# Run on iOS
npx react-native run-ios
```

### Android Setup
```bash
# Run on Android
npx react-native run-android
```

## API Integration

### Base Configuration
```typescript
// src/api/client.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://api.iac-dharma.com'; // Update in production

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Endpoints
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Get current user
- `GET /api/resources` - List infrastructure resources
- `GET /api/costs/summary` - Cost overview
- `GET /api/deployments` - Deployment status
- `GET /api/alerts` - Active alerts
- `POST /api/notifications/register` - Register FCM token

## Push Notifications

### Firebase Configuration
```javascript
// src/services/notifications.ts
import messaging from '@react-native-firebase/messaging';

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  return authStatus === messaging.AuthorizationStatus.AUTHORIZED;
}

export async function getFCMToken() {
  const token = await messaging().getToken();
  return token;
}

// Background message handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background message:', remoteMessage);
});
```

### Notification Types
- **Critical Alerts**: Deployment failures, security issues
- **Cost Alerts**: Budget threshold exceeded
- **Drift Detected**: Infrastructure drift notifications
- **Approval Required**: Manual approval requests

## Biometric Authentication

```typescript
// src/services/biometrics.ts
import ReactNativeBiometrics from 'react-native-biometrics';

export async function authenticateWithBiometrics() {
  const rnBiometrics = new ReactNativeBiometrics();
  
  const { available, biometryType } = await rnBiometrics.isSensorAvailable();
  
  if (available) {
    const { success } = await rnBiometrics.simplePrompt({
      promptMessage: 'Authenticate to access IAC Dharma'
    });
    return success;
  }
  
  return false;
}
```

## Offline Mode

```typescript
// src/store/offlineSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const offlineSlice = createSlice({
  name: 'offline',
  initialState: {
    isOnline: true,
    cachedData: {},
    syncQueue: []
  },
  reducers: {
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    cacheData: (state, action) => {
      state.cachedData = { ...state.cachedData, ...action.payload };
      AsyncStorage.setItem('cached_data', JSON.stringify(state.cachedData));
    },
    addToSyncQueue: (state, action) => {
      state.syncQueue.push(action.payload);
    }
  }
});
```

## Build & Release

### iOS Build
```bash
# Create archive
cd ios
xcodebuild -workspace IACDharmaMobile.xcworkspace \
  -scheme IACDharmaMobile \
  -configuration Release \
  -archivePath ./build/IACDharmaMobile.xcarchive \
  archive

# Upload to App Store Connect
xcodebuild -exportArchive \
  -archivePath ./build/IACDharmaMobile.xcarchive \
  -exportPath ./build \
  -exportOptionsPlist ExportOptions.plist
```

### Android Build
```bash
# Generate signed APK
cd android
./gradlew assembleRelease

# Generate signed AAB (for Play Store)
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests (Detox)
```bash
# Install Detox
npm install -g detox-cli
npm install --save-dev detox

# Run E2E tests
detox test --configuration ios.sim.debug
```

## App Store Submission

### iOS (App Store Connect)
1. Create app in App Store Connect
2. Upload build using Xcode or Application Loader
3. Fill app metadata, screenshots
4. Submit for review

### Android (Google Play Console)
1. Create app in Play Console
2. Upload AAB bundle
3. Complete store listing
4. Submit for review

## Performance Optimization

- **Code Splitting**: Lazy load screens
- **Image Optimization**: Use optimized image formats
- **API Caching**: Cache frequently accessed data
- **Bundle Size**: Analyze and reduce bundle size
- **Memory Management**: Profile and optimize memory usage

## Security Best Practices

- ✅ Certificate pinning for API calls
- ✅ Secure storage using Keychain (iOS) / Keystore (Android)
- ✅ No sensitive data in logs
- ✅ Encrypted local storage
- ✅ Session timeout after 15 minutes
- ✅ Biometric authentication required for sensitive actions

## Monitoring & Analytics

```typescript
// Integration with monitoring services
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

// Track screen views
await analytics().logScreenView({
  screen_name: 'Dashboard',
  screen_class: 'DashboardScreen'
});

// Track errors
crashlytics().recordError(error);
```

## Roadmap

- [ ] Phase 1: Core functionality (Q1 2024)
- [ ] Phase 2: Push notifications (Q2 2024)
- [ ] Phase 3: Offline mode (Q2 2024)
- [ ] Phase 4: Advanced features (Q3 2024)
- [ ] Phase 5: App Store release (Q4 2024)

## Support

For technical issues or questions:
- Email: mobile-support@iac-dharma.com
- Slack: #mobile-app-dev
- Documentation: https://docs.iac-dharma.com/mobile
