import { FC, ReactNode } from 'react'

export interface RawProps {
  title: ReactNode
  children: ReactNode
}

export const Raw: FC<RawProps> = ({ title, children }) => {
  return <div className="raw-component">{title}</div>
}
