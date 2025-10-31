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
- `QuantumNous/new-api` - **Semi Design + Tailwind CSS v3 integration patterns**, CSS layer management, Vite plugin configuration, **layout architecture** (Header/Sidebar/useNavigation hook pattern)

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

**Latest Updates (feat/clone branch - 2025-10-31):**

This branch implements a comprehensive annotation system with advanced canvas interactions, multi-select capabilities, and improved UI/UX patterns. Key changes:

**Annotation System Enhancements:**
- **Dual Zoom Modes**: FIT_WIDTH (default, auto-scales to container) and MANUAL_ZOOM (1:1 pixel size)
- **Canvas Pan Constraints**: Limits panning to image boundaries with proper edge detection
- **Selection Handling**: Multi-select with Shift+click, single select, click-to-deselect on canvas
- **Annotation List Panel**: New dedicated panel showing all annotations with visibility/lock/delete controls
- **Label Assignment**: Modal dialog for assigning labels to shapes with color picker
- **Hover Interactions**: Visual feedback on hover (dashed stroke, handles visible)
- **Drag & Drop**: Move annotations with proper boundary constraints

**Component Updates:**
- `AnnotationCanvas.jsx`: Complete rewrite with ~955 lines of new canvas logic
  - Shape creation: rectangle, circle, polygon, line tools
  - Selection modes: single, multi-select, click-to-clear
  - Pan constraints: keeps image visible, prevents over-panning
  - Zoom integration: syncs with parent zoom controls
  - Annotation synchronization: two-way sync between Fabric shapes and context state
- `AnnotationListPanel.jsx`: New 269-line component for annotation management
  - Tree view of all annotations
  - Visibility toggle (eye icon)
  - Lock/unlock editing (lock icon)
  - Delete annotation (trash icon)
  - Select annotation by clicking list item
- `AnnotationToolsToolbar.jsx`: Enhanced with tooltips, fit width button
- `LabelsPanel.jsx`: Refactored for better label management
- `LabelAssignmentDialog.jsx`: Modal for post-creation label assignment

**Context & State:**
- `AnnotationContext.jsx`: New state management for:
  - `annotations`: Array of all annotations with id, type, coordinates, label, color
  - `activeAnnotationId`: Currently selected annotation
  - `selectAnnotation(id)`: Select single annotation
  - `toggleAnnotationSelection(id)`: Multi-select with Shift
  - `clearSelection()`: Deselect all
  - CRUD operations: add, update, remove, clear all

