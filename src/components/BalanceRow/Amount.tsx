import { FC } from 'react'

interface Props {
  children: string
}

export const Amount: FC<Props> = ({ children }) => (
  <div className="text-zinc-400 text-xs bg-foreground">{children}</div>
)
