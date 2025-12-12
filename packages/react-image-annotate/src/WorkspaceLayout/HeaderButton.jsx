// Migrated from react-material-workspace-layout
// Modernized for React 19 compatibility

import React from "react"
import Button from "@mui/material/Button"
import { styled } from "@mui/material/styles"
import { useIconDictionary } from "./icon-dictionary"
import { iconMapping } from "./icon-mapping"

const defaultNameIconMapping = iconMapping

const getIcon = (name, customIconMapping) => {
  const Icon =
    customIconMapping[name?.toLowerCase()] ||
    defaultNameIconMapping[name?.toLowerCase()] ||
    defaultNameIconMapping.help
  return <Icon />
}

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  width: 60,
  paddingTop: 8,
  paddingBottom: 4,
  marginLeft: 1,
  marginRight: 1,
}))

const ButtonInnerContent = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
}))

const IconContainer = styled("div")(({ theme }) => ({
  color:
    theme.palette.mode === "dark"
      ? theme.palette.text.secondary
      : theme.palette.text.primary,
  "& .MuiSvgIcon-root": {
    width: 18,
    height: 18,
  },
}))

const Text = styled("div")(({ theme }) => ({
  fontWeight: "bold",
  fontSize: 11,
  color:
    theme.palette.mode === "dark"
      ? theme.palette.text.primary
      : theme.palette.text.secondary,
  display: "flex",
  alignItems: "center",
  lineHeight: 1,
  justifyContent: "center",
}))

export const HeaderButton = ({
  name,
  label, // NEW: Optional label for i18n support
  icon,
  disabled,
  onClick,
  hideText = false,
}) => {
  const customIconMapping = useIconDictionary()
  const displayText = label || name // Use label if provided, otherwise fall back to name

  return (
    <StyledButton onClick={onClick} disabled={disabled}>
      <ButtonInnerContent>
        <IconContainer
          style={
            hideText
              ? { height: 32, paddingTop: 8 }
              : { height: 20, paddingTop: 0 }
          }
        >
          {icon || getIcon(name, customIconMapping)}
        </IconContainer>
        {!hideText && (
          <Text>
            <div>{displayText}</div>
          </Text>
        )}
      </ButtonInnerContent>
    </StyledButton>
  )
}

export default HeaderButton
