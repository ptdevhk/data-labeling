import React from "react"
import PropTypes from "prop-types"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"

const FONT_STACK = [
  '"PingFang TC"',
  '"PingFang SC"',
  "-apple-system",
  '"system-ui"',
  '"Segoe UI"',
  "Roboto",
  '"Helvetica Neue"',
  "Arial",
  "sans-serif",
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"',
].join(", ")

const createCustomTheme = (mode = "light") =>
  createTheme({
    palette: {
      mode: mode,
    },
    typography: {
      fontFamily: FONT_STACK,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontFamily: FONT_STACK,
          },
        },
      },
    },
  })

export const Theme = ({ children, mode = "light" }) => {
  const theme = React.useMemo(() => createCustomTheme(mode), [mode])
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div>{children}</div>
    </ThemeProvider>
  )
}

Theme.propTypes = {
  children: PropTypes.node.isRequired,
  mode: PropTypes.oneOf(["light", "dark"]),
}

export default Theme
