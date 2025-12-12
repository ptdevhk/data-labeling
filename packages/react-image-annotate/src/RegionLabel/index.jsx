// @flow

import React, { useRef, memo } from "react"
import Paper from "@mui/material/Paper"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { styled } from "@mui/material/styles"
import { grey } from "@mui/material/colors"
import IconButton from "@mui/material/IconButton"
import Button from "@mui/material/Button"
import TrashIcon from "@mui/icons-material/Delete"
import CheckIcon from "@mui/icons-material/Check"
import TextField from "@mui/material/TextField"
import Select from "react-select"
import CreatableSelect from "react-select/creatable"

import { asMutable } from "../utils/immutable-helpers"
import { sanitizeText } from "../utils/sanitize-input"

const theme = createTheme()

// Styled components replacing makeStyles
const RegionInfo = styled(Paper)({
  fontSize: 12,
  cursor: "default",
  transition: "opacity 200ms",
  opacity: 0.5,
  "&:hover": {
    opacity: 0.9,
    cursor: "pointer",
  },
  "&.highlighted": {
    opacity: 0.9,
    "&:hover": {
      opacity: 1,
    },
  },
  fontWeight: 600,
  color: grey[900],
  padding: 8,
  "& .name": {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    "& .circle": {
      marginRight: 4,
      boxShadow: "0px 0px 2px rgba(0,0,0,0.4)",
      width: 10,
      height: 10,
      borderRadius: 5,
    },
  },
  "& .tags": {
    "& .tag": {
      color: grey[700],
      display: "inline-block",
      margin: 1,
      fontSize: 10,
      textDecoration: "underline",
    },
  },
})

const CommentBox = styled(TextField)({
  "& .MuiInputBase-root": {
    fontWeight: 400,
    fontSize: 13,
  },
})

// type Props = {
//   region: Region,
//   editing?: boolean,
//   allowedClasses?: Array<string>,
//   allowedTags?: Array<string>,
//   cls?: string,
//   tags?: Array<string>,
//   onDelete: (Region) => null,
//   onChange: (Region) => null,
//   onClose: (Region) => null,
//   onOpen: (Region) => null,
//   onRegionClassAdded: () => {},
//   allowComments?: boolean,
// }

export const RegionLabel = ({
  region,
  editing,
  allowedClasses,
  allowedTags,
  onDelete,
  onChange,
  onClose,
  onOpen,
  onRegionClassAdded,
  allowComments,
}) => {
  const commentInputRef = useRef(null)
  const onCommentInputClick = (_) => {
    // The TextField wraps the <input> tag with two divs
    const commentInput = commentInputRef.current.children[0].children[0]

    if (commentInput) return commentInput.focus()
  }

  return (
    <ThemeProvider theme={theme}>
      <RegionInfo
        onClick={() => (!editing ? onOpen(region) : null)}
        className={region.highlighted ? "highlighted" : ""}
      >
        {!editing ? (
          <div>
            {region.cls && (
              <div className="name">
                <div
                  className="circle"
                  style={{ backgroundColor: region.color }}
                />
                {sanitizeText(region.cls)}
              </div>
            )}
            {region.tags && (
              <div className="tags">
                {region.tags.map((t) => (
                  <div key={t} className="tag">
                    {sanitizeText(t)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ width: 200 }}>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <div
                style={{
                  display: "flex",
                  backgroundColor: region.color || "#888",
                  color: "#fff",
                  padding: 4,
                  paddingLeft: 8,
                  paddingRight: 8,
                  borderRadius: 4,
                  fontWeight: "bold",
                  textShadow: "0px 0px 5px rgba(0,0,0,0.4)",
                }}
              >
                {region.type}
              </div>
              <div style={{ flexGrow: 1 }} />
              <IconButton
                onClick={() => onDelete(region)}
                tabIndex={-1}
                style={{ width: 22, height: 22 }}
                size="small"
                variant="outlined"
              >
                <TrashIcon style={{ marginTop: -8, width: 16, height: 16 }} />
              </IconButton>
            </div>
            {(allowedClasses || []).length > 0 && (
              <div style={{ marginTop: 6 }}>
                <CreatableSelect
                  placeholder="Classification"
                  onChange={(o, actionMeta) => {
                    if (actionMeta.action == "create-option") {
                      onRegionClassAdded(o.value)
                    }
                    return onChange({
                      ...region,
                      cls: o.value,
                    })
                  }}
                  value={
                    region.cls ? { label: region.cls, value: region.cls } : null
                  }
                  options={asMutable(
                    allowedClasses.map((c) => ({ value: c, label: c })),
                  )}
                />
              </div>
            )}
            {(allowedTags || []).length > 0 && (
              <div style={{ marginTop: 4 }}>
                <Select
                  onChange={(newTags) =>
                    onChange({
                      ...region,
                      tags: newTags.map((t) => t.value),
                    })
                  }
                  placeholder="Tags"
                  value={(region.tags || []).map((c) => ({
                    label: c,
                    value: c,
                  }))}
                  isMulti
                  options={asMutable(
                    allowedTags.map((c) => ({ value: c, label: c })),
                  )}
                />
              </div>
            )}
            {allowComments && (
              <CommentBox
                fullWidth
                multiline
                rows={3}
                ref={commentInputRef}
                onClick={onCommentInputClick}
                value={region.comment || ""}
                onChange={(event) =>
                  onChange({ ...region, comment: event.target.value })
                }
              />
            )}
            {onClose && (
              <div style={{ marginTop: 4, display: "flex" }}>
                <div style={{ flexGrow: 1 }} />
                <Button
                  onClick={() => onClose(region)}
                  size="small"
                  variant="contained"
                  color="primary"
                >
                  <CheckIcon />
                </Button>
              </div>
            )}
          </div>
        )}
      </RegionInfo>
    </ThemeProvider>
  )
}

export default memo(
  RegionLabel,
  (prevProps, nextProps) =>
    prevProps.editing === nextProps.editing &&
    prevProps.region === nextProps.region,
)
