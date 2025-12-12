/* eslint-disable no-undef */
const importAll = (r) => r.keys().map(r)
importAll(require.context("./", true, /\.story\.js$/))
