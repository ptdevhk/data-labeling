import React from "react"
import Button from "@mui/material/Button"
import { styled } from "@mui/material/styles"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import * as colors from "@mui/material/colors"
import Grid from "@mui/material/Grid"
import Markdown from "react-markdown"
import GitHubButton from "react-github-btn"
import "./github-markdown.css"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs"
import StrictModeTest from "../StrictModeTest"

const theme = createTheme()

const contentMd = `# React Image Annotate

A powerful React component for image and video annotation with bounding boxes, polygons, points, and more.

## Features

- Simple input/output format
- Multiple annotation tools
- Keyboard shortcuts
- Undo/Redo support
- Image and video annotation
- Customizable UI`
const RootContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}))
const ContentContainer = styled("div")(({ theme }) => ({
  width: "100%",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  maxWidth: 1200,
}))
const Header = styled("div")(({ theme }) => ({
  width: "100%",
  display: "flex",
  justifyContent: "center",
  backgroundColor: colors.blue[600],
  padding: 8,
  boxSizing: "border-box",
}))
const HeaderButton = styled(Button)(({ theme }) => ({
  color: "white",
  margin: 8,
  padding: 16,
  paddingLeft: 24,
  paddingRight: 24,
}))
const Hero = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  width: "100%",
  backgroundColor: colors.blue[500],
  padding: 16,
  color: "white",
  boxSizing: "border-box",
}))
const HeroMain = styled("div")(({ theme }) => ({
  fontSize: 48,
  fontWeight: "bold",
  paddingTop: 64,
  textShadow: "0px 1px 5px rgba(0,0,0,0.3)",
}))
const HeroSub = styled("div")(({ theme }) => ({
  paddingTop: 32,
  lineHeight: 1.5,
  fontSize: 24,
  textShadow: "0px 1px 3px rgba(0,0,0,0.2)",
}))
const HeroButtons = styled("div")(({ theme }) => ({
  paddingTop: 32,
  paddingBottom: 48,
}))
const Section = styled("div")(({ theme }) => ({
  display: "flex",
  padding: 16,
  paddingTop: 32,
  flexDirection: "column",
}))

const CodeBlock = ({ children, className, node, ...rest }) => {
  const match = /language-(\w+)/.exec(className || "")
  return match ? (
    <SyntaxHighlighter language={match[1]} style={docco} {...rest}>
      {String(children).replace(/\n$/, "")}
    </SyntaxHighlighter>
  ) : (
    <code className={className} {...rest}>
      {children}
    </code>
  )
}

function flatten(text, child) {
  return typeof child === "string"
    ? text + child
    : React.Children.toArray(child.props.children).reduce(flatten, text)
}

function HeadingRenderer(props) {
  var children = React.Children.toArray(props.children)
  var text = children.reduce(flatten, "")
  var slug = text.toLowerCase().replace(/\W/g, "-")
  return React.createElement("h" + props.level, { id: slug }, props.children)
}

const LandingPage = () => {
  return (
    <ThemeProvider theme={theme}>
      <RootContainer>
        <Header id="about">
          <ContentContainer style={{ flexDirection: "row", flexGrow: 1 }}>
            <HeaderButton href="#features">Features</HeaderButton>
            <HeaderButton href="#usage">Usage</HeaderButton>
            <HeaderButton href="#props">Props</HeaderButton>
            <HeaderButton href="./demo">Demo Playground</HeaderButton>
          </ContentContainer>
        </Header>
        <Hero>
          <ContentContainer>
            <HeroMain>React Image Annotate</HeroMain>
            <HeroSub>
              Powerful React component for image annotations with bounding
              boxes, tagging, classification, multiple images and polygon
              segmentation.
            </HeroSub>
            <HeroButtons>
              <GitHubButton
                href="https://github.com/karlorz/react-image-annotate"
                data-size="large"
                data-show-count="true"
                aria-label="Star karlorz/react-image-annotate on GitHub"
              >
                Star
              </GitHubButton>
            </HeroButtons>
          </ContentContainer>
        </Hero>
        <StrictModeTest />
        <ContentContainer className="markdown-body">
          <Section className="markdown-body">
            <Markdown
              components={{
                code: CodeBlock,
                h1: HeadingRenderer,
                h2: HeadingRenderer,
                h3: HeadingRenderer,
                h4: HeadingRenderer,
                h5: HeadingRenderer,
                h6: HeadingRenderer,
              }}
            >
              {contentMd}
            </Markdown>
          </Section>
        </ContentContainer>
      </RootContainer>
    </ThemeProvider>
  )
}

export default LandingPage
