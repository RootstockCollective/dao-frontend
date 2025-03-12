import { HeaderVariants, Typography } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'

const classesByVariant: Record<HeaderVariants, string> = {
  h1: 'text-[1.7rem] font-bold',
  h2: '',
  span: 'text-[14px] text-[rgba(255,255,255,0.6)] block',
}

interface Props {
  children: ReactNode
  variant?: HeaderVariants
  className?: string
  fontFamily?: 'sora' | 'kk-topo' | 'rootstock-sans'
}

export const Header: FC<Props> = ({ variant = 'h1', children, className, fontFamily = 'rootstock-sans' }) => (
  <Typography
    tagVariant={variant}
    className={cn(classesByVariant[variant], className)}
    fontFamily={fontFamily}
  >
    {children}
  </Typography>
)
