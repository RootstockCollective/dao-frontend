import { FC } from 'react'

interface Props {
  children: React.ReactNode
}

export const Content: FC<Props> = ({ children }) => <div className="flex-grow">{children}</div>
