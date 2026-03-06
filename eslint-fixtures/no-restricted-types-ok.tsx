import type { JSX } from 'react'

interface OkProps {
  label: string
}

export const WithExplicitType: (props: OkProps) => JSX.Element = (props) => (
  <span>{props.label}</span>
)
