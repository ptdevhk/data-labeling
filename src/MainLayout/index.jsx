import { FullScreen, useFullScreenHandle } from "react-full-screen"
import React, { useCallback, useRef, useMemo } from "react"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { styled } from "@mui/material/styles"

import ClassSelectionMenu from "../ClassSelectionMenu"
import DebugBox from "../DebugSidebarBox"
import HistorySidebarBox from "../HistorySidebarBox"
import ImageCanvas from "../ImageCanvas"
import ImageSelector from "../ImageSelectorSidebarBox"
import KeyframeTimeline from "../KeyframeTimeline"
import KeyframesSelector from "../KeyframesSelectorSidebarBox"
import { Node } from "react"
import RegionSelector from "../RegionSelectorSidebarBox"
import SettingsDialog from "../SettingsDialog"
import TagsSidebarBox from "../TagsSidebarBox"
import TaskDescription from "../TaskDescriptionSidebarBox"
import Workspace from "../WorkspaceLayout/Workspace"
import getActiveImage from "../Annotator/reducers/get-active-image"
import getHotkeyHelpText from "../utils/get-hotkey-help-text"
import iconDictionary from "./icon-dictionary"
import { useDispatchHotkeyHandlers } from "../ShortcutsManager"
import useEventCallback from "use-event-callback"
import useImpliedVideoRegions from "./use-implied-video-regions"
import useKey from "use-key-hook"
import { useSettings } from "../SettingsProvider"
import { useI18n } from "../I18nProvider"
// import { withHotKeys } from "react-hotkeys" // TODO: Replace with react-hotkeys-hook

// import Fullscreen from "../Fullscreen"

const emptyArr = []

// Create a theme based on mode (light/dark) for Material-UI components
const createDefaultTheme = (mode = "light") =>
  createTheme({
    palette: {
      mode: mode,
    },
  })

// Temporary fix: Replace withHotKeys HOC with a simple div
// The react-hotkeys library is not compatible with React 19
const HotkeyDiv = styled("div")(({ theme, fullscreen }) => ({
  display: "flex",
  flexGrow: 1,
  flexDirection: "column",
  height: "100%",
  maxHeight: "100vh",
  backgroundColor: theme.palette.background.default,
  overflow: "hidden",
  ...(fullscreen && {
    position: "absolute",
    zIndex: 99999,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  }),
}))

const FullScreenContainer = styled("div")(({ theme }) => ({
  width: "100%",
  height: "100vh",
  "& .fullscreen-enabled": {
    width: "100%",
    height: "100%",
  },
}))

// Styled component for header title using the same styles from styles.js
const HeaderTitle = styled("div")(({ theme }) => ({
  fontWeight: "bold",
  color: theme.palette.text.secondary,
  paddingLeft: 16,
}))

// type Props = {
//   state,
//   RegionEditLabel?,
//   dispatch,
//   alwaysShowNextButton?,
//   alwaysShowPrevButton?,
//   onRegionClassAdded: () => {},
//   hideHeader?,
//   hideHeaderText?,
//   theme?, // NEW: Optional theme - can be 'light', 'dark', or full MUI theme object
// }

