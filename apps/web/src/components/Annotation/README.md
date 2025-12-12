# Annotation Components

This directory contains the refactored annotation workspace components following the new-api CardPro pattern.

## Directory Structure

```
components/annotation/
├── AnnotationWorkspace.jsx      # Main workspace component with CardPro integration
├── AnnotationCanvas.jsx         # ReactImageAnnotate wrapper component
└── index.js                     # Export barrel file
```

## Component Hierarchy

```
AnnotationWorkspace (CardPro wrapper)
└── children: AnnotationCanvas
    └── ReactImageAnnotate (from @karlorz/react-image-annotate)
```

## State Management

All annotation state is managed through the custom hook:
- `hooks/annotation/useAnnotationData.js`

The hook provides:
- Image loading and annotation state
- Save/load handlers
- Navigation (next/prev/exit) handlers
- Theme and language integration
- i18n support

## CardPro Integration

Following the new-api pattern (QuantumNous/new-api):
- **Type**: `type1` (Action-oriented layout)
- **descriptionArea**: Title, description, and image counter
- **actionsArea**: Save, Exit, Previous, Next buttons
- **children**: Canvas with ReactImageAnnotate component

## Usage

```jsx
import AnnotationWorkspace from '@/components/annotation/AnnotationWorkspace';

const Annotation = () => {
  return (
    <div className='mt-[60px] px-2'>
      <AnnotationWorkspace />
    </div>
  );
};
```

## Features

- ✅ CardPro layout integration
- ✅ Separate concerns (description, actions, canvas)
- ✅ Custom hook for state management
- ✅ Theme integration (light/dark mode)
- ✅ Multi-language support (EN/VI/ZH)
- ✅ Image navigation (next/prev)
- ✅ Save/exit handlers
- ✅ Responsive design

## TODO

- [ ] Implement backend API calls in `useAnnotationData.js`
- [ ] Add pagination for image navigation
- [ ] Implement annotation validation
- [ ] Add loading states for async operations
- [ ] Implement error boundaries
