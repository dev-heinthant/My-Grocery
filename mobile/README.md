# My Grocery List — React Native + Expo Mobile App

Standalone React Native + Expo SDK 58 mobile application for Android and iOS, built separately from the existing web application.

## Environment Requirements (macOS)
- Node.js `v26.13.1` (preserved)
- npm `v11.20.0` (preserved)
- Xcode (for iOS Simulator & iOS builds)
- Android Studio (for Android SDK, emulator, and debugging)

## Setup
```bash
cd mobile
cp .env.example .env
npm install
```

## Verification Commands
```bash
npx expo install --check
npx expo-doctor
npm run typecheck
```

## Local Development
```bash
npx expo start
npx expo start --android
npx expo start --ios
```

## EAS Builds
```bash
# Android APK (direct testing)
npx eas build --platform android --profile preview

# Android AAB (Google Play)
npx eas build --platform android --profile production

# iOS Development / Production
npx eas build --platform ios --profile development
npx eas build --platform ios --profile production
```