// Internal component that uses the theme from context
const MainLayoutInner = ({
  state,
  dispatch,
  alwaysShowNextButton = false,
  alwaysShowPrevButton = false,
  RegionEditLabel,
  onRegionClassAdded,
  hideHeader,
  hideHeaderText,
  hideNext = false,
  hidePrev = false,
  hideClone = false,
  hideSettings = false,
  hideFullScreen = false,
  hideSave = false,
  translations,
  theme, // Theme prop passed from outer component
}) => {
  const settings = useSettings()
  const fullScreenHandle = useFullScreenHandle()

  // Get translations from context (if provider exists) or use defaults
  const i18n = useI18n()

  // Allow prop override of context translations
  const t = translations
    ? (key, fallback) => translations[key] || fallback || key
    : i18n.t

  const memoizedActionFns = useRef({})
  const action = (type, ...params) => {
    const fnKey = `${type}(${params.join(",")})`
    if (memoizedActionFns.current[fnKey])
      return memoizedActionFns.current[fnKey]

    const fn = (...args) =>
      params.length > 0
        ? dispatch({
            type,
            ...params.reduce((acc, p, i) => ((acc[p] = args[i]), acc), {}),
          })
        : dispatch({ type, ...args[0] })
    memoizedActionFns.current[fnKey] = fn
    return fn
  }

  const { currentImageIndex, activeImage } = getActiveImage(state)
  let nextImage
  if (currentImageIndex !== null) {
    nextImage = state.images[currentImageIndex + 1]
  }

  useKey(() => dispatch({ type: "CANCEL" }), {
    detectKeys: [27],
  })

  const isAVideoFrame = activeImage && activeImage.frameTime !== undefined
  const innerContainerRef = useRef()
  const hotkeyHandlers = useDispatchHotkeyHandlers({ dispatch })

  let impliedVideoRegions = useImpliedVideoRegions(state)

  const refocusOnMouseEvent = useCallback((e) => {
    if (!innerContainerRef.current) return
    if (innerContainerRef.current.contains(document.activeElement)) return
    if (innerContainerRef.current.contains(e.target)) {
      innerContainerRef.current.focus()
      e.target.focus()
    }
  }, [])

  const canvas = (
    <ImageCanvas
      {...settings}
      showCrosshairs={
        settings.showCrosshairs &&
        state.selectedTool &&
        !["select", "pan", "zoom"].includes(state.selectedTool)
      }
      key={state.selectedImage}
      showMask={state.showMask}
      fullImageSegmentationMode={state.fullImageSegmentationMode}
      autoSegmentationOptions={state.autoSegmentationOptions}
      showTags={state.showTags}
      allowedArea={state.allowedArea}
      modifyingAllowedArea={state.selectedTool === "modify-allowed-area"}
      regionClsList={state.regionClsList}
      regionTagList={state.regionTagList}
      regions={
        state.annotationType === "image"
          ? activeImage && activeImage.regions
            ? activeImage.regions
            : []
          : impliedVideoRegions
      }
      realSize={activeImage ? activeImage.realSize : undefined}
      videoPlaying={state.videoPlaying}
      imageSrc={
        state.annotationType === "image" && activeImage ? activeImage.src : null
      }
      videoSrc={state.annotationType === "video" ? state.videoSrc : null}
      pointDistancePrecision={state.pointDistancePrecision}
      createWithPrimary={
        state.selectedTool && state.selectedTool.includes("create")
      }
      dragWithPrimary={state.selectedTool === "pan"}
      zoomWithPrimary={state.selectedTool === "zoom"}
      showPointDistances={state.showPointDistances}
      videoTime={
        state.annotationType === "image"
          ? state.selectedImageFrameTime
          : state.currentVideoTime
      }
      keypointDefinitions={state.keypointDefinitions}
      onMouseMove={action("MOUSE_MOVE")}
      onMouseDown={action("MOUSE_DOWN")}
      onMouseUp={action("MOUSE_UP")}
      onChangeRegion={action("CHANGE_REGION", "region")}
      onBeginRegionEdit={action("OPEN_REGION_EDITOR", "region")}
      onCloseRegionEdit={action("CLOSE_REGION_EDITOR", "region")}
      onDeleteRegion={action("DELETE_REGION", "region")}
      onBeginBoxTransform={action("BEGIN_BOX_TRANSFORM", "box", "directions")}
      onBeginMovePolygonPoint={action(
        "BEGIN_MOVE_POLYGON_POINT",
        "polygon",
        "pointIndex",
      )}
      onBeginMoveKeypoint={action(
        "BEGIN_MOVE_KEYPOINT",
        "region",
        "keypointId",
      )}
      onAddPolygonPoint={action(
        "ADD_POLYGON_POINT",
        "polygon",
        "point",
        "pointIndex",
      )}
      onSelectRegion={action("SELECT_REGION", "region")}
      onBeginMovePoint={action("BEGIN_MOVE_POINT", "point")}
      onImageLoaded={action("IMAGE_LOADED", "image")}
      RegionEditLabel={RegionEditLabel}
      onImageOrVideoLoaded={action("IMAGE_OR_VIDEO_LOADED", "metadata")}
      onChangeVideoTime={action("CHANGE_VIDEO_TIME", "newTime")}
      onChangeVideoPlaying={action("CHANGE_VIDEO_PLAYING", "isPlaying")}
      onRegionClassAdded={onRegionClassAdded}
      allowComments={state.allowComments}
    />
  )

  const onClickIconSidebarItem = useEventCallback((item) => {
    dispatch({ type: "SELECT_TOOL", selectedTool: item.name })
  })

  const onClickHeaderItem = useEventCallback((item) => {
    if (item.name === "Fullscreen") {
      fullScreenHandle.enter()
    } else if (item.name === "Window") {
      fullScreenHandle.exit()
    }
    dispatch({ type: "HEADER_BUTTON_CLICKED", buttonName: item.name })
  })

  const debugModeOn = Boolean(window.localStorage.$ANNOTATE_DEBUG_MODE && state)
  const nextImageHasRegions =
    !nextImage || (nextImage.regions && nextImage.regions.length > 0)

  const headerLeftSideItems = []
  if (state.annotationType === "video") {
    headerLeftSideItems.push(
      <KeyframeTimeline
        key="timeline"
        currentTime={state.currentVideoTime}
        duration={state.videoDuration}
        onChangeCurrentTime={action("CHANGE_VIDEO_TIME", "newTime")}
        keyframes={state.keyframes}
      />,
    )
  } else if (activeImage) {
    headerLeftSideItems.push(
      <HeaderTitle key="active-image-name">
        {activeImage.name || t("common.noImage", "No Image")}
      </HeaderTitle>,
    )
  }

  const rightSidebarItems = [
    debugModeOn && (
      <DebugBox
        key="debug-box"
        state={debugModeOn}
        lastAction={state.lastAction}
      />
    ),
    state.taskDescription && (
      <TaskDescription
        key="task-description"
        description={state.taskDescription}
        title={t("sidebar.taskDescription", "Task Description")}
      />
    ),
    state.regionClsList && (
      <ClassSelectionMenu
        key="class-selection-menu"
        selectedCls={state.selectedCls}
        regionClsList={state.regionClsList}
        onSelectCls={action("SELECT_CLASSIFICATION", "cls")}
        title={t("sidebar.classifications", "Classifications")}
      />
    ),
    state.labelImages && (
      <TagsSidebarBox
        key="tags-sidebar"
        currentImage={activeImage}
        imageClsList={state.imageClsList}
        imageTagList={state.imageTagList}
        onChangeImage={action("CHANGE_IMAGE", "delta")}
        expandedByDefault
        title={t("sidebar.tags", "Image Tags")}
      />
    ),
    <RegionSelector
      key="region-selector"
      regions={activeImage ? activeImage.regions : emptyArr}
      onSelectRegion={action("SELECT_REGION", "region")}
      onDeleteRegion={action("DELETE_REGION", "region")}
      onChangeRegion={action("CHANGE_REGION", "region")}
      title={t("sidebar.regions", "Regions")}
    />,
    state.keyframes && (
      <KeyframesSelector
        key="keyframes-selector"
        onChangeVideoTime={action("CHANGE_VIDEO_TIME", "newTime")}
        onDeleteKeyframe={action("DELETE_KEYFRAME", "time")}
        onChangeCurrentTime={action("CHANGE_VIDEO_TIME", "newTime")}
        currentTime={state.currentVideoTime}
        duration={state.videoDuration}
        keyframes={state.keyframes}
        title={t("sidebar.keyframes", "Keyframes")}
      />
    ),
    <HistorySidebarBox
      key="history-sidebar"
      history={state.history}
      onRestoreHistory={action("RESTORE_HISTORY")}
      title={t("sidebar.history", "History")}
    />,
  ].filter(Boolean)

  return (
    <FullScreenContainer>
      <FullScreen
        handle={fullScreenHandle}
        onChange={(open) => {
          if (!open) {
            fullScreenHandle.exit()
            action("HEADER_BUTTON_CLICKED", "buttonName")("Window")
          }
        }}
      >
        <HotkeyDiv
          tabIndex={-1}
          ref={innerContainerRef}
          onMouseDown={refocusOnMouseEvent}
          onMouseOver={refocusOnMouseEvent}
          handlers={hotkeyHandlers}
          fullscreen={state.fullScreen}
        >
          <Workspace
            allowFullscreen
            iconDictionary={iconDictionary}
            hideHeader={hideHeader}
            hideHeaderText={hideHeaderText}
            headerLeftSide={headerLeftSideItems}
            headerItems={[
              !hidePrev && { name: "Prev", label: t("header.prev", "Prev") },
              !hideNext && { name: "Next", label: t("header.next", "Next") },
              state.annotationType !== "video"
                ? null
                : !state.videoPlaying
                  ? { name: "Play", label: t("header.play", "Play") }
                  : { name: "Pause", label: t("header.pause", "Pause") },
              !hideClone &&
                !nextImageHasRegions &&
                activeImage &&
                activeImage.regions && {
                  name: "Clone",
                  label: t("header.clone", "Clone"),
                },
              !hideSettings && {
                name: "Settings",
                label: t("header.settings", "Settings"),
              },
              !hideFullScreen &&
                (state.fullScreen
                  ? { name: "Window", label: t("header.window", "Window") }
                  : {
                      name: "Fullscreen",
                      label: t("header.fullscreen", "Fullscreen"),
                    }),
              !hideSave && { name: "Save", label: t("header.save", "Save") },
            ].filter(Boolean)}
            onClickHeaderItem={onClickHeaderItem}
            onClickIconSidebarItem={onClickIconSidebarItem}
            selectedTools={[
              state.selectedTool,
              state.showTags && "show-tags",
              state.showMask && "show-mask",
            ].filter(Boolean)}
            iconSidebarItems={[
              {
                name: "select",
                helperText:
                  t("tools.select", "Select") +
                  getHotkeyHelpText("select_tool"),
                alwaysShowing: true,
              },
              {
                name: "pan",
                helperText:
                  t("tools.pan", "Drag/Pan (right or middle click)") +
                  getHotkeyHelpText("pan_tool"),
                alwaysShowing: true,
              },
              {
                name: "zoom",
                helperText:
                  t("tools.zoom", "Zoom In/Out (scroll)") +
                  getHotkeyHelpText("zoom_tool"),
                alwaysShowing: true,
              },
              {
                name: "show-tags",
                helperText: t("tools.showTags", "Show / Hide Tags"),
                alwaysShowing: true,
              },
              {
                name: "create-point",
                helperText:
                  t("tools.createPoint", "Add Point") +
                  getHotkeyHelpText("create_point"),
              },
              {
                name: "create-box",
                helperText:
                  t("tools.createBox", "Add Bounding Box") +
                  getHotkeyHelpText("create_bounding_box"),
              },
              {
                name: "create-polygon",
                helperText:
                  t("tools.createPolygon", "Add Polygon") +
                  getHotkeyHelpText("create_polygon"),
              },
              {
                name: "create-line",
                helperText: t("tools.createLine", "Add Line"),
              },
              {
                name: "create-expanding-line",
                helperText: t(
                  "tools.createExpandingLine",
                  "Add Expanding Line",
                ),
              },
              {
                name: "create-keypoints",
                helperText: t("tools.createKeypoints", "Add Keypoints (Pose)"),
              },
              state.fullImageSegmentationMode && {
                name: "show-mask",
                alwaysShowing: true,
                helperText: t("tools.showMask", "Show / Hide Mask"),
              },
              {
                name: "modify-allowed-area",
                helperText: t("tools.modifyAllowedArea", "Modify Allowed Area"),
              },
            ]
              .filter(Boolean)
              .filter(
                (a) =>
                  a.alwaysShowing ||
                  (state.enabledTools && state.enabledTools.includes(a.name)),
              )}
            rightSidebarItems={rightSidebarItems}
          >
            {canvas}
          </Workspace>
          <SettingsDialog
            open={state.settingsOpen}
            onClose={() =>
              dispatch({
                type: "HEADER_BUTTON_CLICKED",
                buttonName: "Settings",
              })
            }
          />
        </HotkeyDiv>
      </FullScreen>
    </FullScreenContainer>
  )
}

// Outer wrapper component that provides the theme
export const MainLayout = (props) => {
  const { theme, ...rest } = props

  // Determine the Material-UI theme to use
  const muiTheme = useMemo(() => {
    if (!theme) {
      // Backward compatible: no theme prop = light mode
      return createDefaultTheme("light")
    }

    if (typeof theme === "string") {
      // String mode: 'light' or 'dark'
      return createDefaultTheme(theme)
    }

    // Full theme object provided by user
    return theme
  }, [theme])

  return (
    <ThemeProvider theme={muiTheme}>
      <MainLayoutInner {...rest} theme={theme} />
    </ThemeProvider>
  )
}

export default MainLayout
