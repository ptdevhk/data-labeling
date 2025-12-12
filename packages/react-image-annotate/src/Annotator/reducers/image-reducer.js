// // @flow
//
//   MainLayoutImageAnnotationState,
//   Action,
import { setIn } from "../../utils/immutable-helpers"
import getActiveImage from "./get-active-image"

export default (state, action) => {
  const { currentImageIndex, pathToActiveImage, activeImage } =
    getActiveImage(state)

  switch (action.type) {
    case "IMAGE_OR_VIDEO_LOADED": {
      return setIn(state, ["images", currentImageIndex, "pixelSize"], {
        w: action.metadata.naturalWidth,
        h: action.metadata.naturalHeight,
      })
    }
  }
  return state
}
