// Migrated from react-material-workspace-layout
// Modernized for React 19 compatibility

import React, { useState, memo, useCallback } from "react"
import Paper from "@mui/material/Paper"
import { makeStyles } from "@mui/styles"
import ExpandIcon from "@mui/icons-material/ExpandMore"
import IconButton from "@mui/material/IconButton"
import Collapse from "@mui/material/Collapse"
import classnames from "classnames"
import useEventCallback from "use-event-callback"
import Typography from "@mui/material/Typography"
import { useIconDictionary } from "./icon-dictionary"

const useStyles = makeStyles((theme) => ({
  container: {
    borderBottom: `2px solid ${theme.palette.divider}`,
    "&:first-child": {
      borderTop: `1px solid ${theme.palette.divider}`,
    },
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    paddingLeft: 16,
    paddingRight: 12,
    "& .iconContainer": {
      color:
        theme.palette.mode === "dark"
          ? theme.palette.text.secondary
          : theme.palette.grey[600],
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "& .MuiSvgIcon-root": {
        width: 16,
        height: 16,
      },
    },
  },
  title: {
    fontSize: 11,
    flexGrow: 1,
    fontWeight: 800,
    paddingLeft: 8,
    color:
      theme.palette.mode === "dark"
        ? theme.palette.text.primary
        : theme.palette.grey[800],
    "& span": {
      color:
        theme.palette.mode === "dark"
          ? theme.palette.text.secondary
          : theme.palette.grey[600],
      fontSize: 11,
    },
  },
  expandButton: {
    padding: 0,
    width: 30,
    height: 30,
    "& .icon": {
      width: 20,
      height: 20,
      transition: "500ms transform",
      "&.expanded": {
        transform: "rotate(180deg)",
      },
    },
  },
  expandedContent: {
    maxHeight: 300,
    overflowY: "auto",
    "&.noScroll": {
      overflowY: "visible",
      overflow: "visible",
    },
  },
  resizableContent: {
    display: "block",
    overflow: "hidden",
    height: 200,
    resize: "vertical",
    minHeight: 100,
    maxHeight: 500,
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 20,
      height: 20,
      cursor: "ns-resize",
    },
  },
}))

const getExpandedFromLocalStorage = (title) => {
  try {
    const key = `__REACT_WORKSPACE_SIDEBAR_EXPANDED_${title}`
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : false
  } catch (e) {
    return false
  }
}

const setExpandedInLocalStorage = (title, expanded) => {
  try {
    const key = `__REACT_WORKSPACE_SIDEBAR_EXPANDED_${title}`
    window.localStorage.setItem(key, JSON.stringify(expanded))
  } catch (e) {
    // Ignore localStorage errors
  }
}

export const SidebarBox = ({
  icon,
  title,
  subTitle,
  children,
  noScroll = false,
  expandedByDefault,
}) => {
  const classes = useStyles()
  const [expanded, changeExpandedState] = useState(
    expandedByDefault === undefined
      ? getExpandedFromLocalStorage(title)
      : expandedByDefault,
  )

  const changeExpanded = useCallback(
    (expanded) => {
      changeExpandedState(expanded)
      setExpandedInLocalStorage(title, expanded)
    },
    [title],
  )

  const toggleExpanded = useEventCallback(() => changeExpanded(!expanded))
  const customIconMapping = useIconDictionary()
  const TitleIcon = customIconMapping[title?.toLowerCase()]

  const content = (
    <div
      className={classnames(classes.expandedContent, noScroll && "noScroll")}
    >
      {children}
    </div>
  )

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <div className="iconContainer">
          {icon || (TitleIcon && <TitleIcon className={classes.titleIcon} />)}
        </div>
        <Typography className={classes.title}>
          {title} <span>{subTitle}</span>
        </Typography>
        <IconButton onClick={toggleExpanded} className={classes.expandButton}>
          <ExpandIcon className={classnames("icon", expanded && "expanded")} />
        </IconButton>
      </div>
      {noScroll ? (
        expanded ? (
          content
        ) : null
      ) : (
        <Collapse in={expanded}>
          <div className={classes.resizableContent}>{content}</div>
        </Collapse>
      )}
    </div>
  )
}

export default memo(
  SidebarBox,
  (prev, next) => prev.title === next.title && prev.children === next.children,
)
