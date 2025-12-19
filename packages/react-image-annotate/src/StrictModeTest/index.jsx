// Test component to verify StrictMode is working
import React, { useState, useEffect } from "react"

export const StrictModeTest = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    console.log("StrictMode Test: Effect ran (should run twice in StrictMode)")
    return () => {
      console.log(
        "StrictMode Test: Cleanup ran (should run once before re-run)",
      )
    }
  }, [])

  return (
    <div style={{ padding: "20px", background: "#f0f0f0", margin: "20px" }}>
      <h3>StrictMode Test Component</h3>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
      <p>Check console for StrictMode double-render effects</p>
    </div>
  )
}

export default StrictModeTest
