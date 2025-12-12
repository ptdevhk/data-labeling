// @flow

import React, { memo } from "react"
import { makeStyles } from "@mui/styles"
import { styled } from "@mui/material/styles"
import SidebarBoxContainer from "../SidebarBoxContainer"
import CollectionsIcon from "@mui/icons-material/Collections"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"
import Avatar from "@mui/material/Avatar"
import isEqual from "lodash/isEqual"

const useStyles = makeStyles((theme) => ({
  img: { width: 40, height: 40, borderRadius: 8 },
}))

const IconStyled = styled(CollectionsIcon)(({ theme }) => ({
  color:
    theme.palette.mode === "dark"
      ? theme.palette.text.secondary
      : theme.palette.grey[700],
}))

export const ImageSelectorSidebarBox = ({
  images,
  onSelect,
  title = "Images", // NEW: Optional title for i18n support
}) => {
  const classes = useStyles()
  return (
    <SidebarBoxContainer
      title={title}
      subTitle={`(${images.length})`}
      icon={<IconStyled />}
    >
      <div>
        <List>
          {images.map((img, i) => (
            <ListItem button onClick={() => onSelect(img)} dense key={i}>
              <img className={classes.img} src={img.src} />
              <ListItemText
                primary={img.name}
                secondary={`${(img.regions || []).length} Labels`}
              />
            </ListItem>
          ))}
        </List>
      </div>
    </SidebarBoxContainer>
  )
}

const mapUsedImageProps = (a) => [a.name, (a.regions || []).length, a.src]

export default memo(ImageSelectorSidebarBox, (prevProps, nextProps) =>
  isEqual(
    prevProps.images.map(mapUsedImageProps),
    nextProps.images.map(mapUsedImageProps),
  ),
)
