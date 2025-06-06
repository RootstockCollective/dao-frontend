import { Typography } from '@/components/Typography/Typography'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils/utils'

interface Props {
  className?: string
  children: ReactNode
  size?: 'normal' | 'small'
  variant?: 'normal' | 'light'
  onClick?: () => void
  'data-testid'?: string
}

const variants = {
  normal: '',
  light: 'text-[rgba(255,255,255,0.6)]',
}

const sizeVariant = {
  normal: 'text-[16px]',
  small: 'text-[12px]',
}

/** @deprecated Use TypographyNew/Span instead */
export const Span = ({
  children,
  className,
  variant = 'normal',
  size = 'normal',
  onClick,
  'data-testid': dataTestId,
}: Props) => (
  <Typography
    tagVariant="span"
    className={cn(variants[variant], sizeVariant[size], className)}
    onClick={onClick}
    data-testid={dataTestId}
  >
    {children}
  </Typography>
)
