#!/bin/bash

# Mobile App Build Script
# Builds iOS and Android apps for production

set -e

echo "========================================"
echo "IAC DHARMA Mobile App Build"
echo "========================================"

# Check dependencies
check_dependencies() {
    echo "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js not found. Please install Node.js"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm not found. Please install npm"
        exit 1
    fi
    
    echo "✅ Dependencies check passed"
}

# Install npm packages
install_packages() {
    echo ""
    echo "Installing npm packages..."
    cd mobile
    npm install
    cd ..
    echo "✅ Packages installed"
}

# Build iOS
build_ios() {
    echo ""
    echo "========================================"
    echo "Building iOS App"
    echo "========================================"
    
    if ! command -v pod &> /dev/null; then
        echo "❌ CocoaPods not found. Please install: sudo gem install cocoapods"
        exit 1
    fi
    
    cd mobile/ios
    echo "Installing CocoaPods dependencies..."
    pod install
    
    echo "Building iOS app..."
    xcodebuild -workspace IACDharma.xcworkspace \
               -scheme IACDharma \
               -configuration Release \
               -archivePath build/IACDharma.xcarchive \
               archive
    
    echo "✅ iOS build complete"
    echo "Archive location: mobile/ios/build/IACDharma.xcarchive"
    cd ../..
}

# Build Android
build_android() {
    echo ""
    echo "========================================"
    echo "Building Android App"
    echo "========================================"
    
    cd mobile/android
    echo "Building Android APK..."
    ./gradlew assembleRelease
    
    echo "Building Android AAB (Play Store)..."
    ./gradlew bundleRelease
    
    echo "✅ Android build complete"
    echo "APK location: mobile/android/app/build/outputs/apk/release/app-release.apk"
    echo "AAB location: mobile/android/app/build/outputs/bundle/release/app-release.aab"
    cd ../..
}

# Main menu
show_menu() {
    echo ""
    echo "What would you like to build?"
    echo "1) iOS only"
    echo "2) Android only"
    echo "3) Both iOS and Android"
    echo "4) Exit"
    echo ""
    read -p "Enter your choice [1-4]: " choice
    
    case $choice in
        1)
            check_dependencies
            install_packages
            build_ios
            ;;
        2)
            check_dependencies
            install_packages
            build_android
            ;;
        3)
            check_dependencies
            install_packages
            build_ios
            build_android
            ;;
        4)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo "Invalid choice. Please try again."
            show_menu
            ;;
    esac
}

# Run
check_dependencies
show_menu

echo ""
echo "========================================"
echo "✅ Build Complete!"
echo "========================================"
