#!/usr/bin/env bash
#
# Test script for semantic-release setup validation
# Verifies that all components are correctly configured
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "================================================"
echo "Semantic Release Setup Validation"
echo "================================================"
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function for test results
pass() {
    echo -e "${GREEN}✓${NC} $1"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

fail() {
    echo -e "${RED}✗${NC} $1"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Test 1: Check VERSION file exists and has valid format
echo "Testing VERSION file..."
if [ -f "$PROJECT_ROOT/VERSION" ]; then
    VERSION=$(cat "$PROJECT_ROOT/VERSION" | tr -d '[:space:]')
    if [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-.*)?$ ]]; then
        pass "VERSION file exists with valid format: $VERSION"
    else
        fail "VERSION file has invalid format: $VERSION"
    fi
else
    fail "VERSION file not found"
fi

# Test 2: Check .releaserc.json exists
echo ""
echo "Testing semantic-release configuration..."
if [ -f "$PROJECT_ROOT/.releaserc.json" ]; then
    pass ".releaserc.json exists"
else
    fail ".releaserc.json not found"
fi

# Test 3: Check commitlint configuration
echo ""
echo "Testing commitlint configuration..."
if [ -f "$PROJECT_ROOT/.commitlintrc.json" ]; then
    pass ".commitlintrc.json exists"
else
    fail ".commitlintrc.json not found"
fi

# Test 4: Check GitHub workflows
echo ""
echo "Testing GitHub workflows..."
if [ -f "$PROJECT_ROOT/.github/workflows/release.yml" ]; then
    pass "release.yml workflow exists"
else
    fail "release.yml workflow not found"
fi

if [ -f "$PROJECT_ROOT/.github/workflows/commitlint.yml" ]; then
    pass "commitlint.yml workflow exists"
else
    fail "commitlint.yml workflow not found"
fi

# Test 5: Check version-bump script
echo ""
echo "Testing version-bump script..."
if [ -f "$PROJECT_ROOT/bin/version-bump.sh" ] && [ -x "$PROJECT_ROOT/bin/version-bump.sh" ]; then
    pass "version-bump.sh exists and is executable"
else
    fail "version-bump.sh not found or not executable"
fi

# Test 6: Check Makefile targets
echo ""
echo "Testing Makefile targets..."
cd "$PROJECT_ROOT"
if make -n version-current &>/dev/null; then
    pass "Makefile target 'version-current' exists"
else
    fail "Makefile target 'version-current' not found"
fi

if make -n version-sync VERSION=1.0.0 &>/dev/null; then
    pass "Makefile target 'version-sync' exists"
else
    fail "Makefile target 'version-sync' not found"
fi

if make -n version-bump TYPE=patch &>/dev/null; then
    pass "Makefile target 'version-bump' exists"
else
    fail "Makefile target 'version-bump' not found"
fi

# Test 7: Verify version synchronization
echo ""
echo "Testing version synchronization..."
VERSION_FILE_VERSION=$(cat "$PROJECT_ROOT/VERSION" | tr -d '[:space:]')
PYPROJECT_VERSION=$(grep '^version = ' "$PROJECT_ROOT/pyproject.toml" | sed 's/version = "\(.*\)"/\1/')
PACKAGE_VERSION=$(grep '"version":' "$PROJECT_ROOT/web/package.json" | sed 's/.*"version": "\(.*\)".*/\1/')

if [ "$VERSION_FILE_VERSION" = "$PYPROJECT_VERSION" ] && [ "$VERSION_FILE_VERSION" = "$PACKAGE_VERSION" ]; then
    pass "All version files are synchronized: $VERSION_FILE_VERSION"
else
    fail "Version files are out of sync:"
    echo "   VERSION:        $VERSION_FILE_VERSION"
    echo "   pyproject.toml: $PYPROJECT_VERSION"
    echo "   package.json:   $PACKAGE_VERSION"
fi

# Test 8: Check documentation
echo ""
echo "Testing documentation..."
if [ -f "$PROJECT_ROOT/docs/VERSIONING.md" ]; then
    pass "VERSIONING.md documentation exists"
else
    fail "VERSIONING.md documentation not found"
fi

if [ -f "$PROJECT_ROOT/CHANGELOG.md" ]; then
    pass "CHANGELOG.md exists"
else
    warn "CHANGELOG.md not found (will be created on first release)"
fi

# Test 9: Test make version-current
echo ""
echo "Testing make commands..."
MAKE_VERSION=$(cd "$PROJECT_ROOT" && make version-current 2>/dev/null | tail -n 1)
if [ "$MAKE_VERSION" = "$VERSION_FILE_VERSION" ]; then
    pass "make version-current works correctly: $MAKE_VERSION"
else
    fail "make version-current returned unexpected value: $MAKE_VERSION"
fi

# Test 10: Validate conventional commit examples
echo ""
echo "Testing conventional commit format validation..."
VALID_COMMITS=(
    "feat(canvas): add new feature"
    "fix(auth): resolve bug"
    "docs(readme): update documentation"
    "chore(deps): update dependencies"
    "refactor(api): restructure code"
)

for commit in "${VALID_COMMITS[@]}"; do
    if [[ "$commit" =~ ^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?:\ .+ ]]; then
        pass "Valid commit format: $commit"
    else
        fail "Invalid commit format: $commit"
    fi
done

# Summary
echo ""
echo "================================================"
echo "Test Summary"
echo "================================================"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}Failed: $TESTS_FAILED${NC}"
    echo ""
    echo "Some tests failed. Please fix the issues before proceeding."
    exit 1
else
    echo -e "${RED}Failed: $TESTS_FAILED${NC}"
    echo ""
    echo -e "${GREEN}All tests passed! Semantic release setup is valid.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Commit these changes with a conventional commit message"
    echo "  2. Push to main branch to trigger automatic release"
    echo "  3. Review the generated CHANGELOG and GitHub release"
    echo ""
    echo "Example commit:"
    echo "  git add -A"
    echo "  git commit -m 'chore(release): setup semantic-release automation'"
    echo "  git push origin main"
fi
