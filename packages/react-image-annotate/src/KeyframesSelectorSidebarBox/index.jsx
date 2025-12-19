// @flow weak

import React from "react"
import AddLocationIcon from "@mui/icons-material/AddLocation"
import SidebarBoxContainer from "../SidebarBoxContainer"
import getTimeString from "../KeyframeTimeline/get-time-string.js"
import TrashIcon from "@mui/icons-material/Delete"
import { styled } from "@mui/material/styles"

const KeyframeRow = styled("div")(({ theme }) => ({
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  padding: 8,
  fontSize: 14,
  color: theme.palette.text.primary,
  "&.current": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.primary.dark
        : theme.palette.primary.light,
  },
  "&:hover": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.grey[800]
        : theme.palette.grey[100],
  },
  "& .time": {
    flexGrow: 1,
    fontWeight: "bold",
    "& .regionCount": {
      marginLeft: 8,
      fontWeight: "normal",
      color: theme.palette.text.secondary,
    },
  },
  "& .trash": {
    "& .icon": {
      fontSize: 18,
      color:
        theme.palette.mode === "dark"
          ? theme.palette.grey[500]
          : theme.palette.grey[600],
      transition: "transform 80ms",
      "&:hover": {
        color:
          theme.palette.mode === "dark"
            ? theme.palette.grey[300]
            : theme.palette.grey[800],
        transform: "scale(1.25,1.25)",
      },
    },
  },
}))

const IconStyled = styled(AddLocationIcon)(({ theme }) => ({
  color:
    theme.palette.mode === "dark"
      ? theme.palette.text.secondary
      : theme.palette.grey[700],
}))

const KeyframesSelectorSidebarBox = ({
  currentVideoTime,
  keyframes,
  onChangeVideoTime,
  onDeleteKeyframe,
  title = "Keyframes", // NEW: Optional title for i18n support
}) => {
  const keyframeTimes = Object.keys(keyframes).map((t) => parseInt(t))

  return (
    <SidebarBoxContainer
      title={title}
      subTitle=""
      icon={<IconStyled />}
      expandedByDefault
    >
      {keyframeTimes.map((t) => (
        <KeyframeRow
          fullWidth
          key={t}
          className={currentVideoTime === t ? "current" : ""}
          onClick={() => onChangeVideoTime(t)}
        >
          <div className="time">
            {getTimeString(t, 2)}
            <span className="regionCount">
              ({(keyframes[t]?.regions || []).length})
            </span>
          </div>
          <div className="trash">
            <TrashIcon
              onClick={(e) => {
                onDeleteKeyframe(t)
                e.stopPropagation()
              }}
              className="icon"
            />
          </div>
        </KeyframeRow>
      ))}
    </SidebarBoxContainer>
  )
}

export default KeyframesSelectorSidebarBox
