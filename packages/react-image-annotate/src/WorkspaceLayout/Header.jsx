// Migrated from react-material-workspace-layout
// Modernized for React 19 compatibility

import React from "react"
import HeaderButton from "./HeaderButton"
import Box from "@mui/material/Box"
import { styled } from "@mui/material/styles"

const Container = styled("div")(({ theme }) => ({
  width: "100%",
  display: "flex",
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  alignItems: "center",
  flexShrink: 1,
  boxSizing: "border-box",
}))

const LeftSideContainer = styled("div")({
  flexGrow: 1,
  display: "flex",
  alignItems: "center",
})

export const Header = ({
  leftSideContent = null,
  hideHeaderText = false,
  items,
  onClickItem,
}) => {
  return (
    <Container>
      <LeftSideContainer>{leftSideContent}</LeftSideContainer>
      {items.map((item) => (
        <HeaderButton
          key={item.name}
          hideText={hideHeaderText}
          onClick={() => onClickItem(item)}
          {...item}
        />
      ))}
    </Container>
  )
}

export default Header
