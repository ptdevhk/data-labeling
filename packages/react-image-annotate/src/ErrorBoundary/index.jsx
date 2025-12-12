import React, { Component } from "react"
import PropTypes from "prop-types"
import { makeStyles } from "@mui/styles"
import Paper from "@mui/material/Paper"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"

const useStyles = makeStyles((theme) => ({
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4),
    minHeight: "400px",
    textAlign: "center",
  },
  errorIcon: {
    fontSize: 64,
    color: theme.palette.error.main,
    marginBottom: theme.spacing(2),
  },
  errorTitle: {
    marginBottom: theme.spacing(1),
    fontWeight: 600,
  },
  errorMessage: {
    marginBottom: theme.spacing(3),
    color: theme.palette.text.secondary,
  },
  errorDetails: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.shape.borderRadius,
    maxWidth: "600px",
    overflow: "auto",
    fontFamily: "monospace",
    fontSize: "0.875rem",
    textAlign: "left",
  },
}))

function ErrorFallback({ error, resetError, showDetails }) {
  const classes = useStyles()

  return (
    <Paper className={classes.errorContainer} elevation={0}>
      <ErrorOutlineIcon className={classes.errorIcon} />
      <Typography variant="h5" className={classes.errorTitle}>
        Something went wrong
      </Typography>
      <Typography variant="body1" className={classes.errorMessage}>
        The annotation component encountered an error. Please try again or
        refresh the page.
      </Typography>
      <Button variant="contained" color="primary" onClick={resetError}>
        Try Again
      </Button>
      {showDetails && error && (
        <div className={classes.errorDetails}>
          <Typography variant="caption" component="div">
            <strong>Error Details:</strong>
          </Typography>
          <Typography variant="caption" component="pre">
            {error.toString()}
          </Typography>
          {error.stack && (
            <Typography variant="caption" component="pre">
              {error.stack}
            </Typography>
          )}
        </div>
      )}
    </Paper>
  )
}

/**
 * Error Boundary for React Image Annotate
 *
 * Catches errors in the annotation component tree and displays
 * a fallback UI instead of crashing the entire application.
 *
 * @example
 * <AnnotatorErrorBoundary>
 *   <Annotator {...props} />
 * </AnnotatorErrorBoundary>
 */
class AnnotatorErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error("AnnotatorErrorBoundary caught an error:", error, errorInfo)

    this.setState({
      error,
      errorInfo,
    })

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })

    // Call optional reset callback
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback component
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          resetError: this.resetError,
        })
      }

      // Default fallback UI
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={this.resetError}
          showDetails={
            this.props.showDetails ?? process.env.NODE_ENV !== "production"
          }
        />
      )
    }

    return this.props.children
  }
}

AnnotatorErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.func,
  onError: PropTypes.func,
  onReset: PropTypes.func,
  showDetails: PropTypes.bool,
}

export default AnnotatorErrorBoundary
