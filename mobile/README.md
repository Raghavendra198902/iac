# IAC DHARMA Mobile App

React Native mobile application for iOS and Android platforms.

## Features

- ✅ Native iOS and Android support
- ✅ Authentication with biometric support
- ✅ Dashboard with real-time metrics
- ✅ Project and Blueprint management
- ✅ Cost analytics and forecasting
- ✅ Infrastructure monitoring
- ✅ Push notifications
- ✅ Offline support
- ✅ ML-powered insights

## Tech Stack

- **Framework**: React Native 0.73
- **Navigation**: React Navigation 6.x
- **UI Components**: React Native Paper
- **State Management**: Zustand + React Query
- **API Client**: Axios
- **Charts**: React Native Chart Kit
- **Storage**: AsyncStorage
- **Biometrics**: React Native Biometrics
- **Notifications**: React Native Push Notification

## Prerequisites

- Node.js >= 18.0.0
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)
- CocoaPods (for iOS dependencies)

## Installation

```bash
# Install dependencies
cd mobile
npm install

# iOS - Install CocoaPods dependencies
cd ios
pod install
cd ..

# Android - No additional setup required
```

## Environment Configuration

Create `.env` file in the mobile directory:

```bash
API_BASE_URL=http://localhost:3000
ML_API_URL=http://localhost:5000
CODEPUSH_KEY_IOS=your-ios-key
CODEPUSH_KEY_ANDROID=your-android-key
```

## Running the App

### iOS

```bash
# Run on iOS simulator
npm run ios

# Run on specific device
npm run ios -- --simulator="iPhone 15 Pro"

# Run on physical device
npm run ios -- --device="Your Device Name"
```

### Android

```bash
# Run on Android emulator
npm run android

# Run on specific device
npm run android -- --deviceId=YOUR_DEVICE_ID
```

## Building for Production

### iOS

```bash
# Build release
npm run build:ios

# Or manually in Xcode:
# 1. Open ios/IACDharma.xcworkspace in Xcode
# 2. Select Product > Archive
# 3. Upload to App Store Connect
```

### Android

```bash
# Build release APK
npm run build:android

# Output: android/app/build/outputs/apk/release/app-release.apk

# Build AAB for Play Store
cd android
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

## Project Structure

```
mobile/
├── src/
│   ├── screens/          # Screen components
│   │   ├── Auth/         # Login, Register
│   │   ├── Dashboard/    # Main dashboard
│   │   ├── Projects/     # Project management
│   │   ├── Blueprints/   # Blueprint management
│   │   ├── Monitoring/   # Infrastructure monitoring
│   │   ├── CostAnalytics/# Cost analytics
│   │   └── Settings/     # App settings
│   ├── components/       # Reusable components
│   ├── navigation/       # Navigation setup
│   ├── services/         # API services
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   ├── utils/            # Utility functions
│   └── types/            # TypeScript types
├── android/              # Android native code
├── ios/                  # iOS native code
├── App.tsx               # Root component
├── index.js              # Entry point
└── package.json          # Dependencies
```

## Key Screens

### Dashboard
- Real-time metrics and statistics
- Cost trend charts
- Recent alerts
- Quick actions

### Projects
- List all projects
- Create new projects
- View project details
- Manage resources

### Blueprints
- Browse infrastructure blueprints
- Create new blueprints
- View and edit configurations
- Generate IaC code

### Monitoring
- Real-time infrastructure metrics
- Anomaly detection
- Alert management
- Performance graphs

### Cost Analytics
- Cost forecasting (ML-powered)
- Budget tracking
- Cost optimization recommendations
- Historical cost analysis

## API Integration

The mobile app integrates with:

1. **Main API Gateway** (Port 3000)
   - Authentication
   - Projects and Blueprints
   - Monitoring and Alerts

2. **ML API Service** (Port 5000)
   - Cost forecasting
   - Anomaly detection
   - AI recommendations

## Features Implementation Status

| Feature | iOS | Android | Status |
|---------|-----|---------|--------|
| Authentication | ✅ | ✅ | Complete |
| Biometric Login | ✅ | ✅ | Complete |
| Dashboard | ✅ | ✅ | Complete |
| Projects | ✅ | ✅ | Complete |
| Blueprints | ✅ | ✅ | Complete |
| Monitoring | ✅ | ✅ | Complete |
| Cost Analytics | ✅ | ✅ | Complete |
| Push Notifications | ✅ | ✅ | Complete |
| Offline Mode | ✅ | ✅ | Complete |
| Dark Mode | 🚧 | 🚧 | Planned |
| QR Code Scanner | 🚧 | 🚧 | Planned |

## Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm test -- --coverage

# Run E2E tests (iOS)
detox test --configuration ios.sim.debug

# Run E2E tests (Android)
detox test --configuration android.emu.debug
```

## Code Push Updates

Deploy over-the-air updates:

```bash
# iOS
code-push release-react IACDharma-iOS ios -m --description "Bug fixes"

# Android
code-push release-react IACDharma-Android android -m --description "Bug fixes"
```

## Troubleshooting

### iOS Issues

**Metro bundler not starting**
```bash
npx react-native start --reset-cache
```

**Pod install fails**
```bash
cd ios
pod deintegrate
pod install
```

**Build fails in Xcode**
- Clean build folder: Product > Clean Build Folder
- Delete derived data: ~/Library/Developer/Xcode/DerivedData

### Android Issues

**Gradle build fails**
```bash
cd android
./gradlew clean
cd ..
```

**App not installing**
```bash
adb uninstall com.iacdharma.mobile
npm run android
```

**Metro bundler connection issues**
```bash
adb reverse tcp:8081 tcp:8081
```

## Performance Optimization

- **Image Optimization**: Use react-native-fast-image
- **List Rendering**: Use FlatList with proper keys
- **Code Splitting**: Lazy load screens
- **Bundle Size**: Enable Hermes engine
- **Network**: Implement request caching

## Security

- ✅ Biometric authentication (Face ID/Touch ID/Fingerprint)
- ✅ Secure token storage (Keychain/Keystore)
- ✅ SSL pinning for API calls
- ✅ Code obfuscation in production
- ✅ Encrypted local storage

## App Store Submission

### iOS App Store

1. Archive app in Xcode
2. Upload to App Store Connect
3. Fill app metadata and screenshots
4. Submit for review

### Google Play Store

1. Build signed AAB
2. Upload to Play Console
3. Fill store listing
4. Submit for review

## Support

For issues or questions:
- Check documentation in `/docs/mobile/`
- Review common issues above
- Contact the development team

## License

Proprietary - IAC DHARMA Platform
