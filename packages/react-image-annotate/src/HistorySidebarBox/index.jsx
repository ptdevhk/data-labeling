// @flow

import React, { setState, memo } from "react"
import { makeStyles } from "@mui/styles"
import SidebarBoxContainer from "../SidebarBoxContainer"
import HistoryIcon from "@mui/icons-material/History"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"
import IconButton from "@mui/material/IconButton"
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction"
import UndoIcon from "@mui/icons-material/Undo"
import moment from "moment"
import isEqual from "lodash/isEqual"
import Box from "@mui/material/Box"

const useStyles = makeStyles((theme) => ({
  emptyText: {
    fontSize: 14,
    fontWeight: "bold",
    color:
      theme.palette.mode === "dark"
        ? theme.palette.text.disabled
        : theme.palette.grey[500],
    textAlign: "center",
    padding: 20,
  },
  icon: {
    color:
      theme.palette.mode === "dark"
        ? theme.palette.text.secondary
        : theme.palette.grey[700],
  },
}))

const listItemTextStyle = { paddingLeft: 16 }

export const HistorySidebarBox = ({
  history,
  onRestoreHistory,
  title = "History", // NEW: Optional title for i18n support
}) => {
  const classes = useStyles()

  return (
    <SidebarBoxContainer
      title={title}
      icon={<HistoryIcon className={classes.icon} />}
      expandedByDefault
    >
      <List>
        {history.length === 0 && (
          <div className={classes.emptyText}>No History Yet</div>
        )}
        {history.map(({ name, time }, i) => (
          <ListItem button dense key={i}>
            <ListItemText
              style={listItemTextStyle}
              primary={name}
              secondary={moment(time).format("LT")}
            />
            {i === 0 && (
              <ListItemSecondaryAction onClick={() => onRestoreHistory()}>
                <IconButton>
                  <UndoIcon />
                </IconButton>
              </ListItemSecondaryAction>
            )}
          </ListItem>
        ))}
      </List>
    </SidebarBoxContainer>
  )
}

export default memo(
  HistorySidebarBox,
  (prevProps, nextProps) =>
    prevProps.title === nextProps.title &&
    isEqual(
      prevProps.history.map((a) => [a.name, a.time]),
      nextProps.history.map((a) => [a.name, a.time]),
    ),
)
