// @flow
import React from "react"
import Annotator from "../Annotator"

const FullImageSegmentationAnnotator = (props) => {
  return <Annotator {...props} fullImageSegmentationMode={true} />
}

export default FullImageSegmentationAnnotator
