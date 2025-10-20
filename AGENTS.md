# AGENTS.md

**Instructions for Agents when working in this repository.**

## Agent Guidelines

### Using Documentation Tools
**IMPORTANT**: Always use these MCP tools for up-to-date documentation:

1. **context7** - For library documentation and code examples:
   - First call `mcp__context7__resolve-library-id` to get the library ID
   - Then call `mcp__context7__get-library-docs` with the library ID
   - Use for: React, FastAPI, Fabric.js, Semi Design, i18next, Tailwind CSS, etc.
   - Example: Get React Router DOM 7 docs before refactoring routes

2. **deepwiki** - For GitHub repository deep knowledge:
   - Call `mcp__deepwiki__read_wiki_structure` to see available topics
   - Call `mcp__deepwiki__read_wiki_contents` for comprehensive docs
   - Call `mcp__deepwiki__ask_question` for specific questions
   - Use for: facebook/react, vercel/next.js, fabricjs/fabric.js, etc.
   - **Example questions to ask**:
     - "What are common performance issues with React 18 and how to fix them?"
     - "How do I properly migrate from React Router 6 to 7?"
     - "What are best practices for Fabric.js canvas optimization?"
     - "How to debug Semi Design component rendering issues?"
     - "What are common i18next configuration mistakes?"

### JavaScript/TypeScript Refactoring
When refactoring JavaScript/TypeScript code:

1. **Before starting**:
   - Check current React version and compatibility (we use React 18.3 for Semi Design)
   - Use `deepwiki` to ask about migration paths and breaking changes
   - Use `context7` to get latest API documentation
   - Ask deepwiki for troubleshooting: "What are common issues when upgrading [library]?"

2. **During refactoring**:
   - Follow React 18 patterns (no deprecated APIs like findDOMNode)
   - Use React Router DOM 7 nested routes syntax
   - Maintain Semi Design 2.86 compatibility
   - Keep Fabric.js 6 canvas patterns
   - Preserve i18n structure with react-i18next

3. **Testing approach**:
   - Run `make lint-react` after changes
   - Test in both light/dark themes
   - Verify responsive behavior (480px, 768px, 1024px, 1440px)
   - Check i18n key coverage
   - Use deepwiki to ask: "What are common test patterns for [component type]?"

4. **Troubleshooting**:
   - If errors occur, ask deepwiki specific questions about the library
   - Use context7 to verify you're using current API syntax
   - Check Semi Design React 18 compatibility issues
   - Example: `mcp__deepwiki__ask_question` with "How to fix [error message] in React 18?"

### Key Repositories for deepwiki Queries
When working on this project, frequently query these repositories:

**Frontend Libraries:**
- `facebook/react` - React core, hooks, performance optimization
- `remix-run/react-router` - React Router DOM 7 routing patterns
- `fabricjs/fabric.js` - Canvas manipulation, object handling, events
- `DouyinFE/semi-design` - Semi Design components, theming, customization
- `i18next/react-i18next` - Internationalization patterns, language switching
- `vitejs/vite` - Build configuration, plugins, optimization
- `TanStack/query` - Server state management, caching, mutations
- `tailwindlabs/tailwindcss` - Tailwind CSS v3 patterns, CSS layers, integration

**Backend Libraries:**
- `fastapi/fastapi` - API design, dependency injection, async patterns
- `encode/starlette` - ASGI server, middleware, routing
- `pydantic/pydantic` - Data validation, schema design

**Reference Templates:**
- `karlorz/full-stack-fastapi-template` - TypeScript migration patterns, OpenAPI client generation, TanStack Query integration
- `QuantumNous/new-api` - **Semi Design + Tailwind CSS v3 integration patterns**, CSS layer management, Vite plugin configuration

**Common Questions to Ask:**
- "What are the latest best practices for [library name]?"
- "How to debug [specific error] in [library name]?"
- "What are performance optimization techniques for [library name]?"
- "How to properly integrate [library A] with [library B]?"
- "What are common pitfalls when using [library name] with React 18?"

## TypeScript & OpenAPI Client

**Reference Template**: https://github.com/karlorz/full-stack-fastapi-template

This template provides patterns for TypeScript migration, OpenAPI client generation with `@hey-api/openapi-ts`, and TanStack Query integration.

