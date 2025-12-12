# React Image Annotate

[![npm version](https://img.shields.io/npm/v/@karlorz/react-image-annotate.svg)](https://www.npmjs.com/package/@karlorz/react-image-annotate)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/karlorz/react-image-annotate)

The best image/video annotation tool ever. [Check out the demo here](https://karlorz.github.io/react-image-annotate/). Or the [code sandbox here](https://codesandbox.io/s/react-image-annotate-example-38tsc?file=/src/App.js:0-403).

## Features

- Simple input/output format
- Bounding Box, Point and Polygon Annotation
- Zooming, Scaling, Panning
- Multiple Images
- Cursor Crosshair
- **Headless Architecture** (v3.x) - Build custom UIs with `useAnnotator` hook
- **Internationalization** (i18n) - Built-in support for EN/ZH/VI languages
- **Theme Customization** - PingFang font stack with Material-UI v6

![Screenshot of Annotator](https://user-images.githubusercontent.com/1910070/51199716-83c72080-18c5-11e9-837c-c3a89c8caef4.png)

## Usage

Install with npm (recommended):

```bash
npm install @karlorz/react-image-annotate
```

Or with bun (alternative):

```bash
bun add @karlorz/react-image-annotate
```

```javascript
import React from "react";
import ReactImageAnnotate from "@karlorz/react-image-annotate";

const App = () => (
  <ReactImageAnnotate
    labelImages
    regionClsList={["Alpha", "Beta", "Charlie", "Delta"]}
    regionTagList={["tag1", "tag2", "tag3"]}
    images={[
      {
        src: "https://placekitten.com/408/287",
        name: "Image 1",
        regions: []
      }
    ]}
  />
);

export default App;

```

## Headless Architecture (v3.x)

For custom UIs, use the headless `useAnnotator` hook:

```javascript
import { useAnnotator } from "@karlorz/react-image-annotate/headless";

function MyCustomAnnotator() {
  const { state, actions, regions, currentImage } = useAnnotator({
    images: [{ src: '/image.jpg', name: 'Test' }],
    onExit: (output) => console.log(output)
  });

  return (
    <div>
      <button onClick={() => actions.selectTool('create-box')}>
        Box Tool
      </button>
      <canvas {...actions.getCanvasProps()} />
      {regions.map(r => (
        <div key={r.id}>
          {r.cls}
          <button onClick={() => actions.deleteRegion(r)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

See `examples/headless/` for complete examples with Tailwind CSS, Semi Design, and vanilla React.

## Internationalization (i18n)

Wrap your app with `I18nProvider` for multi-language support:

```javascript
import { I18nProvider } from "@karlorz/react-image-annotate";

<I18nProvider language="zh"> {/* en, zh, or vi */}
  <ReactImageAnnotate {...props} />
</I18nProvider>
```

Or provide custom translations:

```javascript
<I18nProvider
  language="fr"
  translations={{
    fr: { 'header.save': 'Enregistrer', ... }
  }}
>
  <ReactImageAnnotate {...props} />
</I18nProvider>
```

## Theme Support (Light/Dark Mode)

The component supports both light and dark themes:

```javascript
// Simple string mode (recommended)
<ReactImageAnnotate theme="dark" {...props} />
<ReactImageAnnotate theme="light" {...props} />

// Custom Material-UI theme
import { createTheme } from '@mui/material/styles'

const customTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#3f51b5' },
    background: {
      default: '#1a1a1a',
      paper: '#2a2a2a',
    },
  },
})

<ReactImageAnnotate theme={customTheme} {...props} />
```

**Theme Integration**: The component respects the MUI theme palette and will automatically style all internal components (workspace, sidebars, dialogs) according to the theme mode. Perfect for applications with dynamic theme switching!

To get the proper fonts, make sure to import the Inter UI or Roboto font, the
following line added to a css file should suffice.

```css
@import url("https://rsms.me/inter/inter.css");
```

## Props

All of the following properties can be defined on the Annotator...

| Prop                     | Type (\* = required)                             | Description                                                                             | Default       |
| ------------------------ | ------------------------------------------------ | --------------------------------------------------------------------------------------- | ------------- |
| `taskDescription`        | \*`string`                                       | Markdown description for what to do in the image.                                       |               |
| `allowedArea`            | `{ x: number, y: number, w: number, h: number }` | Area that is available for annotation.                                                  | Entire image. |
| `regionTagList`          | `Array<string>`                                  | Allowed "tags" (mutually inclusive classifications) for regions.                        |               |
| `regionClsList`          | `Array<string>`                                  | Allowed "classes" (mutually exclusive classifications) for regions.                     |               |
| `imageTagList`           | `Array<string>`                                  | Allowed tags for entire image.                                                          |               |
| `imageClsList`           | `Array<string>`                                  | Allowed classes for entire image.                                                       |               |
| `enabledTools`           | `Array<string>`                                  | Tools allowed to be used. e.g. "select", "create-point", "create-box", "create-polygon" | Everything.   |
| `showTags`               | `boolean`                                        | Show tags and allow tags on regions.                                                    | `true`        |
| `selectedImage`          | `string`                                         | URL of initially selected image.                                                        |               |
| `images`                 | `Array<Image>`                                   | Array of images to load into annotator                                                  |               |
| `showPointDistances`     | `boolean`                                        | Show distances between points.                                                          | `false`       |
| `pointDistancePrecision` | `number`                                         | Precision on displayed points (e.g. 3 => 0.123)                                         |               |
| `theme`                  | `"light"` \| `"dark"` \| `Theme`                 | Theme mode (string) or full MUI theme object for styling the component.                 | `"light"`     |
| `onExit`                 | `MainLayoutState => any`                         | Called when "Save" is called.                                                           |               |
| `RegionEditLabel`        | `Node`                                           | React Node overriding the form to update the region (see [`RegionLabel`](https://github.com/karlorz/react-image-annotate/blob/master/src/RegionLabel/index.js))                                                          |               |
| `allowComments`          | `boolean`                                        | Show a textarea to add comments on each annotation.                                     | `false`       |
| `hidePrev`               | `boolean`                                        | Hide `Previous Image` button from the header bar.                                       | `false`       |
| `hideNext`               | `boolean`                                        | Hide `Next Image` button from the header bar.                                           | `false`       |
| `hideClone`              | `boolean`                                        | Hide `Clone` button from the header bar.                                                | `false`       |
| `hideSettings`           | `boolean`                                        | Hide `Settings` button from the header bar.                                             | `false`       |
| `hideFullScreen`         | `boolean`                                        | Hide `FullScreen/Window` button from the header bar.                                    | `false`       |
| `hideSave`               | `boolean`                                        | Hide `Save` button from the header bar.                                                 | `false`       |

## Developers

### Development

This project uses [Storybook](https://storybook.js.org/) with Vite. To begin developing, run the following commands in the cloned repo:

1. `npm install` (or `bun install`)
2. `npm run storybook` (or `bun run storybook`)

A browser tab will automatically open with the project components at http://localhost:9090.

### Package Manager

- **Primary**: npm (recommended)
- **Alternative**: bun (faster builds)

See more details in the [contributing guidelines](https://github.com/karlorz/react-image-annotate/wiki/Setup-for-Development).

### Icons

Consult these icon repositories:

- [Material Icons](https://material.io/tools/icons/)
- [Font Awesome Icons](https://fontawesome.com/icons?d=gallery&m=free)
