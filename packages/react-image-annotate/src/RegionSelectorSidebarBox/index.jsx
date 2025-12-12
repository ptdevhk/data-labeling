// @flow

import React, { Fragment, useState, memo, useMemo } from "react"
import SidebarBoxContainer from "../SidebarBoxContainer"
import { useTheme as useMuiTheme } from "@mui/styles"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { styled } from "@mui/material/styles"
import { grey } from "@mui/material/colors"
import RegionIcon from "@mui/icons-material/PictureInPicture"
import Grid from "@mui/material/Grid"
import ReorderIcon from "@mui/icons-material/SwapVert"
import PieChartIcon from "@mui/icons-material/PieChart"
import TrashIcon from "@mui/icons-material/Delete"
import LockIcon from "@mui/icons-material/Lock"
import UnlockIcon from "@mui/icons-material/LockOpen"
import VisibleIcon from "@mui/icons-material/Visibility"
import VisibleOffIcon from "@mui/icons-material/VisibilityOff"
import isEqual from "lodash/isEqual"

// Styled components replacing makeStyles
const Container = styled("div")(({ theme }) => ({
  fontSize: 11,
  fontWeight: "bold",
  color:
    theme.palette.mode === "dark" ? theme.palette.text.secondary : "#616161",
  "& .icon": {
    marginTop: 4,
    width: 16,
    height: 16,
    color:
      theme.palette.mode === "dark" ? theme.palette.text.secondary : grey[700],
  },
  "& .icon2": {
    opacity: 0.5,
    width: 16,
    height: 16,
    transition: "200ms opacity",
    color:
      theme.palette.mode === "dark" ? theme.palette.text.secondary : grey[700],
    "&:hover": {
      cursor: "pointer",
      opacity: 1,
    },
  },
}))

const StyledRow = styled("div")(({ theme }) => ({
  padding: 4,
  cursor: "pointer",
  "&.header:hover": {
    backgroundColor:
      theme.palette.mode === "dark" ? theme.palette.grey[900] : "#fff",
  },
  "&.highlighted": {
    backgroundColor:
      theme.palette.mode === "dark" ? theme.palette.primary.dark : "#bbdefb",
  },
  "&:hover": {
    backgroundColor:
      theme.palette.mode === "dark" ? theme.palette.grey[800] : "#e3f2fd",
    color:
      theme.palette.mode === "dark" ? theme.palette.text.primary : "#424242",
  },
}))

const ChipContainer = styled("span")({
  display: "flex",
  flexDirection: "row",
  padding: 2,
  borderRadius: 2,
  paddingLeft: 4,
  paddingRight: 4,
  alignItems: "center",
  "& .color": {
    borderRadius: 5,
    width: 10,
    height: 10,
    marginRight: 4,
  },
})

const ChipText = styled("div")(({ theme }) => ({
  color: theme.palette.mode === "dark" ? theme.palette.text.primary : "#616161",
}))

const HeaderSep = styled("div")(({ theme }) => ({
  borderTop:
    theme.palette.mode === "dark"
      ? `1px solid ${theme.palette.grey[700]}`
      : `1px solid ${grey[200]}`,
  marginTop: 2,
  marginBottom: 2,
}))

const Chip = ({ color, text }) => {
  return (
    <ChipContainer>
      <div className="color" style={{ backgroundColor: color }} />
      <ChipText>{text}</ChipText>
    </ChipContainer>
  )
}

const RowLayout = ({
  header,
  highlighted,
  order,
  classification,
  area,
  tags,
  trash,
  lock,
  visible,
  onClick,
}) => {
  const [mouseOver, changeMouseOver] = useState(false)
  const classNames = [header && "header", highlighted && "highlighted"]
    .filter(Boolean)
    .join(" ")

  return (
    <StyledRow
      onClick={onClick}
      onMouseEnter={() => changeMouseOver(true)}
      onMouseLeave={() => changeMouseOver(false)}
      className={classNames}
    >
      <Grid container alignItems="center">
        <Grid item xs={2}>
          <div style={{ textAlign: "right", paddingRight: 10 }}>{order}</div>
        </Grid>
        <Grid item xs={5}>
          {classification}
        </Grid>
        <Grid item xs={2}>
          <div style={{ textAlign: "right", paddingRight: 6 }}>{area}</div>
        </Grid>
        <Grid item xs={1}>
          {trash}
        </Grid>
        <Grid item xs={1}>
          {lock}
        </Grid>
        <Grid item xs={1}>
          {visible}
        </Grid>
      </Grid>
    </StyledRow>
  )
}

