/**
 * TypeScript type definitions for the headless annotator hooks
 */

export interface Region {
  id: string
  type: "box" | "polygon" | "point" | "line" | "expanding-line" | "keypoints"
  cls?: string
  tags?: string[]
  color?: string
  editingLabels?: boolean
  highlighted?: boolean
  [key: string]: any
}

export interface Image {
  src: string
  name?: string
  regions?: Region[]
  pixelSize?: { w: number; h: number }
  realSize?: { w: number; h: number; unitName?: string }
  frameTime?: number
  [key: string]: any
}

export interface AnnotatorConfig {
  // Image/Video configuration
  images?: Image[]
  videoSrc?: string
  videoTime?: number
  videoName?: string
  selectedImage?: number | string

  // Annotation configuration
  regionClsList?: string[]
  regionTagList?: string[]
  imageClsList?: string[]
  imageTagList?: string[]
  keypointDefinitions?: any

  // Tool configuration
  enabledTools?: string[]
  selectedTool?: string
  allowedArea?: { x: number; y: number; w: number; h: number }

  // Display configuration
  showTags?: boolean
  showPointDistances?: boolean
  pointDistancePrecision?: number
  showMask?: boolean
  fullImageSegmentationMode?: boolean

  // Segmentation options
  autoSegmentationOptions?: { type: string; [key: string]: any }

  // UI configuration (for Annotator component, not headless hook)
  theme?: "light" | "dark" | any // MUI theme object or mode string
  hideHeader?: boolean
  hideHeaderText?: boolean
  hideNext?: boolean
  hidePrev?: boolean
  hideClone?: boolean
  hideSettings?: boolean
  hideFullScreen?: boolean
  hideSave?: boolean
  RegionEditLabel?: any

  // Callbacks
  onExit?: (output: AnnotatorOutput) => void
  onNextImage?: (output: AnnotatorOutput) => void
  onPrevImage?: (output: AnnotatorOutput) => void
  onRegionClassAdded?: (cls: string) => void

  // Other
  taskDescription?: string
  keyframes?: any
  allowComments?: boolean
}

export interface AnnotatorState {
  annotationType: "image" | "video"

  // Image state
  images?: Image[]
  selectedImage?: number
  selectedImageFrameTime?: number

  // Video state
  videoSrc?: string
  currentVideoTime?: number
  videoDuration?: number
  videoPlaying?: boolean
  keyframes?: any
  videoName?: string

  // Tool state
  selectedTool: string
  enabledTools: string[]
  mode: string | null

  // Display state
  showTags: boolean
  showMask: boolean
  showPointDistances?: boolean
  pointDistancePrecision?: number
  fullImageSegmentationMode: boolean

  // Region/Label configuration
  regionClsList: string[]
  regionTagList: string[]
  imageClsList: string[]
  imageTagList: string[]
  labelImages: boolean

  // Other state
  allowedArea?: { x: number; y: number; w: number; h: number }
  taskDescription?: string
  autoSegmentationOptions?: any
  keypointDefinitions?: any
  allowComments?: boolean
  history: any[]
  selectedCls?: string

  [key: string]: any
}

export interface AnnotatorOutput {
  images?: Image[]
  videoSrc?: string
  keyframes?: any
  [key: string]: any
}

export interface AnnotatorActions {
  // Tool selection
  selectTool: (tool: string) => void

  // Region management
  selectRegion: (region: Region) => void
  changeRegion: (region: Region) => void
  deleteRegion: (region: Region) => void
  openRegionEditor: (region: Region) => void
  closeRegionEditor: (region: Region) => void

  // Image management
  selectImage: (imageIndex: number, image?: Image) => void
  changeImage: (delta: number) => void

  // Video management
  changeVideoTime: (newTime: number) => void
  changeVideoPlaying: (isPlaying: boolean) => void
  deleteKeyframe: (time: number) => void

  // History
  restoreHistory: () => void

  // UI actions
  toggleShowTags: () => void
  toggleShowMask: () => void
  selectClassification: (cls: string) => void
  headerButtonClicked: (buttonName: string) => void

  // Canvas events
  mouseMove: (x: number, y: number) => void
  mouseDown: (x: number, y: number) => void
  mouseUp: (x: number, y: number) => void

  // Box/Polygon editing
  beginBoxTransform: (box: Region, directions: string[]) => void
  beginMovePolygonPoint: (polygon: Region, pointIndex: number) => void
  addPolygonPoint: (polygon: Region, point: any, pointIndex: number) => void
  beginMovePoint: (point: Region) => void
  beginMoveKeypoint: (region: Region, keypointId: string) => void

  // Image/Video loading
  imageLoaded: (image: any) => void
  imageOrVideoLoaded: (metadata: any) => void

  // Other
  cancel: () => void

  // Canvas props helper
  getCanvasProps: () => {
    onMouseMove: (e: React.MouseEvent) => void
    onMouseDown: (e: React.MouseEvent) => void
    onMouseUp: (e: React.MouseEvent) => void
  }

  // Region class added callback
  onRegionClassAdded: (cls: string) => void
}

export interface UseAnnotatorReturn {
  // State
  state: AnnotatorState

  // Convenience accessors
  regions: Region[]
  currentImage: Image | null
  currentImageIndex: number | undefined
  annotationType: "image" | "video"

  // Actions
  actions: AnnotatorActions

  // Raw dispatch (for advanced use)
  dispatch: (action: any) => void

  // Output helper
  getOutput: () => AnnotatorOutput

  // Callbacks (for backward compatibility)
  onRegionClassAdded: (cls: string) => void
}
