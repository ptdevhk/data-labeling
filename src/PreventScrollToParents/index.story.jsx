// @flow

import React from "react"

import { fn } from "storybook/test"

import RemoveScrollOnChildren from "./"

export default {
  title: "RemoveScrollOnChildren",
}

export const Basic = () => (
  <div style={{ width: "100vh", textAlign: "center", height: "200vh" }}>
    <RemoveScrollOnChildren>
      <div
        style={{
          display: "inline-block",
          width: 100,
          height: 100,
          backgroundColor: "red",
        }}
      />
    </RemoveScrollOnChildren>
  </div>
)
