### Project Overview

This project develops a web-based image data labeling tool emphasizing manual annotation workflows, with extensibility for future LLM agent integration to support assisted tasks such as label suggestions or classifications. Users can manually draw shapes (e.g., polygons, rectangles, circles, lines, points) on images to generate datasets for machine learning applications including object detection, instance segmentation, and tagging.

Structured as a monorepo, the project features a React single-page application (SPA) frontend in `./web`, a FastAPI Python backend in `./svc` for data persistence and API services, and Caddy as a reverse proxy for secure production serving. Docker Compose orchestrates the full stack, ensuring seamless development and deployment.

Drawing inspiration from AnyLabeling, the tool delivers an intuitive, web-native interface prioritizing manual precision. Differentiators include:
- Browser-based access without desktop installation.
- Manual-only labeling at launch; LLM features deferred.
- Exclusion of auto-segmentation (e.g., no SAM/SAM2).

### Development Workflow

Adopt Gitflow for structured collaboration: Develop features in isolated branches, integrate via `develop`, and release to `main`. Implement CI/CD (e.g., GitHub Actions) to automate linting, testing, and builds on pull requests. Track tasks and bugs via GitHub Issues.

- **Branching Strategy**: 
  - `main`: Stable production code.
  - `develop`: Integration branch for ongoing work.
  - Feature branches: `feature/<descriptive-name>` (e.g., `feature/polygon-tool`).
  - Hotfix branches: `hotfix/<issue-description>` for urgent patches.
- **Commit Conventions**: Conventional Commits format (e.g., `feat: implement rectangle tool`, `fix: resolve zoom lag`, `docs: update README`). Scope commits to single concerns; limit lines to 72 characters.
- **Pull Requests**: Require at least one reviewer; include unit tests and changelog entries. Merge via squash-and-merge to maintain linear history.
- **Releases**: Semantic versioning (e.g., `v1.0.0`); automate tags and changelogs with tools like semantic-release.

### Design Requirements

The UI/UX design establishes a professional, accessible foundation optimized for extended labeling sessions, blending Console efficiency with precise canvas interactions. Emphasize minimalism to reduce cognitive load, ensuring scalability for future LLM elements.

