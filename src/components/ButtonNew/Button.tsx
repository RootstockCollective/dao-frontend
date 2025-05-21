import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary'

interface Props {
  children: ReactNode
  variant?: ButtonVariant
  onClick?: () => void
  className?: string
}

export const Button: FC<Props> = ({ children, variant = 'primary', onClick, className = '' }) => {
  const baseStyles =
    'relative overflow-hidden px-6 py-2 rounded-md font-bold text-base transition-all duration-150 flex items-center justify-center gap-2'
  const styles = {
    primary: 'bg-[#F57C1D] text-white hover:bg-[#d86d13] disabled:bg-[#b66516]',
    secondary:
      'bg-transparent text-white border border-white hover:bg-white hover:text-black disabled:opacity-50',
  }

  return (
    <button type="button" className={cn(baseStyles, styles[variant], className)} onClick={onClick}>
      {children}
    </button>
  )
}
