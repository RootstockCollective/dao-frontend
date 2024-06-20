import { FC } from 'react'

interface Props {
  children: string
  onClick: () => void
}

export const ActionButton: FC<Props> = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="border-white border-[1px] text-white rounded-full px-1 hover:bg-zinc-700"
  >
    {children}
  </button>
)
