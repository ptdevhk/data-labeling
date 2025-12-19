import { grey, blue, orange, purple } from "@mui/material/colors"

export default (theme) => ({
  container: {
    fontSize: 11,
    fontWeight: "bold",
    color:
      theme.palette.mode === "dark" ? theme.palette.text.secondary : "#616161",
    "& .icon": {
      marginTop: 4,
      width: 16,
      height: 16,
      color:
        theme.palette.mode === "dark"
          ? theme.palette.text.secondary
          : grey[700],
    },
    "& .icon2": {
      opacity: 0.5,
      width: 16,
      height: 16,
      transition: "200ms opacity",
      color:
        theme.palette.mode === "dark"
          ? theme.palette.text.secondary
          : grey[700],
      "&:hover": {
        cursor: "pointer",
        opacity: 1,
      },
    },
  },
  row: {
    padding: 4,
    cursor: "pointer",
    "&.header:hover": {
      backgroundColor:
        theme.palette.mode === "dark" ? theme.palette.grey[900] : "#fff",
    },
    "&.highlighted": {
      backgroundColor:
        theme.palette.mode === "dark" ? theme.palette.primary.dark : blue[100],
    },
    "&:hover": {
      backgroundColor:
        theme.palette.mode === "dark" ? theme.palette.grey[800] : blue[50],
      color:
        theme.palette.mode === "dark" ? theme.palette.text.primary : "#424242",
    },
  },
  chip: {
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
    "& .text": {
      color:
        theme.palette.mode === "dark" ? theme.palette.text.primary : "#616161",
    },
  },
})
