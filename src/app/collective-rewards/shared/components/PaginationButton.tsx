import { Button } from '@/components/Button'
import { FC, ReactNode } from 'react'

export const PaginationButton: FC<{
  text: ReactNode
  onClick: () => void
  disabled?: boolean
  isActive?: boolean
}> = ({ text, onClick, disabled, isActive }) => (
  <Button onClick={onClick} disabled={disabled} variant={isActive ? 'pagination-active' : 'pagination'}>
    {text}
  </Button>
)