**After modifying backend API endpoints, regenerate the client:**
```bash
make generate-client
```

**Generated files:** `web/src/client/` (types.gen.ts, sdk.gen.ts, schemas.gen.ts)

## Project Overview

Web-based image annotation tool with React SPA frontend + FastAPI backend. Browser-only, manual labeling (no auto-segmentation/SAM). Monorepo structure: `./web` (React+Vite) and `./svc` (FastAPI+Python).

**Quick Start:**
```bash
cp .env.example .env              # Generate API_SECRET_KEY: openssl rand -hex 32
make all                          # Build frontend + start local backend (port 5002)
make docker-up                    # Or use Docker Compose (port 5002)
```

## Development Commands

### Local Development
```bash
make all                          # Build frontend + backend on port 5002 (recommended)
make start-backend                    # Backend only with hot reload
cd web && bun run dev             # Frontend dev server on port 5173
make build-frontend               # Build React to web/dist/
```

### Docker
```bash
make docker-up                    # Build frontend + start containers (initial setup)
make docker-down                  # Stop containers
make docker-restart               # Build frontend + restart containers (after changes)
docker compose -f docker-compose.yml logs -f  # View logs (base config only)
docker compose logs -f                        # View logs (base + override merged)
```

**Note**: Since `docker-compose.override.yml` exists, Docker Compose will automatically merge it with `docker-compose.yml` unless you explicitly use `-f docker-compose.yml` to use only the base config.

### Testing & Quality
```bash
make test                         # Pytest with coverage
make lint                         # All linters (ruff, mypy, ESLint, i18n)
make lint-check                   # Check Python linting
make lint-react                   # ESLint + i18n
cd svc && uv run pytest -vv       # Python tests
```

### TypeScript & API Client
```bash
make generate-client              # Generate TypeScript API client from OpenAPI spec
cd web && bun run type-check      # Run TypeScript compiler checks
cd web && bun run generate-client # Alternative: generate via npm script
```

### Dependencies
```bash
make dep-sync                     # Sync Python deps
make dep-update                   # Update all deps
cd web && bun add <pkg>           # Add frontend dep
```

## Architecture

### Backend (`svc/`)
- **Entry**: `svc/main.py` - FastAPI app with routers + static file serving
- **Routes**: `svc/routes/views.py` - API endpoints
- **APIs**: `svc/apis/api_a/`, `svc/apis/api_b/` - Business logic
- **Core**: `svc/core/` - Config, JWT auth, logging
- **Auth**: `/token` → JWT → `Depends(get_current_user)`
- **Config**: `.env` loaded via `starlette.config.Config`

**Routing Order (critical):**
1. API routers (`/api*`, `/token`, `/health`, `/docs`)
2. Static files (`/assets` → `web/dist/assets`)
3. SPA catch-all (`/{full_path:path}` → `index.html`)

### Frontend (`web/src/`)
**Stack:**
- React 18.3 (downgraded for Semi Design compatibility)
- React Router DOM 7 (nested routes)
- Semi Design 2.86 (UI components)
- Fabric.js 6 (canvas annotations)
- **Tailwind CSS 3.4.18** (integrated with Semi Design via CSS layers)
- i18next + react-i18next (i18n)

**Structure:**
- `pages/`: Dashboard, Projects, ProjectDetail, Datasets, Exports, Settings, Annotation
- `components/Layout/`: MainLayout, Sidebar, Header
- `components/Canvas/`: AnnotationCanvas, AnnotationToolsToolbar, LabelsPanel
- `contexts/`: ThemeContext (dark/light mode)

**CSS Architecture (Tailwind v3 + Semi Design Integration):**
- Semi Design CSS is imported in `web/src/main.tsx` (line 4): `import '@douyinfe/semi-ui/dist/css/semi.css';`
- The `@douyinfe/vite-plugin-semi` with `cssLayer: true` automatically wraps Semi CSS in `@layer semi`
- **DO NOT** import Semi Design CSS in other files (App.tsx, components, or use `@import` in CSS)
- CSS layer order (web/src/index.css:4):
  1. `tailwind-base` - Tailwind reset/normalize
  2. `semi` - Semi Design components (auto-wrapped by Vite plugin from main.tsx import)
  3. `tailwind-components` - Custom component styles
  4. `tailwind-utils` - Tailwind utilities (highest priority)
