import { FC, ReactNode } from 'react'

export const RewardsSection: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="flex flex-col items-start gap-6 self-stretch">{children}</div>
)
