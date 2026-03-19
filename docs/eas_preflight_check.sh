#!/bin/bash

# Pre-build checklist script for EAS
# Run this before your first build

echo "🔍 EAS Build Pre-flight Checklist"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counter for issues
ISSUES=0
WARNINGS=0

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check EAS CLI
echo "📦 Checking EAS CLI..."
if command_exists eas; then
    EAS_VERSION=$(eas --version)
    echo -e "${GREEN}✓ EAS CLI installed (version: $EAS_VERSION)${NC}"
else
    echo -e "${RED}✗ EAS CLI not installed${NC}"
    echo "  Install with: npm install -g eas-cli"
    ((ISSUES++))
fi
echo ""

# Check Expo login
echo "🔐 Checking Expo authentication..."
if eas whoami &>/dev/null; then
    EXPO_USER=$(eas whoami)
    echo -e "${GREEN}✓ Logged in as: $EXPO_USER${NC}"
else
    echo -e "${RED}✗ Not logged in to Expo${NC}"
    echo "  Login with: eas login"
    ((ISSUES++))
fi
echo ""

# Check app.json configuration
echo "⚙️  Checking app.json configuration..."

# Check if app.json exists
if [ ! -f "app.json" ]; then
    echo -e "${RED}✗ app.json not found${NC}"
    ((ISSUES++))
else
    # Check for owner field
    if grep -q '"owner"' app.json; then
        OWNER=$(grep '"owner"' app.json | sed 's/.*"owner": "\(.*\)".*/\1/')
        if [ "$OWNER" = "your-expo-account-name" ]; then
            echo -e "${YELLOW}⚠️  Owner field needs to be updated in app.json${NC}"
            echo "  Current: $OWNER"
            echo "  Update to your Expo username"
            ((WARNINGS++))
        else
            echo -e "${GREEN}✓ Owner configured: $OWNER${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  No owner field in app.json${NC}"
        echo "  Add: \"owner\": \"your-expo-username\""
        ((WARNINGS++))
    fi

    # Check for project ID
    if grep -q '"projectId"' app.json; then
        PROJECT_ID=$(grep '"projectId"' app.json | sed 's/.*"projectId": "\(.*\)".*/\1/')
        if [ "$PROJECT_ID" = "YOUR_PROJECT_ID_HERE" ]; then
            echo -e "${YELLOW}⚠️  Project ID needs to be configured${NC}"
            echo "  Run: eas init"
            ((WARNINGS++))
        else
            echo -e "${GREEN}✓ Project ID configured${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  No project ID in app.json${NC}"
        echo "  Run: eas init"
        ((WARNINGS++))
    fi

    # Check bundle identifiers
    if grep -q '"bundleIdentifier"' app.json; then
        echo -e "${GREEN}✓ iOS bundle identifier configured${NC}"
    else
        echo -e "${RED}✗ iOS bundle identifier missing${NC}"
        ((ISSUES++))
    fi

    if grep -q '"package"' app.json; then
        echo -e "${GREEN}✓ Android package name configured${NC}"
    else
        echo -e "${RED}✗ Android package name missing${NC}"
        ((ISSUES++))
    fi
fi
echo ""

# Check eas.json
echo "📋 Checking eas.json..."
if [ -f "eas.json" ]; then
    echo -e "${GREEN}✓ eas.json exists${NC}"
    
    # Check for build profiles
    if grep -q '"development"' eas.json && grep -q '"preview"' eas.json && grep -q '"production"' eas.json; then
        echo -e "${GREEN}✓ Build profiles configured (development, preview, production)${NC}"
    else
        echo -e "${YELLOW}⚠️  Some build profiles might be missing${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}✗ eas.json not found${NC}"
    echo "  Run: eas build:configure"
    ((ISSUES++))
fi
echo ""

# Check dependencies
echo "📦 Checking dependencies..."
if [ -f "package.json" ]; then
    if [ -d "node_modules" ]; then
        echo -e "${GREEN}✓ node_modules exists${NC}"
    else
        echo -e "${YELLOW}⚠️  node_modules not found${NC}"
        echo "  Run: npm install"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}✗ package.json not found${NC}"
    ((ISSUES++))
fi
echo ""

# Check assets
echo "🖼️  Checking assets..."
if [ -f "assets/logos/logo.png" ]; then
    echo -e "${GREEN}✓ App icon found${NC}"
else
    echo -e "${YELLOW}⚠️  App icon not found at assets/logos/logo.png${NC}"
    ((WARNINGS++))
fi
echo ""

# Check for sensitive files
echo "🔒 Checking for sensitive files in git..."
if [ -f ".gitignore" ]; then
    if grep -q "google-service-account.json" .gitignore; then
        echo -e "${GREEN}✓ google-service-account.json in .gitignore${NC}"
    else
        echo -e "${YELLOW}⚠️  Add google-service-account.json to .gitignore${NC}"
        ((WARNINGS++))
    fi
    
    if grep -q "*.pem" .gitignore || grep -q "*.p8" .gitignore; then
        echo -e "${GREEN}✓ Certificate files in .gitignore${NC}"
    else
        echo -e "${YELLOW}⚠️  Add certificate files (*.pem, *.p8) to .gitignore${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠️  No .gitignore found${NC}"
    ((WARNINGS++))
fi
echo ""

# Summary
echo "=================================="
echo "📊 Summary"
echo "=================================="

if [ $ISSUES -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! You're ready to build.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. npm run build:android:preview"
    echo "  2. npm run build:ios:preview"
    echo ""
elif [ $ISSUES -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found - Review and fix if needed${NC}"
    echo -e "${GREEN}✓ No blocking issues - You can proceed with builds${NC}"
    echo ""
else
    echo -e "${RED}✗ $ISSUES critical issue(s) found${NC}"
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found${NC}"
    echo ""
    echo "Please fix the critical issues before building."
    echo ""
    exit 1
fi

# Helpful commands
echo "Helpful commands:"
echo "  eas init                    - Initialize EAS project"
echo "  eas build:configure         - Configure build profiles"
echo "  eas login                   - Login to Expo"
echo "  npm install                 - Install dependencies"
echo ""
echo "Documentation: EAS_BUILD_GUIDE.md"