- Tailwind config (web/tailwind.config.js) maps Semi Design CSS variables:
  - Colors: `var(--semi-color-primary)`, `var(--semi-color-success)`, etc.
  - Border radius: `var(--semi-border-radius-small)`, etc.
  - Use Semi tokens via Tailwind classes: `bg-primary`, `text-semi-text-0`, `rounded-semi-medium`
- **Reference**: Follow patterns from `QuantumNous/new-api` repository (imports semi.css in index.jsx)

### Deployment (Docker Compose)
**Services:**
- **backend**: Port 5001 (internal), Python 3.13, 2 Gunicorn workers
- **caddy**: Port 5002 (public), reverse proxy + static files

**Important: Docker Compose File Merging**
This project has both `docker-compose.yml` and `docker-compose.override.yml`. Docker Compose automatically merges these files unless you explicitly specify `-f docker-compose.yml`:

```bash
# Uses ONLY docker-compose.yml (base config, ENVIRONMENT=production)
docker compose -f docker-compose.yml up -d

# Auto-merges docker-compose.yml + docker-compose.override.yml (ENVIRONMENT=develop)
docker compose up -d
```

**When to use each:**
- **Production/CI**: Always use `-f docker-compose.yml` for consistent base config
- **Local development with customizations**: Omit `-f` to include your override file

**ENVIRONMENT Build Argument:**
- `docker-compose.yml`: Sets `ENVIRONMENT: ${ENVIRONMENT:-production}` (default: production)
- `docker-compose.override.yml`: Overrides to `ENVIRONMENT: "develop"` (line 8)
- Dockerfile behavior (priority order):
  1. **Existing `.env`**: If `.env` exists in repo, uses it directly (highest priority)
  2. **ENVIRONMENT=develop**: Copies `.env.dev` → `.env` (falls back to `.env.example` if missing)
  3. **ENVIRONMENT=production** (or any other value): Copies `.env.example` → `.env`
- This means `docker compose build` (without `-f`) automatically uses `ENVIRONMENT=develop` and `.env.dev`
- **Important**: `.dockerignore` does NOT exclude `.env` or `.env.dev` to allow Docker builds to use them

**Caddyfile Routes** (order matters):
```caddyfile
:5002 {
    # API routes first
    handle /api* { reverse_proxy backend:5001 }
    handle /token { reverse_proxy backend:5001 }
    handle /health { reverse_proxy backend:5001 }
    handle /docs { reverse_proxy backend:5001 }

    # Frontend static files with SPA fallback
    handle {
        root * /web/dist
        encode zstd gzip
        try_files {path} /index.html
        file_server
    }
}
```

**Volumes:**
- `web/dist` bind mount (must exist before `docker compose up`)
- `caddy_data`, `caddy_config` (persistent)

**Environment (.env):**
```bash
PYTHON_VERSION="313"
TZ="Asia/Hong_Kong"        # Timezone (optional, defaults to Asia/Hong_Kong)
ENVIRONMENT="production"   # Environment mode: production or develop
API_USERNAME="ubuntu"
API_PASSWORD="debian"
API_SECRET_KEY="<generate_with_openssl>"
API_ALGORITHM="HS256"
API_ACCESS_TOKEN_EXPIRE_MINUTES="5256000000"
```

**Environment Files:**
- `.env.example`: Template with safe defaults (production config, checked into git)
- `.env`: Active config (git-ignored, but NOT dockerignored - used in builds if present)
- `.env.dev`: Shared development config (checked into git, NOT dockerignored)
- `.env.local`: Local overrides (git-ignored AND dockerignored, never used in builds)

**Priority in Docker builds:**
1. Existing `.env` file (if present in repo)
2. `.env.dev` (if ENVIRONMENT=develop)
3. `.env.example` (fallback for production)

## Project Structure

