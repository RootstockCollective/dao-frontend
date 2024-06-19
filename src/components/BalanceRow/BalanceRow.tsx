import { FC, ReactNode } from 'react'

interface BalanceRowAction {
  label: string
  onClick: () => void
}

interface Props {
  label: string
  amount: string
  icon?: ReactNode
  actions?: BalanceRowAction[]
}

export const BalanceRow: FC<Props> = ({ label, amount, icon, actions }) => (
  <div className="flex items-center p-3 mb-3 bg-foreground">
    <div className="mr-3 bg-foreground">{icon}</div>
    <div className="flex-grow">
      <div className="text-white text-sm bg-foreground">{label}</div>
      <div className="text-zinc-400 text-xs bg-foreground">{amount}</div>
    </div>
    <div className="flex space-x-2 bg-foreground">
      {actions?.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className="border-white border-[1px] text-white rounded-full px-1 hover:bg-zinc-700"
        >
          {action.label}
        </button>
      ))}
    </div>
  </div>
)
