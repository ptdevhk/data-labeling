import React, { useState, createContext, useContext } from "react"
import { fn } from "storybook/test"
import { Button, Layout, List, Space, Typography } from "@douyinfe/semi-ui"
import {
  IconBox,
  IconEdit,
  IconTick,
  IconDelete,
  IconSave,
  IconArrowLeft,
  IconArrowRight,
} from "@douyinfe/semi-icons"

import { useAnnotator } from "../hooks/useAnnotator"
import MainLayout from "../MainLayout"
import ImageCanvas from "../ImageCanvas"
import SettingsProvider, { useSettings } from "../SettingsProvider"
import { I18nProvider } from "../I18nProvider"

export default {
  title: "Headless/Advanced Integration",
  parameters: {
    layout: "fullscreen",
  },
}

const { Sider, Content, Header } = Layout
const { Title, Text } = Typography

const sampleImages = [
  {
    src: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800",
    name: "City Street",
    regions: [
      {
        id: "region-1",
        type: "box",
        x: 0.2,
        y: 0.3,
        w: 0.3,
        h: 0.2,
        cls: "building",
        color: "#00ff00",
      },
      {
        id: "region-2",
        type: "box",
        x: 0.6,
        y: 0.5,
        w: 0.2,
        h: 0.3,
        cls: "car",
        color: "#ff0000",
      },
    ],
  },
  {
    src: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
    name: "Computer Workspace",
    regions: [],
  },
  {
    src: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=800",
    name: "Mountain Landscape",
    regions: [],
  },
]

function HeadlessCanvas({ state, actions, regions, currentImage }) {
  const settings = useSettings()
  const showCrosshairsSetting = settings.showCrosshairs ?? true

  return (
    <ImageCanvas
      {...settings}
      key={state.selectedImage ?? 0}
      regions={regions}
      imageSrc={
        state.annotationType === "image" && currentImage
          ? currentImage.src
          : null
      }
      videoSrc={state.annotationType === "video" ? state.videoSrc : null}
      videoTime={
        state.annotationType === "image"
          ? state.selectedImageFrameTime
          : state.currentVideoTime
      }
      realSize={currentImage ? currentImage.realSize : undefined}
      showTags={state.showTags}
      showMask={state.showMask}
      showPointDistances={state.showPointDistances}
      pointDistancePrecision={state.pointDistancePrecision}
      regionClsList={state.regionClsList}
      regionTagList={state.regionTagList}
      allowedArea={state.allowedArea}
      keypointDefinitions={state.keypointDefinitions}
      fullImageSegmentationMode={state.fullImageSegmentationMode}
      autoSegmentationOptions={state.autoSegmentationOptions}
      modifyingAllowedArea={
        state.selectedTool === "modify-allowed-area" &&
        Boolean(state.allowedArea)
      }
      allowComments={state.allowComments}
      videoPlaying={state.videoPlaying}
      showCrosshairs={
        showCrosshairsSetting &&
        state.selectedTool &&
        !["select", "pan", "zoom"].includes(state.selectedTool)
      }
      createWithPrimary={
        state.selectedTool ? state.selectedTool.includes("create") : false
      }
      dragWithPrimary={state.selectedTool === "pan"}
      zoomWithPrimary={state.selectedTool === "zoom"}
      onMouseMove={({ x, y }) => actions.mouseMove(x, y)}
      onMouseDown={({ x, y }) => actions.mouseDown(x, y)}
      onMouseUp={({ x, y }) => actions.mouseUp(x, y)}
      onChangeRegion={actions.changeRegion}
      onBeginRegionEdit={actions.openRegionEditor}
      onCloseRegionEdit={actions.closeRegionEditor}
      onDeleteRegion={actions.deleteRegion}
      onBeginBoxTransform={actions.beginBoxTransform}
      onBeginMovePolygonPoint={actions.beginMovePolygonPoint}
      onBeginMoveKeypoint={actions.beginMoveKeypoint}
      onAddPolygonPoint={actions.addPolygonPoint}
      onSelectRegion={actions.selectRegion}
      onBeginMovePoint={actions.beginMovePoint}
      onImageOrVideoLoaded={actions.imageOrVideoLoaded}
      onChangeVideoTime={actions.changeVideoTime}
      onChangeVideoPlaying={actions.changeVideoPlaying}
      onRegionClassAdded={actions.onRegionClassAdded}
    />
  )
}

