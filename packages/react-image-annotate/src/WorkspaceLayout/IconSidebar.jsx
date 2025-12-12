// Migrated from react-material-workspace-layout
// Modernized for React 19 compatibility

import React from "react"
import { styled } from "@mui/material/styles"
import IconButton from "@mui/material/IconButton"
import { iconMapping } from "./icon-mapping"
import { useIconDictionary } from "./icon-dictionary"
import Tooltip from "@mui/material/Tooltip"

const Container = styled("div")(({ theme }) => ({
  width: 50,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.palette.background.paper,
  borderRight: `1px solid ${theme.palette.divider}`,
  flexShrink: 0,
}))

const emptyAr = []

export const IconSidebar = ({
  items = emptyAr,
  onClickItem,
  selectedTools = emptyAr,
}) => {
  const customIconMapping = useIconDictionary()

  return (
    <Container>
      {items.map((item) => {
        const NameIcon =
          customIconMapping[item.name?.toLowerCase()] ||
          iconMapping[item.name?.toLowerCase()] ||
          iconMapping["help"]

        const buttonPart = (
          <IconButton
            key={item.name}
            color={
              item.selected || selectedTools.includes(item.name?.toLowerCase())
                ? "primary"
                : "default"
            }
            disabled={Boolean(item.disabled)}
            onClick={item.onClick ? item.onClick : () => onClickItem(item)}
          >
            {item.icon || <NameIcon />}
          </IconButton>
        )

        if (!item.helperText) return buttonPart

        return (
          <Tooltip key={item.name} title={item.helperText} placement="right">
            {buttonPart}
          </Tooltip>
        )
      })}
    </Container>
  )
}

export default IconSidebar
