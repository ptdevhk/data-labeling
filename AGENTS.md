# AGENTS.md

**Instructions for Agents when working in this repository.**

## Agent Guidelines

### Documentation Tools (REQUIRED)
**ALWAYS use these MCP tools for up-to-date documentation:**

1. **context7**: Library documentation and API references
   - First call `mcp__context7__resolve-library-id` to get the library ID
   - Then call `mcp__context7__get-library-docs` with the library ID
   - Use for: React, FastAPI, Semi Design, i18next, Tailwind CSS, @karlorz/react-image-annotate

2. **deepwiki**: GitHub repository deep knowledge
   - Call `mcp__deepwiki__read_wiki_structure`, `read_wiki_contents`, or `ask_question`
   - Use for: facebook/react, vercel/next.js, fabricjs/fabric.js, DouyinFE/semi-design, **QuantumNous/new-api**
   - Example questions: "What are common issues with React 18?", "How to debug Semi Design components?", "How does CardPro component work in new-api?"

### Key Repositories for deepwiki
**Frontend Libraries:**
- `facebook/react` - React core, hooks, performance
- `remix-run/react-router` - React Router DOM 7 patterns
- `karlorz/react-image-annotate` - Primary annotation library
- `DouyinFE/semi-design` - Semi Design components
- `i18next/react-i18next` - Internationalization
- `tailwindlabs/tailwindcss` - Tailwind CSS v3

**Backend Libraries:**
- `fastapi/fastapi` - API design, async patterns
- `pydantic/pydantic` - Data validation

**Reference Templates:**
- `karlorz/full-stack-fastapi-template` - TypeScript patterns, OpenAPI client
- `QuantumNous/new-api` - Semi Design + Tailwind integration, component-based UI architecture

## Project Overview

Web-based image annotation tool with React SPA frontend + FastAPI backend.

**Monorepo Structure:**
```
data-labeling/
├── apps/
│   └── web/                    # React frontend (Vite)
├── packages/
│   └── react-image-annotate/   # Annotation library (workspace)
├── svc/                        # Python backend (FastAPI)
├── package.json                # Workspace root config
├── bun.lock                    # Single lockfile for all JS
└── makefile
```

**Current Stack:**
- React 18.3 (downgraded for Semi Design compatibility)
- React Router DOM 7 (nested routes)
- Semi Design 2.86 + Tailwind CSS 3.4
- @karlorz/react-image-annotate 4.0.3 (primary annotation library)
- i18next (EN/VI/ZH support)

**Quick Start:**
```bash
cp .env.example .env              # Generate API_SECRET_KEY: openssl rand -hex 32
make all                          # Local development on port 5002
make docker-up                    # Docker deployment on port 5002
```

## Development Commands

### Essential Commands
```bash
# Install (workspaces auto-linked)
bun install                       # Install all workspace dependencies

# Local Development
make all                          # Build lib + frontend, start backend
make start-frontend               # Frontend dev server on port 5173
make dev-lib                      # Library watch mode
make dev-all                      # Parallel lib + frontend dev (HMR)
make start-backend                # Backend only with hot reload

# Build
make build-all                    # Build lib then frontend
make build-lib                    # Build library only
make build-frontend               # Build frontend only

# Docker
make docker-up                    # Initial setup (builds + starts containers)
make docker-restart               # Rebuild + restart containers
make docker-down                  # Stop containers
docker compose logs -f            # View logs

# Quality & Testing
make test                         # Pytest with coverage
make lint                         # All linters (ruff, mypy, ESLint, i18n)
make lint-react                   # ESLint + i18n check

# API Client Generation
make generate-client              # Generate TypeScript client from OpenAPI spec

# No more bun link needed! Library is a workspace package.
```

## Architecture Rules

### Frontend Architecture

**CSS Layer Order (CRITICAL):**
- Semi Design CSS imported **ONLY** in `apps/web/src/main.tsx`
- CSS layers in `apps/web/src/index.css`: tailwind-base → semi → tailwind-components → tailwind-utils
- **DO NOT** import Semi CSS elsewhere (causes duplication and layer conflicts)
- Use PostCSS `tailwindcss` plugin, NOT `@tailwindcss/postcss`

**Component-Based UI Architecture (QuantumNous/new-api pattern):**

1. **PageLayout Pattern:**
   - Top-level container with `HeaderBar`, `SiderBar`, and `Content` areas
   - Dynamic rendering based on route and device type
   - Fixed header (56px mobile, 64px desktop)
   - Sidebar: 250px expanded, 64px collapsed (desktop only)
   - Content area adjusts padding/margin based on route and sidebar state
   - **Each page MUST add its own marginTop** for header offset
   - Standard pages: `style={{ marginTop: '80px' }}`
   - Annotation page: `style={{ marginTop: isMobile ? '56px' : '64px' }}`

