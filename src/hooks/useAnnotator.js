/**
 * useAnnotator - Headless hook for image/video annotation
 *
 * This hook extracts all business logic from the Annotator component,
 * making it framework-agnostic and allowing custom UI implementations.
 *
 * @example
 * ```js
 * import { useAnnotator } from '@karlorz/react-image-annotate/headless'
 *
 * function MyCustomAnnotator() {
 *   const { state, actions, regions, currentImage } = useAnnotator({
 *     images: [{ src: '/image.jpg', name: 'Test' }],
 *     onExit: (output) => console.log(output)
 *   })
 *
 *   return (
 *     <div>
 *       <button onClick={() => actions.selectTool('create-box')}>Box</button>
 *       <canvas {...actions.getCanvasProps()} />
 *       {regions.map(r => <div key={r.id}>{r.cls}</div>)}
 *     </div>
 *   )
 * }
 * ```
 */

import { useEffect, useReducer, useRef, useMemo, useCallback } from "react"
import makeImmutable, { without } from "../utils/immutable-helpers"
import combineReducers from "../Annotator/reducers/combine-reducers.js"
import generalReducer from "../Annotator/reducers/general-reducer.js"
import getFromLocalStorage from "../utils/get-from-local-storage"
import historyHandler from "../Annotator/reducers/history-handler.js"
import imageReducer from "../Annotator/reducers/image-reducer.js"
import videoReducer from "../Annotator/reducers/video-reducer.js"
import getActiveImage from "../Annotator/reducers/get-active-image"
import useEventCallback from "use-event-callback"

/**
 * Main headless hook for annotation
 */
