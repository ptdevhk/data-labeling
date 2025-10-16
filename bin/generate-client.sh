#!/usr/bin/env bash

# Turn on bash strict mode.
set -euo pipefail

echo "================================================"
echo "Generating TypeScript API client..."
echo "================================================"

# Get the script's directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "Extracting OpenAPI specification from FastAPI backend..."

# Navigate to project root and extract OpenAPI spec
cd "$PROJECT_ROOT"
export PYTHONPATH="$PROJECT_ROOT"
uv run python -c "from svc.main import app; import json; print(json.dumps(app.openapi()))" > web/openapi.json

echo "✓ OpenAPI specification extracted"
echo ""

# Navigate to frontend and generate client
cd web
echo "Generating TypeScript client code..."
bun run openapi-ts

echo ""
echo "================================================"
echo "API client generated successfully!"
echo "================================================"
echo ""
echo "Generated files in: web/src/client/"
echo "  ✓ types.gen.ts    - TypeScript type definitions"
echo "  ✓ sdk.gen.ts      - Service classes for API calls"
echo "  ✓ schemas.gen.ts  - JSON schemas"
echo "  ✓ client.gen.ts   - HTTP client configuration"
echo ""
