#!/bin/bash

# Script to start iOS Simulator on macOS
# Make sure you have Xcode installed

echo "🍎 Starting iOS Simulator..."

# Check if Xcode is installed
if ! command -v xcrun &> /dev/null; then
    echo "❌ Error: Xcode is not installed or xcrun is not in PATH"
    echo "Please install Xcode from the App Store"
    exit 1
fi

# Get list of available simulators
echo "📱 Available iOS Simulators:"
xcrun simctl list devices available | grep "iPhone"

# Start the default iPhone simulator (or specify one)
# You can change "iPhone 15" to any available simulator
SIMULATOR_NAME="iPhone 15"

echo ""
echo "🚀 Launching $SIMULATOR_NAME..."

# Check if the simulator exists
if xcrun simctl list devices | grep -q "$SIMULATOR_NAME"; then
    # Boot the simulator
    xcrun simctl boot "$SIMULATOR_NAME" 2>/dev/null || echo "Simulator already booted"
    
    # Open Simulator app
    open -a Simulator
    
    echo "✅ $SIMULATOR_NAME is ready!"
    echo ""
    echo "Now run: npm run ios"
else
    echo "⚠️  $SIMULATOR_NAME not found. Available simulators:"
    xcrun simctl list devices available
    echo ""
    echo "Edit this script to change the simulator name or just run: npm run ios"
fi
