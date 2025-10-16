#!/usr/bin/env bash
#
# Manual version bumping script for local development
# Usage: ./bin/version-bump.sh [major|minor|patch]
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VERSION_FILE="$PROJECT_ROOT/VERSION"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to display usage
usage() {
    echo "Usage: $0 [major|minor|patch]"
    echo ""
    echo "Bump version number in VERSION file and sync to all project files."
    echo ""
    echo "Arguments:"
    echo "  major    Bump major version (X.0.0)"
    echo "  minor    Bump minor version (x.Y.0)"
    echo "  patch    Bump patch version (x.y.Z)"
    echo ""
    echo "Example:"
    echo "  $0 patch    # 1.2.3 -> 1.2.4"
    echo "  $0 minor    # 1.2.3 -> 1.3.0"
    echo "  $0 major    # 1.2.3 -> 2.0.0"
    exit 1
}

# Check arguments
if [ $# -ne 1 ]; then
    usage
fi

BUMP_TYPE="$1"

# Validate bump type
if [[ ! "$BUMP_TYPE" =~ ^(major|minor|patch)$ ]]; then
    echo -e "${RED}Error: Invalid bump type '$BUMP_TYPE'${NC}"
    usage
fi

# Check if VERSION file exists
if [ ! -f "$VERSION_FILE" ]; then
    echo -e "${YELLOW}VERSION file not found. Creating with initial version 0.0.0${NC}"
    echo "0.0.0" > "$VERSION_FILE"
fi

# Read current version
CURRENT_VERSION=$(cat "$VERSION_FILE" | tr -d '[:space:]')

# Validate version format
if ! [[ "$CURRENT_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-.*)?$ ]]; then
    echo -e "${RED}Error: Invalid version format in VERSION file: $CURRENT_VERSION${NC}"
    echo "Expected format: X.Y.Z or X.Y.Z-prerelease"
    exit 1
fi

# Extract version components (remove any prerelease suffix)
BASE_VERSION="${CURRENT_VERSION%%-*}"
IFS='.' read -r MAJOR MINOR PATCH <<< "$BASE_VERSION"

# Bump version based on type
case "$BUMP_TYPE" in
    major)
        MAJOR=$((MAJOR + 1))
        MINOR=0
        PATCH=0
        ;;
    minor)
        MINOR=$((MINOR + 1))
        PATCH=0
        ;;
    patch)
        PATCH=$((PATCH + 1))
        ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"

echo -e "${GREEN}Bumping version: $CURRENT_VERSION -> $NEW_VERSION${NC}"

# Update VERSION file
echo "$NEW_VERSION" > "$VERSION_FILE"

# Sync version to other files using make
cd "$PROJECT_ROOT"
make version-sync VERSION="$NEW_VERSION"

echo -e "${GREEN}✓ Version bumped successfully to $NEW_VERSION${NC}"
echo ""
echo "Next steps:"
echo "  1. Review changes: git diff"
echo "  2. Commit changes: git add -A && git commit -m 'chore(release): $NEW_VERSION'"
echo "  3. Tag release: git tag -a v$NEW_VERSION -m 'Release v$NEW_VERSION'"
echo "  4. Push changes: git push && git push --tags"
