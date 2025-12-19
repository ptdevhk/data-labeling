// @flow

import React, { memo } from "react"
import SidebarBoxContainer from "../SidebarBoxContainer"
import DescriptionIcon from "@mui/icons-material/Description"
import { styled } from "@mui/material/styles"
import Markdown from "react-markdown"

const MarkdownContainer = styled("div")(({ theme }) => ({
  paddingLeft: 16,
  paddingRight: 16,
  fontSize: 12,
  color: theme.palette.text.primary,
  "& h1": { fontSize: 18 },
  "& h2": { fontSize: 14 },
  "& h3": { fontSize: 12 },
  "& h4": { fontSize: 12 },
  "& h5": { fontSize: 12 },
  "& h6": { fontSize: 12 },
  "& p": { fontSize: 12 },
  "& a": { color: theme.palette.primary.main },
  "& img": { width: "100%" },
}))

const IconStyled = styled(DescriptionIcon)(({ theme }) => ({
  color:
    theme.palette.mode === "dark"
      ? theme.palette.text.secondary
      : theme.palette.grey[700],
}))

export const TaskDescriptionSidebarBox = ({
  description,
  title = "Task Description", // NEW: Optional title for i18n support
}) => {
  return (
    <SidebarBoxContainer
      title={title}
      icon={<IconStyled />}
      expandedByDefault={description && description !== "" ? false : true}
    >
      <MarkdownContainer>
        <Markdown>{description}</Markdown>
      </MarkdownContainer>
    </SidebarBoxContainer>
  )
}

export default memo(TaskDescriptionSidebarBox)