- **Layout Structure**:
  - **Global Navigation**: Collapsible sidebar (20% width on desktop, hamburger on mobile) for projects, datasets, exports, and settings; top header with search, notifications bell, user avatar dropdown, and dark/light mode toggle.
  - **Main Content Areas**: Console uses card grids (3-column on desktop, 1-column mobile) for project overviews; annotation view employs split layout (tools sidebar: 15%, canvas: 70%, properties panel: 15%).
  - **Responsive System**: CSS Grid/Flexbox with media queries; breakpoints: 480px (mobile: stack vertically), 768px (tablet: horizontal nav), 1024px (desktop: full split-view), 1440px (large: expanded previews).

  #### Responsive Sidebar Implementation (✅ Completed - 2025-10-09)
  The global navigation sidebar follows the new-api design pattern, providing optimal UX across all viewport sizes:

  **Desktop Behavior (>480px):**
  - **Fixed Positioning**: Sidebar remains visible and fixed to left edge
  - **Expanded State** (250px): Full navigation with logo, app name, text labels, version footer
  - **Collapsed State** (64px): Icon-only navigation, hidden text, rotated chevron indicator
  - **Toggle Mechanism**: Chevron button at bottom; hamburger menu in header (both trigger collapse/expand)
  - **Smooth Transitions**: 300ms cubic-bezier animation for width changes, content area margins adjust automatically
  - **State Persistence**: Collapse preference saved to localStorage, restored on page reload
  - **Auto-Collapse**: Sidebar automatically collapses when navigating to annotation page (maximizes canvas space)

  **Mobile Behavior (≤480px):**
  - **Hidden by Default**: Sidebar completely hidden, content uses full viewport width
  - **Drawer Overlay**: Hamburger menu (≡) in header opens slide-in drawer from left
  - **Backdrop**: Semi-transparent black overlay (rgba(0,0,0,0.5)) behind drawer, click to dismiss
  - **Slide Animation**: 300ms ease-in transition from left edge
  - **Auto-Close**: Drawer automatically closes after navigation item selection
  - **Full Navigation**: Drawer shows expanded sidebar (250px) with all navigation items

  **Technical Implementation:**
  - **CSS Variables**: `--sidebar-width: 250px`, `--sidebar-width-collapsed: 64px`, `--sidebar-current-width` (dynamic)
  - **Body Class**: `body.sidebar-collapsed` toggles `--sidebar-current-width` between expanded/collapsed
  - **React Hooks**:
    - `useIsMobile()`: Detects viewport ≤480px via window.matchMedia
    - `useSidebarCollapsed()`: Manages collapsed state, syncs with body class and localStorage
  - **Components**:
    - `MainLayout.jsx`: Orchestrates sidebar rendering (drawer vs fixed), manages states
    - `Sidebar.jsx`: Renders as `<aside>` (not Semi's Layout.Sider to avoid width conflicts), uses Semi's `Nav` component for menu items
    - `Header.jsx`: Hamburger button switches behavior (drawer toggle on mobile, collapse on desktop)
  - **Semi Design Integration**: Uses `Nav`, `Nav.Header`, `Button` components with `theme="borderless"` for minimal aesthetic
  - **Route Highlighting**: Active navigation item highlighted via `selectedKeys` prop, synced with React Router location

  **Design Rationale:**
  - Inspired by new-api's sidebar pattern for consistency with modern web apps
  - Prioritizes canvas space on annotation page via auto-collapse
  - Mobile-first drawer prevents viewport clutter on small screens
  - CSS variables enable theme-agnostic sizing (works with light/dark modes)
  - localStorage persistence reduces friction for returning users
- **Header and Sidebar Navigation**:
  - **Top Header**: A fixed, slim bar (64px height) spanning the full width, providing quick-access global controls. Key items from left to right:
    - **Toggle Sidebar Button**
    - **Logo/Branding**: App icon and name (e.g., "Data Labeling Tool") with link to console; clickable for home navigation.
    - **Configurable Navigation Links (useNavigation)**: Home, Console, Projects.
    - **Search Bar**: Compact input field (Semi Design Input) for global search across projects, datasets, or annotations; placeholder "Search projects or images..."; supports autocomplete for recent items.
    - **Notifications Bell**: Icon button (Lucide Bell) with badge for unread count; dropdown menu (Semi Design Popover) showing toast-like alerts (e.g., "Annotation saved", "Upload complete"); integrates with React-Toastify for persistence.
    - **User Avatar Dropdown**: Circular avatar (initials or image) with chevron; menu (Semi Design DropdownMenu) includes profile, settings, logout; shows user role (e.g., "Admin") and version info.
    - **Dark/Light Mode Toggle**: Switch icon (Lucide Moon/Sun) at far right; persists via localStorage; animates smoothly with 300ms transition.
    - **Hamburger Menu (Mobile Only)**: Three-line icon to toggle sidebar drawer; positioned after logo.
    - **Auto-Save Indicator**: Small status icon (e.g., Lucide Save with green check) next to notifications bell; shows "Saving..." spinner during saves, timestamp on success (e.g., "Saved 2m ago"); clickable to force manual save.
  - **Sidebar Menu**: Vertical navigation (Semi Design Nav) in a collapsible aside (250px expanded, 64px collapsed on desktop); full drawer overlay on mobile (slide-in from left with backdrop). Items structured hierarchically with icons and labels (hidden in collapsed state):
    - **Console**: Home icon; overview page with project cards and stats.
    - **Projects**: Folder icon; list view with create/new button; sub-items: "My Projects", "Shared Projects".
    - **Datasets**: Image icon; upload/browse interface; sub-items: "All Datasets", "Pending Review".
    - **Annotations**: Edit icon; active labeling workspace; sub-items: "In Progress", "Completed".
    - **Exports**: Download icon; format selection and history; sub-items: "Recent Exports", "Templates".
    - **Settings**: Gear icon; user preferences; sub-items: "Account", "Themes", "Shortcuts", "Help & Feedback", "Auto-Save (Toggle)".
    - **Footer (Expanded Only)**: Version number (e.g., "v1.0.0") and logout button at bottom.
    - **Collapse sidebar(left,right arrow)**
    - **Behavior**: Auto-highlight active route via `selectedKeys`; chevron toggle for collapse/expand; state synced with localStorage; auto-collapse on annotation page to maximize canvas space.
- **Color Scheme and Theming**:
  - **Primary**: Light mode (#FFFFFF bg, #111827 text, #3B82F6 primary action, #10B981 success, #EF4444 error, #F3F4F6 neutral).
  - **Dark Mode**: #111827 bg, #F9FAFB text, adjusted accents for visibility; toggle persists via localStorage.
  - **Accessibility**: WCAG 2.1 AA compliant (≥4.5:1 contrast); use semantic colors (e.g., blue for interactive, avoid pure red-green distinctions).
- **Typography and Icons**:
  - **Fonts**: Inter (system fallback: -apple-system, BlinkMacSystemFont); scale: H1 (32px bold), H2 (24px semibold), body (16px regular), captions (14px light).
  - **Icons**: Lucide React library; 24px default, stroke-width 2px; tool-specific (e.g., square icon for rectangle); tooltips on hover/focus.
- **Interactions and Feedback**:
  - **Animations**: Micro-interactions (e.g., 150-300ms cubic-bezier transitions for hovers, modals); disable during canvas focus to prevent interference.
  - **Feedback Mechanisms**: Inline validation (e.g., red outlines for invalid shapes); toasts for async ops (position: bottom-right, duration: 4s); progress indicators for uploads/exports. For auto-save, display subtle toast notifications (e.g., "Draft saved automatically") on successful saves, with error toasts for failures (e.g., "Save failed—check connection"); include a recovery prompt modal on app reload if unsaved changes are detected in drafts.
  - **Onboarding Flow**: Interactive tour (e.g., Joyride library) with 4-6 steps, highlighting key UI; skippable, one-time via localStorage.
- **Canvas-Specific Elements**:
  - **Viewer**: Full-bleed canvas with optional faint grid (toggle via icon); floating toolbar for zoom/reset; drag-to-pan with cursor hints.
  - **Tools Palette**: Vertical list with preview thumbnails; selected tool glows (#3B82F6 border); right-click context menu for shape options. Implement as a Semi Design `ButtonGroup` for cohesive clustering: Use `theme="borderless"` for minimalism, `type="tertiary"` for neutral states, and `theme="solid"`/`type="primary"` for active selection. Icons from Lucide React (e.g., `IconSquare` for rectangle); tooltips via Semi `Tooltip` for shortcuts (e.g., "Rectangle (R)"). Group into drawing tools (polygon, rectangle, circle, line, point) and utilities (eraser, undo, redo) with a divider. Responsive: Vertical on desktop (`flexDirection: 'column'`), horizontal stack on mobile via media queries. Integrate with Fabric.js via `onClick` handlers to set drawing modes (e.g., `canvas.isDrawingMode`). Trigger auto-save events on tool actions like shape completion or undo/redo to capture state changes promptly. **Note**: For implementation patterns, agents should reference MCP tools (context7, deepwiki) for Semi Design, Lucide React, and Fabric.js best practices.
  - **Labels Panel**: Collapsible accordion for classes/attributes; drag-to-reorder classes; color picker for shape fills.
- **Localization and Inclusivity**:
  - Support RTL layouts; initial languages: English (default), Vietnamese, Chinese (via i18next JSON files).
  - Design Tokens: Use CSS custom properties (e.g., `--primary-color: #3B82F6`) for theme consistency; Figma library for component variants.
- **Prototyping Guidelines**:
  - Create high-fidelity Figma prototypes with motion prototypes; iterate based on user testing (e.g., 5-10 labelers for task completion time).
  - Ensure 100% keyboard operability (e.g., Tab to tools, Enter to confirm shapes).

### Scope for Frontend Phase
Focus on a functional MVP: Standalone React SPA supporting manual labeling with mock APIs. Boot locally via Vite; persist via IndexedDB. Implement core design elements (Console, canvas) for desktop/tablet responsiveness. Defer full backend/LLM until Phase 2.

### Functional Requirements

#### 1. User Authentication and Project Management
- **Authentication**: Form-based login/register (mock JWT tokens); guest mode with limited exports.
- **Console**: Grid of project cards (create/edit: name, desc, class YAML import); stats (e.g., 80% labeled) with VChart pie charts; search/filter by name/date.
- **Datasets**: Drag-and-drop batch upload (≤10MB/image, JPEG/PNG); thumbnail carousel with lazy loading; bulk delete.

#### 2. Image Annotation Interface
- **Viewer**: Fabric.js canvas integrated with zoom/pan; navigation sidebar for dataset thumbnails; full-screen toggle.
- **Tools** (Manual):
  - Rectangle/Polygon/Circle/Line/Point: Intuitive drawing modes with snap-to-grid option.
  - Move and edit the selected polygons: Highlight active polygon with semi-transparent fill, allow dragging the entire shape, and expose vertex handles for precise adjustments and arrow-key nudges.
  - Eraser/Undo/Redo: Visual undo stack preview; max 50 actions.
  - **Zoom follows window width**: Automatic canvas scaling that dynamically adjusts the zoom level to fit the image width to the viewport width. When enabled, the canvas automatically recalculates the scale factor on window resize events by dividing the container width by the image width (`scale = containerWidth / imageWidth`). The zoom mode toggles between `FIT_WINDOW` (fit entire image), `FIT_WIDTH` (fit width only), and `MANUAL_ZOOM` (user-controlled). The `resizeEvent` handler triggers `adjustScale()` to recompute and apply the new zoom percentage, persisting the current mode per file. This behavior mimics AnyLabeling's `set_fit_width()` and `scale_fit_width()` methods, providing seamless responsiveness without manual zoom adjustments.
  - **Canvas Scrolling** (✅ Implemented - 2025-10-28): Dynamic canvas resizing enables proper scrolling when zoomed images exceed viewport dimensions. The implementation ensures the canvas element itself grows/shrinks based on zoom level, rather than relying solely on Fabric.js viewport transforms:
    - **Dynamic Canvas Dimensions**: Canvas element size (`<canvas width/height>`) automatically adjusts when zoom changes. For example, at 100% zoom on a 1635×1280px image, canvas becomes 1635×1280px; at 200% zoom, it expands to 3270×2560px, triggering native browser scrollbars.
    - **Container Hierarchy**: Canvas wrapper uses `display: inline-block` with `minWidth/minHeight: 100%` to expand with canvas content while remaining centered. Parent container has `overflow: auto` to enable scrolling when canvas exceeds viewport.
    - **Zoom Integration**: Three zoom functions dynamically resize canvas:
      - `setZoom(level)`: Calculates new dimensions as `Math.round(imageWidth × level)` and applies via `canvas.setDimensions()`, then updates Fabric zoom with `canvas.setZoom(level)`.
      - `resetToCenter()`: Resets canvas to image natural size (100% zoom) with `canvas.setDimensions({ width: img.width, height: img.height })`.
      - `adjustScale()` (for FIT_WIDTH): Computes scale as `containerWidth / imageWidth`, resizes canvas accordingly, and updates zoom level.
    - **FIT_WIDTH Toggle Fix**: Implements retry mechanism using `requestAnimationFrame` to handle timing issues when `backgroundImageRef` becomes temporarily unavailable after mode transitions. Retries up to 10 times until refs are ready.
    - **Container Reference Correction**: Uses `scrollContainer = parent.parentElement` instead of immediate parent (inline-block wrapper) to get actual viewport width for accurate FIT_WIDTH calculations.
    - **Technical Details**:
      - Canvas wrapper: `<div style="display: inline-block; minWidth: 100%; minHeight: 100%">`
      - Scrollable container: `<div style="overflow: auto; flex: 1">`
      - Pan functionality works via select tool when canvas exceeds viewport
      - Annotations persist correctly during all zoom/scroll operations
      - ResizeObserver triggers FIT_WIDTH recalculation on window resize
    - **User Experience**: Users can zoom in to 200-300% for precise annotation, scroll freely using scrollbars or trackpad gestures, and toggle FIT_WIDTH mode seamlessly. The canvas behaves like a native scrollable document, providing intuitive navigation without custom pan controls.
- **Labels**: Dynamic class dropdown; per-shape attributes (e.g., confidence slider 0-100%); multi-select for batch labeling.
- **LLM Placeholder**: Grayed-out "Assist" button linking to future sidebar chat.

#### 3. Export and Review
- **Auto-Save** (Inspired by AnyLabeling): Implement an optional auto-save mode to automatically persist annotation drafts, reducing data loss during long sessions or crashes. Key features:
  - **Trigger Events**: Saves occur every 30 seconds (configurable in settings: 10s–5min intervals) or immediately on shape completion, label changes, undo/redo, or image switches. Debounce rapid changes (e.g., vertex drags) to avoid excessive writes.
  - **What is Saved**: Current canvas state (shapes, labels, attributes via Fabric.js serialization), project metadata, and per-image progress. For frontend MVP, store in IndexedDB (keyed by project ID + image hash); sync to backend API (`/api/annotate/draft`) in Phase 2 for multi-device recovery.
  - **User Controls**: Toggle via Settings > Auto-Save (default: enabled); manual save button in header/canvas toolbar. Version drafts with timestamps and change counts to handle concurrent edits (e.g., merge on load).
  - **Notifications and Recovery**: Subtle UI indicator (e.g., "Last saved: 1m ago" in header) with green check on success; toast on save ("Draft auto-saved") or error ("Save failed—manual save recommended"). On app reload or image load, check for unsaved drafts and prompt modal: "Recover unsaved changes from [timestamp]?" with diff preview if possible. Mimics AnyLabeling's rendering-aware saves to ensure completeness without slowing UI (e.g., queue saves async, skip if no changes).
  - **Performance Considerations**: Batch saves for multiple images; limit draft history to last 5 versions per project; clear on explicit export/save-as-final.
- **Export**: Formats: COCO JSON, YOLO TXT, CSV; zip download with metadata.
- **Review**: Paginated table view (filter/sort by class/image); inline edits; bulk actions (approve/reject).
- **Tracking**: Per-project progress bars; export logs with timestamps.

#### 4. UI/UX Flows
- **Onboarding**: Stepper modal guiding setup (project → upload → first annotation), including demo of auto-save toggle and indicator.
- **Shortcuts**: Customizable (e.g., 'B' for brush/eraser, 'S' for manual save); display cheat sheet in help modal.
- **Errors/Notifications**: Contextual toasts (e.g., "Shape too small" with resize prompt); auto-save errors escalate to persistent banner if repeated.
- **i18n**: Dynamic language switcher; auto-detect browser locale.

### Non-Functional Requirements

#### Performance
- Initial load <3s (code-split routes); lazy-load images/annotations. Auto-save operations <100ms latency, non-blocking via Web Workers if needed.
- Canvas rendering ≥60 FPS; test on i5/8GB RAM.
- Bundle <4MB gzipped (Vite optimization).

#### Accessibility and Usability
- WCAG 2.1 AA: Screen reader support (ARIA for shapes); focus indicators. Announce auto-save status via ARIA live regions (e.g., "Draft saved").
- Offline: Service Worker for caching; IndexedDB sync on reconnect, with auto-save queuing for offline tolerance.
- Cross-browser: Chrome/Edge/Firefox/Safari (latest two versions).

#### Security and Maintainability
- Sanitize all inputs (DOMPurify for labels); CSP headers in production. Encrypt IndexedDB drafts if sensitive data present.
- Dependency audits quarterly; 80% test coverage, including auto-save edge cases (e.g., offline save, conflict resolution).

### Technology Stack

| Component              | Technology                          | Rationale |
|------------------------|-------------------------------------|-----------|
| **Language**          | JavaScript                         | Enables rapid prototyping without type overhead. |
| **Framework**         | React 18+                          | Modular components for complex UIs. |
| **Build Tool**        | Vite 5+                            | HMR and ES modules for dev efficiency. |
| **State Management**  | React Context API                  | Simple global state without external deps. |
| **UI Library**        | Semi Design 2.69+ (@douyinfe/semi-ui) | Rich, themeable components for console views. |
| **Icons**             | Lucide React                       | Lightweight, customizable SVGs. |
| **Charts**            | VChart (@visactor)                 | Interactive viz for progress metrics. |
| **Canvas**            | Fabric.js                          | Declarative shapes with export support. |
| **Image Handling**    | React-Zoom-Pan-Pinch               | Gesture-friendly viewer controls. |
| **Upload**            | React-Dropzone                     | Accessible file interactions. |
| **Styling**           | Tailwind CSS 3.x                   | Utility classes for design tokens. |
| **i18n**              | i18next + react-i18next            | Robust localization pipeline. |
| **HTTP/Routing**      | Axios / React Router DOM 6+        | Reliable API handling and navigation. |
| **Notifications**     | React-Toastify                     | Configurable, non-blocking alerts. |
| **Testing**           | Vitest + React Testing Library     | Fast, React-idiomatic tests. |
| **Linting**           | ESLint + Prettier                  | Enforces code quality. |
| **Package Manager**   | Bun                                | Speedy installs for CI/dev. |
| **Local Storage**     | Dexie.js (IndexedDB wrapper)       | Efficient, queryable persistence for auto-save drafts. |

#### Semi Design Best Practices
Based on official Semi Design documentation:

**Button Component:**
- **Import Path**: Always use `import { Button } from '@douyinfe/semi-ui';` (not from sub-paths like `@douyinfe/semi-ui/button/button`)
- **Theme Options**: `solid` (background), `borderless` (no background), `light` (light background), `outline` (border mode)
- **Type Options**: `primary`, `secondary`, `tertiary`, `warning`, `danger`
- **Size Options**: `large`, `default`, `small`
- **Icon Support**: Use `icon` prop with `noHorizontalPadding` for icon-only buttons to remove padding
- **Active State**: Combine `theme="solid"` + `type="primary"` for highlighted/selected buttons

**ButtonGroup Component:**
- **Unified Props**: Set `size`, `disabled`, `theme`, `type` on ButtonGroup to apply to all child Buttons
- **Layout Control**: Use inline `style={{ flexDirection: 'column' }}` for vertical stacking
- **Accessibility**: Always provide `aria-label` for button groups

**Tooltip Component:**
- **Position Options**: `top`, `topLeft`, `topRight`, `left`, `leftTop`, `leftBottom`, `right`, `rightTop`, `rightBottom`, `bottom`, `bottomLeft`, `bottomRight`
- **Trigger Options**: `hover` (default), `focus`, `click`, `custom`, `contextMenu`
- **Delays**: `mouseEnterDelay` and `mouseLeaveDelay` default to 50ms
- **Arrow**: `showArrow={true}` by default, `arrowPointAtCenter={true}` centers arrow on target
- **Spacing**: Default 8px gap between tooltip and target (configurable via `spacing` prop)
- **Nested Components**: When nesting Tooltip with Popconfirm/Popover, wrap in intermediate `<span style={{ display: 'inline-block' }}><Tooltip>...</Tooltip></span>` to prevent trigger hijacking

**General Semi Design Tips:**
- Import CSS: `import '@douyinfe/semi-ui/dist/css/semi.css';` in main entry file
- Z-index defaults: Tooltip (1060), can be overridden globally via `semiGlobal.config.overrideDefaultProps`
- Dark mode: Semi Design components automatically adapt when parent has dark mode class
- Accessibility: All components support ARIA attributes and keyboard navigation

#### Frontend Bootstrapping
1. `npm create vite@latest -- --template react` (JS template).
2. `bun add` core deps (Semi UI, Axios, Dexie.js, etc.); `bun add -D` dev deps.
3. Configure `vite.config.js` (Semi plugin, aliases); `tailwind.config.js`.
4. Import Semi Design CSS: Add `import '@douyinfe/semi-ui/dist/css/semi.css';` to `main.jsx`.
5. `bun run dev` (localhost:5173); `bun run build` for `/dist`.

### Backend Integration
- **Framework**: FastAPI 0.100+ (Python 3.13).
- **Key Features**: JWT auth, file uploads (via FastAPI's UploadFile), SQLite/Postgres for annotations. Add endpoint `/api/annotate/draft` for async draft syncing (POST with JSON payload, versioning via ETag).
- **Endpoints**: `/api/projects`, `/api/annotate/{id}`, `/health`.
- **Local Dev**: `make all` serves frontend from backend (port 5002).
- **Production**: Gunicorn workers (env-var tunable).

### Docker Deployment
Ensures parity between dev/prod; multi-stage builds minimize image size.

#### Architecture
- **Backend Service**: Exposes port 5001; volumes for data persistence.
- **Caddy Service**: Port 5002; static serve from `web/dist`, API proxy.

#### Quick Start
```bash
cp .env.example .env  # Generate secrets: API_SECRET_KEY=$(openssl rand -hex 32)
make docker-up        # Auto-builds frontend, spins up services
```
- URLs: App (`http://localhost:5002/`), API Docs (`/api/docs`), ReDoc (`/api/redoc`).
- Management: `make docker-down` (stop); `docker compose logs -f` (monitor).

#### Configuration Files
- **docker-compose.yml**: Services, networks, env_file.
- **Caddyfile**: Route precedence (API > static); compression enabled.
- **.dockerignore**: Excludes venv/node_modules for clean builds.

#### Common Issues
- **Build Failures**: Run `uv lock` then `docker compose build --no-cache`.
- **Static 404s**: Ensure `web/dist` exists pre-up.
- **Routing Errors**: Verify Caddyfile handles (API first).

### Future Roadmap
- **Phase 2**: LLM endpoints (`/llm/suggest` via OpenAI/Hugging Face); enhance auto-save with real-time backend syncing via WebSockets.
- **Enhancements**: Collaboration (WebSockets), advanced exports (VOC/Pascal).
- **Scaling**: Horizontal backend pods; CDN for assets.

### Project Structure
```
data-labeling/
├── web/                 # Frontend SPA
│   ├── src/             # Components, contexts, utils
│   ├── dist/            # Build artifacts (.gitignore)
│   ├── public/          # Static files
│   └── package.json     # Scripts/deps
├── svc/                 # Backend API
│   ├── core/            # Config, deps, auth
│   ├── routes/          # Endpoint routers
│   ├── models/          # DB schemas
│   ├── tests/           # Pytest suite
│   └── main.py          # App instantiation
├── dockerfiles/         # Custom builds (e.g., python313/)
├── .dockerignore        # Build exclusions
├── Caddyfile            # Proxy directives
├── docker-compose.yml   # Stack definition
├── Makefile             # Dev targets (e.g., docker-up)
├── pyproject.toml       # Python deps (uv-managed)
├── uv.lock              # Locked env
├── .env.example         # Config template
└── PROJECT.md           # This spec
```

### Deliverables
- **Repo Setup**: README with diagrams (e.g., Mermaid for architecture); Makefile with `make help`.
- **Design Assets**: Figma file (wireframes, style guide), including auto-save flow prototypes.
- **MVP Proof**: Loom video demoing end-to-end flow, highlighting auto-save in action.
- **Quality Gates**: Test reports (>80% coverage); lint passes.

For commands, run `make help`. Refer to AGENTS.md for Docker deep-dive. This spec serves as the living blueprint—update via PRs as the project evolves.