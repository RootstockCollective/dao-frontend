import { HeaderVariants, Typography } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'

const classesByVariant: Record<HeaderVariants, string> = {
  h1: 'text-[1.7rem] font-bold',
  h2: '',
  span: 'text-[14px] text-[rgba(255,255,255,0.6)] block',
}

interface Props {
  variant?: HeaderVariants
  children: ReactNode
  className?: string
}

export const Header: FC<Props> = ({ variant = 'h1', children, className }) => (
  <Typography tagVariant={variant} className={cn(classesByVariant[variant], className)}>
    {children}
  </Typography>
)
