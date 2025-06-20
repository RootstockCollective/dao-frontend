import { LabelVariants } from './types'
import { Typography } from './Typography'
import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'

const DEFAULT_CLASSES = 'text-[1rem]'

const classesByVariant: Record<LabelVariants, string> = {
  normal: 'font-light',
  light: 'text-text-light',
  semibold: 'font-[600]',
}

interface Props {
  variant?: LabelVariants
  className?: string
  children: ReactNode
}

/** @deprecated Use TypographyNew/Label instead */
export const Label: FC<Props> = ({ variant = 'normal', className, children }) => (
  <Typography tagVariant="label" className={cn(DEFAULT_CLASSES, classesByVariant[variant], className)}>
    {children}
  </Typography>
)