2. **CardPro Component (Main content container):**
   - **Type 1 (Operational)**: Description + Actions + Search areas
     - Used for: User management, Basic CRUD operations
   - **Type 2 (Query-based)**: Statistics + Search areas
     - Used for: Logs, Usage tracking, Analytics views
   - **Type 3 (Complex)**: Description + Tabs + Actions + Search areas
     - Used for: Multi-section views, Channel management, Advanced features
   - Fixed pagination area at bottom for all types
   - Responsive: Hides certain areas on mobile devices

3. **Common UI Components (from apps/web/src/components/common/ui/):**
   - `CardPro`: Main content container with structured areas
   - `CardTable`: Specialized table card wrapper
   - `CompactModeToggle`: Toggle between compact/normal table views
   - `JSONEditor`: JSON editing with syntax highlighting
   - `Loading`: Minimum loading time indicator
   - `ScrollableContainer`: Custom scrollbar styling
   - `SelectableButtonGroup`: Multi-select button groups
   - `RenderUtils`: Common rendering utilities

4. **Essential Hooks (from apps/web/src/hooks/common/):**
   - `useIsMobile()`: Device detection for responsive UI
   - `useSidebarCollapsed()`: Sidebar state management
   - `useNavigation()`: Enhanced navigation utilities
   - `useMinimumLoadingTime()`: Loading UX improvements
   - `useContainerWidth()`: Dynamic width calculations
   - `useTableCompactMode()`: Table density preferences
   - `useNotifications()`: Toast notification system
   - `useUserPermissions()`: Permission-based rendering

**Layout Pattern (integrated design):**
- MainLayout creates fixed header (56px mobile, 64px desktop)
- **Each page MUST add its own marginTop**
- Standard pages: `style={{ marginTop: '80px' }}`
- Annotation page: `style={{ marginTop: isMobile ? '56px' : '64px' }}`
- Use inline styles for layout offsets (highest specificity)

**Routes:**
- `/` → Redirects to `/console`
- `/console` → Overview page
- `/console/projects` → Projects list
- `/console/projects/:id` → Project detail
- `/console/annotation/:id` → Annotation workspace
- `/console/datasets`, `/console/exports`, `/console/settings`

**Sidebar Behavior:**
- Desktop: Fixed sidebar (250px expanded, 64px collapsed)
- Mobile: Drawer overlay with backdrop
- Auto-collapses on annotation page
- State persisted in localStorage

### Backend Architecture

**FastAPI Structure:**
- Entry: `svc/main.py` - FastAPI app with routers + static serving
- Auth: `/token` endpoint → JWT → `Depends(get_current_user)`
- Config: `.env` loaded via `starlette.config.Config`

**Routing Order (critical for SPA):**
1. API routes (`/api*`, `/token`, `/health`)
2. Static files (`/assets` → `apps/web/dist/assets`)
3. SPA catch-all (`/{full_path:path}` → `index.html`)

### Docker Compose

**File Merging Behavior:**
- `docker-compose.yml`: Base production config
- `docker-compose.override.yml`: Dev overrides (auto-merged unless using `-f`)
- Production: `docker compose -f docker-compose.yml up`
- Development: `docker compose up` (merges override automatically)

**Environment Priority:**
1. Existing `.env` file (if present)
2. ENVIRONMENT=develop: Uses `.env.dev`
3. ENVIRONMENT=production: Uses `.env.example`

**Note**: `.dockerignore` does NOT exclude `.env` or `.env.dev` (needed for builds)

## Implementation Status

### ✅ Completed
- React SPA with 7 pages + routing
- @karlorz/react-image-annotate integration (6 tools, keyboard shortcuts)
- Theme switching (light/dark) + i18n (EN/VI/ZH)
- JWT authentication + health check
- Docker Compose deployment with Caddy
- Tailwind CSS v3 + Semi Design integration
- Responsive sidebar with collapse state
- **Common UI components from QuantumNous/new-api** (CardPro, CardTable, etc.)
- **Common hooks from QuantumNous/new-api** (useIsMobile, useSidebarCollapsed, etc.)
- **Annotation Save/Export functionality**:
  - Save button (persists to localStorage, no navigation)
  - Export button with format selection (JSON, YOLO, COCO, Pascal VOC)
  - `onSave` and `onExport` callbacks added to react-image-annotate library
  - Region color preservation for reload
  - Export dialog with annotation count from library state

### 🚧 Partially Implemented
- Project/Dataset management (UI exists, no backend CRUD)

### ❌ TODO (MVP Priority)
- **Backend annotation CRUD APIs** (POST/GET/PUT/DELETE)
- **Annotation persistence to backend** (currently localStorage only)
- **Dataset image listing API** (for next/prev navigation)
- Project/Dataset CRUD operations

## Development Conventions

### Git Workflow
- Branches: `feature/<name>`, `hotfix/<issue>`
- Conventional commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `build:`, `ci:`, `chore:`
- **⚠️ NEVER use `BREAKING CHANGE:`** unless explicitly requested by user
- semantic-release rules: feat=MINOR bump, fix=PATCH bump

