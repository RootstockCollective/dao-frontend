import { FC } from 'react'

interface Props {
  children: React.ReactNode
}

export const ActionButtons: FC<Props> = ({ children }) => (
  <div className="flex space-x-2 bg-foreground">{children}</div>
)
