#!/bin/bash

# Script to start Android Emulator on macOS
# Make sure you have Android Studio and an AVD (Android Virtual Device) set up

echo "🤖 Starting Android Emulator..."

# Check if ANDROID_HOME is set
if [ -z "$ANDROID_HOME" ]; then
    # Try common locations
    if [ -d "$HOME/Library/Android/sdk" ]; then
        export ANDROID_HOME="$HOME/Library/Android/sdk"
        export PATH="$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools"
    else
        echo "❌ Error: ANDROID_HOME is not set and couldn't find Android SDK"
        echo "Please install Android Studio and set ANDROID_HOME environment variable"
        echo ""
        echo "Add this to your ~/.zshrc or ~/.bash_profile:"
        echo 'export ANDROID_HOME=$HOME/Library/Android/sdk'
        echo 'export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools'
        exit 1
    fi
fi

# Check if emulator command exists
if ! command -v emulator &> /dev/null; then
    echo "❌ Error: Android emulator not found in PATH"
    echo "PATH should include: $ANDROID_HOME/emulator"
    exit 1
fi

# List available AVDs
echo "📱 Available Android Virtual Devices:"
emulator -list-avds

# Get the first available AVD or use a default name
AVD_NAME=$(emulator -list-avds | head -n 1)

if [ -z "$AVD_NAME" ]; then
    echo ""
    echo "❌ No Android Virtual Devices found!"
    echo "Please create an AVD in Android Studio:"
    echo "  1. Open Android Studio"
    echo "  2. Go to Tools > Device Manager"
    echo "  3. Click 'Create Device'"
    echo "  4. Choose a device and system image"
    exit 1
fi

echo ""
echo "🚀 Starting AVD: $AVD_NAME"
echo ""

# Start the emulator in the background
emulator -avd "$AVD_NAME" -netdelay none -netspeed full &

echo "✅ Android emulator is starting..."
echo "This may take a minute or two..."
echo ""
echo "Once the emulator is fully booted, run: npm run android"
