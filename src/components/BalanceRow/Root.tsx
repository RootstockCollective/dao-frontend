import { FC } from 'react'

interface Props {
  children: React.ReactNode
}

export const Root: FC<Props> = ({ children }) => (
  <div className="flex items-center p-3 mb-3 bg-foreground">{children}</div>
)