function SemiDesignCanvas({ state, actions, regions, currentImage }) {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 8,
        boxShadow: "0 6px 18px rgba(15, 23, 42, 0.08)",
        overflow: "hidden",
      }}
    >
      <HeadlessCanvas
        state={state}
        actions={actions}
        regions={regions}
        currentImage={currentImage}
      />
    </div>
  )
}

// TODO: Implement HeadlessWithWorkspace component
// export const WithWorkspaceLayout = () => <HeadlessWithWorkspace />

// WithWorkspaceLayout.storyName = "Full Workspace Layout"
// WithWorkspaceLayout.parameters = {
//   docs: {
//     description: {
//       story: `
// This demonstrates using the **headless \`useAnnotator\` hook** with the full Workspace layout.

// **Key Points:**
// - Uses \`useAnnotator\` hook for all business logic
// - Renders with existing \`MainLayout\` and \`Workspace\` components
// - 100% compatible with existing UI
// - Allows customization of behavior while keeping the UI

// **Benefits:**
// - Separate business logic from UI
// - Can add custom behavior (analytics, logging, etc.)
// - Can intercept and modify actions
// - Can integrate with external state management
//       `,
//     },
//   },
// }

// =============================================================================
// Demo 1B: Headless Hook with Semi Design Theme
// =============================================================================

