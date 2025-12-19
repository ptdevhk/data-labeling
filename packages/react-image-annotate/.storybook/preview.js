// React 19 compatibility shim - must be imported before React
import '../src/utils/react19-compat.js'

// Semi Design CSS
import '@douyinfe/semi-ui/dist/css/semi.min.css'

import React from 'react'
import Theme from '../src/Theme'

const preview = {
  decorators: [
    (Story) => React.createElement(
      React.StrictMode,
      null,
      React.createElement(Theme, null, React.createElement(Story))
    )
  ],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      }
    }
  }
}

export default preview
