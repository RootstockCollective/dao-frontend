import { ParagraphVariants, Typography } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'

interface Props {
  variant?: ParagraphVariants
  className?: string
  children: ReactNode
}

const DEFAULT_CLASSES = 'text-[1.4rem]'

const classesByVariant: Record<ParagraphVariants, string> = {
  normal: '',
  bold: 'font-bold',
  semibold: 'font-[600]',
  light: 'opacity-60',
  error: 'text-st-error',
}

export const Paragraph: FC<Props> = ({ variant = 'bold', className, children }) => (
  <Typography tagVariant="p" className={cn(DEFAULT_CLASSES, classesByVariant[variant], className)}>
    {children}
  </Typography>
)