export function useAnnotator(config = {}) {
  const {
    images,
    videoSrc,
    videoTime = 0,
    videoName,
    selectedImage: initialSelectedImage,
    allowedArea,
    showPointDistances,
    pointDistancePrecision,
    showTags = getFromLocalStorage("showTags", true),
    enabledTools = [
      "select",
      "create-point",
      "create-box",
      "create-polygon",
      "create-line",
      "create-expanding-line",
      "show-mask",
    ],
    selectedTool = "select",
    regionTagList = [],
    regionClsList = [],
    imageTagList = [],
    imageClsList = [],
    keyframes = {},
    taskDescription = "",
    fullImageSegmentationMode = false,
    keypointDefinitions,
    autoSegmentationOptions = { type: "autoseg" },
    allowComments,
    onExit,
    onNextImage,
    onPrevImage,
    onRegionClassAdded,
  } = config

  // Normalize selectedImage (convert string to index if needed)
  let selectedImage =
    initialSelectedImage ?? (images && images.length > 0 ? 0 : undefined)
  if (typeof selectedImage === "string") {
    selectedImage = (images || []).findIndex((img) => img.src === selectedImage)
    if (selectedImage === -1) selectedImage = undefined
  }

  const annotationType = images ? "image" : "video"

  // Initialize state with reducer
  const [state, dispatchToReducer] = useReducer(
    historyHandler(
      combineReducers(
        annotationType === "image" ? imageReducer : videoReducer,
        generalReducer,
      ),
    ),
    makeImmutable({
      annotationType,
      showTags,
      allowedArea,
      showPointDistances,
      pointDistancePrecision,
      selectedTool,
      fullImageSegmentationMode,
      autoSegmentationOptions,
      mode: null,
      taskDescription,
      showMask: true,
      labelImages: imageClsList.length > 0 || imageTagList.length > 0,
      regionClsList,
      regionTagList,
      imageClsList,
      imageTagList,
      currentVideoTime: videoTime,
      enabledTools,
      history: [],
      videoName,
      keypointDefinitions,
      allowComments,
      ...(annotationType === "image"
        ? {
            selectedImage,
            images,
            selectedImageFrameTime:
              images && images.length > 0 ? images[0].frameTime : undefined,
          }
        : {
            videoSrc,
            keyframes,
          }),
    }),
  )

  // Enhanced dispatch that handles header button actions
  const dispatch = useEventCallback((action) => {
    if (action.type === "HEADER_BUTTON_CLICKED") {
      if (["Exit", "Done", "Save", "Complete"].includes(action.buttonName)) {
        if (onExit) return onExit(without(state, "history"))
      } else if (action.buttonName === "Next" && onNextImage) {
        return onNextImage(without(state, "history"))
      } else if (action.buttonName === "Prev" && onPrevImage) {
        return onPrevImage(without(state, "history"))
      }
    }
    dispatchToReducer(action)
  })

  // Handle region class added callback
  const handleRegionClassAdded = useEventCallback((cls) => {
    dispatchToReducer({
      type: "ON_CLS_ADDED",
      cls: cls,
    })
    if (onRegionClassAdded) {
      onRegionClassAdded(cls)
    }
  })

  // Sync selectedImage prop changes
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
    return () => {
      // Cleanup to prevent memory leaks
      stateRef.current = null
    }
  }, [state])

  useEffect(() => {
    if (selectedImage === undefined) return
    const currentState = stateRef.current
    if (!currentState) return
    if (currentState.selectedImage === selectedImage) return
    const image = currentState.images
      ? currentState.images[selectedImage]
      : undefined
    if (!image) return
    dispatchToReducer({
      type: "SELECT_IMAGE",
      imageIndex: selectedImage,
      image,
    })
  }, [selectedImage, images])

  // Get current image and regions
  const { currentImageIndex, activeImage } = useMemo(
    () => getActiveImage(state),
    [state],
  )

  const regions = useMemo(() => {
    if (state.annotationType === "image") {
      return activeImage?.regions || []
    }
    // For video, we'd need to compute implied regions from keyframes
    // This is handled separately in the UI layer
    return []
  }, [state, activeImage])

  // Memoized action creators
  const actions = useMemo(
    () => ({
      // Tool selection
      selectTool: (tool) =>
        dispatch({ type: "SELECT_TOOL", selectedTool: tool }),

      // Region management
      selectRegion: (region) => dispatch({ type: "SELECT_REGION", region }),
      changeRegion: (region) => dispatch({ type: "CHANGE_REGION", region }),
      deleteRegion: (region) => dispatch({ type: "DELETE_REGION", region }),
      openRegionEditor: (region) =>
        dispatch({ type: "OPEN_REGION_EDITOR", region }),
      closeRegionEditor: (region) =>
        dispatch({ type: "CLOSE_REGION_EDITOR", region }),

      // Image management
      selectImage: (imageIndex, image) =>
        dispatch({ type: "SELECT_IMAGE", imageIndex, image }),
      changeImage: (delta) => dispatch({ type: "CHANGE_IMAGE", delta }),

      // Video management
      changeVideoTime: (newTime) =>
        dispatch({ type: "CHANGE_VIDEO_TIME", newTime }),
      changeVideoPlaying: (isPlaying) =>
        dispatch({ type: "CHANGE_VIDEO_PLAYING", isPlaying }),
      deleteKeyframe: (time) => dispatch({ type: "DELETE_KEYFRAME", time }),

      // History
      restoreHistory: () => dispatch({ type: "RESTORE_HISTORY" }),

      // UI actions
      toggleShowTags: () =>
        dispatch({ type: "HEADER_BUTTON_CLICKED", buttonName: "Show Tags" }),
      toggleShowMask: () =>
        dispatch({ type: "HEADER_BUTTON_CLICKED", buttonName: "Show Mask" }),
      selectClassification: (cls) =>
        dispatch({ type: "SELECT_CLASSIFICATION", cls }),
      headerButtonClicked: (buttonName) =>
        dispatch({ type: "HEADER_BUTTON_CLICKED", buttonName }),

      // Canvas events (these are typically called by canvas components)
      mouseMove: (x, y) => dispatch({ type: "MOUSE_MOVE", x, y }),
      mouseDown: (x, y) => dispatch({ type: "MOUSE_DOWN", x, y }),
      mouseUp: (x, y) => dispatch({ type: "MOUSE_UP", x, y }),

      // Box/Polygon editing
      beginBoxTransform: (box, directions) =>
        dispatch({ type: "BEGIN_BOX_TRANSFORM", box, directions }),
      beginMovePolygonPoint: (polygon, pointIndex) =>
        dispatch({ type: "BEGIN_MOVE_POLYGON_POINT", polygon, pointIndex }),
      addPolygonPoint: (polygon, point, pointIndex) =>
        dispatch({ type: "ADD_POLYGON_POINT", polygon, point, pointIndex }),
      beginMovePoint: (point) => dispatch({ type: "BEGIN_MOVE_POINT", point }),
      beginMoveKeypoint: (region, keypointId) =>
        dispatch({ type: "BEGIN_MOVE_KEYPOINT", region, keypointId }),

      // Image/Video loading
      imageLoaded: (image) => dispatch({ type: "IMAGE_LOADED", image }),
      imageOrVideoLoaded: (metadata) =>
        dispatch({ type: "IMAGE_OR_VIDEO_LOADED", metadata }),

      // Other
      cancel: () => dispatch({ type: "CANCEL" }),

      // Region class added
      onRegionClassAdded: handleRegionClassAdded,

      // Canvas props helper for custom UIs
      getCanvasProps: () => ({
        onMouseMove: (e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = (e.clientX - rect.left) / rect.width
          const y = (e.clientY - rect.top) / rect.height
          dispatch({ type: "MOUSE_MOVE", x, y })
        },
        onMouseDown: (e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = (e.clientX - rect.left) / rect.width
          const y = (e.clientY - rect.top) / rect.height
          dispatch({ type: "MOUSE_DOWN", x, y })
        },
        onMouseUp: (e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = (e.clientX - rect.left) / rect.width
          const y = (e.clientY - rect.top) / rect.height
          dispatch({ type: "MOUSE_UP", x, y })
        },
      }),
    }),
    [dispatch, handleRegionClassAdded],
  )

  // Helper to get output (state without history)
  const getOutput = useCallback(() => {
    return without(state, "history")
  }, [state])

  return {
    // State
    state,

    // Convenience accessors
    regions,
    currentImage: activeImage || null,
    currentImageIndex,
    annotationType,

    // Actions
    actions,

    // Raw dispatch for advanced use
    dispatch,

    // Output helper
    getOutput,

    // Callbacks (for backward compatibility with MainLayout)
    onRegionClassAdded: handleRegionClassAdded,
  }
}

export default useAnnotator
