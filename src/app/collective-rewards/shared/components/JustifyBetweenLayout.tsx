import { ReactNode } from 'react'

type JustifyBetweenLayoutProps = {
  leftComponent: ReactNode
  rightComponent: ReactNode
}

export const JustifyBetweenLayout = ({ leftComponent, rightComponent }: JustifyBetweenLayoutProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      {leftComponent}
      <div className="flex gap-3">{rightComponent}</div>
    </div>
  )
}
