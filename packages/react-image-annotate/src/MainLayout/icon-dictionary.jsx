// @flow

import React from "react"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faMousePointer,
  faHandPaper,
  faSearch,
  faTag,
  faCrosshairs,
  faBorderAll, // Replacement for faVectorSquare (removed in FontAwesome 7 free)
  faDrawPolygon,
  faGripLines,
  faChartLine,
  faMask,
  faEdit,
  faPerson,
  faExpand,
  faCompress,
  faArrowLeft,
  faArrowRight,
  faPlay,
  faPause,
  faFloppyDisk,
  faGear,
  faClone,
} from "@fortawesome/free-solid-svg-icons"

const faStyle = { marginTop: 4, width: 16, height: 16, marginBottom: 4 }

const iconFromFa = (icon) => () => (
  <FontAwesomeIcon style={faStyle} size="xs" fixedWidth icon={icon} />
)

export const iconDictionary = {
  select: iconFromFa(faMousePointer),
  pan: iconFromFa(faHandPaper),
  zoom: iconFromFa(faSearch),
  "show-tags": iconFromFa(faTag),
  "create-point": iconFromFa(faCrosshairs),
  "create-box": iconFromFa(faBorderAll),
  "create-polygon": iconFromFa(faDrawPolygon),
  "create-expanding-line": iconFromFa(faGripLines),
  "create-line": iconFromFa(faChartLine),
  "show-mask": iconFromFa(faMask),
  "modify-allowed-area": iconFromFa(faEdit),
  "create-keypoints": iconFromFa(faPerson),
  window: iconFromFa(faCompress),
  fullscreen: iconFromFa(faExpand),
  Fullscreen: iconFromFa(faExpand),
  Window: iconFromFa(faCompress),
  prev: iconFromFa(faArrowLeft),
  Prev: iconFromFa(faArrowLeft),
  next: iconFromFa(faArrowRight),
  Next: iconFromFa(faArrowRight),
  play: iconFromFa(faPlay),
  Play: iconFromFa(faPlay),
  pause: iconFromFa(faPause),
  Pause: iconFromFa(faPause),
  save: iconFromFa(faFloppyDisk),
  Save: iconFromFa(faFloppyDisk),
  settings: iconFromFa(faGear),
  Settings: iconFromFa(faGear),
  clone: iconFromFa(faClone),
  Clone: iconFromFa(faClone),
}

export default iconDictionary