**UI/UX Improvements:**
- Header menus refactored to use Semi UI Dropdown (replacing custom implementations)
- Annotation page layout: 3-panel design (toolbar 64px + canvas flex + list panel 250px)
- Dark mode support with proper stroke colors (light mode: #3b82f6, dark: #60a5fa)
- Responsive hover states with visual feedback
- Tooltips on all toolbar buttons (keyboard shortcuts shown)

**Internationalization:**
- New i18n keys in en/vi/zh locales:
  - `annotation.toolbar.*`: Tool names and shortcuts
  - `annotation.listPanel.*`: List panel UI strings
  - `annotation.labelDialog.*`: Label assignment dialog
  - `annotation.actions.*`: Action buttons (show/hide, lock/unlock, delete)

**Technical Patterns:**
- Refs for stable callbacks: Prevents re-render loops in canvas event handlers
- Shape registry: Maps Fabric.js objects to annotation IDs for two-way sync
- Color utilities: `hexToRgba()` for alpha channel support
- Dimension computation: Handles scaled shapes with fallback logic
- Boundary detection: Accurate edge checking for pan constraints

**Files Changed (14 files, +1537 -366 lines):**
- Major: AnnotationCanvas.jsx, AnnotationListPanel.jsx (new), AnnotationContext.jsx
- Moderate: Annotation.jsx, AnnotationToolsToolbar.jsx, LabelsPanel.jsx
- Minor: Header.jsx, MainLayout.jsx, LabelAssignmentDialog.jsx
- Docs: PROJECT.md (design updates), AGENTS.md (this update)
- i18n: en.json, vi.json, zh.json (47 new keys each)

**Key Implementation Notes for Agents:**
- When adding new canvas features, use `fabricCanvasRef.current` to access Fabric.js canvas
- Shape selection should update both `shapeRegistryRef` and `AnnotationContext` state
- Color values: Use `hexToRgba(color, alpha)` for consistent RGBA formatting
- Pan boundaries: Check `backgroundImageRef.current` dimensions before panning
- Multi-select: Use `annotations.filter(a => a.selected)` to get selected annotations
- Delete operations: Must call both `canvas.remove(shape)` and `removeAnnotation(id)`
- **Always reference MCP tools for implementation patterns**: Use `context7` for Fabric.js/Semi Design docs, `deepwiki` for React/fabric.js repo best practices

**Layout Architecture** (Updated 2025-10-20):
- Follows **new-api** design pattern (`QuantumNous/new-api`)
- **Routes**: `/` redirects to `/console`, main pages: `/console`, `/console/projects`, `/console/datasets`, `/console/exports`, `/console/settings`
- **Header**: Logo + configurable nav links (Home, Console, Projects) + language/theme/user controls
- **Sidebar**: Collapsible navigation (Console, Projects, Datasets, Exports, Settings)
- **Hooks**: `useNavigation` (header links), `useSidebarCollapsed` (sidebar state), `useIsMobile` (768px breakpoint)

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
1. API routers (`/api*`, `/token`, `/health`, `/api/docs`, `/api/redoc`)
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

**Annotation Canvas Zoom Architecture** (Updated 2025-10-28):

The annotation page implements a dual-zoom system inspired by AnyLabeling:

**Two Zoom Modes:**
1. **FIT_WIDTH** (Default ON):
   - Image scales to fit container width automatically
   - Auto-adjusts on window resize via ResizeObserver
   - Formula: `canvasZoom = (containerWidth - 2) / imageWidth`
   - Background image: Always at 1:1 scale (scaleX: 1, scaleY: 1)
   - Zoom handled by: Fabric canvas zoom property
   - Toggle button: Active/highlighted state

2. **MANUAL_ZOOM** (Toggle OFF):
   - Image displays at actual pixel size (e.g., 1635×1280px)
   - Background image: At 1:1 scale (scaleX: 1, scaleY: 1)
   - Canvas zoom: 1.0 (100%)
   - Image position: Centered `(canvasWidth - imgWidth) / 2`
   - Window resize: Does NOT change zoom/scale
   - Toggle button: Inactive/normal state

**Key Implementation Details:**
- **Background image scale**: Always 1.0 in BOTH modes (never scaled)
- **Zoom control**: Fabric canvas zoom property only
- **Positioning**: Origin (0, 0) for FIT_WIDTH, centered for MANUAL
- **State tracking**: `zoomModeRef` to handle ResizeObserver timing
- **Image loading**: `imageLoadedRef` flag prevents premature centering
- **No double-scaling**: Old `resizeBackgroundImage()` removed, replaced with `centerBackgroundImage()`

**Files:**
- `web/src/pages/Annotation.jsx` - Zoom mode state, toggle handlers
- `web/src/components/Canvas/AnnotationToolsToolbar.jsx` - Fit Width button (Maximize2 icon)
- `web/src/components/Canvas/AnnotationCanvas.jsx` - Canvas zoom, image positioning, ResizeObserver

**Troubleshooting:**
- If image shrinks on refresh: Check background image scale is 1.0, not fitted
- If only corner visible: Check image position is (0, 0) for FIT_WIDTH mode
- If toggle doesn't change size: Check `resetToCenter()` is called and `zoomModeRef` is updated
- If inconsistent on load: Check `imageLoadedRef` flag and ResizeObserver coordination

**Theme handling:**
- `ThemeContext` persists `light` / `dark` / `auto` and toggles `<html>` classes
- Applies `body` `theme-mode="dark"` for Semi Design compatibility
- Header dropdown uses `setThemeMode` to avoid cycling toggle behavior

**Layout Structure** (Updated 2025-10-20, based on new-api):
```
web/src/
├── components/Layout/
│   ├── MainLayout.jsx      # Fixed header + sidebar layout
│   ├── Header.jsx          # Logo + nav links + actions
│   └── Sidebar.jsx         # Collapsible navigation menu
├── hooks/
│   ├── useNavigation.js    # Header nav links configuration
│   ├── useSidebarCollapsed.js  # Sidebar collapse state
│   └── useIsMobile.js      # 768px breakpoint detection
├── pages/
│   ├── Console.jsx         # Console overview (hero banner + stat grid)
│   ├── Projects.jsx        # Projects list
│   ├── Datasets.jsx        # Datasets management
│   ├── Exports.jsx         # Export formats
│   ├── Settings.jsx        # Settings page
│   └── Annotation.jsx      # Annotation workspace
└── App.tsx                 # Routes: / → /console redirect
```

**Routing:**
- `/` → Redirects to `/console`
- `/console` → Console overview page
- `/console/projects` → Projects list
- `/console/projects/:id` → Project detail
- `/console/datasets` → Datasets management
- `/console/exports` → Export page
- `/console/settings` → Settings
- `/console/annotation/:id` → Annotation workspace

**Header Navigation** (Desktop only, `useNavigation` hook):
- Home → `/` (redirects to `/console`)
- Console → `/console`
- Projects → `/console/projects`
- Active link highlighting with Semi Design primary color

**Sidebar Navigation** (All pages except annotation):
- Console → `/console`
- Projects → `/console/projects`
- Datasets → `/console/datasets`
- Exports → `/console/exports`
- Settings → `/console/settings`
- Collapse button at bottom (persistent via localStorage)

**Responsive Behavior:**
- **Desktop (>768px)**: Fixed sidebar (250px expanded, 64px collapsed), header nav links visible
- **Mobile (≤768px)**: Drawer sidebar, header nav links hidden, hamburger menu

**Console page layout notes:**
- Page uses the shared Semi Layout padding without a dedicated hero card.
- The top section is a responsive grid of compact stat cards (icon + two-line label/value).
- Main column stacks "Recent Projects" and "Project Activity" cards; side column shows "Quick Actions" shortcuts.
- Stats and cards follow the `new-api` spacing/pill icon patterns.

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
    handle /api/docs { reverse_proxy backend:5001 }
    handle /api/redoc { reverse_proxy backend:5001 }

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
│   │   ├── pages/        # 7 pages (Console, Projects, ProjectDetail, etc.)
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

## Implementation Status (as of 2025-10-31)

### ✅ Completed
**Frontend:**
- React 18 + Vite SPA with 7 routed pages
- **Annotation canvas with 5 working tools** (rectangle, circle, polygon, line, select)
- **Advanced selection system**: Single select, multi-select with Shift+click, click-to-deselect
- **Annotation List Panel**: Dedicated panel with visibility/lock/delete controls (NEW in feat/clone)
- **Label Assignment Dialog**: Post-creation label assignment with color picker (NEW in feat/clone)
- **Canvas Pan Constraints**: Prevents over-panning beyond image boundaries (NEW in feat/clone)
- **Hover Interactions**: Visual feedback on annotation hover (dashed stroke, handles) (NEW in feat/clone)
- **Dual Zoom Modes**: FIT_WIDTH (auto-scale) and MANUAL_ZOOM (1:1 pixels) (NEW in feat/clone)
- Responsive sidebar (auto-collapses on annotation page)
- Theme switching (light/dark) with proper annotation colors
- i18n framework (EN/VI/ZH) with 47+ new annotation-related keys
- Background image loading (`/samples/image_{ID}.jpg`)
- Zoom controls (50%-300%)
- 3-panel annotation layout (64px toolbar + flex canvas + 250px list panel)
- **Tailwind CSS v3 + Semi Design integration** (CSS layers, Vite plugin, token mapping)
- **Semi UI Dropdown menus** in header (language, theme, user)
- **Tooltips on toolbar buttons** with keyboard shortcuts

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
- Labels panel (UI + basic CRUD, needs advanced features)
- Properties panel (placeholder, needs full implementation)
- Project/Dataset management (pages only, no backend CRUD)
- Export page (scaffold only)
- **Annotation state persistence** (in-memory only, no backend save/load yet)

### ❌ Not Yet Implemented (MVP Requirements)
**High Priority:**
- **Annotation persistence to backend** (save/load annotations via API)
- Backend annotation CRUD APIs (POST/GET/PUT/DELETE endpoints)
- Undo/Redo functionality (history stack)
- **Keyboard shortcuts for tools** (R, C, P, L, S keys)
- Shape editing UI improvements (vertex manipulation for polygons)
- Advanced label features (nested categories, attributes)
- Annotation validation (min size, max count)
- Project image listing API
- Export formats (COCO JSON, YOLO TXT, CSV)

**Medium Priority:**
- Loading states for images
- Error boundaries for canvas
- Canvas drag-to-pan (currently select tool only)
- Multi-select bulk operations (batch delete, batch label)
- Annotation statistics (count by label, coverage %)
- Search/filter annotations in list panel

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

### Vite Dev Server
**Vite hangs after printing "$ vite"** (no further output, doesn't bind to port 5173):

**Root Cause**: Bun cache corruption triggered by Node.js v24 + Vite v7 incompatibility. This is NOT a code issue - it's a known tooling bug where Bun's dependency cache becomes stale and Vite's ESM loader gets stuck during module resolution.

**Quick Fix**:
```bash
make clean-frontend-cache    # Clears node_modules, bun.lockb, .vite cache
cd web && bun install --force
bun run dev                  # Should start in <1 second
```

**Why This Happens**:
- Vite 7.x uses experimental Node.js ESM loader hooks
- Node 24 introduced breaking changes to the loader API  
- Bun's caching can create a corrupted state that triggers the hang
- The hang occurs BEFORE `vite.config.ts` is even loaded

**Evidence**: Confirmed by GitHub issues:
- [oven-sh/bun#16968](https://github.com/oven-sh/bun/issues/16968) - "The service was stopped"
- [vitejs/vite#19691](https://github.com/vitejs/vite/discussions/19691) - "failed to load config with bun"

**Long-term Solution**: Migrate to Node.js v22 LTS for stable development environment (avoids Node 24 + Vite 7 incompatibility altogether).

**Prevention**: Run `make clean-frontend-cache` whenever switching branches or after major dependency updates.

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
