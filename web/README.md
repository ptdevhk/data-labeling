# Data Labeling Tool - Frontend

Web-based image data labeling tool built with React 19 + Vite 7, following the design specifications in PROJECT.md.

## Quick Start

```bash
# Install dependencies
bun install

# Start development server (port 5173)
bun run dev

# Build for production
bun run build

# Lint code
bun run lint
```

## Tech Stack

- **React 19** - UI framework with hooks
- **Vite 7** - Build tool with HMR
- **Tailwind CSS 3** - Utility-first CSS framework
- **React Router DOM 7** - Client-side routing
- **Fabric.js 6** - Canvas manipulation for annotations
- **i18next** - Internationalization (EN, VI, ZH)
- **Lucide React** - Icon library (24px, stroke-width 2)
- **Axios** - HTTP client for API requests

## Features Implemented

### ✅ Core Infrastructure
- Vite configuration with path aliases (`@/`)
- Tailwind CSS with custom design tokens
- Theme system (light/dark mode with localStorage persistence)
- i18n support (English, Vietnamese, Chinese)
- React Router for SPA navigation
- API proxy configuration for backend integration

### ✅ Design System (Per PROJECT.md)
- **Colors**: Primary (#3B82F6), Success (#10B981), Error (#EF4444)
- **Typography**: Inter font family (H1: 32px, H2: 24px, Body: 16px, Caption: 14px)
- **Responsive**: Breakpoints at 480px, 768px, 1024px, 1440px
- **Accessibility**: WCAG 2.1 AA compliant focus indicators
- **Animations**: 150-300ms cubic-bezier transitions

### ✅ Layout Components
- Collapsible sidebar navigation (20% width → 60px collapsed)
- Global header with search, language selector, theme toggle, notifications, user menu
- Main layout with responsive grid system

### ✅ Dashboard Page
- Statistics cards (total projects, images, labeled, completion rate)
- Recent projects table with progress bars
- Mock data integration ready for backend API

### ✅ Annotation Interface
- Three-panel layout (Tools: 15%, Canvas: 70%, Labels: 15%)
- Fabric.js canvas integration with zoom/pan controls
- Drawing tools palette (Select, Rectangle, Circle, Polygon, Line, Point, Eraser)
- Zoom controls (In, Out, Reset, Percentage display)
- Labels panel with color-coded classes
- Add/manage label classes with custom colors

### ✅ Drawing Tools
- **Rectangle Tool**: Draw bounding boxes with mouse drag
- **Circle Tool**: Draw circular annotations
- **Select Tool**: Move and edit existing shapes
- **Undo/Redo**: Action history management
- Tool state management with visual feedback

## Project Structure

```
src/
├── components/
│   ├── Canvas/              # Annotation canvas components
│   │   ├── AnnotationCanvas.jsx
│   │   ├── ToolsPalette.jsx
│   │   └── LabelsPanel.jsx
│   └── Layout/              # Global layout components
│       ├── Header.jsx
│       ├── Sidebar.jsx
│       └── MainLayout.jsx
├── contexts/                # React contexts
│   └── ThemeContext.jsx
├── pages/                   # Route pages
│   ├── Dashboard.jsx
│   ├── Projects.jsx
│   ├── Datasets.jsx
│   ├── Exports.jsx
│   ├── SettingsPage.jsx
│   └── Annotation.jsx
├── locales/                 # i18n translations
│   ├── en.json
│   ├── vi.json
│   └── zh.json
├── constants/               # Design tokens
│   └── theme.js
├── utils/                   # Utilities
│   └── i18n.js
├── App.jsx                  # Root component
├── main.jsx                 # Entry point
└── index.css                # Global styles
```

## API Integration

Vite proxy configured in `vite.config.js` to forward requests to backend:
- `/api/*` → `http://localhost:5002`
- `/token` → `http://localhost:5002`
- `/health` → `http://localhost:5002`

## Development Server

Currently running at: **http://localhost:5173/**

## Next Steps (Per PROJECT.md)

### To Be Implemented:
- [ ] Complete Polygon, Line, Point drawing tools
- [ ] Image upload with React-Dropzone (drag-and-drop, ≤10MB/image)
- [ ] Project CRUD operations with mock API
- [ ] Dataset management with lazy loading thumbnails
- [ ] Export functionality (COCO JSON, YOLO TXT, CSV)
- [ ] Authentication (JWT mock tokens, guest mode)
- [ ] IndexedDB for local persistence
- [ ] Onboarding flow (Joyride library, 4-6 steps)
- [ ] Keyboard shortcuts customization
- [ ] VChart integration for statistics visualization
- [ ] Service Worker for offline support
- [ ] LLM "Assist" button placeholder

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

## Performance Targets (Per PROJECT.md)

- Initial load: <3s
- Canvas rendering: ≥60 FPS
- Bundle size: <4MB gzipped
