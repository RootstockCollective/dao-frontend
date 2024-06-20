import { FC } from 'react'

interface Props {
  children: string
}

export const Label: FC<Props> = ({ children }) => <div className="text-white text-sm bg-foreground">{children}</div>
