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
  <div className="flex items-center p-3 mb-3">
    <div className="mr-3">{icon}</div>
    <div className="flex-grow ">
      <div className="text-white text-sm">{label}</div>
      <div className="text-gray-500 text-xs">{amount}</div>
    </div>
    <div className="flex space-x-2">
      {actions?.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className="border-white border-[1px] text-white rounded-full px-3 py-1 hover:bg-gray-700"
        >
          {action.label}
        </button>
      ))}
    </div>
  </div>
)
