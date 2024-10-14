import { ParagraphVariants, SizeVariants, Typography } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'

interface Props {
  variant?: ParagraphVariants
  children: ReactNode
  size?: SizeVariants
  className?: string
  fontFamily?: 'sora' | 'kk-topo' | 'rootstock-sans'
  'data-testid'?: string
}

const DEFAULT_CLASSES = 'text-[1.4rem]'

const classesByVariant: Record<ParagraphVariants, string> = {
  normal: '',
  bold: 'font-bold',
  semibold: 'font-[600]',
  light: 'opacity-60',
  error: 'text-st-error',
}

const classesBySize: Record<SizeVariants, string> = {
  small: 'text-[14px]',
  medium: 'text-[16px]',
  large: 'text-[18px]',
}

export const Paragraph: FC<Props> = ({
  variant = 'normal',
  size = 'medium',
  className,
  children,
  fontFamily = 'rootstock-sans',
  'data-testid': dataTestId,
}) => (
  <Typography
    tagVariant="p"
    className={cn(DEFAULT_CLASSES, classesByVariant[variant], classesBySize[size], className)}
    fontFamily={fontFamily}
    data-testid={`Paragraph${dataTestId || ''}`}
  >
    {children}
  </Typography>
)
