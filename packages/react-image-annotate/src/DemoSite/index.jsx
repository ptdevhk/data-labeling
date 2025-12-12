// @flow
import React, { useState } from "react"
import ReactDOM from "react-dom"
import Editor, { examples } from "./Editor.jsx"
import Annotator from "../Annotator/index.jsx"
import ErrorBoundaryDialog from "./ErrorBoundaryDialog.jsx"

const DemoSite = () => {
  const [annotatorOpen, changeAnnotatorOpen] = useState(false)
  const [annotatorProps, changeAnnotatorProps] = useState(examples["Custom"]())
  const [lastOutput, changeLastOutput] = useState()

  return (
    <div>
      {annotatorOpen ? (
        <ErrorBoundaryDialog
          onClose={() => {
            changeAnnotatorOpen(false)
          }}
        >
          <Annotator
            {...annotatorProps}
            onExit={(output) => {
              delete output["lastAction"]
              changeLastOutput(output)
              changeAnnotatorOpen(false)
            }}
          />
        </ErrorBoundaryDialog>
      ) : (
        <Editor
          lastOutput={lastOutput}
          onOpenAnnotator={(props) => {
            changeAnnotatorProps(props)
            changeAnnotatorOpen(true)
          }}
        />
      )}
    </div>
  )
}

export default DemoSite
