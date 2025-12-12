// Migrated from react-material-workspace-layout
// Modernized for React 19 compatibility

import React, { useReducer, useEffect, useMemo } from "react"
import { styled } from "@mui/material/styles"
import ButtonBase from "@mui/material/ButtonBase"
import ExpandIcon from "@mui/icons-material/KeyboardArrowLeft"
import ContractIcon from "@mui/icons-material/KeyboardArrowRight"

const Container = styled("div")(({ theme }) => ({
  width: 0,
  display: "flex",
  flexDirection: "column",
  height: "100%",
  flexShrink: 0,
  backgroundColor: theme.palette.background.paper,
  borderLeft: `1px solid ${theme.palette.divider}`,
  position: "relative",
  transition: "width 500ms",
  "&.expanded": {
    width: 300,
  },
}))

const Expander = styled(ButtonBase)(({ theme }) => ({
  width: 23,
  height: 40,
  display: "flex",
  overflow: "hidden",
  alignItems: "center",
  justifyContent: "flex-start",
  borderTopLeftRadius: "50%",
  borderBottomLeftRadius: "50%",
  boxSizing: "border-box",
  borderTop: `1px solid ${theme.palette.divider}`,
  borderBottom: `1px solid ${theme.palette.divider}`,
  borderLeft: `1px solid ${theme.palette.divider}`,
  boxShadow:
    theme.palette.mode === "dark"
      ? "-1px 2px 5px rgba(0,0,0,0.5)"
      : "-1px 2px 5px rgba(0,0,0,0.2)",
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  position: "absolute",
  top: "calc(50% - 20px)",
  left: -23,
  zIndex: 9999,
  transition: "opacity 500ms, left 500ms, width 500ms",
  "&.expanded": {
    left: -20,
    width: 20,
    opacity: 0.4,
    "& .icon": {
      marginLeft: 0,
    },
  },
  "& .icon": {
    marginLeft: 3,
  },
}))

const Slider = styled("div")(({ theme }) => ({
  position: "absolute",
  right: 0,
  top: 0,
  width: 0,
  bottom: 0,
  overflow: "hidden",
  transition: "opacity 500ms, left 500ms, width 500ms",
  "&.expanded": {
    width: 300,
  },
}))

const InnerSliderContent = styled("div")(({ theme }) => ({
  width: 300,
  position: "absolute",
  right: 0,
  top: 0,
  bottom: 0,
}))

const getInitialExpandedState = () => {
  try {
    const stored = window.localStorage.getItem(
      "__REACT_WORKSPACE_LAYOUT_EXPANDED",
    )
    return stored ? JSON.parse(stored) : window.innerWidth > 1000
  } catch (e) {
    return window.innerWidth > 1000
  }
}

export const RightSidebar = ({ children, initiallyExpanded, height }) => {
  const [expanded, toggleExpanded] = useReducer(
    (state) => !state,
    initiallyExpanded === undefined
      ? getInitialExpandedState()
      : initiallyExpanded,
  )

  useEffect(() => {
    if (initiallyExpanded === undefined) {
      try {
        window.localStorage.setItem(
          "__REACT_WORKSPACE_LAYOUT_EXPANDED",
          JSON.stringify(expanded),
        )
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }, [initiallyExpanded, expanded])

  const containerStyle = useMemo(
    () => ({
      height: height || "100%",
    }),
    [height],
  )

  return (
    <Container className={expanded ? "expanded" : ""} style={containerStyle}>
      <Slider className={expanded ? "expanded" : ""}>
        <InnerSliderContent>{children}</InnerSliderContent>
      </Slider>
      <Expander onClick={toggleExpanded} className={expanded ? "expanded" : ""}>
        {expanded ? (
          <ContractIcon className="icon" />
        ) : (
          <ExpandIcon className="icon" />
        )}
      </Expander>
    </Container>
  )
}

export default RightSidebar
