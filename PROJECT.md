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
  - **Sidebar Menu**: Vertical navigation (Semi Design Nav) in a collapsible aside (250px expanded, 64px collapsed on desktop); full drawer overlay on mobile (slide-in from left with backdrop). Items structured hierarchically with icons and labels (hidden in collapsed state):
    - **Console**: Home icon; overview page with project cards and stats.
    - **Projects**: Folder icon; list view with create/new button; sub-items: "My Projects", "Shared Projects".
    - **Datasets**: Image icon; upload/browse interface; sub-items: "All Datasets", "Pending Review".
    - **Annotations**: Edit icon; active labeling workspace; sub-items: "In Progress", "Completed".
    - **Exports**: Download icon; format selection and history; sub-items: "Recent Exports", "Templates".
    - **Settings**: Gear icon; user preferences; sub-items: "Account", "Themes", "Shortcuts", "Help & Feedback".
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
  - **Feedback Mechanisms**: Inline validation (e.g., red outlines for invalid shapes); toasts for async ops (position: bottom-right, duration: 4s); progress indicators for uploads/exports.
  - **Onboarding Flow**: Interactive tour (e.g., Joyride library) with 4-6 steps, highlighting key UI; skippable, one-time via localStorage.
- **Canvas-Specific Elements**:
  - **Viewer**: Full-bleed canvas with optional faint grid (toggle via icon); floating toolbar for zoom/reset; drag-to-pan with cursor hints.
  - **Tools Palette**: Vertical list with preview thumbnails; selected tool glows (#3B82F6 border); right-click context menu for shape options. Implement as a Semi Design `ButtonGroup` for cohesive clustering: Use `theme="borderless"` for minimalism, `type="tertiary"` for neutral states, and `theme="solid"`/`type="primary"` for active selection. Icons from Lucide React (e.g., `IconSquare` for rectangle); tooltips via Semi `Tooltip` for shortcuts (e.g., "Rectangle (R)"). Group into drawing tools (polygon, rectangle, circle, line, point) and utilities (eraser, undo, redo) with a divider. Responsive: Vertical on desktop (`flexDirection: 'column'`), horizontal stack on mobile via media queries. Integrate with Fabric.js via `onClick` handlers to set drawing modes (e.g., `canvas.isDrawingMode`).
    #### Example Implementation for Tools Palette
    ```jsx
    import React, { useState } from 'react';
    import { Button, ButtonGroup, Tooltip } from '@douyinfe/semi-ui';
    import {
      Pentagon,      // Polygon icon
      Square,        // Rectangle icon
      Circle,        // Circle icon
      Minus,         // Line icon
      Dot,           // Point icon
      Eraser,        // Eraser icon
      Undo,          // Undo icon
      Redo           // Redo icon
    } from 'lucide-react';

    const AnnotationToolsToolbar = () => {
      const [activeTool, setActiveTool] = useState('rectangle'); // Default to rectangle

      const drawingTools = [
        { key: 'polygon', icon: Pentagon, label: 'Polygon (P)', aria: 'Draw polygon' },
        { key: 'rectangle', icon: Square, label: 'Rectangle (R)', aria: 'Draw rectangle' },
        { key: 'circle', icon: Circle, label: 'Circle (C)', aria: 'Draw circle' },
        { key: 'line', icon: Minus, label: 'Line (L)', aria: 'Draw line' },
        { key: 'point', icon: Dot, label: 'Point (O)', aria: 'Add point' },
      ];

      const utilityTools = [
        { key: 'eraser', icon: Eraser, label: 'Eraser (E)', aria: 'Erase shapes' },
        { key: 'undo', icon: Undo, label: 'Undo (Z)', aria: 'Undo action' },
        { key: 'redo', icon: Redo, label: 'Redo (Shift+Z)', aria: 'Redo action' },
      ];

      const handleToolSelect = (key) => {
        setActiveTool(key);
        // Integrate with Fabric.js: e.g., canvas.isDrawingMode = key === 'freeform';
      };

      return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 p-2 gap-4" style={{ width: '64px' }}>
          {/* Drawing Tools Group */}
          <ButtonGroup 
            theme="borderless" 
            size="default" 
            type="tertiary" 
            aria-label="Annotation drawing tools"
            style={{ flexDirection: 'column' }}
          >
            {drawingTools.map(({ key, icon: Icon, label, aria }) => (
              <Tooltip key={key} content={label} position="right">
                <Button
                  icon={<Icon size={20} color={activeTool === key ? '#3B82F6' : 'currentColor'} />}
                  theme={activeTool === key ? 'solid' : 'borderless'}
                  type={activeTool === key ? 'primary' : 'tertiary'}
                  onClick={() => handleToolSelect(key)}
                  aria-label={aria}
                  noHorizontalPadding
                />
              </Tooltip>
            ))}
          </ButtonGroup>

          {/* Divider */}
          <div className="w-full h-px bg-gray-200 dark:bg-gray-600 my-2" />

          {/* Utility Tools Group */}
          <ButtonGroup 
            theme="borderless" 
            size="small" 
            type="tertiary" 
            aria-label="Annotation utility tools"
            style={{ flexDirection: 'column' }}
          >
            {utilityTools.map(({ key, icon: Icon, label, aria }) => (
              <Tooltip key={key} content={label} position="right">
                <Button
                  icon={<Icon size={18} />}
                  onClick={() => handleToolSelect(key)} // e.g., Trigger eraser mode
                  aria-label={aria}
                  noHorizontalPadding
                />
              </Tooltip>
            ))}
          </ButtonGroup>
        </div>
      );
    };

    export default AnnotationToolsToolbar;
    ```
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
- **Labels**: Dynamic class dropdown; per-shape attributes (e.g., confidence slider 0-100%); multi-select for batch labeling.
- **LLM Placeholder**: Grayed-out "Assist" button linking to future sidebar chat.

#### 3. Export and Review
- **Persistence/Export**: Auto-save drafts; formats: COCO JSON, YOLO TXT, CSV; zip download with metadata.
- **Review**: Paginated table view (filter/sort by class/image); inline edits; bulk actions (approve/reject).
- **Tracking**: Per-project progress bars; export logs with timestamps.

#### 4. UI/UX Flows
- **Onboarding**: Stepper modal guiding setup (project → upload → first annotation).
- **Shortcuts**: Customizable (e.g., 'B' for brush/eraser); display cheat sheet in help modal.
- **Errors/Notifications**: Contextual toasts (e.g., "Shape too small" with resize prompt).
- **i18n**: Dynamic language switcher; auto-detect browser locale.

### Non-Functional Requirements

#### Performance
- Initial load <3s (code-split routes); lazy-load images/annotations.
- Canvas rendering ≥60 FPS; test on i5/8GB RAM.
- Bundle <4MB gzipped (Vite optimization).

#### Accessibility and Usability
- WCAG 2.1 AA: Screen reader support (ARIA for shapes); focus indicators.
- Offline: Service Worker for caching; IndexedDB sync on reconnect.
- Cross-browser: Chrome/Edge/Firefox/Safari (latest two versions).

#### Security and Maintainability
- Sanitize all inputs (DOMPurify for labels); CSP headers in production.
- Dependency audits quarterly; 80% test coverage.

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
2. `bun add` core deps (Semi UI, Axios, etc.); `bun add -D` dev deps.
3. Configure `vite.config.js` (Semi plugin, aliases); `tailwind.config.js`.
4. Import Semi Design CSS: Add `import '@douyinfe/semi-ui/dist/css/semi.css';` to `main.jsx`.
5. `bun run dev` (localhost:5173); `bun run build` for `/dist`.

### Backend Integration
- **Framework**: FastAPI 0.100+ (Python 3.13).
- **Key Features**: JWT auth, file uploads (via FastAPI's UploadFile), SQLite/Postgres for annotations.
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
- **Phase 2**: LLM endpoints (`/llm/suggest` via OpenAI/Hugging Face).
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
- **Design Assets**: Figma file (wireframes, style guide).
- **MVP Proof**: Loom video demoing end-to-end flow.
- **Quality Gates**: Test reports (>80% coverage); lint passes.

For commands, run `make help`. Refer to GEMINI.md for Docker deep-dive. This spec serves as the living blueprint—update via PRs as the project evolves.