const RowHeader = () => {
  return (
    <RowLayout
      header
      highlighted={false}
      order={<ReorderIcon className="icon" />}
      classification={<div style={{ paddingLeft: 10 }}>Class</div>}
      area={<PieChartIcon className="icon" />}
      trash={<TrashIcon className="icon" />}
      lock={<LockIcon className="icon" />}
      visible={<VisibleIcon className="icon" />}
    />
  )
}

const MemoRowHeader = memo(RowHeader)

const Row = ({
  region: r,
  highlighted,
  onSelectRegion,
  onDeleteRegion,
  onChangeRegion,
  visible,
  locked,
  color,
  cls,
  index,
}) => {
  return (
    <RowLayout
      header={false}
      highlighted={highlighted}
      onClick={() => onSelectRegion(r)}
      order={`#${index + 1}`}
      classification={<Chip text={cls || ""} color={color || "#ddd"} />}
      area=""
      trash={<TrashIcon onClick={() => onDeleteRegion(r)} className="icon2" />}
      lock={
        r.locked ? (
          <LockIcon
            onClick={() => onChangeRegion({ ...r, locked: false })}
            className="icon2"
          />
        ) : (
          <UnlockIcon
            onClick={() => onChangeRegion({ ...r, locked: true })}
            className="icon2"
          />
        )
      }
      visible={
        r.visible || r.visible === undefined ? (
          <VisibleIcon
            onClick={() => onChangeRegion({ ...r, visible: false })}
            className="icon2"
          />
        ) : (
          <VisibleOffIcon
            onClick={() => onChangeRegion({ ...r, visible: true })}
            className="icon2"
          />
        )
      }
    />
  )
}

const MemoRow = memo(
  Row,
  (prevProps, nextProps) =>
    prevProps.highlighted === nextProps.highlighted &&
    prevProps.visible === nextProps.visible &&
    prevProps.locked === nextProps.locked &&
    prevProps.id === nextProps.id &&
    prevProps.index === nextProps.index &&
    prevProps.cls === nextProps.cls &&
    prevProps.color === nextProps.color,
)

const emptyArr = []

export const RegionSelectorSidebarBox = ({
  regions = emptyArr,
  onDeleteRegion,
  onChangeRegion,
  onSelectRegion,
  title = "Regions", // NEW: Optional title for i18n support
}) => {
  const parentTheme = useMuiTheme()
  const paletteMode = parentTheme?.palette?.mode || "light"
  const fontFamily = parentTheme?.typography?.fontFamily

  const localTheme = useMemo(
    () =>
      createTheme({
        palette: { mode: paletteMode },
        ...(fontFamily ? { typography: { fontFamily } } : {}),
      }),
    [paletteMode, fontFamily],
  )

  const RegionIconStyled = styled(RegionIcon)(({ theme }) => ({
    color:
      theme.palette.mode === "dark" ? theme.palette.text.secondary : grey[700],
  }))

  return (
    <ThemeProvider theme={localTheme}>
      <SidebarBoxContainer
        title={title}
        subTitle=""
        icon={<RegionIconStyled />}
        expandedByDefault
      >
        <Container>
          <MemoRowHeader />
          <HeaderSep />
          {regions.map((r, i) => (
            <MemoRow
              key={r.id}
              {...r}
              region={r}
              index={i}
              onSelectRegion={onSelectRegion}
              onDeleteRegion={onDeleteRegion}
              onChangeRegion={onChangeRegion}
            />
          ))}
        </Container>
      </SidebarBoxContainer>
    </ThemeProvider>
  )
}

const mapUsedRegionProperties = (r) => [
  r.id,
  r.color,
  r.locked,
  r.visible,
  r.highlighted,
]

export default memo(
  RegionSelectorSidebarBox,
  (prevProps, nextProps) =>
    prevProps.title === nextProps.title &&
    isEqual(
      (prevProps.regions || emptyArr).map(mapUsedRegionProperties),
      (nextProps.regions || emptyArr).map(mapUsedRegionProperties),
    ),
)