```
data-labeling/
├── web/                  # React frontend
│   ├── src/
│   │   ├── pages/        # 7 pages (Dashboard, Projects, ProjectDetail, etc.)
│   │   ├── components/   # Layout/, Canvas/
│   │   ├── contexts/     # ThemeContext
│   │   ├── utils/        # i18n config
│   │   ├── index.css     # CSS layers: tailwind-base, semi, tailwind-components, tailwind-utils
│   │   ├── main.tsx      # App entry, imports semi.css + index.css
│   │   └── App.tsx       # Routes, NO CSS imports
│   ├── dist/             # Built frontend (git-ignored)
│   ├── package.json      # bun deps
│   ├── vite.config.ts    # Vite + Semi plugin with cssLayer: true
│   ├── tailwind.config.js # Tailwind v3 with Semi Design token mapping
│   └── postcss.config.js  # PostCSS with tailwindcss plugin (NOT @tailwindcss/postcss)
├── svc/                  # FastAPI backend
│   ├── main.py           # App entry point
│   ├── routes/           # API routing
│   ├── apis/             # Business logic
│   ├── core/             # Auth, config, logger
│   └── tests/            # Pytest tests
├── dockerfiles/          # Multi-stage Dockerfiles
├── Caddyfile             # Reverse proxy config
├── docker-compose.yml    # Service orchestration
├── Makefile              # Dev workflow automation
├── pyproject.toml        # Python deps (uv)
├── .env                  # Environment config
└── CLAUDE.local.md       # Agent instructions (this file)
```

## Implementation Status (as of 2025-10-20)

### ✅ Completed
**Frontend:**
- React 18 + Vite SPA with 7 routed pages
- Annotation canvas with 5 working tools (rectangle, circle, polygon, line, select)
- Responsive sidebar (auto-collapses on annotation page)
- Theme switching (light/dark)
- i18n framework (EN/VI/ZH)
- Background image loading (`/samples/image_{ID}.jpg`)
- Zoom controls (50%-300%)
- 3-panel annotation layout (64px toolbar + flex canvas + 250px labels panel)
- **Tailwind CSS v3 + Semi Design integration** (CSS layers, Vite plugin, token mapping)

**Backend:**
- FastAPI with JWT auth (`/token` endpoint)
- Static file serving (SPA support)
- Health check (`/health`)
- Docker Compose deployment

**DevOps:**
- Docker multi-stage builds with Caddy
- Local dev workflow (hot reload)
- Makefile automation
- Linting (ruff, mypy, ESLint)
- Testing (pytest with coverage)

### 🚧 Partially Implemented
- Labels panel (UI only, no functionality)
- Properties panel (placeholder)
- Project/Dataset management (pages only, no CRUD)
- Export page (scaffold only)

### ❌ Not Yet Implemented (MVP Requirements)
**High Priority:**
- Annotation persistence (save/load to backend API)
- Backend annotation CRUD APIs
- Undo/Redo functionality
- Keyboard shortcuts for tools
- Point tool implementation
- Shape editing/deletion UI
- Label assignment to shapes
- Properties panel functionality
- Annotation list/tree view
- Project image listing API
- Export formats (COCO JSON, YOLO TXT, CSV)

**Medium Priority:**
- Loading states for images
- Error boundaries for canvas
- Tooltips on toolbar buttons
- Canvas pan/drag
- Annotation validation
- Multi-select for bulk operations
- Annotation statistics

## Development Conventions

**Git Workflow:**
- **main**: Production code
- Feature branches: `feature/<name>`
- Hotfixes: `hotfix/<issue>`
- Conventional commits: `feat:`, `fix:`, `docs:`

