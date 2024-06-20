import { FC } from 'react'

interface Props {
  children: React.ReactNode
}

export const Root: FC<Props> = ({ children }) => (
  <div className="flex items-center p-3 mx-1 mb-1 bg-foreground rounded-lg">{children}</div>
)
