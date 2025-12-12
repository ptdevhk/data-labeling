// @flow

// React 19 compatibility shim - must be imported before any other code
import "./utils/react19-compat.js"

import React from "react"
import ReactDOMClient from "react-dom/client"
import Theme from "./Theme/index.jsx"
import DemoSite from "./DemoSite/index.jsx"
import LandingPage from "./LandingPage/index.jsx"
import "./site.css"

const Site = () => {
  const path = window.location.pathname
    .replace(/\/$/, "")
    .split("/")
    .slice(-1)[0]
  return <Theme>{path === "demo" ? <DemoSite /> : <LandingPage />}</Theme>
}

const container = document.getElementById("root")
if (container) {
  const root = ReactDOMClient.createRoot(container)
  root.render(
    <React.StrictMode>
      <Site />
    </React.StrictMode>,
  )
}
