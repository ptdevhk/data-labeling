// Migrated from react-material-workspace-layout
// Modernized for React 19 compatibility

import React, { useRef } from "react"
import { styled } from "@mui/material/styles"
import Header from "./Header"
import IconSidebar from "./IconSidebar"
import RightSidebar from "./RightSidebar"
import WorkContainer from "./WorkContainer"
import useDimensions from "react-use-dimensions"
import { IconDictionaryContext } from "./icon-dictionary"

const emptyAr = []
const emptyObj = {}

const Container = styled("div")(({ theme }) => ({
  display: "flex",
  width: "100%",
  flexDirection: "column",
  height: "100%",
  overflow: "hidden",
  maxWidth: "100vw",
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
}))

const SidebarsAndContent = styled("div")(({ theme }) => ({
  display: "flex",
  flexGrow: 1,
  width: "100%",
  height: "100%",
  overflow: "hidden",
  maxWidth: "100vw",
}))

const Workspace = ({
  style = emptyObj,
  iconSidebarItems = emptyAr,
  selectedTools = ["select"],
  headerItems = emptyAr,
  rightSidebarItems = emptyAr,
  onClickHeaderItem,
  onClickIconSidebarItem,
  headerLeftSide = null,
  iconDictionary = emptyObj,
  rightSidebarExpanded,
  hideHeader = false,
  hideHeaderText = false,
  children,
}) => {
  const [sidebarAndContentRef, sidebarAndContent] = useDimensions()

  return (
    <IconDictionaryContext.Provider value={iconDictionary}>
      <Container style={style}>
        {!hideHeader && (
          <Header
            hideHeaderText={hideHeaderText}
            leftSideContent={headerLeftSide}
            onClickItem={onClickHeaderItem}
            items={headerItems}
          />
        )}
        <SidebarsAndContent ref={sidebarAndContentRef}>
          {iconSidebarItems.length === 0 ? null : (
            <IconSidebar
              onClickItem={onClickIconSidebarItem}
              selectedTools={selectedTools}
              items={iconSidebarItems}
            />
          )}
          <WorkContainer>{children}</WorkContainer>
          {rightSidebarItems.length === 0 ? null : (
            <RightSidebar
              initiallyExpanded={rightSidebarExpanded}
              height={sidebarAndContent?.height || 0}
            >
              {rightSidebarItems}
            </RightSidebar>
          )}
        </SidebarsAndContent>
      </Container>
    </IconDictionaryContext.Provider>
  )
}

export default Workspace
