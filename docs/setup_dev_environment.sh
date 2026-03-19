#!/bin/bash

# Complete setup script for first-time development environment setup
# Run this once after cloning the repository

echo "🚀 Setting up Idrissimart development environment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${YELLOW}⚠️  Warning: This script is optimized for macOS${NC}"
    echo "Some iOS-specific checks will be skipped on other platforms"
    echo ""
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js
echo "📦 Checking Node.js..."
if command_exists node; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js $NODE_VERSION installed${NC}"
else
    echo -e "${RED}✗ Node.js not found${NC}"
    echo "  Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check npm
echo "📦 Checking npm..."
if command_exists npm; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓ npm $NPM_VERSION installed${NC}"
else
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi

# Check Expo CLI
echo "📦 Checking Expo..."
if command_exists expo; then
    EXPO_VERSION=$(expo --version)
    echo -e "${GREEN}✓ Expo $EXPO_VERSION installed${NC}"
else
    echo -e "${YELLOW}⚠️  Expo CLI not found globally${NC}"
    echo "  No problem - using npx expo will work fine"
fi

# Check for iOS development tools (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo ""
    echo "🍎 Checking iOS development tools..."
    
    if command_exists xcrun; then
        echo -e "${GREEN}✓ Xcode Command Line Tools installed${NC}"
        
        # Check for simulators
        SIM_COUNT=$(xcrun simctl list devices available 2>/dev/null | grep -c "iPhone")
        if [ "$SIM_COUNT" -gt 0 ]; then
            echo -e "${GREEN}✓ $SIM_COUNT iOS simulators available${NC}"
        else
            echo -e "${YELLOW}⚠️  No iOS simulators found${NC}"
            echo "  Open Xcode and download simulators from Preferences > Components"
        fi
    else
        echo -e "${YELLOW}⚠️  Xcode Command Line Tools not installed${NC}"
        echo "  Run: xcode-select --install"
    fi
fi

# Check Android development tools
echo ""
echo "🤖 Checking Android development tools..."

if [ -d "$HOME/Library/Android/sdk" ]; then
    export ANDROID_HOME="$HOME/Library/Android/sdk"
    export PATH="$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools"
    echo -e "${GREEN}✓ Android SDK found at $ANDROID_HOME${NC}"
else
    echo -e "${YELLOW}⚠️  Android SDK not found${NC}"
    echo "  Install Android Studio from https://developer.android.com/studio"
fi

if command_exists emulator; then
    AVD_COUNT=$(emulator -list-avds 2>/dev/null | wc -l | tr -d ' ')
    if [ "$AVD_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✓ $AVD_COUNT Android AVD(s) configured${NC}"
    else
        echo -e "${YELLOW}⚠️  No Android AVDs found${NC}"
        echo "  Create one in Android Studio: Tools > Device Manager"
    fi
else
    echo -e "${YELLOW}⚠️  Android emulator command not found${NC}"
    echo "  Make sure ANDROID_HOME is set and added to PATH"
fi

# Install npm dependencies
echo ""
echo "📦 Installing npm dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed successfully${NC}"
else
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    exit 1
fi

# Check if backend server is running
echo ""
echo "🔍 Checking backend server..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5454 | grep -q "200\|404"; then
    echo -e "${GREEN}✓ Backend server is running on localhost:5454${NC}"
else
    echo -e "${YELLOW}⚠️  Backend server not detected on localhost:5454${NC}"
    echo "  Start your Django server with: python manage.py runserver 0.0.0.0:5454"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Setup complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Next steps:"
echo ""
echo "  For iOS:"
echo "    1. npm run emulator:ios"
echo "    2. npm run ios"
echo ""
echo "  For Android:"
echo "    1. npm run emulator:android"
echo "    2. npm run android"
echo ""
echo "  Or just run:"
echo "    npm start"
echo ""
echo "📚 Documentation:"
echo "  - EMULATOR_SETUP.md       → Complete guide"
echo "  - EMULATOR_QUICK_START.txt → Quick reference"
echo "  - REDUX_API_GUIDE.md      → API integration"
echo ""
echo "Good luck! 🚀"
