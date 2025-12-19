#!/usr/bin/env bash

# Turn on bash strict mode.
set -euo pipefail

echo "================================================"
echo "Updating Python dependencies..."
echo "================================================"

# Delete the old lock file.
rm -f uv.lock

# Remove the current virtual environment.
rm -rf .venv || true

# Create a new virtual environment.
uv venv -p 3.13

# Install the latest versions of the Python dependencies.
uv lock && uv sync

echo ""
echo "================================================"
echo "Updating Frontend dependencies..."
echo "================================================"

# Update all workspace dependencies from project root
bun update

echo ""
echo "================================================"
echo "Dependency update completed!"
echo "================================================"
echo ""
echo "Summary:"
echo "  ✓ Python dependencies updated (uv.lock)"
echo "  ✓ Frontend dependencies updated (bun.lock)"
echo ""
echo "Next steps:"
echo "  1. Review changes: git diff uv.lock bun.lock"
echo "  2. Test the application: make all"
echo "  3. Run linters: make lint"
echo "  4. Run tests: make test"