### Code Quality
- Python: Ruff (E, F, PT, C4, I), Mypy strict mode
- JavaScript: ESLint with React plugins, Prettier
- Tests: >80% coverage target
- Max complexity: 10 (Python)

### Design System
- Breakpoints: 480px, 768px, 1024px, 1440px
- Use Semi Design tokens via Tailwind: `bg-primary`, `text-semi-text-0`
- Typography: Inter font (32px H1, 24px H2, 16px body)
- Accessibility: WCAG 2.1 AA (≥4.5:1 contrast)
- Border radius: 10px for interactive elements (buttons, inputs, cards)
- Visual effects: Pastel balls background, shine text animations
- Custom scrollbars: Styled for tables and side sheets

## Migration to QuantumNous/new-api Design

### Migration Strategy
1. **Component Migration Priority:**
   - Replace existing card layouts with `CardPro` patterns
   - Use `CardTable` wrapper for all table components
   - Implement `CompactModeToggle` for data-heavy views
   - Add `Loading` with minimum display time for better UX

2. **Hook Integration:**
   - Replace existing mobile detection with `useIsMobile()`
   - Standardize sidebar state with `useSidebarCollapsed()`
   - Use `useMinimumLoadingTime()` for all async operations
   - Implement `useTableCompactMode()` for user preferences

3. **Layout Refactoring:**
   - Maintain PageLayout structure with HeaderBar + SiderBar + Content
   - Apply CardPro types based on page functionality:
     - Projects/Datasets: Type 1 (operational)
     - Logs/Analytics: Type 2 (query-based)
     - Annotation workspace: Custom layout (not CardPro)
   - Ensure all pages handle marginTop for header offset

4. **Styling Guidelines:**
   - Maintain CSS layer architecture (tailwind-base → semi → tailwind-components → tailwind-utils)
   - Apply 10px border-radius consistently
   - Use CSS custom properties for theming
   - Implement visual enhancements (backgrounds, animations) progressively

## Common Issues & Solutions

### CSS/Tailwind Issues
**Problem**: Semi Design components not styled
- **Solution**: Verify Semi CSS import in `main.tsx` only
- Check Vite config has `vitePluginSemi({ cssLayer: true })`
- Verify CSS layer order in `index.css`

**Problem**: Tailwind styles not overriding Semi Design
- **Solution**: Check CSS layer order - `tailwind-utils` must be last
- Use `!important` sparingly - rely on layer precedence

### Docker Issues
**Problem**: Frontend 404 errors
- **Solution**: Run `make build-frontend` before `docker compose up`

**Problem**: Changes not reflected
- **Solution**: Use `make docker-restart` for frontend changes
- For backend: `docker compose -f docker-compose.yml build backend`

### React Issues
**Problem**: `findDOMNode` deprecation error
- **Solution**: React 18.3 required (Semi Design incompatible with React 19)

### Vite Dev Server Hang
**Problem**: Vite prints "$ vite" then hangs
- **Fix**: `make clean-frontend-cache && bun install --force`
- **Cause**: Bun cache corruption with Node 24 + Vite 7
- **Prevention**: Run clean-frontend-cache when switching branches

## Key Files Reference

### Frontend Core
- `apps/web/src/main.tsx`: Entry point, imports Semi CSS
- `apps/web/src/index.css`: CSS layer definitions
- `apps/web/vite.config.ts`: Semi Design plugin configuration
- `apps/web/tailwind.config.js`: Semi token mapping

### Annotation Feature
- `apps/web/src/components/Annotation/AnnotationWorkspace.jsx`: Main annotation page
- `apps/web/src/components/Annotation/AnnotationCanvas.jsx`: Canvas wrapper for react-image-annotate
- `apps/web/src/components/Annotation/AnnotationExportDialog.jsx`: Export format dialog
- `apps/web/src/hooks/annotation/useAnnotationData.js`: Annotation state, save/export logic
- `apps/web/src/utils/exportFormats.js`: YOLO, COCO, VOC, JSON export utilities

### Library (react-image-annotate)
- `packages/react-image-annotate/src/Annotator/index.jsx`: Main component (accepts onSave, onExport)
- `packages/react-image-annotate/src/hooks/useAnnotator.js`: Headless hook with Save/Export handlers
- `packages/react-image-annotate/src/MainLayout/index.jsx`: Toolbar with Save/Export buttons
- `packages/react-image-annotate/src/I18nProvider/index.jsx`: i18n translations (en, zh, vi)

### Backend & Config
- `svc/main.py`: FastAPI app with routing order
- `Caddyfile`: Reverse proxy configuration
- `.dockerignore`: Excludes .venv/, node_modules/, .env.local (NOT .env)

## Resources
- Semi Design: https://semi.design/
- @karlorz/react-image-annotate: https://github.com/karlorz/react-image-annotate
- FastAPI: https://fastapi.tiangolo.com/
- Full implementation patterns: See PROJECT.md