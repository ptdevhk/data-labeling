// Using React 19 - Flow types removed for migration testing
//
// NOTE: This component now uses the headless useAnnotator hook.
// All business logic has been extracted to src/hooks/useAnnotator.js
// This component is now a thin wrapper that provides the default UI.
//
// For custom UIs, use: import { useAnnotator } from '@karlorz/react-image-annotate/headless'

import React from "react"
import MainLayout from "../MainLayout"
import SettingsProvider from "../SettingsProvider"
import ErrorBoundary from "../ErrorBoundary"
import { useAnnotator } from "../hooks/useAnnotator.js"

export const Annotator = ({
  images,
  allowedArea,
  selectedImage,
  showPointDistances,
  pointDistancePrecision,
  showTags,
  enabledTools,
  selectedTool,
  regionTagList,
  regionClsList,
  imageTagList,
  imageClsList,
  keyframes,
  taskDescription,
  fullImageSegmentationMode,
  RegionEditLabel,
  videoSrc,
  videoTime,
  videoName,
  onExit,
  onNextImage,
  onPrevImage,
  keypointDefinitions,
  autoSegmentationOptions,
  hideHeader,
  hideHeaderText,
  hideNext,
  hidePrev,
  hideClone,
  hideSettings,
  hideFullScreen,
  hideSave,
  allowComments,
  theme, // NEW: Accept theme prop ('light', 'dark', or MUI theme object)
}) => {
  // Use the headless hook for all business logic
  const { state, dispatch, onRegionClassAdded } = useAnnotator({
    images,
    videoSrc,
    videoTime,
    videoName,
    selectedImage,
    allowedArea,
    showPointDistances,
    pointDistancePrecision,
    showTags,
    enabledTools,
    selectedTool,
    regionTagList,
    regionClsList,
    imageTagList,
    imageClsList,
    keyframes,
    taskDescription,
    fullImageSegmentationMode,
    keypointDefinitions,
    autoSegmentationOptions,
    allowComments,
    onExit,
    onNextImage,
    onPrevImage,
  })

  if (!images && !videoSrc)
    return 'Missing required prop "images" or "videoSrc"'

  return (
    <ErrorBoundary>
      <SettingsProvider>
        <MainLayout
          RegionEditLabel={RegionEditLabel}
          alwaysShowNextButton={Boolean(onNextImage)}
          alwaysShowPrevButton={Boolean(onPrevImage)}
          state={state}
          dispatch={dispatch}
          onRegionClassAdded={onRegionClassAdded}
          hideHeader={hideHeader}
          hideHeaderText={hideHeaderText}
          hideNext={hideNext}
          hidePrev={hidePrev}
          hideClone={hideClone}
          hideSettings={hideSettings}
          hideFullScreen={hideFullScreen}
          hideSave={hideSave}
          theme={theme}
        />
      </SettingsProvider>
    </ErrorBoundary>
  )
}

export default Annotator
