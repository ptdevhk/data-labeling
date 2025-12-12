import React, { useEffect } from "react"
import { styled } from "@mui/material/styles"
import Box from "@mui/material/Box"
import SidebarBoxContainer from "../SidebarBoxContainer"
import colors from "../colors"
import BallotIcon from "@mui/icons-material/Ballot"
import capitalize from "lodash/capitalize"
import classnames from "classnames"

const LabelContainer = styled("div")(({ theme }) => ({
  display: "flex",
  paddingTop: 4,
  paddingBottom: 4,
  paddingLeft: 16,
  paddingRight: 16,
  alignItems: "center",
  cursor: "pointer",
  opacity: 0.7,
  backgroundColor:
    theme.palette.mode === "dark"
      ? theme.palette.grey[800]
      : theme.palette.background.paper,
  "&:hover": {
    opacity: 1,
  },
  "&.selected": {
    opacity: 1,
    fontWeight: "bold",
  },
}))
const Circle = styled("div")(({ theme }) => ({
  width: 12,
  height: 12,
  borderRadius: 12,
  marginRight: 8,
}))
const Label = styled("div")(({ theme }) => ({
  fontSize: 11,
  color: theme.palette.text.primary,
}))
const DashSep = styled("div")(({ theme }) => ({
  flexGrow: 1,
  borderBottom:
    theme.palette.mode === "dark"
      ? `2px dotted ${theme.palette.grey[700]}`
      : `2px dotted ${theme.palette.grey[300]}`,
  marginLeft: 8,
  marginRight: 8,
}))
const Number = styled("div")(({ theme }) => ({
  fontSize: 11,
  textAlign: "center",
  minWidth: 14,
  paddingTop: 2,
  paddingBottom: 2,
  fontWeight: "bold",
  color:
    theme.palette.mode === "dark"
      ? theme.palette.text.secondary
      : theme.palette.grey[700],
}))

export const ClassSelectionMenu = ({
  selectedCls,
  regionClsList,
  onSelectCls,
  title = "Classifications", // NEW: Optional title for i18n support
}) => {
  useEffect(() => {
    const keyMapping = {}
    for (let i = 0; i < 9 && i < regionClsList.length; i++) {
      keyMapping[i + 1] = () => onSelectCls(regionClsList[i])
    }
    const onKeyDown = (e) => {
      if (keyMapping[e.key]) {
        keyMapping[e.key]()
        e.preventDefault()
        e.stopPropagation()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [regionClsList, selectedCls])

  const IconStyled = styled(BallotIcon)(({ theme }) => ({
    color:
      theme.palette.mode === "dark"
        ? theme.palette.text.secondary
        : theme.palette.grey[700],
  }))

  return (
    <SidebarBoxContainer
      title={title}
      subTitle=""
      icon={<IconStyled />}
      expandedByDefault
    >
      {regionClsList.map((label, index) => (
        <LabelContainer
          key={`${label}-${index}`}
          className={classnames({ selected: label === selectedCls })}
          onClick={() => onSelectCls(label)}
        >
          <Circle style={{ backgroundColor: colors[index % colors.length] }} />
          <Label className={classnames({ selected: label === selectedCls })}>
            {capitalize(label)}
          </Label>
          <DashSep />
          <Number className={classnames({ selected: label === selectedCls })}>
            {index < 9 ? `Key [${index + 1}]` : ""}
          </Number>
        </LabelContainer>
      ))}
      <Box pb={2} />
    </SidebarBoxContainer>
  )
}

export default ClassSelectionMenu
