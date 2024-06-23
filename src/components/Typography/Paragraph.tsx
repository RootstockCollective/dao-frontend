import { ParagraphVariants, Typography } from '@/components/Typography'
import { FC, ReactNode } from 'react'
import classNames from 'classnames'

interface Props {
  variant?: ParagraphVariants
  children: ReactNode
}

const DEFAULT_CLASSES = 'text-[1.4rem]'

const classesByVariant: Record<ParagraphVariants, string> = {
  normal: 'font-bold',
  'semibold': 'font-[600]',
  light: '',
}

export const Paragraph: FC<Props> = ({ variant = 'normal', children }) => (
  <Typography tagVariant='p' className={classNames(DEFAULT_CLASSES, classesByVariant[variant])}>{children}</Typography>
)
