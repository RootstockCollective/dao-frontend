import { Typography } from '@/components/Typography/Typography'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  className?: string
  children: ReactNode
  size?: 'normal' | 'small'
  variant?: 'normal' | 'light'
}

const variants = {
  normal: '',
  light: 'text-[rgba(255,255,255,0.6)]',
}

const sizeVariant = {
  normal: 'text-[16px]',
  small: 'text-[12px]',
}
export const Span = ({ children, className, variant = 'normal', size = 'normal' }: Props) => (
  <Typography tagVariant="span" className={cn(variants[variant], sizeVariant[size], className)}>
    {children}
  </Typography>
)
