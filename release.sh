#!/bin/bash
# 🚀 Gissues Release Script
# Usage: ./release.sh [patch|minor|major]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default to patch if no argument provided
BUMP_TYPE=${1:-patch}

echo -e "${BLUE}🚀 Gissues Release Script${NC}"
echo -e "Bump type: ${YELLOW}$BUMP_TYPE${NC}"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Not in a git repository!${NC}"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}❌ You have uncommitted changes. Please commit them first.${NC}"
    exit 1
fi

# Get current version from manifest.json
CURRENT_VERSION=$(grep -o '"version": "[^"]*"' manifest.json | grep -o '[0-9.]*')
echo -e "Current version: ${GREEN}v$CURRENT_VERSION${NC}"

# Calculate new version
IFS='.' read -r -a version_parts <<< "$CURRENT_VERSION"
major=${version_parts[0]}
minor=${version_parts[1]}
patch=${version_parts[2]}

case $BUMP_TYPE in
    "major")
        major=$((major + 1))
        minor=0
        patch=0
        ;;
    "minor")
        minor=$((minor + 1))
        patch=0
        ;;
    "patch")
        patch=$((patch + 1))
        ;;
    *)
        echo -e "${RED}❌ Invalid bump type. Use: patch, minor, or major${NC}"
        exit 1
        ;;
esac

NEW_VERSION="$major.$minor.$patch"
echo -e "New version: ${GREEN}v$NEW_VERSION${NC}"

# Confirm release
read -p "$(echo -e ${YELLOW}Continue with release v$NEW_VERSION? [y/N]: ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Release cancelled.${NC}"
    exit 0
fi

# Update version in manifest.json
echo -e "${BLUE}📝 Updating manifest.json...${NC}"
sed -i.bak "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" manifest.json
rm manifest.json.bak

# Commit version bump
echo -e "${BLUE}📝 Committing version bump...${NC}"
git add manifest.json
git commit -m "🔖 Bump version to v$NEW_VERSION"

# Create git tag
echo -e "${BLUE}🏷️ Creating git tag...${NC}"
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION

🚀 What's new in v$NEW_VERSION:
- Version bump from v$CURRENT_VERSION to v$NEW_VERSION
- Check commit history for detailed changes

📥 Installation:
1. Download ZIP from GitHub
2. Extract and load in chrome://extensions/
3. Enable Developer mode first

⭐ Give us a star if you like Gissues!"

# Push changes and tags
echo -e "${BLUE}📤 Pushing to GitHub...${NC}"
git push
git push --tags

echo -e "${GREEN}✅ Release v$NEW_VERSION completed successfully!${NC}"
echo -e "${BLUE}🔗 GitHub Release: ${NC}https://github.com/cladjidane/gissues/releases/tag/v$NEW_VERSION"
echo -e "${BLUE}📦 Download ZIP: ${NC}https://github.com/cladjidane/gissues/archive/refs/tags/v$NEW_VERSION.zip"

# Optional: Open GitHub releases page
read -p "$(echo -e ${YELLOW}Open GitHub releases page? [y/N]: ${NC})" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v open > /dev/null; then
        open "https://github.com/cladjidane/gissues/releases/tag/v$NEW_VERSION"
    elif command -v xdg-open > /dev/null; then
        xdg-open "https://github.com/cladjidane/gissues/releases/tag/v$NEW_VERSION"
    else
        echo -e "${YELLOW}Please visit manually: https://github.com/cladjidane/gissues/releases/tag/v$NEW_VERSION${NC}"
    fi
fi