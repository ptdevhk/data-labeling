// @flow

import React from "react"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import { useTheme } from "@mui/material/styles"
import Survey from "material-survey/components/Survey"
import { useSettings } from "../SettingsProvider"
import { useI18n } from "../I18nProvider"

export const SettingsDialog = ({ open, onClose }) => {
  const settings = useSettings()
  const theme = useTheme()
  const { t } = useI18n()

  // Apply theme-aware styles to material-survey components
  const isDark = theme.palette.mode === "dark"
  const textColor = isDark ? theme.palette.text.primary : "rgb(66, 66, 66)"

  return (
    <Dialog open={open || false} onClose={onClose}>
      <DialogTitle>{t("settings", "Settings")}</DialogTitle>
      <DialogContent
        style={{ minWidth: 400 }}
        sx={{
          // Override material-survey hardcoded colors for dark mode
          "& span[style*='color: rgb(66, 66, 66)']": {
            color: `${textColor} !important`,
          },
          "& span[style*='color: rgb(117, 117, 117)']": {
            color: `${isDark ? theme.palette.text.secondary : "rgb(117, 117, 117)"} !important`,
          },
        }}
      >
        <Survey
          variant="flat"
          noActions
          defaultAnswers={settings}
          onQuestionChange={(q, a, answers) => settings.changeSetting(q, a)}
          form={{
            questions: [
              {
                type: "boolean",
                title: t("show_crosshairs", "Show Crosshairs"),
                name: "showCrosshairs",
              },
              {
                type: "boolean",
                title: t("show_highlight_box", "Show Highlight Box"),
                name: "showHighlightBox",
              },
              {
                type: "boolean",
                title: t("wasd_mode", "WASD Mode"),
                name: "wasdMode",
              },
              {
                type: "dropdown",
                title: t("video_playback_speed", "Video Playback Speed"),
                name: "videoPlaybackSpeed",
                defaultValue: "1x",
                choices: ["0.25x", "0.5x", "1x", "2x"],
              },
            ],
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("close", "Close")}</Button>
      </DialogActions>
    </Dialog>
  )
}

export default SettingsDialog
