#!/usr/bin/env bash
#
# Quick demo of semantic-release version bumping
# This script demonstrates how the versioning system works
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "================================================"
echo "Semantic Release Version Bumping Demo"
echo "================================================"
echo ""

cd "$PROJECT_ROOT"

# Show current version
echo -e "${BLUE}1. Current Version:${NC}"
CURRENT=$(make version-current)
echo "   $CURRENT"
echo ""

# Show version in all files
echo -e "${BLUE}2. Version in Project Files:${NC}"
echo "   VERSION file:        $(cat VERSION)"
echo "   pyproject.toml:      $(grep '^version = ' pyproject.toml | sed 's/version = "\(.*\)"/\1/')"
echo "   web/package.json:    $(grep '"version":' web/package.json | sed 's/.*"version": "\(.*\)".*/\1/')"
echo ""

# Show Makefile targets
echo -e "${BLUE}3. Available Make Targets:${NC}"
make help | grep -E 'version-' | head -5
echo ""

# Show commit message format
echo -e "${BLUE}4. Conventional Commit Format:${NC}"
echo "   Format: <type>(<scope>): <subject>"
echo ""
echo "   Examples:"
echo "   - feat(canvas): add polygon tool      → MINOR bump (1.2.3 → 1.3.0)"
echo "   - fix(auth): resolve token issue      → PATCH bump (1.2.3 → 1.2.4)"
echo "   - feat!: redesign API                 → MAJOR bump (1.2.3 → 2.0.0)"
echo "   - docs(readme): update docs           → NO release"
echo ""

# Show workflow
echo -e "${BLUE}5. Automated Release Workflow:${NC}"
echo "   Push to main → GitHub Actions → semantic-release"
echo "                                  ↓"
echo "                         Analyze commits"
echo "                                  ↓"
echo "                         Calculate version"
echo "                                  ↓"
echo "                         Update files + CHANGELOG"
echo "                                  ↓"
echo "                         Create GitHub release"
echo ""

# Show manual bump example
echo -e "${BLUE}6. Manual Version Bump Example:${NC}"
echo "   $ make version-bump TYPE=patch"
echo "   Bumping version: 0.1.0 -> 0.1.1"
echo "   Version synchronized to 0.1.1"
echo ""
echo "   Then commit:"
echo "   $ git add -A"
echo "   $ git commit -m 'chore(release): 0.1.1'"
echo "   $ git push origin main"
echo ""

# Show validation
echo -e "${BLUE}7. Validate Setup:${NC}"
echo "   $ ./bin/test-version-setup.sh"
echo "   ✓ All tests passed!"
echo ""

# Show resources
echo -e "${BLUE}8. Documentation:${NC}"
echo "   - docs/VERSIONING.md              Full versioning guide"
echo "   - docs/COMMIT_REFERENCE.md        Quick commit format reference"
echo "   - docs/SEMANTIC_RELEASE_SETUP.md  Implementation summary"
echo "   - CHANGELOG.md                    Release history"
echo ""

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Ready to use semantic versioning!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Commit these changes: git add -A && git commit -m 'chore(release): setup semantic-release'"
echo "  2. Push to main: git push origin main"
echo "  3. Check GitHub Actions for the release workflow"
echo "  4. Start using conventional commits in your development"
echo ""
echo "For help: make help | grep version"
