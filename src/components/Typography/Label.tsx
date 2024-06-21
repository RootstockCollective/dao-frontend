import { LabelVariants, Typography } from '@/components/Typography'
import { FC, ReactNode } from 'react'
import classNames from 'classnames'

const DEFAULT_CLASSES = 'text-[1.4rem]'

const classesByVariant: Record<LabelVariants, string> = {
  normal: '',
  light: 'text-text-light',
  strong: 'font-bold',
}

interface Props {
  variant?: LabelVariants
  textClass?: string
  children: ReactNode
}

export const Label: FC<Props> = ({ variant = 'normal', textClass = '', children }) => (
  <Typography
    tagVariant="label"
    className={classNames(DEFAULT_CLASSES, classesByVariant[variant], textClass)}
  >
    {children}
  </Typography>
)