**Commit Message Guidelines:**
- Use [Conventional Commits](https://www.conventionalcommits.org/) format
- Types: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `build:`, `ci:`, `chore:`, `revert:`
- **CRITICAL**: ⚠️ **NEVER** use `BREAKING CHANGE:` in commit messages unless explicitly requested by the user
  - `BREAKING CHANGE:` triggers a MAJOR version bump (e.g., 1.0.0 → 2.0.0)
  - Only use when changes require manual user action or break backward compatibility
  - Examples of breaking changes:
    - Removing or renaming public APIs
    - Changing required environment variables
    - Requiring new secrets or configuration
    - Modifying database schema without migration
  - When in doubt, ask the user if the change should be marked as breaking
- **semantic-release version rules** (`.releaserc.json`):
  - `BREAKING CHANGE:` or `!` after type = MAJOR bump (1.0.0 → 2.0.0)
  - `feat:` = MINOR bump (1.0.0 → 1.1.0)
  - `fix:`, `perf:`, `refactor:`, `revert:` = PATCH bump (1.0.0 → 1.0.1)
  - `docs:`, `style:`, `chore:`, `test:`, `ci:` = No version bump

**Code Quality:**
- Python: Ruff (E, F, PT, C4, I), Mypy (strict), max complexity 10
- JS: ESLint with React plugins, Prettier
- Tests: Pytest >80% coverage, `@pytest.mark.integration` for integration tests

**Design System:**
- Responsive: 480px, 768px, 1024px, 1440px breakpoints
- Colors: Use Semi Design tokens via Tailwind (`bg-primary`, `text-semi-text-0`)
- Typography: Inter font (32px H1, 24px H2, 16px body)
- Accessibility: WCAG 2.1 AA (≥4.5:1 contrast)

## Common Issues

### CI/CD & Release

**For all CI/CD, semantic-release, and Dependabot troubleshooting**, see:
- 📖 [Complete Troubleshooting Guide](./docs/VERSIONING.md#troubleshooting) - Version bumping, commitlint, release failures
- 📖 [GitHub Repository Setup](./README.md#github-repository-setup) - PAT configuration, branch protection, auto-merge

**Quick reference:**
- semantic-release requires `SEMANTIC_RELEASE_TOKEN` (PAT) to bypass branch protection
- Dependabot auto-merge requires required status checks in branch protection
- Both work together with PAT-based approach (documented in README.md)

### Tailwind CSS + Semi Design

**CSS not loading correctly**:
- Verify Semi Design CSS is imported in `web/src/main.tsx`: `import '@douyinfe/semi-ui/dist/css/semi.css';`
- Check `@douyinfe/vite-plugin-semi` is installed: `bun pm ls | grep vite-plugin-semi`
- Verify Vite config has `vitePluginSemi({ cssLayer: true })` (web/vite.config.ts:17)
- Ensure PostCSS uses `tailwindcss` plugin, NOT `@tailwindcss/postcss` (web/postcss.config.js:3)
- Verify CSS layer order in index.css: `@layer tailwind-base, semi, tailwind-components, tailwind-utils`
- **DO NOT** import Semi Design CSS in App.tsx, components, or use `@import` in index.css

**Tailwind styles not overriding Semi Design**:
- Check CSS layer order - `tailwind-utils` should be last (highest priority)
- Use Tailwind utilities in JSX, not custom CSS classes
- Use `!important` sparingly - rely on CSS layers instead

**Semi Design components not styled**:
- Verify build output contains `@layer semi` (check dist/assets/*.css)
- Ensure Vite plugin is properly configured with CommonJS import workaround
- Check browser console for CSS loading errors

**Duplicate CSS styles / Large bundle**:
- Semi Design CSS should be ~679 KB (imported in main.tsx)
- Expected total CSS bundle: ~1,040 kB (Semi 679 KB + Tailwind + custom styles)
- **DO NOT** import Semi Design CSS in multiple places - only in main.tsx
- Let Vite plugin wrap the import with `@layer semi` automatically

**Verifying Tailwind v3 installation** (run these commands to confirm complete downgrade):
```bash
# 1. Check package.json shows v3
grep "tailwindcss" web/package.json
# Expected: "tailwindcss": "^3.4.17"

# 2. Check installed version
cat web/node_modules/tailwindcss/package.json | grep '"version"'
# Expected: "version": "3.4.18"

# 3. Verify bun.lock has no v4 references
grep -E "@tailwindcss/postcss|tailwindcss@[^3]" web/bun.lock
# Expected: (empty output - no matches)

# 4. Check bun package list
cd web && bun pm ls | grep tailwind
# Expected: ├── tailwindcss@3.4.18

# 5. Clean install to regenerate lock file
cd web && rm -rf node_modules && bun install
# Should show: tailwindcss@3.4.18

# 6. Verify build works
cd web && bun run build
# Expected: Build succeeds, CSS ~445 kB

# 7. Verify CSS layers in output
grep "@layer tailwind-base,semi,tailwind-components,tailwind-utils" web/dist/assets/index-*.css
# Expected: @layer tailwind-base,semi,tailwind-components,tailwind-utils
```

### Docker
**"gunicorn: not found"**: `.dockerignore` must exclude `.venv/`. Fix: `docker compose build --no-cache`

**Frontend 404**: `web/dist` missing. Fix: `make build-frontend && docker compose restart caddy`

**API returns HTML**: Caddyfile route order incorrect. Fix: API handles before static files

**.env not copied to container**: Check `.dockerignore` - ensure `.env` is NOT listed (only `.env.local` should be ignored)

**Changes not reflected**:
- Frontend: `make docker-restart` (rebuilds frontend + restarts containers)
- Backend: `docker compose -f docker-compose.yml build backend && docker compose -f docker-compose.yml up -d`
- Both: `make docker-build && docker compose -f docker-compose.yml up -d`

**Note**: Use `-f docker-compose.yml` explicitly to avoid auto-merging with `docker-compose.override.yml`.

**Lock file out of sync**: `uv lock && docker compose -f docker-compose.yml build backend`

### React
**`findDOMNode` error**: Semi Design incompatible with React 19. Fix: `bun install react@^18.3.1 react-dom@^18.3.1`

## Key Files

- **pyproject.toml**: Python deps, mypy/ruff/pytest config
- **uv.lock**: Locked Python environment
- **Caddyfile**: Reverse proxy (API → backend, static → frontend)
- **docker-compose.yml**: Base service definitions (production config)
- **docker-compose.override.yml**: Development overrides (auto-merged when using `docker compose` without `-f`)
- **.env**: Runtime config (git-ignored, but NOT dockerignored - used in builds)
- **.env.dev**: Development config (checked into git, NOT dockerignored)
- **.env.example**: Template config (checked into git)
- **.dockerignore**: Excludes `.venv/`, `node_modules/`, `.env.local` (but NOT `.env` or `.env.dev`)
- **Makefile**: Build/test/deploy orchestration
- **web/vite.config.ts**: Vite + Semi Design plugin configuration
- **web/tailwind.config.js**: Tailwind v3 with Semi Design token mapping
- **web/postcss.config.js**: PostCSS with tailwindcss plugin (v3 syntax)
- **web/src/index.css**: CSS layer definitions and custom styles

## Workflow Examples

**Fresh clone (Docker):**
```bash
cp .env.example .env
make docker-up
# Access: http://localhost:5002/
```

**Fresh clone (Local):**
```bash
cp .env.example .env
uv sync
make all
# Access: http://localhost:5002/
```

**Frontend dev (hot reload):**
```bash
cd web && bun install && bun run dev
# Dev server: http://localhost:5173/
# Still needs backend for API calls
```

**Backend dev (serves built frontend):**
```bash
uv sync
make build-frontend
make start-backend
# Backend + frontend: http://localhost:5002/
```

**Docker rebuild on changes:**
```bash
# Frontend changes (development mode with override)
make docker-restart

# Backend changes (production mode only)
docker compose -f docker-compose.yml build backend && docker compose -f docker-compose.yml up -d

# Both frontend + backend (production mode only)
make docker-build && docker compose -f docker-compose.yml up -d

# Config changes (Caddyfile, .env) - base config only (production)
docker compose -f docker-compose.yml restart

# Config changes - with override merged (development)
docker compose restart
```

**Note**:
- `make docker-build` uses `-f docker-compose.yml` for **production** builds (ENVIRONMENT=production, uses `.env.example`)
- `make docker-restart` uses `-f docker-compose.yml` for **production** builds
- `docker compose build` (without `-f`) merges override for **development** builds (ENVIRONMENT=develop, uses `.env.dev`)

## Production Deployment

1. Build frontend before deploy (CI/CD: `bun run build`)
2. Set proper secrets in `.env` (generate new `API_SECRET_KEY`)
3. Configure HTTPS in Caddyfile with domain
4. Use production logging (Sentry, Datadog)
5. Scale backend workers in Dockerfile
6. Add health checks to docker-compose.yml
7. Use Docker secrets instead of `.env` file

## Resources

- Makefile help: `make help`
- Docker Compose: https://docs.docker.com/compose/
- Caddy: https://caddyserver.com/docs/
- FastAPI: https://fastapi.tiangolo.com/
- Vite: https://vitejs.dev/
- Semi Design: https://semi.design/
- Semi Design + Tailwind: https://semi.design/zh-CN/start/tailwind
- Tailwind CSS v3: https://tailwindcss.com/docs
- Fabric.js: http://fabricjs.com/
