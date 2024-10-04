import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export const Header = ({ children }: Props) => {
  return (
    <header className="container my-8">
      <div className="flex">{children}</div>
    </header>
  )
}
