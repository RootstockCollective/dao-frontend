import { LabelVariants, Typography } from '@/components/Typography'
import { FC, ReactNode } from 'react'
import classNames from 'classnames'

const DEFAULT_CLASSES = 'text-[1.4rem]'

const classesByVariant: Record<LabelVariants, string> = {
  normal: 'font-light',
  light: 'text-text-light',
  strong: 'font-bold',
}

interface Props {
  variant?: LabelVariants
  className?: string
  children: ReactNode
}

export const Label: FC<Props> = ({ variant = 'normal', className = '', children }) => (
  <Typography
    tagVariant="label"
    className={classNames(DEFAULT_CLASSES, classesByVariant[variant], className)}
  >
    {children}
  </Typography>
)