function HeadlessWithSemiDesign() {
  const onExitSpy = fn()
  const onNextSpy = fn()
  const onPrevSpy = fn()

  const { state, actions, regions, currentImage } = useAnnotator({
    images: sampleImages,
    enabledTools: ["select", "create-box", "create-polygon", "create-point"],
    regionClsList: ["building", "car", "person", "tree", "road"],
    regionTagList: ["important", "uncertain", "verified"],
    selectedTool: "select",
    onExit: onExitSpy,
    onNextImage: onNextSpy,
    onPrevImage: onPrevSpy,
  })

  const tools = [
    { name: "select", icon: <IconTick />, label: "Select" },
    { name: "create-box", icon: <IconBox />, label: "Bounding Box" },
    { name: "create-polygon", icon: <IconEdit />, label: "Polygon" },
  ]

  const handleSelectTool = (toolName) => {
    actions.selectTool(toolName)
  }

  const handleDeleteRegion = (region) => {
    actions.deleteRegion(region)
  }

  const handleSave = () => {
    actions.headerButtonClicked("Save")
  }

  const handlePrev = () => actions.headerButtonClicked("Prev")
  const handleNext = () => actions.headerButtonClicked("Next")

  const totalImages = state.images?.length || 0
  const currentIndex =
    state.selectedImage !== undefined && state.selectedImage !== null
      ? state.selectedImage
      : -1

  return (
    <div style={{ height: "100vh", width: "100vw", background: "#f5f6f8" }}>
      <SettingsProvider>
        <Layout style={{ height: "100%" }}>
          <Header
            style={{
              background: "#ffffff",
              borderBottom: "1px solid #e8e9eb",
              padding: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 20px",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Title
                  heading={5}
                  style={{
                    margin: 0,
                    fontWeight: "bold",
                    color: "#616161",
                    paddingLeft: 16,
                  }}
                  className="makeStyles-headerTitle"
                >
                  {currentImage?.name || "No Image Selected"}
                </Title>
                <Text type="tertiary" style={{ paddingLeft: 16 }}>
                  {currentIndex >= 0
                    ? `Image ${currentIndex + 1} of ${totalImages}`
                    : "No images"}
                </Text>
              </div>
              <Space align="center">
                <Button
                  icon={<IconArrowLeft />}
                  type="tertiary"
                  theme="solid"
                  disabled={currentIndex <= 0}
                  onClick={handlePrev}
                />
                <Button
                  icon={<IconArrowRight />}
                  type="tertiary"
                  theme="solid"
                  disabled={
                    currentIndex === totalImages - 1 || totalImages === 0
                  }
                  onClick={handleNext}
                />
                <Button
                  theme="solid"
                  type="primary"
                  icon={<IconSave />}
                  onClick={handleSave}
                >
                  Save
                </Button>
              </Space>
            </div>
          </Header>

          <Layout style={{ flex: 1 }}>
            <Sider
              style={{
                width: 76,
                background: "#ffffff",
                borderRight: "1px solid #e8e9eb",
                padding: "16px 12px",
              }}
            >
              <Space vertical spacing="tight" style={{ width: "100%" }}>
                {tools.map((tool) => (
                  <Button
                    key={tool.name}
                    icon={tool.icon}
                    type={
                      state.selectedTool === tool.name ? "primary" : "tertiary"
                    }
                    theme="borderless"
                    block
                    onClick={() => handleSelectTool(tool.name)}
                    aria-label={tool.label}
                  />
                ))}
              </Space>
            </Sider>

            <Content
              style={{
                background: "#f5f6f8",
                padding: 24,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 0,
              }}
            >
              <div style={{ width: "100%", height: "100%", maxWidth: 1100 }}>
                <SemiDesignCanvas
                  state={state}
                  actions={actions}
                  regions={regions}
                  currentImage={currentImage}
                />
              </div>
            </Content>

            <Sider
              style={{
                width: 320,
                background: "#ffffff",
                borderLeft: "1px solid #e8e9eb",
                overflow: "auto",
                padding: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  height: "100%",
                }}
              >
                <div>
                  <Title heading={6} style={{ marginBottom: 8 }}>
                    Regions ({regions.length})
                  </Title>
                  <Text type="tertiary">
                    Manage annotations using Semi Design components
                  </Text>
                </div>

                <List
                  dataSource={regions}
                  renderItem={(region, index) => (
                    <List.Item
                      key={region.id}
                      style={{
                        borderRadius: 8,
                        background: region.highlighted
                          ? "#f1f7ff"
                          : "transparent",
                        border: region.highlighted
                          ? "1px solid #a3c4f3"
                          : "1px solid transparent",
                        padding: "12px 10px",
                        cursor: "pointer",
                      }}
                      onClick={() => actions.selectRegion(region)}
                      main={
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: 3,
                              backgroundColor: region.color || "#4f46e5",
                            }}
                          />
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                            }}
                          >
                            <Text strong>
                              {region.cls || `Region ${index + 1}`}
                            </Text>
                            <Text type="tertiary">{region.type}</Text>
                          </div>
                        </div>
                      }
                      extra={
                        <Button
                          icon={<IconDelete />}
                          type="danger"
                          theme="borderless"
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleDeleteRegion(region)
                          }}
                        />
                      }
                    />
                  )}
                  emptyContent={
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <Text type="tertiary">
                        No regions yet. Select a tool to start annotating.
                      </Text>
                    </div>
                  }
                />
              </div>
            </Sider>
          </Layout>
        </Layout>
      </SettingsProvider>
    </div>
  )
}

export const WithSemiDesignTheme = () => <HeadlessWithSemiDesign />

WithSemiDesignTheme.storyName = "🎨 Semi Design Theme"
WithSemiDesignTheme.parameters = {
  docs: {
    description: {
      story: `
This demonstrates using the **headless \`useAnnotator\` hook** with **Semi Design** UI components.

**Key Features:**
- ✨ Modern Semi Design UI components
- 🎨 Clean and professional interface
- 🔧 Custom sidebar with tool buttons
- 📋 Region list with delete functionality
- 💾 Save functionality with Semi Design buttons

**Integration Benefits:**
- Uses Semi Design's Button, Layout, List, and Typography components
- Maintains the core MainLayout for canvas rendering
- Custom toolbars and sidebars with Semi Design styling
- Easy to customize with Semi Design's theme system

**Semi Design Components Used:**
- \`Button\` - For tool selection and actions
- \`Layout\` (Header, Sider, Content) - For overall layout
- \`List\` - For displaying regions
- \`Typography\` (Title, Text) - For text elements
- Icons from \`@douyinfe/semi-icons\`
      `,
    },
  },
}

// =============================================================================
// Demo 2: Theme Customization (Light/Dark Mode)
// =============================================================================

