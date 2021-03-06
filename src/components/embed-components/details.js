/** @jsx h */
import { h } from 'preact'
import { useState } from 'preact/hooks'

export const Details = ({ label, children }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <details
      onClick={() => setIsExpanded(!isExpanded)}
      class="mb-6 cursor-pointer"
    >
      <summary>{isExpanded ? `Click to close.` : label}</summary>
      {isExpanded ? children : null}
    </details>
  )
}
