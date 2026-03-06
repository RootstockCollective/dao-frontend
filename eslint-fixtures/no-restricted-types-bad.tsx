import type { FC, FunctionComponent } from 'react'

interface BadProps {
  label: string
}

export const WithFC: FC<BadProps> = (props) => <span>{props.label}</span>

export const WithFunctionComponent: FunctionComponent<BadProps> = (props) => (
  <span>{props.label}</span>
)
