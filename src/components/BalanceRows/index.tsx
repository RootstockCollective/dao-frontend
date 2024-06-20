import { FC } from 'react'

interface Props {
  label: string
  children: React.ReactNode
}

export const BalanceRows: FC<Props> = ({ label, children }) => (
  <div>
    <h2 className="text-white text-sm py-1 ml-1">{label}</h2>
    <div className="flex flex-col">{children}</div>
  </div>
)