const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
})

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light")

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div
        style={{
          width: "100%",
          height: "100vh",
          backgroundColor: theme === "dark" ? "#1a1a1a" : "#ffffff",
          color: theme === "dark" ? "#e0e0e0" : "#000000",
          transition: "background-color 0.3s, color 0.3s",
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

const themePalette = {
  light: {
    surface: "#ffffff",
    surfaceAlt: "#f5f6f8",
    panel: "#f8f9fb",
    border: "#e2e8f0",
    text: "#0f172a",
    subtext: "#475569",
    accent: "#2563eb",
    accentText: "#ffffff",
    danger: "#ef4444",
  },
  dark: {
    surface: "#121826",
    surfaceAlt: "#0b1120",
    panel: "#1f2937",
    border: "#334155",
    text: "#e2e8f0",
    subtext: "#94a3b8",
    accent: "#3b82f6",
    accentText: "#0b1120",
    danger: "#f87171",
  },
}

function HeadlessWithTheme() {
  const { theme, setTheme } = useContext(ThemeContext)
  const palette = themePalette[theme]
  const onExitSpy = fn()

  const { state, actions, regions, currentImage, getOutput } = useAnnotator({
    images: sampleImages,
    enabledTools: ["select", "create-box", "create-polygon"],
    regionClsList: ["object", "background"],
    onExit: (output) => {
      console.log("Theme:", theme)
      console.log("Output:", output)
      onExitSpy(output)
    },
  })

  const tools = [
    { name: "select", label: "Select" },
    { name: "create-box", label: "Bounding Box" },
    { name: "create-polygon", label: "Polygon" },
  ]

  const totalImages = state.images?.length || 0
  const currentIndex =
    state.selectedImage !== undefined && state.selectedImage !== null
      ? state.selectedImage
      : -1

  const handleSave = () => {
    const output = getOutput()
    console.log("Saved output:", output)
    onExitSpy(output)
  }

  return (
    <SettingsProvider>
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: palette.surfaceAlt,
          color: palette.text,
          transition: "background 0.3s ease, color 0.3s ease",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px",
            background: palette.surface,
            borderBottom: `1px solid ${palette.border}`,
            gap: 16,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 18, fontWeight: 600 }}>
              {currentImage?.name || "No Image Selected"}
            </span>
            <span style={{ color: palette.subtext, fontSize: 14 }}>
              {currentIndex >= 0
                ? `Image ${currentIndex + 1} of ${totalImages}`
                : "No images"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                display: "flex",
                background: palette.panel,
                borderRadius: 999,
                border: `1px solid ${palette.border}`,
                padding: 4,
                gap: 4,
              }}
            >
              <button
                onClick={() => setTheme("light")}
                style={{
                  padding: "6px 14px",
                  border: "none",
                  borderRadius: 999,
                  cursor: "pointer",
                  background:
                    theme === "light" ? palette.accent : "transparent",
                  color:
                    theme === "light" ? palette.accentText : palette.subtext,
                  fontWeight: 500,
                }}
              >
                ☀️ Light
              </button>
              <button
                onClick={() => setTheme("dark")}
                style={{
                  padding: "6px 14px",
                  border: "none",
                  borderRadius: 999,
                  cursor: "pointer",
                  background: theme === "dark" ? palette.accent : "transparent",
                  color:
                    theme === "dark" ? palette.accentText : palette.subtext,
                  fontWeight: 500,
                }}
              >
                🌙 Dark
              </button>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => actions.headerButtonClicked("Prev")}
                disabled={currentIndex <= 0}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: `1px solid ${palette.border}`,
                  background: "transparent",
                  color: palette.text,
                  cursor: currentIndex <= 0 ? "not-allowed" : "pointer",
                  opacity: currentIndex <= 0 ? 0.5 : 1,
                }}
              >
                Prev
              </button>
              <button
                onClick={() => actions.headerButtonClicked("Next")}
                disabled={currentIndex === totalImages - 1 || totalImages === 0}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: `1px solid ${palette.border}`,
                  background: "transparent",
                  color: palette.text,
                  cursor:
                    currentIndex === totalImages - 1 || totalImages === 0
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    currentIndex === totalImages - 1 || totalImages === 0
                      ? 0.5
                      : 1,
                }}
              >
                Next
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "none",
                  background: palette.accent,
                  color: palette.accentText,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Save
              </button>
            </div>
          </div>
        </header>

        <div
          style={{
            flex: 1,
            display: "flex",
            overflow: "hidden",
          }}
        >
          <aside
            style={{
              width: 80,
              background: palette.surface,
              borderRight: `1px solid ${palette.border}`,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {tools.map((tool) => (
              <button
                key={tool.name}
                onClick={() => actions.selectTool(tool.name)}
                style={{
                  padding: "12px 10px",
                  borderRadius: 8,
                  border: `1px solid ${
                    state.selectedTool === tool.name
                      ? palette.accent
                      : palette.border
                  }`,
                  background:
                    state.selectedTool === tool.name
                      ? palette.accent
                      : "transparent",
                  color:
                    state.selectedTool === tool.name
                      ? palette.accentText
                      : palette.subtext,
                  cursor: "pointer",
                }}
              >
                {tool.label}
              </button>
            ))}
          </aside>

          <main
            style={{
              flex: 1,
              padding: 24,
              background: palette.surfaceAlt,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                maxWidth: 1100,
                background: palette.surface,
                borderRadius: 12,
                border: `1px solid ${palette.border}`,
                boxShadow: "0 20px 45px rgba(15, 23, 42, 0.12)",
                overflow: "hidden",
              }}
            >
              <HeadlessCanvas
                state={state}
                actions={actions}
                regions={regions}
                currentImage={currentImage}
              />
            </div>
          </main>

          <aside
            style={{
              width: 320,
              background: palette.surface,
              borderLeft: `1px solid ${palette.border}`,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              overflow: "auto",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>
                Regions ({regions.length})
              </span>
              <span style={{ color: palette.subtext, fontSize: 13 }}>
                Theme-aware list styled with custom tokens
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {regions.length === 0 && (
                <div
                  style={{
                    padding: "32px 12px",
                    textAlign: "center",
                    borderRadius: 12,
                    border: `1px dashed ${palette.border}`,
                    color: palette.subtext,
                  }}
                >
                  No regions yet. Select a tool to start annotating.
                </div>
              )}
              {regions.map((region, index) => (
                <div
                  key={region.id}
                  onClick={() => actions.selectRegion(region)}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    border: `1px solid ${palette.border}`,
                    background: region.highlighted
                      ? palette.accent + "20"
                      : palette.surfaceAlt,
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    <span style={{ fontWeight: 600 }}>
                      {region.cls || `Region ${index + 1}`}
                    </span>
                    <span style={{ color: palette.subtext, fontSize: 13 }}>
                      {region.type}
                    </span>
                  </div>
                  <button
                    onClick={(event) => {
                      event.stopPropagation()
                      actions.deleteRegion(region)
                    }}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: "none",
                      background: palette.danger,
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </SettingsProvider>
  )
}

export const WithThemeCustomization = () => (
  <ThemeProvider>
    <HeadlessWithTheme />
  </ThemeProvider>
)

WithThemeCustomization.storyName = "Theme Customization (Light/Dark)"
WithThemeCustomization.parameters = {
  docs: {
    description: {
      story: `
This demonstrates **theme integration** using the headless hook.

**How it Works:**
- Custom \`ThemeContext\` wraps the component
- Theme state is managed externally
- \`onExit\` callback receives current theme
- UI adapts to theme changes

**Real-World Usage:**
\`\`\`jsx
import { useTheme } from '@/contexts/ThemeContext'

const { resolvedTheme } = useTheme()
const { state, actions } = useAnnotator({
  onExit: (output) => saveWithTheme(output, resolvedTheme)
})
\`\`\`

**Integration Examples:**
- Semi Design: \`const { mode } = useTheme()\`
- Tailwind: \`data-theme={resolvedTheme}\`
- MUI: \`<ThemeProvider theme={customTheme}>\`
      `,
    },
  },
}

// =============================================================================
// Demo 3: i18n Integration (Multi-Language)
// =============================================================================

function HeadlessWithI18n() {
  const [language, setLanguage] = useState("en")
  const onExitSpy = fn()

  const { state, dispatch, onRegionClassAdded } = useAnnotator({
    images: sampleImages,
    regionClsList: ["building", "car", "person"],
    onExit: (output) => {
      console.log(`Saved in ${language}:`, output)
      onExitSpy(output)
    },
  })

  return (
    <I18nProvider language={language}>
      <div style={{ position: "relative", height: "100vh" }}>
        {/* Language Selector - Moved to avoid overlap with MainLayout header */}
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 10000,
            background: "#f8f9fa",
            padding: "12px 20px",
            borderRadius: 8,
            display: "flex",
            gap: 12,
            alignItems: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600 }}>Language:</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              padding: "8px 14px",
              border: "1px solid #ccc",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            <option value="en">🇺🇸 English</option>
            <option value="zh">🇨🇳 中文</option>
            <option value="vi">🇻🇳 Tiếng Việt</option>
          </select>
        </div>

        <SettingsProvider>
          <MainLayout
            state={state}
            dispatch={dispatch}
            onRegionClassAdded={onRegionClassAdded}
            alwaysShowNextButton={true}
            alwaysShowPrevButton={true}
          />
        </SettingsProvider>
      </div>
    </I18nProvider>
  )
}

export const WithI18nIntegration = () => <HeadlessWithI18n />

WithI18nIntegration.storyName = "i18n Integration (Multi-Language)"
WithI18nIntegration.parameters = {
  docs: {
    description: {
      story: `
This demonstrates **internationalization (i18n)** using the built-in **I18nProvider**.

**How it Works:**
- Uses the new built-in \`I18nProvider\` component
- Supports English, Chinese, and Vietnamese out of the box
- UI text automatically translates (header buttons, tool names, etc.)
- Easy integration with existing code

**Features:**
- ✅ Built-in translations for EN/ZH/VI
- ✅ All UI elements translate automatically
- ✅ 100% backward compatible
- ✅ Progressive enhancement (optional)

**Real-World Usage:**
\`\`\`jsx
import { Annotator, I18nProvider } from '@karlorz/react-image-annotate'

function App() {
  return (
    <I18nProvider language="zh">
      <Annotator images={myImages} />
    </I18nProvider>
  )
}
\`\`\`

**Integration with react-i18next:**
\`\`\`jsx
import { useTranslation } from 'react-i18next'
import { Annotator, I18nProvider, DEFAULT_TRANSLATIONS } from '@karlorz/react-image-annotate'

function App() {
  const { i18n, t } = useTranslation()

  // Map react-i18next translations to annotator format
  const annotatorTranslations = {
    [i18n.language]: Object.keys(DEFAULT_TRANSLATIONS).reduce((acc, key) => {
      acc[key] = t(\`annotator.\${key}\`, DEFAULT_TRANSLATIONS[key])
      return acc
    }, {})
  }

  return (
    <I18nProvider
      language={i18n.language}
      translations={annotatorTranslations}
    >
      <Annotator images={myImages} />
    </I18nProvider>
  )
}
\`\`\`

**Supported Languages:**
- 🇺🇸 English (en)
- 🇨🇳 中文 (zh)
- 🇻🇳 Tiếng Việt (vi)
      `,
    },
  },
}

// =============================================================================
// Demo 4: Combined Theme + i18n
// =============================================================================

function HeadlessWithThemeAndI18n() {
  const { theme, setTheme } = useContext(ThemeContext)
  const [language, setLanguage] = useState("en")
  const onExitSpy = fn()

  const { state, dispatch, onRegionClassAdded } = useAnnotator({
    images: sampleImages,
    enabledTools: ["select", "create-box", "create-polygon", "create-point"],
    regionClsList: ["building", "car", "person", "tree"],
    onExit: (output) => {
      console.log(`Saved - Theme: ${theme}, Language: ${language}`)
      console.log("Output:", output)
      onExitSpy({ output, theme, language })
    },
  })

  return (
    <I18nProvider language={language}>
      <div style={{ position: "relative", height: "100%" }}>
        {/* Combined Theme + Language Controls - Moved to avoid overlap */}
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 10000,
            background: theme === "dark" ? "#2d2d2d" : "#f8f9fa",
            padding: "16px 20px",
            borderRadius: 12,
            boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Language Selector */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                minWidth: 80,
                color: theme === "dark" ? "#e0e0e0" : "#000",
              }}
            >
              Language:
            </span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                padding: "8px 14px",
                border: "1px solid #ccc",
                borderRadius: 6,
                cursor: "pointer",
                background: theme === "dark" ? "#1a1a1a" : "#fff",
                color: theme === "dark" ? "#e0e0e0" : "#000",
                fontSize: 14,
              }}
            >
              <option value="en">🇺🇸 English</option>
              <option value="zh">🇨🇳 中文</option>
              <option value="vi">🇻🇳 Tiếng Việt</option>
            </select>
          </div>

          {/* Theme Selector */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                minWidth: 80,
                color: theme === "dark" ? "#e0e0e0" : "#000",
              }}
            >
              Theme:
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setTheme("light")}
                style={{
                  padding: "8px 14px",
                  border: "1px solid #ccc",
                  background: theme === "light" ? "#007bff" : "transparent",
                  color:
                    theme === "light"
                      ? "#fff"
                      : theme === "dark"
                        ? "#e0e0e0"
                        : "#000",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                ☀️ Light
              </button>
              <button
                onClick={() => setTheme("dark")}
                style={{
                  padding: "8px 14px",
                  border: "1px solid #ccc",
                  background: theme === "dark" ? "#007bff" : "transparent",
                  color: theme === "dark" ? "#fff" : "#000",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                🌙 Dark
              </button>
            </div>
          </div>
        </div>

        <SettingsProvider>
          <MainLayout
            state={state}
            dispatch={dispatch}
            onRegionClassAdded={onRegionClassAdded}
            alwaysShowNextButton={true}
            alwaysShowPrevButton={true}
            theme={theme}
          />
        </SettingsProvider>
      </div>
    </I18nProvider>
  )
}

export const CombinedThemeAndI18n = () => (
  <ThemeProvider>
    <HeadlessWithThemeAndI18n />
  </ThemeProvider>
)

CombinedThemeAndI18n.storyName = "🎨 Complete: Theme + i18n"
CombinedThemeAndI18n.parameters = {
  docs: {
    description: {
      story: `
This demonstrates the **complete integration** of theme and i18n using the built-in **I18nProvider**.

**Features Demonstrated:**
- ✅ Full Workspace layout (same as original Annotator)
- ✅ Light/Dark theme switching
- ✅ Multi-language support (EN/ZH/VI) with **automatic UI translation**
- ✅ External state management
- ✅ Custom behavior injection

**NEW in v3.x:**
All UI elements now translate automatically including:
- Header buttons (Prev, Next, Save, etc.)
- Tool names (Select, Bounding Box, Polygon, etc.)
- Sidebar labels (Task Description, Regions, etc.)

**Real-World Integration:**
\`\`\`jsx
import { useAnnotator } from '@karlorz/react-image-annotate/headless'
import { I18nProvider } from '@karlorz/react-image-annotate'
import { useTheme } from '@/contexts/ThemeContext'
import MainLayout from '@karlorz/react-image-annotate/components/MainLayout'

function MyApp() {
  const { resolvedTheme } = useTheme()
  const [language, setLanguage] = useState('en')

  const { state, dispatch, onRegionClassAdded } = useAnnotator({
    images: myImages,
    onExit: (output) => {
      saveWithMetadata(output, {
        theme: resolvedTheme,
        language: language,
        timestamp: Date.now()
      })
    }
  })

  return (
    <I18nProvider language={language}>
      <div data-theme={resolvedTheme}>
        <MainLayout
          state={state}
          dispatch={dispatch}
          onRegionClassAdded={onRegionClassAdded}
        />
      </div>
    </I18nProvider>
  )
}
\`\`\`

**Benefits:**
- Keep the proven Workspace UI
- Add your theme system
- Built-in i18n support - no extra configuration needed!
- Add analytics, logging, etc.
- Full control over data flow
      `,
    },
  },
}
